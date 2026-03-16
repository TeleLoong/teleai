(() => {
  const players = Array.from(document.querySelectorAll("[data-research-player]"));

  if (!players.length) return;

  const MODE = {
    IDLE: "idle",
    LOADING: "loading",
    PLAYING: "playing",
    PAUSED: "paused",
    SEEKING: "seeking",
    ENDED: "ended",
  };

  const LOAD_TIMEOUT_MS = 8000;
  const SEEK_SETTLE_EPSILON = 0.2;
  const PLAY_PROGRESS_WATCHDOG_MS = 2600;
  const PLAY_PROGRESS_MIN_DELTA = 0.15;
  const MAX_AUTO_RECOVERY_ATTEMPTS = 1;
  const state = new WeakMap();

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

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getBufferedEnd = (video) => {
    if (!video.buffered || video.buffered.length === 0) {
      return Number.isFinite(video.currentTime) ? Math.max(video.currentTime, 0) : 0;
    }

    let bufferedEnd = 0;
    for (let index = 0; index < video.buffered.length; index += 1) {
      try {
        bufferedEnd = Math.max(bufferedEnd, video.buffered.end(index));
      } catch (_) {
        return bufferedEnd;
      }
    }

    return bufferedEnd;
  };

  const getDuration = (playerState) => {
    const { video } = playerState;
    if (Number.isFinite(video.duration) && video.duration > 0) {
      playerState.lastKnownDuration = video.duration;
      return video.duration;
    }

    return playerState.lastKnownDuration;
  };

  const getCurrentTime = (playerState, previewTime = null) => {
    if (Number.isFinite(previewTime)) {
      return previewTime;
    }

    const current = playerState.video.currentTime;
    if (Number.isFinite(current) && current >= 0) {
      playerState.lastKnownTime = current;
      return current;
    }

    return playerState.lastKnownTime;
  };

  const showReplayOverlay = (playerState, visible) => {
    const { replayOverlay } = playerState;
    if (!replayOverlay) return;

    replayOverlay.hidden = !visible;
    replayOverlay.classList.toggle("is-visible", visible);
    replayOverlay.setAttribute("aria-hidden", visible ? "false" : "true");
  };

  const showStatus = (playerState, text, tone = "info") => {
    const { status } = playerState;
    if (!status) return;

    status.textContent = text;
    status.classList.add("is-visible");
    status.classList.toggle("is-error", tone === "error");
  };

  const clearStatus = (playerState) => {
    const { status } = playerState;
    if (!status) return;

    status.textContent = "";
    status.classList.remove("is-visible", "is-error");
  };

  const clearLoadTimeout = (playerState) => {
    if (!playerState.loadTimeoutId) return;
    window.clearTimeout(playerState.loadTimeoutId);
    playerState.loadTimeoutId = null;
  };

  const clearProgressWatchdog = (playerState) => {
    if (playerState.progressWatchdogId) {
      window.clearTimeout(playerState.progressWatchdogId);
      playerState.progressWatchdogId = null;
    }
    playerState.awaitingProgress = false;
    playerState.progressBaseline = null;
  };

  const getFailureMessage = (playerState) =>
    Number.isFinite(playerState.pendingSeekTime)
      ? "视频跳转失败，请再次点击播放或刷新后重试。"
      : "视频加载失败，请再次点击播放或刷新后重试。";

  const armLoadTimeout = (playerState, message) => {
    clearLoadTimeout(playerState);

    playerState.loadTimeoutId = window.setTimeout(() => {
      playerState.wantsPlay = false;
      playerState.pendingSeekTime = null;
      clearProgressWatchdog(playerState);
      playerState.mode = MODE.PAUSED;
      updateToggle(playerState);
      showStatus(playerState, message, "error");
    }, LOAD_TIMEOUT_MS);
  };

  const syncTimeline = (playerState, previewTime = null) => {
    const { controls } = playerState;
    const duration = getDuration(playerState);
    const current = getCurrentTime(playerState, previewTime);
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const safeCurrent = safeDuration > 0 ? clamp(current, 0, safeDuration) : Math.max(current, 0);
    const playedRatio = safeDuration > 0 ? clamp(safeCurrent / safeDuration, 0, 1) : 0;
    const bufferedRatio = safeDuration > 0 ? clamp(getBufferedEnd(playerState.video) / safeDuration, 0, 1) : 0;

    if (controls.currentTime) controls.currentTime.textContent = formatTime(safeCurrent);
    if (controls.duration) controls.duration.textContent = formatTime(safeDuration);
    if (controls.played) controls.played.style.width = `${playedRatio * 100}%`;
    if (controls.thumb) controls.thumb.style.left = `${playedRatio * 100}%`;
    if (controls.buffered) controls.buffered.style.width = `${bufferedRatio * 100}%`;

    if (controls.progress) {
      controls.progress.setAttribute("aria-valuemax", String(Math.round(safeDuration)));
      controls.progress.setAttribute("aria-valuenow", String(Math.round(safeCurrent)));
      controls.progress.setAttribute("aria-valuetext", `${formatTime(safeCurrent)} / ${formatTime(safeDuration)}`);
      controls.progress.setAttribute("aria-disabled", safeDuration > 0 ? "false" : "true");
    }
  };

  const updateToggle = (playerState) => {
    const { toggle } = playerState.controls;
    if (!toggle) return;

    let label = "播放";
    if (playerState.mode === MODE.LOADING || playerState.mode === MODE.SEEKING) {
      label = "加载中";
    } else if (playerState.mode === MODE.PLAYING) {
      label = "暂停";
    } else if (playerState.mode === MODE.ENDED) {
      label = "重播";
    }

    toggle.textContent = label;
    toggle.setAttribute("aria-label", `${label}视频`);
  };

  const clearPlayRequest = (playerState, playRequest) => {
    if (playerState.playRequest === playRequest) {
      playerState.playRequest = null;
    }
  };

  const settlePlaying = (playerState) => {
    clearLoadTimeout(playerState);
    clearProgressWatchdog(playerState);
    playerState.playRequest = null;
    playerState.wantsPlay = false;
    playerState.pendingSeekTime = null;
    playerState.recoveryResumeTime = null;
    playerState.autoRecoveryCount = 0;
    playerState.mode = MODE.PLAYING;
    updateToggle(playerState);
    clearStatus(playerState);
    showReplayOverlay(playerState, false);
    syncTimeline(playerState);
  };

  const observePlaybackProgress = (playerState) => {
    if (!playerState.awaitingProgress) return false;

    const baseline = Number.isFinite(playerState.progressBaseline) ? playerState.progressBaseline : 0;
    const current = getCurrentTime(playerState);
    if (current - baseline < PLAY_PROGRESS_MIN_DELTA) {
      return false;
    }

    settlePlaying(playerState);
    return true;
  };

  const runAutoRecovery = (playerState) => {
    const { video } = playerState;
    if (playerState.autoRecoveryCount >= MAX_AUTO_RECOVERY_ATTEMPTS) {
      playerState.wantsPlay = false;
      playerState.pendingSeekTime = null;
      clearProgressWatchdog(playerState);
      playerState.mode = MODE.PAUSED;
      updateToggle(playerState);
      showStatus(playerState, "视频启动失败，请再次点击播放或刷新后重试。", "error");
      return false;
    }

    playerState.autoRecoveryCount += 1;
    playerState.recoveryResumeTime = Number.isFinite(playerState.pendingSeekTime)
      ? playerState.pendingSeekTime
      : getCurrentTime(playerState);
    playerState.mode = Number.isFinite(playerState.pendingSeekTime) ? MODE.SEEKING : MODE.LOADING;
    updateToggle(playerState);
    showStatus(playerState, "视频启动较慢，正在自动恢复...");
    armLoadTimeout(playerState, getFailureMessage(playerState));

    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      video.load();
      return true;
    }

    try {
      video.pause();
    } catch (_) {
      // Ignore pause errors while recovering stalled startup.
    }
    video.load();
    return true;
  };

  const armProgressWatchdog = (playerState, baseline) => {
    clearProgressWatchdog(playerState);
    playerState.awaitingProgress = true;
    playerState.progressBaseline = Number.isFinite(baseline) ? baseline : getCurrentTime(playerState);

    playerState.progressWatchdogId = window.setTimeout(() => {
      playerState.progressWatchdogId = null;
      if (!playerState.wantsPlay || !playerState.awaitingProgress) return;

      if (observePlaybackProgress(playerState)) return;
      const recoveryStarted = runAutoRecovery(playerState);
      if (!recoveryStarted) return;
      armProgressWatchdog(
        playerState,
        Number.isFinite(playerState.recoveryResumeTime)
          ? playerState.recoveryResumeTime
          : Number.isFinite(playerState.pendingSeekTime)
            ? playerState.pendingSeekTime
            : getCurrentTime(playerState)
      );
    }, PLAY_PROGRESS_WATCHDOG_MS);
  };

  const attemptPlay = (playerState) => {
    const { video } = playerState;
    if (!playerState.wantsPlay || video.seeking || (!video.paused && !video.ended) || playerState.playRequest) return;

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playerState.playRequest = playPromise;

      playPromise.catch(() => {
        clearPlayRequest(playerState, playPromise);

        if (!playerState.wantsPlay) return;

        if (video.seeking || Number.isFinite(playerState.pendingSeekTime)) {
          return;
        }

        playerState.wantsPlay = false;
        playerState.pendingSeekTime = null;
        playerState.mode = MODE.PAUSED;
        updateToggle(playerState);
        showStatus(playerState, "视频播放失败，请再次点击播放或刷新后重试。", "error");
      });

      playPromise.then(() => {
        clearPlayRequest(playerState, playPromise);
      });
    }
  };

  const requestPlayback = (playerState, reason = "play") => {
    const { video } = playerState;

    playerState.autoRecoveryCount = 0;
    playerState.recoveryResumeTime = null;
    playerState.wantsPlay = true;
    showReplayOverlay(playerState, false);
    playerState.mode = reason === "seek" ? MODE.SEEKING : MODE.LOADING;
    updateToggle(playerState);

    if (reason === "seek") {
      showStatus(playerState, "正在跳转到目标位置...");
      armLoadTimeout(playerState, getFailureMessage(playerState));
    } else {
      showStatus(playerState, "正在加载视频...");
      armLoadTimeout(playerState, getFailureMessage(playerState));
    }

    armProgressWatchdog(
      playerState,
      Number.isFinite(playerState.pendingSeekTime) ? playerState.pendingSeekTime : getCurrentTime(playerState)
    );

    if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) {
      video.load();
    }

    if (reason !== "seek") {
      attemptPlay(playerState);
    }
  };

  const pausePlayback = (playerState) => {
    playerState.wantsPlay = false;
    playerState.pendingSeekTime = null;
    playerState.recoveryResumeTime = null;
    clearLoadTimeout(playerState);
    clearProgressWatchdog(playerState);

    if (!playerState.video.paused) {
      playerState.video.pause();
    }

    playerState.mode = MODE.PAUSED;
    updateToggle(playerState);
    clearStatus(playerState);
  };

  const restartPlayback = (playerState) => {
    const { video } = playerState;
    showReplayOverlay(playerState, false);
    clearStatus(playerState);
    playerState.pendingSeekTime = 0;

    if (Number.isFinite(video.currentTime) && video.currentTime !== 0) {
      video.currentTime = 0;
    }

    syncTimeline(playerState, 0);
    requestPlayback(playerState, "restart");
  };

  const seekTo = (playerState, requestedTime, previewOnly = false) => {
    const duration = getDuration(playerState);
    if (!Number.isFinite(duration) || duration <= 0) return;

    const targetTime = clamp(requestedTime, 0, duration);

    if (previewOnly) {
      syncTimeline(playerState, targetTime);
      return;
    }

    playerState.pendingSeekTime = targetTime;
    playerState.wantsPlay = true;
    showReplayOverlay(playerState, false);
    syncTimeline(playerState, targetTime);
    requestPlayback(playerState, "seek");

    try {
      playerState.video.currentTime = targetTime;
      attemptPlay(playerState);
    } catch (_) {
      playerState.wantsPlay = false;
      playerState.pendingSeekTime = null;
      playerState.mode = MODE.PAUSED;
      updateToggle(playerState);
      showStatus(playerState, "当前进度暂时不可用，请稍后再试。", "error");
    }
  };

  const getProgressTimeFromPointer = (progress, clientX, duration) => {
    const rect = progress.getBoundingClientRect();
    if (!rect.width) return 0;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return ratio * duration;
  };

  const bindProgressEvents = (playerState) => {
    const { progress } = playerState.controls;
    if (!progress) return;

    progress.addEventListener("pointerdown", (event) => {
      const duration = getDuration(playerState);
      if (!Number.isFinite(duration) || duration <= 0) return;

      event.preventDefault();
      playerState.isDragging = true;
      progress.setPointerCapture(event.pointerId);
      const previewTime = getProgressTimeFromPointer(progress, event.clientX, duration);
      seekTo(playerState, previewTime, true);
    });

    progress.addEventListener("pointermove", (event) => {
      if (!playerState.isDragging) return;
      const duration = getDuration(playerState);
      if (!Number.isFinite(duration) || duration <= 0) return;

      const previewTime = getProgressTimeFromPointer(progress, event.clientX, duration);
      seekTo(playerState, previewTime, true);
    });

    const finishDrag = (event) => {
      if (!playerState.isDragging) return;

      const duration = getDuration(playerState);
      playerState.isDragging = false;
      if (progress.hasPointerCapture(event.pointerId)) {
        progress.releasePointerCapture(event.pointerId);
      }

      if (!Number.isFinite(duration) || duration <= 0) return;

      const targetTime = getProgressTimeFromPointer(progress, event.clientX, duration);
      seekTo(playerState, targetTime);
    };

    progress.addEventListener("pointerup", finishDrag);
    progress.addEventListener("pointercancel", finishDrag);

    progress.addEventListener("keydown", (event) => {
      const duration = getDuration(playerState);
      if (!Number.isFinite(duration) || duration <= 0) return;

      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();

      let nextTime = getCurrentTime(playerState);
      if (event.key === "ArrowLeft") nextTime -= 5;
      if (event.key === "ArrowRight") nextTime += 5;
      if (event.key === "Home") nextTime = 0;
      if (event.key === "End") nextTime = duration;

      seekTo(playerState, nextTime);
    });
  };

  const bindPlayer = (player) => {
    if (player.dataset.researchBound === "true") return;

    const video = player.querySelector("video[data-research-video]");
    const controls = player.querySelector("[data-research-player-controls]");
    const toggle = controls ? controls.querySelector("[data-research-player-toggle]") : null;
    const progress = controls ? controls.querySelector("[data-research-progress]") : null;

    if (!video || !controls || !toggle || !progress) return;

    player.dataset.researchBound = "true";

    const playerState = {
      player,
      video,
      controls: {
        toggle,
        progress,
        buffered: controls.querySelector("[data-research-buffered]"),
        played: controls.querySelector("[data-research-played]"),
        thumb: controls.querySelector("[data-research-thumb]"),
        currentTime: controls.querySelector("[data-research-current-time]"),
        duration: controls.querySelector("[data-research-duration]"),
      },
      status: player.querySelector("[data-research-video-status]"),
      replayOverlay: player.querySelector("[data-research-replay-overlay]"),
      replayButton: player.querySelector("[data-research-replay-button]"),
      mode: MODE.IDLE,
      wantsPlay: false,
      isDragging: false,
      pendingSeekTime: null,
      lastKnownDuration: 0,
      lastKnownTime: 0,
      loadTimeoutId: null,
      playRequest: null,
      progressWatchdogId: null,
      awaitingProgress: false,
      progressBaseline: null,
      autoRecoveryCount: 0,
      recoveryResumeTime: null,
    };

    state.set(video, playerState);

    video.controls = false;
    video.preload = "metadata";

    toggle.addEventListener("click", () => {
      if (playerState.mode === MODE.LOADING || playerState.mode === MODE.SEEKING) {
        pausePlayback(playerState);
        return;
      }

      if (!video.paused && !video.ended) {
        pausePlayback(playerState);
        return;
      }

      if (video.ended || playerState.mode === MODE.ENDED) {
        restartPlayback(playerState);
        return;
      }

      requestPlayback(playerState, "play");
    });

    if (playerState.replayButton) {
      playerState.replayButton.addEventListener("click", () => {
        restartPlayback(playerState);
      });
    }

    bindProgressEvents(playerState);

    video.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(playerState.recoveryResumeTime)) {
        const duration = getDuration(playerState);
        const resumeTime = Number.isFinite(duration)
          ? clamp(playerState.recoveryResumeTime, 0, duration)
          : Math.max(playerState.recoveryResumeTime, 0);

        try {
          video.currentTime = resumeTime;
          syncTimeline(playerState, resumeTime);
        } catch (_) {
          // Ignore seek failures on metadata recovery path.
        }
      }

      syncTimeline(playerState);
      if (playerState.wantsPlay) {
        showStatus(playerState, "正在准备播放...");
      }
    });

    video.addEventListener("durationchange", () => {
      syncTimeline(playerState);
    });

    ["loadeddata", "canplay", "canplaythrough"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        syncTimeline(playerState);
        if (playerState.wantsPlay) {
          attemptPlay(playerState);
        }
      });
    });

    ["timeupdate", "progress"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        if (playerState.isDragging) return;
        syncTimeline(playerState);
        observePlaybackProgress(playerState);
      });
    });

    video.addEventListener("seeking", () => {
      if (!Number.isFinite(playerState.pendingSeekTime)) return;

      playerState.mode = MODE.SEEKING;
      updateToggle(playerState);
      showStatus(playerState, "正在跳转到目标位置...");
    });

    video.addEventListener("seeked", () => {
      syncTimeline(playerState);

      if (!Number.isFinite(playerState.pendingSeekTime)) return;

      const reachedTarget = Math.abs(video.currentTime - playerState.pendingSeekTime) <= SEEK_SETTLE_EPSILON;
      if (reachedTarget) {
        playerState.pendingSeekTime = null;
      }

      if (playerState.wantsPlay) {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          attemptPlay(playerState);
        }
        return;
      }

      playerState.mode = video.paused ? MODE.PAUSED : MODE.PLAYING;
      updateToggle(playerState);
    });

    video.addEventListener("play", () => {
      if (playerState.mode !== MODE.SEEKING) {
        playerState.mode = MODE.LOADING;
        updateToggle(playerState);
      }
    });

    video.addEventListener("playing", () => {
      playerState.playRequest = null;
      showReplayOverlay(playerState, false);
      syncTimeline(playerState);
      observePlaybackProgress(playerState);
    });

    video.addEventListener("pause", () => {
      if (video.ended || playerState.wantsPlay) return;

      clearLoadTimeout(playerState);
      clearProgressWatchdog(playerState);
      playerState.playRequest = null;
      playerState.recoveryResumeTime = null;
      playerState.mode = MODE.PAUSED;
      updateToggle(playerState);
      clearStatus(playerState);
    });

    video.addEventListener("waiting", () => {
      if (playerState.isDragging) return;
      if (!playerState.wantsPlay && !video.paused && !video.ended) {
        playerState.wantsPlay = true;
      }

      playerState.mode = Number.isFinite(playerState.pendingSeekTime) ? MODE.SEEKING : MODE.LOADING;
      updateToggle(playerState);
      showStatus(
        playerState,
        Number.isFinite(playerState.pendingSeekTime) ? "正在跳转到目标位置..." : "正在缓冲视频..."
      );
      armLoadTimeout(playerState, getFailureMessage(playerState));
      armProgressWatchdog(
        playerState,
        Number.isFinite(playerState.pendingSeekTime) ? playerState.pendingSeekTime : getCurrentTime(playerState)
      );
    });

    ["stalled", "suspend"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        if (!playerState.wantsPlay || playerState.isDragging) return;
        playerState.mode = Number.isFinite(playerState.pendingSeekTime) ? MODE.SEEKING : MODE.LOADING;
        updateToggle(playerState);
        showStatus(playerState, "网络波动，正在尝试恢复播放...");
        armLoadTimeout(playerState, getFailureMessage(playerState));
        armProgressWatchdog(
          playerState,
          Number.isFinite(playerState.pendingSeekTime) ? playerState.pendingSeekTime : getCurrentTime(playerState)
        );
      });
    });

    ["emptied", "abort"].forEach((eventName) => {
      video.addEventListener(eventName, () => {
        if (!playerState.wantsPlay) return;
        playerState.mode = MODE.LOADING;
        updateToggle(playerState);
        showStatus(playerState, "视频连接中断，正在重新加载...");
        armLoadTimeout(playerState, getFailureMessage(playerState));
        armProgressWatchdog(playerState, getCurrentTime(playerState));
      });
    });

    video.addEventListener("ended", () => {
      clearLoadTimeout(playerState);
      clearProgressWatchdog(playerState);
      playerState.playRequest = null;
      playerState.wantsPlay = false;
      playerState.pendingSeekTime = null;
      playerState.recoveryResumeTime = null;
      playerState.mode = MODE.ENDED;
      updateToggle(playerState);
      clearStatus(playerState);
      syncTimeline(playerState, getDuration(playerState));
      showReplayOverlay(playerState, true);
    });

    video.addEventListener("error", () => {
      clearLoadTimeout(playerState);
      clearProgressWatchdog(playerState);
      playerState.playRequest = null;
      playerState.wantsPlay = false;
      playerState.pendingSeekTime = null;
      playerState.recoveryResumeTime = null;
      playerState.mode = MODE.PAUSED;
      updateToggle(playerState);
      showReplayOverlay(playerState, false);
      showStatus(playerState, "视频加载失败，请刷新页面后重试。", "error");
    });

    syncTimeline(playerState);
    updateToggle(playerState);
    showReplayOverlay(playerState, false);
  };

  players.forEach(bindPlayer);
})();
