(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.querySelector("[data-deck-progress]");
  const prevButton = document.querySelector("[data-deck-prev]");
  const nextButton = document.querySelector("[data-deck-next]");
  const params = new URLSearchParams(window.location.search);
  const printMode = params.get("print") === "1" || params.get("mode") === "print";
  let current = clamp(readInitialIndex(), 0, slides.length - 1);

  if (printMode) {
    document.body.classList.add("print-mode");
    slides.forEach((slide) => slide.classList.add("is-active"));
    return;
  }

  document.body.classList.add("presentation-mode");

  function goTo(index, options = {}) {
    current = clamp(index, 0, slides.length - 1);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
      slide.setAttribute("aria-hidden", slideIndex === current ? "false" : "true");
    });

    if (progress) {
      progress.textContent = `${current + 1} / ${slides.length}`;
    }

    if (prevButton) {
      prevButton.disabled = current === 0;
    }

    if (nextButton) {
      nextButton.disabled = current === slides.length - 1;
    }

    if (!options.silent) {
      history.replaceState(null, "", `#${current + 1}`);
    }
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function readInitialIndex() {
    const hashIndex = Number(window.location.hash.replace("#", ""));
    if (Number.isFinite(hashIndex) && hashIndex > 0) {
      return hashIndex - 1;
    }

    const queryIndex = Number(params.get("slide"));
    if (Number.isFinite(queryIndex) && queryIndex > 0) {
      return queryIndex - 1;
    }

    return 0;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  prevButton?.addEventListener("click", prev);
  nextButton?.addEventListener("click", next);

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      next();
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      prev();
    }

    if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      goTo(slides.length - 1);
    }
  });

  window.addEventListener("hashchange", () => {
    goTo(readInitialIndex(), { silent: true });
  });

  window.DeckRuntime = {
    goTo,
    next,
    prev,
    get current() {
      return current;
    },
    count: slides.length
  };

  goTo(current, { silent: true });
})();
