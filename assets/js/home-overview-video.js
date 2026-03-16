(() => {
  const videos = Array.from(document.querySelectorAll("video[data-home-overview-video]"));

  if (!videos.length) return;

  const PLAY_RETRY_DELAY_MS = 180;
  const RETRY_ON_VISIBLE_DELAY_MS = 120;
  const RECOVERY_RETRY_DELAY_MS = 320;
  const PAUSE_RETRY_DELAY_MS = 220;
  const retryTimers = new WeakMap();

  const clearRetry = (video) => {
    const timerId = retryTimers.get(video);

    if (timerId) {
      window.clearTimeout(timerId);
      retryTimers.delete(video);
    }
  };

  const markFallback = (video) => {
    const poster = video.dataset.homeOverviewPoster || video.getAttribute("poster");

    if (poster) {
      video.style.backgroundImage = `url("${poster}")`;
    }

    video.classList.remove("is-ready", "is-playing");
    video.classList.add("is-fallback");
  };

  const clearFallback = (video) => {
    video.style.backgroundImage = "";
    video.classList.remove("is-fallback");
  };

  const markReady = (video) => {
    clearFallback(video);
    video.classList.add("is-ready");
  };

  const markPlaying = (video) => {
    clearFallback(video);
    video.classList.add("is-ready", "is-playing");
  };

  const tryPlay = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        markFallback(video);
      });
    }
  };

  const scheduleTryPlay = (video, delay = 0, options = {}) => {
    if (retryTimers.has(video)) return;

    const timerId = window.setTimeout(() => {
      retryTimers.delete(video);
      if (!video.isConnected || video.ended) return;

      if (options.reload) {
        video.load();
      }

      tryPlay(video);
    }, delay);

    retryTimers.set(video, timerId);
  };

  const recoverPlayback = (video, { delay = RECOVERY_RETRY_DELAY_MS, reload = false } = {}) => {
    if (document.visibilityState !== "visible" || video.ended) return;
    scheduleTryPlay(video, delay, { reload });
  };

  videos.forEach((video) => {
    markFallback(video);

    video.addEventListener("loadeddata", () => {
      markReady(video);
    });

    video.addEventListener("canplay", () => {
      markReady(video);
      scheduleTryPlay(video);
    });

    video.addEventListener("playing", () => {
      clearRetry(video);
      markPlaying(video);
    });

    video.addEventListener("ended", () => {
      clearRetry(video);
      video.classList.remove("is-playing");
    });

    video.addEventListener("waiting", () => {
      recoverPlayback(video);
    });

    video.addEventListener("stalled", () => {
      recoverPlayback(video, { reload: true });
    });

    video.addEventListener("suspend", () => {
      recoverPlayback(video, { reload: true });
    });

    video.addEventListener("pause", () => {
      if (video.ended) return;
      recoverPlayback(video, { delay: PAUSE_RETRY_DELAY_MS });
    });

    video.addEventListener("error", () => {
      markFallback(video);
      recoverPlayback(video, { delay: RECOVERY_RETRY_DELAY_MS, reload: true });
    });

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady(video);
    } else if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      video.load();
    }

    scheduleTryPlay(video, PLAY_RETRY_DELAY_MS);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;

    videos.forEach((video) => {
      if (!video.paused || video.ended) return;
      clearRetry(video);
      scheduleTryPlay(video, RETRY_ON_VISIBLE_DELAY_MS);
    });
  });
})();
