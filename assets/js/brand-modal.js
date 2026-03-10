(() => {
  const trigger = document.getElementById("brand-modal-trigger");
  const modal = document.getElementById("brand-image-modal");
  const navbar = document.getElementById("navbar");

  if (!trigger || !modal || !navbar) return;

  const closeButton = modal.querySelector("[data-brand-modal-close]");
  const overlayVideos = modal.querySelectorAll("video");
  const root = document.documentElement;
  const getStartTime = (video) => {
    const start = Number(video.dataset.start);
    return Number.isFinite(start) && start >= 0 ? start : 0;
  };

  const setModalTop = () => {
    const height = navbar.offsetHeight || 0;
    root.style.setProperty("--brand-modal-top", `${height}px`);
  };

  const openModal = () => {
    setModalTop();
    root.classList.add("brand-modal-open");
    document.body.classList.add("brand-modal-open");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    overlayVideos.forEach((video) => {
      video.currentTime = getStartTime(video);
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    });
    if (closeButton) closeButton.focus();
  };

  const closeModal = () => {
    overlayVideos.forEach((video) => {
      video.pause();
      video.currentTime = getStartTime(video);
    });
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    root.classList.remove("brand-modal-open");
    document.body.classList.remove("brand-modal-open");
  };

  const isOpen = () => modal.classList.contains("is-open");

  trigger.addEventListener("click", (event) => {
    // Respect "open in new tab/window" intent.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openModal();
  });

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isOpen()) closeModal();
  });

  window.addEventListener("resize", () => {
    if (isOpen()) setModalTop();
  });
})();
