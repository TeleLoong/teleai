(() => {
  const PLAYER_BUILD = "reports-video-20260317-7";
  const NEWS_MODAL_BOUND_ATTR = "reportNewsBound";
  const NEWS_TOGGLE_BOUND_ATTR = "reportNewsToggleBound";
  const NEWS_CLOSER_BOUND_ATTR = "reportNewsCloserBound";
  const NEWS_ESCAPE_BOUND_ATTR = "reportNewsEscapeBound";
  const VIDEO_BOUND_ATTR = "reportVideoBound";
  const SEEK_EPSILON = 0.35;
  const METADATA_TIMEOUT_MS = 4000;
  const SEEK_TIMEOUT_MS = 4000;
  const state = new WeakMap();
  const videos = Array.from(document.querySelectorAll("video[data-report-video]"));
  const newsCards = Array.from(document.querySelectorAll("[data-report-news-card]"));
  const newsModal = document.querySelector("[data-report-news-modal]");
  let activeController = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${minutes}:${String(secs).padStart(2, "0")}`;
  };

  const getDuration = (video) => (Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0);

  const getController = (video) => {
    let controller = state.get(video);

    if (!controller) {
      const cover = video.closest(".report-cover");
      const controls = cover ? cover.querySelector("[data-report-player-controls]") : null;

      controller = {
        video,
        status: cover ? cover.querySelector("[data-report-video-status]") : null,
        controls: {
          toggle: controls ? controls.querySelector("[data-report-player-toggle]") : null,
          progress: controls ? controls.querySelector("[data-report-progress]") : null,
          buffered: controls ? controls.querySelector("[data-report-buffered]") : null,
          played: controls ? controls.querySelector("[data-report-played]") : null,
          thumb: controls ? controls.querySelector("[data-report-thumb]") : null,
          currentTime: controls ? controls.querySelector("[data-report-current-time]") : null,
          duration: controls ? controls.querySelector("[data-report-duration]") : null,
        },
        mode: "idle",
        desiredPlaying: false,
        seekToken: 0,
        pendingSeekTime: null,
        pendingSeekRatio: null,
        metadataPromise: null,
        playPromise: null,
        internalPause: false,
        isDragging: false,
        dragPointerId: null,
        dragPreviewRatio: null,
        dragPreviewTime: null,
      };

      state.set(video, controller);
    }

    return controller;
  };

  const clearStatus = (controller) => {
    if (!controller.status) return;
    controller.status.textContent = "";
    controller.status.classList.remove("is-visible", "is-error");
  };

  const showStatus = (controller, text, tone = "info") => {
    if (!controller.status) return;
    if (!text) {
      clearStatus(controller);
      return;
    }

    controller.status.textContent = text;
    controller.status.classList.add("is-visible");
    controller.status.classList.toggle("is-error", tone === "error");
  };

  const updateToggle = (controller) => {
    const button = controller.controls.toggle;
    if (!button) return;

    let label = "播放";
    if (controller.mode === "loading" || controller.mode === "seeking") {
      label = "加载中";
    } else if (controller.mode === "playing") {
      label = "暂停";
    } else if (controller.mode === "ended") {
      label = "重播";
    } else if (controller.mode === "paused" && controller.video.currentTime > 0) {
      label = "继续播放";
    }

    button.textContent = label;
    button.setAttribute("aria-label", `${label}视频`);
  };

  const updateTimeline = (controller, options = {}) => {
    const { previewTime = null, previewRatio = null } = options;
    const { video } = controller;
    const duration = getDuration(video);
    const safeCurrentTime = Number.isFinite(previewTime)
      ? duration > 0
        ? clamp(previewTime, 0, duration)
        : Math.max(previewTime, 0)
      : Number.isFinite(video.currentTime)
        ? duration > 0
          ? clamp(video.currentTime, 0, duration)
          : Math.max(video.currentTime, 0)
        : 0;
    const playedRatio = Number.isFinite(previewRatio) ? clamp(previewRatio, 0, 1) : duration > 0 ? clamp(safeCurrentTime / duration, 0, 1) : 0;

    if (controller.controls.currentTime) {
      controller.controls.currentTime.textContent = formatTime(safeCurrentTime);
    }
    if (controller.controls.duration) {
      controller.controls.duration.textContent = formatTime(duration);
    }
    if (controller.controls.played) {
      controller.controls.played.style.width = `${playedRatio * 100}%`;
    }
    if (controller.controls.thumb) {
      controller.controls.thumb.style.left = `${playedRatio * 100}%`;
    }

    let bufferedRatio = 0;
    if (duration > 0 && video.buffered && video.buffered.length > 0) {
      bufferedRatio = clamp(video.buffered.end(video.buffered.length - 1) / duration, 0, 1);
    }
    if (controller.controls.buffered) {
      controller.controls.buffered.style.width = `${bufferedRatio * 100}%`;
    }

    if (controller.controls.progress) {
      controller.controls.progress.setAttribute("aria-valuemax", String(Math.round(duration)));
      controller.controls.progress.setAttribute("aria-valuenow", String(Math.round(safeCurrentTime)));
      controller.controls.progress.setAttribute("aria-valuetext", `${formatTime(safeCurrentTime)} / ${formatTime(duration)}`);
      controller.controls.progress.setAttribute("aria-disabled", duration > 0 ? "false" : "true");
    }
  };

  const renderTimeline = (controller) => {
    if (controller.isDragging && Number.isFinite(controller.dragPreviewRatio)) {
      const duration = getDuration(controller.video);
      const previewTime = Number.isFinite(controller.dragPreviewTime)
        ? controller.dragPreviewTime
        : duration > 0
          ? duration * controller.dragPreviewRatio
          : null;
      updateTimeline(controller, { previewTime, previewRatio: controller.dragPreviewRatio });
      return;
    }

    updateTimeline(controller);
  };

  const setMode = (controller, mode, statusText = null, statusTone = "info") => {
    controller.mode = mode;
    if (statusText === null) {
      clearStatus(controller);
    } else {
      showStatus(controller, statusText, statusTone);
    }
    updateToggle(controller);
  };

  const getLoadingState = (controller) => {
    const mode = controller.pendingSeekTime !== null || controller.video.seeking ? "seeking" : "loading";
    const text = mode === "seeking" ? "正在跳转到所选位置..." : "正在缓冲视频...";
    return { mode, text };
  };

  const clearPendingSeek = (controller) => {
    controller.seekToken += 1;
    controller.pendingSeekTime = null;
    controller.pendingSeekRatio = null;
  };

  const clearPlaybackState = (controller) => {
    controller.playPromise = null;
  };

  const setPausedOrIdle = (controller) => {
    setMode(controller, controller.video.currentTime > 0 ? "paused" : "idle");
    renderTimeline(controller);
  };

  const releaseActive = (controller) => {
    if (activeController === controller) {
      activeController = null;
    }
  };

  const pauseInternally = (controller) => {
    if (controller.video.paused) return;
    controller.internalPause = true;
    controller.video.pause();
  };

  const resetDragState = (controller) => {
    const { progress } = controller.controls;
    if (progress && controller.dragPointerId !== null) {
      if (typeof progress.hasPointerCapture === "function" && progress.hasPointerCapture(controller.dragPointerId)) {
        try {
          progress.releasePointerCapture(controller.dragPointerId);
        } catch (_error) {
          // Ignore release errors when capture has already been cleared.
        }
      }
    }

    controller.isDragging = false;
    controller.dragPointerId = null;
    controller.dragPreviewRatio = null;
    controller.dragPreviewTime = null;
  };

  const cleanupInactiveController = (controller) => {
    controller.desiredPlaying = false;
    clearPlaybackState(controller);
    clearPendingSeek(controller);
    resetDragState(controller);
    clearStatus(controller);
    pauseInternally(controller);
    controller.video.preload = "metadata";
    setPausedOrIdle(controller);

    if (activeController === controller) {
      activeController = null;
    }
  };

  const activateController = (controller) => {
    if (activeController === controller) {
      controller.video.preload = "auto";
      return;
    }

    if (activeController) {
      cleanupInactiveController(activeController);
    }

    activeController = controller;
    controller.video.preload = "auto";
  };

  const ensureMetadata = (controller) => {
    if (controller.video.readyState >= HTMLMediaElement.HAVE_METADATA || getDuration(controller.video) > 0) {
      return Promise.resolve();
    }

    if (controller.metadataPromise) {
      return controller.metadataPromise;
    }

    controller.metadataPromise = new Promise((resolve, reject) => {
      let finished = false;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        controller.video.removeEventListener("loadedmetadata", handleReady);
        controller.video.removeEventListener("error", handleError);
      };

      const finish = (callback) => {
        if (finished) return;
        finished = true;
        cleanup();
        callback();
      };

      const handleReady = () => finish(resolve);
      const handleError = () => finish(() => reject(new Error("metadata-error")));
      const timeoutId = window.setTimeout(() => finish(() => reject(new Error("metadata-timeout"))), METADATA_TIMEOUT_MS);

      controller.video.addEventListener("loadedmetadata", handleReady);
      controller.video.addEventListener("error", handleError);

      if (controller.video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        controller.video.load();
      }
    }).finally(() => {
      controller.metadataPromise = null;
    });

    return controller.metadataPromise;
  };

  const performSeek = (controller, targetTime) =>
    new Promise((resolve, reject) => {
      let finished = false;

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        controller.video.removeEventListener("seeked", handleSeeked);
        controller.video.removeEventListener("error", handleError);
      };

      const finish = (callback) => {
        if (finished) return;
        finished = true;
        cleanup();
        callback();
      };

      const handleSeeked = () => finish(resolve);
      const handleError = () => finish(() => reject(new Error("seek-error")));
      const timeoutId = window.setTimeout(() => {
        const delta = Math.abs((controller.video.currentTime || 0) - targetTime);
        if (!controller.video.seeking || delta <= SEEK_EPSILON) {
          finish(resolve);
          return;
        }
        finish(() => reject(new Error("seek-timeout")));
      }, SEEK_TIMEOUT_MS);

      controller.video.addEventListener("seeked", handleSeeked);
      controller.video.addEventListener("error", handleError);

      try {
        controller.video.currentTime = targetTime;
      } catch (error) {
        finish(() => reject(error));
        return;
      }

      window.requestAnimationFrame(() => {
        if (finished) return;
        const delta = Math.abs((controller.video.currentTime || 0) - targetTime);
        if (!controller.video.seeking && delta <= SEEK_EPSILON) {
          finish(resolve);
        }
      });
    });

  const maybeContinuePlayback = async (controller) => {
    if (activeController !== controller || !controller.desiredPlaying || controller.video.ended) {
      return false;
    }

    if (!controller.video.paused && !controller.video.seeking) {
      return true;
    }

    if (controller.playPromise) {
      return controller.playPromise;
    }

    const { mode, text } = getLoadingState(controller);
    setMode(controller, mode, text);

    controller.playPromise = (async () => {
      try {
        const playResult = controller.video.play();
        if (playResult && typeof playResult.then === "function") {
          await playResult;
        }
        return true;
      } catch (error) {
        if (activeController === controller && controller.desiredPlaying) {
          if (controller.video.error) {
            failPlayback(controller, "视频加载失败，请点击“打开原文件”查看。");
          } else if (error && ["NotAllowedError", "NotSupportedError"].includes(error.name)) {
            failPlayback(controller, "浏览器阻止了播放，请重试或点击“打开原文件”查看。");
          } else if (controller.video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            controller.desiredPlaying = false;
            setMode(controller, "paused", "播放启动失败，请重试。", "error");
            renderTimeline(controller);
            releaseActive(controller);
          } else {
            const { mode: retryMode, text: retryText } = getLoadingState(controller);
            setMode(controller, retryMode, retryText);
          }
        }
        return false;
      } finally {
        controller.playPromise = null;
      }
    })();

    return controller.playPromise;
  };

  const failPlayback = (controller, message) => {
    controller.desiredPlaying = false;
    clearPlaybackState(controller);
    clearPendingSeek(controller);
    setMode(controller, "error", message, "error");
    renderTimeline(controller);
    releaseActive(controller);
  };

  const markStablePlayback = (controller) => {
    if (activeController !== controller || !controller.desiredPlaying || controller.video.paused || controller.video.ended) {
      return;
    }

    controller.pendingSeekTime = null;
    controller.pendingSeekRatio = null;
    clearStatus(controller);
    setMode(controller, "playing");
    renderTimeline(controller);
  };

  const requestPlay = async (controller) => {
    activateController(controller);
    controller.desiredPlaying = true;
    clearStatus(controller);
    await maybeContinuePlayback(controller);
  };

  const requestPause = (controller) => {
    controller.desiredPlaying = false;
    clearPlaybackState(controller);
    clearPendingSeek(controller);
    clearStatus(controller);

    if (controller.video.paused) {
      setPausedOrIdle(controller);
      releaseActive(controller);
      return;
    }

    controller.video.pause();
  };

  const seekTo = async (controller, target, options = {}) => {
    const { autoplay = true } = options;
    activateController(controller);

    controller.desiredPlaying = autoplay;
    const token = controller.seekToken + 1;
    controller.seekToken = token;
    controller.pendingSeekTime = Number.isFinite(target.time) ? target.time : null;
    controller.pendingSeekRatio = Number.isFinite(target.ratio) ? clamp(target.ratio, 0, 1) : null;
    clearStatus(controller);

    const { mode, text } = autoplay ? getLoadingState(controller) : { mode: "paused", text: null };
    setMode(controller, mode, text);
    updateTimeline(controller, {
      previewTime: controller.pendingSeekTime,
      previewRatio: controller.pendingSeekRatio,
    });

    try {
      await ensureMetadata(controller);
      if (activeController !== controller || controller.seekToken !== token) return;

      const duration = getDuration(controller.video);
      const resolvedTime =
        controller.pendingSeekRatio !== null
          ? duration * controller.pendingSeekRatio
          : duration > 0
            ? clamp(controller.pendingSeekTime || 0, 0, duration)
            : 0;
      const resolvedRatio = duration > 0 ? clamp(resolvedTime / duration, 0, 1) : 0;

      controller.pendingSeekTime = resolvedTime;
      controller.pendingSeekRatio = resolvedRatio;
      setMode(controller, "seeking", "正在跳转到所选位置...");
      updateTimeline(controller, { previewTime: resolvedTime, previewRatio: resolvedRatio });

      await performSeek(controller, resolvedTime);
      if (activeController !== controller || controller.seekToken !== token) return;

      controller.pendingSeekTime = null;
      controller.pendingSeekRatio = null;
      renderTimeline(controller);

      if (!autoplay) {
        setPausedOrIdle(controller);
        releaseActive(controller);
        return;
      }

      await maybeContinuePlayback(controller);
    } catch (_error) {
      if (activeController !== controller || controller.seekToken !== token) return;
      failPlayback(controller, "跳转失败，请重试。");
    }
  };

  const getProgressRatio = (progress, clientX) => {
    const rect = progress.getBoundingClientRect();
    if (!rect.width) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1);
  };

  const setDragPreview = (controller, ratio) => {
    controller.dragPreviewRatio = clamp(ratio, 0, 1);
    const duration = getDuration(controller.video);
    controller.dragPreviewTime = duration > 0 ? duration * controller.dragPreviewRatio : null;
    renderTimeline(controller);
  };

  const bindProgressEvents = (controller) => {
    const { progress } = controller.controls;
    if (!progress) return;

    progress.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      activateController(controller);
      controller.isDragging = true;
      controller.dragPointerId = event.pointerId;

      if (typeof progress.setPointerCapture === "function") {
        progress.setPointerCapture(event.pointerId);
      }

      setDragPreview(controller, getProgressRatio(progress, event.clientX));
    });

    progress.addEventListener("pointermove", (event) => {
      if (!controller.isDragging || controller.dragPointerId !== event.pointerId) return;
      setDragPreview(controller, getProgressRatio(progress, event.clientX));
    });

    const finishDrag = (event) => {
      if (!controller.isDragging) return;
      if (event.pointerId !== undefined && controller.dragPointerId !== null && event.pointerId !== controller.dragPointerId) {
        return;
      }

      const fallbackRatio = Number.isFinite(controller.dragPreviewRatio) ? controller.dragPreviewRatio : 0;
      const finalRatio = event.clientX !== undefined ? getProgressRatio(progress, event.clientX) : fallbackRatio;
      resetDragState(controller);
      void seekTo(controller, { ratio: finalRatio }, { autoplay: true });
    };

    progress.addEventListener("pointerup", finishDrag);
    progress.addEventListener("pointercancel", finishDrag);

    progress.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
        return;
      }

      event.preventDefault();

      let targetTime = Number.isFinite(controller.video.currentTime) ? controller.video.currentTime : 0;
      if (event.key === "ArrowLeft") targetTime -= 5;
      if (event.key === "ArrowRight") targetTime += 5;
      if (event.key === "Home") targetTime = 0;
      if (event.key === "End") targetTime = Number.MAX_SAFE_INTEGER;

      void seekTo(controller, { time: targetTime }, { autoplay: true });
    });
  };

  const bindMediaEvents = (controller) => {
    const { video } = controller;

    video.addEventListener("loadedmetadata", () => {
      renderTimeline(controller);
      updateToggle(controller);
    });

    ["progress", "loadeddata"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        renderTimeline(controller);

        if (eventName === "loadeddata" && activeController === controller && controller.desiredPlaying && video.paused) {
          void maybeContinuePlayback(controller);
        }
      });
    });

    video.addEventListener("timeupdate", () => {
      renderTimeline(controller);

      if (
        activeController === controller &&
        controller.desiredPlaying &&
        !video.paused &&
        !video.seeking &&
        Number.isFinite(video.currentTime) &&
        video.currentTime > 0
      ) {
        markStablePlayback(controller);
      }
    });

    video.addEventListener("play", () => {
      if (activeController !== controller) {
        pauseInternally(controller);
        return;
      }

      const { mode, text } = getLoadingState(controller);
      setMode(controller, mode, text);
    });

    video.addEventListener("playing", () => {
      if (activeController !== controller) {
        pauseInternally(controller);
        return;
      }

      markStablePlayback(controller);
    });

    video.addEventListener("pause", () => {
      if (video.ended) return;

      if (controller.internalPause) {
        controller.internalPause = false;
        return;
      }

      if (activeController !== controller) {
        setPausedOrIdle(controller);
        return;
      }

      if (controller.desiredPlaying) {
        const { mode, text } = getLoadingState(controller);
        setMode(controller, mode, text);

        if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
          void maybeContinuePlayback(controller);
        }
        return;
      }

      setPausedOrIdle(controller);
      releaseActive(controller);
    });

    video.addEventListener("waiting", () => {
      if (activeController !== controller) return;
      const { mode, text } = getLoadingState(controller);
      setMode(controller, mode, text);
    });

    video.addEventListener("seeking", () => {
      if (activeController !== controller) return;
      setMode(controller, "seeking", "正在跳转到所选位置...");
    });

    const continueIfWanted = () => {
      if (activeController !== controller || !controller.desiredPlaying) return;

      if (!video.paused && !video.seeking) {
        markStablePlayback(controller);
        return;
      }

      void maybeContinuePlayback(controller);
    };

    video.addEventListener("canplay", continueIfWanted);
    video.addEventListener("seeked", () => {
      renderTimeline(controller);
      continueIfWanted();
    });

    video.addEventListener("ended", () => {
      controller.desiredPlaying = false;
      clearPlaybackState(controller);
      clearPendingSeek(controller);
      clearStatus(controller);
      setMode(controller, "ended");
      renderTimeline(controller);
      releaseActive(controller);
    });

    video.addEventListener("error", () => {
      failPlayback(controller, "视频加载失败，请点击“打开原文件”查看。");
    });
  };

  const initNewsCards = () => {
    if (!newsCards.length || !newsModal || newsModal.dataset[NEWS_MODAL_BOUND_ATTR] === "true") {
      return;
    }

    newsModal.dataset[NEWS_MODAL_BOUND_ATTR] = "true";

    const modalImage = newsModal.querySelector("[data-report-news-modal-image]");
    const modalTitle = newsModal.querySelector("[data-report-news-modal-title]");
    const modalDate = newsModal.querySelector("[data-report-news-modal-date]");
    const modalLink = newsModal.querySelector("[data-report-news-modal-link]");
    const modalClosers = Array.from(newsModal.querySelectorAll("[data-report-news-close]"));
    let lastTrigger = null;

    const closeModal = () => {
      newsModal.classList.remove("is-open");
      newsModal.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("reports-news-modal-open");
      document.body.classList.remove("reports-news-modal-open");

      if (lastTrigger) {
        lastTrigger.setAttribute("aria-expanded", "false");
        lastTrigger.focus();
      }
    };

    const openModal = (toggle) => {
      const title = toggle.dataset.reportNewsTitle || "";
      const date = toggle.dataset.reportNewsDate || "";
      const image = toggle.dataset.reportNewsImage || "";
      const link = toggle.dataset.reportNewsLink || "";

      if (modalImage) {
        modalImage.src = image;
        modalImage.alt = title;
      }
      if (modalTitle) modalTitle.textContent = title;
      if (modalDate) {
        const hasDate = date && date !== "未标注日期";
        modalDate.textContent = hasDate ? date : "";
        modalDate.hidden = !hasDate;
      }
      if (modalLink) {
        modalLink.href = link;
      }

      if (lastTrigger && lastTrigger !== toggle) {
        lastTrigger.setAttribute("aria-expanded", "false");
      }

      lastTrigger = toggle;
      toggle.setAttribute("aria-expanded", "true");
      newsModal.classList.add("is-open");
      newsModal.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("reports-news-modal-open");
      document.body.classList.add("reports-news-modal-open");

      const closeButton = newsModal.querySelector(".reports-news-modal__close");
      if (closeButton) {
        closeButton.focus();
      }
    };

    newsCards.forEach((card) => {
      const toggle = card.querySelector("[data-report-news-toggle]");
      if (!toggle || toggle.dataset[NEWS_TOGGLE_BOUND_ATTR] === "true") return;

      toggle.dataset[NEWS_TOGGLE_BOUND_ATTR] = "true";
      toggle.addEventListener("click", () => {
        openModal(toggle);
      });
    });

    modalClosers.forEach((node) => {
      if (node.dataset[NEWS_CLOSER_BOUND_ATTR] === "true") return;

      node.dataset[NEWS_CLOSER_BOUND_ATTR] = "true";
      node.addEventListener("click", closeModal);
    });

    if (document.documentElement.dataset[NEWS_ESCAPE_BOUND_ATTR] !== "true") {
      document.documentElement.dataset[NEWS_ESCAPE_BOUND_ATTR] = "true";
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && newsModal.classList.contains("is-open")) {
          closeModal();
        }
      });
    }
  };

  initNewsCards();

  if (!videos.length) return;

  document.documentElement.dataset.reportsVideoBuild = PLAYER_BUILD;

  videos.forEach((video) => {
    if (video.dataset[VIDEO_BOUND_ATTR] === "true") return;

    video.dataset[VIDEO_BOUND_ATTR] = "true";
    video.dataset.reportScriptBuild = PLAYER_BUILD;
    video.controls = false;
    video.preload = "metadata";

    const controller = getController(video);

    if (controller.controls.toggle) {
      controller.controls.toggle.addEventListener("click", () => {
        if (activeController === controller && (controller.mode === "loading" || controller.mode === "seeking")) {
          return;
        }

        if (controller.mode === "ended" || video.ended) {
          void seekTo(controller, { time: 0 }, { autoplay: true });
          return;
        }

        if (activeController === controller && controller.mode === "playing" && !video.paused) {
          requestPause(controller);
          return;
        }

        void requestPlay(controller);
      });
    }

    bindProgressEvents(controller);
    bindMediaEvents(controller);
    renderTimeline(controller);
    updateToggle(controller);
  });
})();
