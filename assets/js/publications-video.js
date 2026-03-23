(() => {
  const page = document.querySelector(".publications-page");

  if (!page) return;

  const METADATA_RECOVERY_DELAY_MS = 1500;
  const videoState = new WeakMap();

  const hasValidDuration = (video) => Number.isFinite(video.duration) && video.duration > 0;

  const getVideoState = (video) => {
    let state = videoState.get(video);

    if (!state) {
      state = {
        recoveryAttempted: false,
        recoveryTimerId: null,
      };
      videoState.set(video, state);
    }

    return state;
  };

  const clearRecoveryTimer = (state) => {
    if (state.recoveryTimerId === null) return;

    window.clearTimeout(state.recoveryTimerId);
    state.recoveryTimerId = null;
  };

  const settleMetadata = (video) => {
    const state = getVideoState(video);
    clearRecoveryTimer(state);
  };

  const triggerMetadataLoad = (video) => {
    if (video.networkState !== HTMLMediaElement.NETWORK_EMPTY) return;

    try {
      video.load();
    } catch (_) {
      // Ignore load failures; the native element will continue its own recovery.
    }
  };

  const recoverMetadata = (video) => {
    const state = getVideoState(video);

    if (state.recoveryAttempted || hasValidDuration(video)) return;

    state.recoveryAttempted = true;

    const resumeTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    const shouldResume = !video.paused && !video.ended;

    const restoreAfterLoad = () => {
      video.removeEventListener("loadedmetadata", restoreAfterLoad);

      if (resumeTime > 0 && Number.isFinite(video.duration) && video.duration > 0) {
        try {
          video.currentTime = Math.min(resumeTime, video.duration);
        } catch (_) {
          // Ignore seek failures while restoring metadata after reload.
        }
      }

      if (!shouldResume) return;

      void video.play().catch(() => {
        // Ignore autoplay restoration failures; the user can resume manually.
      });
    };

    video.addEventListener("loadedmetadata", restoreAfterLoad);

    try {
      video.load();
    } catch (_) {
      video.removeEventListener("loadedmetadata", restoreAfterLoad);
    }
  };

  const scheduleMetadataRecovery = (video) => {
    const state = getVideoState(video);

    if (hasValidDuration(video)) {
      settleMetadata(video);
      return;
    }

    clearRecoveryTimer(state);
    state.recoveryTimerId = window.setTimeout(() => {
      state.recoveryTimerId = null;

      if (hasValidDuration(video)) return;
      recoverMetadata(video);
    }, METADATA_RECOVERY_DELAY_MS);
  };

  const bindVideos = () => {
    const videos = Array.from(page.querySelectorAll("video.publications-video-player"));

    if (!videos.length) return;

    const pauseOtherVideos = (activeVideo) => {
      videos.forEach((video) => {
        if (video === activeVideo) return;
        if (video.paused || video.ended) return;

        try {
          video.pause();
        } catch (_) {
          // Ignore pause failures from media elements that are already stopping.
        }
      });
    };

    videos.forEach((video) => {
      if (video.dataset.publicationsVideoBound === "true") return;

      video.dataset.publicationsVideoBound = "true";
      triggerMetadataLoad(video);
      scheduleMetadataRecovery(video);

      video.addEventListener("play", () => {
        pauseOtherVideos(video);
      });
      video.addEventListener("loadedmetadata", () => {
        settleMetadata(video);
      });
      video.addEventListener("durationchange", () => {
        if (!hasValidDuration(video)) return;
        settleMetadata(video);
      });
    });
  };

  const bindRecordToggle = () => {
    const buttons = Array.from(page.querySelectorAll("[data-publications-toggle-button]"));
    const panels = Array.from(page.querySelectorAll("[data-publications-panel]"));

    if (!buttons.length || !panels.length) return;

    const setActivePanel = (target) => {
      buttons.forEach((button) => {
        const isActive = button.dataset.publicationsToggleTarget === target;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.publicationsPanel === target;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    };

    buttons.forEach((button) => {
      if (button.dataset.publicationsToggleBound === "true") return;

      button.dataset.publicationsToggleBound = "true";
      button.addEventListener("click", () => {
        setActivePanel(button.dataset.publicationsToggleTarget);
      });
    });

    const initialButton =
      buttons.find((button) => button.classList.contains("is-active")) ||
      buttons.find((button) => button.getAttribute("aria-pressed") === "true") ||
      buttons[0];

    if (initialButton) {
      setActivePanel(initialButton.dataset.publicationsToggleTarget);
    }
  };

  bindVideos();
  bindRecordToggle();
})();
