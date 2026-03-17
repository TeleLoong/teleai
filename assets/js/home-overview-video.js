(() => {
  const videos = Array.from(document.querySelectorAll("video[data-home-overview-video]"));

  if (!videos.length) return;

  const MODE = {
    IDLE: "idle",
    LOADING: "loading",
    PLAYING: "playing",
    STALLED: "stalled",
    RECOVERING: "recovering",
  };

  const START_STAGGER_MS = 85;
  const RECOVERY_STAGGER_MS = 60;
  const PLAYBACK_WATCHDOG_MS = 2400;
  const STALL_WATCHDOG_MS = 1400;
  const MIN_PROGRESS_DELTA = 0.08;
  const SOFT_RETRY_BASE_MS = 450;
  const HARD_RETRY_BASE_MS = 1500;
  const RELOAD_FAILURE_THRESHOLD = 2;
  const MAX_BACKOFF_EXPONENT = 4;

  const state = new WeakMap();
  let nextQueueAt = 0;

  const getNow = () => window.performance.now();

  const getVideoState = (video, index = 0) => {
    let videoState = state.get(video);

    if (!videoState) {
      videoState = {
        index,
        mode: MODE.IDLE,
        hasPlayed: false,
        awaitingPlayback: false,
        consecutiveFailures: 0,
        recoveryAttemptCount: 0,
        lastObservedTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
        lastProgressAt: 0,
        lastPlayRequestAt: 0,
        pendingActionId: null,
        progressWatchdogId: null,
        pendingRecovery: null,
      };

      state.set(video, videoState);
    }

    return videoState;
  };

  const setMode = (video, mode) => {
    const videoState = getVideoState(video);
    videoState.mode = mode;
    video.dataset.homeOverviewState = mode;
  };

  const clearPendingAction = (video, { clearRecovery = true } = {}) => {
    const videoState = getVideoState(video);

    if (videoState.pendingActionId) {
      window.clearTimeout(videoState.pendingActionId);
      videoState.pendingActionId = null;
    }

    if (clearRecovery) {
      videoState.pendingRecovery = null;
    }
  };

  const clearWatchdog = (video) => {
    const videoState = getVideoState(video);

    if (!videoState.progressWatchdogId) return;

    window.clearTimeout(videoState.progressWatchdogId);
    videoState.progressWatchdogId = null;
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

  const prepareVideo = (video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("autoplay", "");
    video.setAttribute("loop", "");
  };

  const getCurrentTime = (video) => {
    const currentTime = video.currentTime;
    return Number.isFinite(currentTime) ? currentTime : 0;
  };

  const hasProgressed = (video, videoState, baselineTime, baselineProgressAt) => {
    const advancedByTime = getCurrentTime(video) - baselineTime >= MIN_PROGRESS_DELTA;
    const advancedByEvent = videoState.lastProgressAt > baselineProgressAt;

    return advancedByTime || advancedByEvent;
  };

  const queueAction = (video, action, { minDelay = 0, spacing = START_STAGGER_MS } = {}) => {
    const videoState = getVideoState(video);
    const now = getNow();

    clearPendingAction(video, { clearRecovery: false });
    nextQueueAt = Math.max(nextQueueAt, now);

    const scheduledAt = Math.max(now + minDelay, nextQueueAt);
    const delay = Math.max(scheduledAt - now, 0);

    nextQueueAt = scheduledAt + spacing;
    videoState.pendingActionId = window.setTimeout(() => {
      videoState.pendingActionId = null;
      videoState.pendingRecovery = null;
      action();
    }, delay);
  };

  const settlePlaying = (video) => {
    const videoState = getVideoState(video);

    clearPendingAction(video);
    clearWatchdog(video);
    videoState.awaitingPlayback = false;
    videoState.hasPlayed = true;
    videoState.consecutiveFailures = 0;
    videoState.recoveryAttemptCount = 0;
    videoState.lastObservedTime = getCurrentTime(video);
    videoState.lastProgressAt = getNow();
    setMode(video, MODE.PLAYING);
    markPlaying(video);
  };

  const scheduleRecovery = (video, { hard = false, minDelay = 0 } = {}) => {
    const videoState = getVideoState(video);

    if (!video.isConnected || video.ended) return;
    if (document.visibilityState !== "visible") return;

    if (videoState.pendingRecovery) {
      if (videoState.pendingRecovery.reload || !hard) {
        return;
      }

      clearPendingAction(video);
    }

    clearWatchdog(video);
    videoState.awaitingPlayback = false;
    videoState.consecutiveFailures += 1;
    videoState.recoveryAttemptCount += 1;

    const reload = hard || videoState.consecutiveFailures >= RELOAD_FAILURE_THRESHOLD;
    const retryBase = reload ? HARD_RETRY_BASE_MS : SOFT_RETRY_BASE_MS;
    const backoffExponent = Math.min(videoState.recoveryAttemptCount - 1, MAX_BACKOFF_EXPONENT);
    const retryDelay = minDelay + retryBase * 2 ** backoffExponent;

    videoState.pendingRecovery = { reload };
    setMode(video, reload ? MODE.RECOVERING : MODE.STALLED);

    if (!videoState.hasPlayed || reload) {
      markFallback(video);
    } else {
      video.classList.remove("is-playing");
    }

    queueAction(
      video,
      () => {
        startPlayback(video, {
          reload,
          mode: MODE.RECOVERING,
          watchdogMs: reload ? PLAYBACK_WATCHDOG_MS + 600 : PLAYBACK_WATCHDOG_MS,
        });
      },
      {
        minDelay: retryDelay,
        spacing: RECOVERY_STAGGER_MS,
      }
    );
  };

  const armWatchdog = (video, timeoutMs) => {
    const videoState = getVideoState(video);
    const baselineTime = getCurrentTime(video);
    const baselineProgressAt = videoState.lastProgressAt;

    clearWatchdog(video);
    videoState.progressWatchdogId = window.setTimeout(() => {
      videoState.progressWatchdogId = null;

      if (!video.isConnected || video.ended) return;
      if (document.visibilityState !== "visible") return;

      if (hasProgressed(video, videoState, baselineTime, baselineProgressAt)) {
        if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          settlePlaying(video);
        }
        return;
      }

      scheduleRecovery(video, {
        hard: videoState.consecutiveFailures + 1 >= RELOAD_FAILURE_THRESHOLD,
      });
    }, timeoutMs);
  };

  const startPlayback = (video, { reload = false, mode = MODE.LOADING, watchdogMs = PLAYBACK_WATCHDOG_MS } = {}) => {
    const videoState = getVideoState(video);

    if (!video.isConnected || video.ended) return;
    if (document.visibilityState !== "visible") return;

    prepareVideo(video);
    videoState.awaitingPlayback = true;
    videoState.lastPlayRequestAt = getNow();
    videoState.lastObservedTime = getCurrentTime(video);
    setMode(video, mode);

    if (!videoState.hasPlayed) {
      markFallback(video);
    } else {
      video.classList.remove("is-playing");
    }

    if (reload || video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      try {
        video.load();
      } catch (_) {
        // Ignore reload failures and let the browser keep the existing resource.
      }
    }

    armWatchdog(video, watchdogMs);

    const playPromise = video.play();
    if (!playPromise || typeof playPromise.catch !== "function") return;

    playPromise.catch(() => {
      scheduleRecovery(video, {
        hard: videoState.consecutiveFailures + 1 >= RELOAD_FAILURE_THRESHOLD,
      });
    });
  };

  const handleProgress = (video) => {
    const videoState = getVideoState(video);
    const currentTime = getCurrentTime(video);
    const wrappedAround = currentTime + 0.5 < videoState.lastObservedTime;
    const advanced = currentTime - videoState.lastObservedTime >= MIN_PROGRESS_DELTA;

    if (!wrappedAround && !advanced) return;

    videoState.lastObservedTime = currentTime;
    videoState.lastProgressAt = getNow();

    if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      settlePlaying(video);
    }
  };

  videos.forEach((video, index) => {
    getVideoState(video, index);
    prepareVideo(video);
    markFallback(video);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady(video);
    }

    video.addEventListener("loadeddata", () => {
      markReady(video);
    });

    video.addEventListener("canplay", () => {
      markReady(video);
      if (!video.paused) {
        settlePlaying(video);
        return;
      }

      const videoState = getVideoState(video);
      if (videoState.awaitingPlayback) {
        armWatchdog(video, PLAYBACK_WATCHDOG_MS);
      }
    });

    video.addEventListener("playing", () => {
      settlePlaying(video);
    });

    video.addEventListener("timeupdate", () => {
      handleProgress(video);
    });

    video.addEventListener("waiting", () => {
      if (video.paused || video.ended) return;
      setMode(video, MODE.STALLED);
      video.classList.remove("is-playing");
      armWatchdog(video, STALL_WATCHDOG_MS);
    });

    video.addEventListener("stalled", () => {
      setMode(video, MODE.STALLED);
      armWatchdog(video, STALL_WATCHDOG_MS);
    });

    video.addEventListener("suspend", () => {
      const videoState = getVideoState(video);
      if (videoState.mode === MODE.LOADING || videoState.mode === MODE.RECOVERING || videoState.mode === MODE.STALLED) {
        armWatchdog(video, STALL_WATCHDOG_MS);
      }
    });

    video.addEventListener("pause", () => {
      if (video.ended) return;
      if (document.visibilityState !== "visible") return;
      if (getVideoState(video).mode !== MODE.PLAYING) return;
      armWatchdog(video, STALL_WATCHDOG_MS);
    });

    video.addEventListener("error", () => {
      scheduleRecovery(video, { hard: true });
    });

    video.addEventListener("ended", () => {
      clearWatchdog(video);
      video.classList.remove("is-playing");
      if (video.loop) {
        setMode(video, MODE.LOADING);
      }
    });

    queueAction(
      video,
      () => {
        startPlayback(video);
      },
      { spacing: START_STAGGER_MS }
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;

    videos.forEach((video) => {
      const videoState = getVideoState(video);

      if (video.ended) return;
      if (!video.paused) return;
      if (videoState.mode === MODE.RECOVERING) return;
      if (videoState.pendingRecovery) return;

      queueAction(
        video,
        () => {
          startPlayback(video, {
            mode: videoState.hasPlayed ? MODE.STALLED : MODE.LOADING,
            watchdogMs: STALL_WATCHDOG_MS,
          });
        },
        { minDelay: 120, spacing: RECOVERY_STAGGER_MS }
      );
    });
  });
})();
