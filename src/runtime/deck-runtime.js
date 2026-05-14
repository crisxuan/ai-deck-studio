(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.querySelector("[data-deck-progress]");
  const prevButton = document.querySelector("[data-deck-prev]");
  const nextButton = document.querySelector("[data-deck-next]");
  const notes = Array.from(document.querySelectorAll(".speaker-notes"));
  const params = new URLSearchParams(window.location.search);
  const printMode = params.get("print") === "1" || params.get("mode") === "print";
  const previewIndex = Number(params.get("preview"));
  const isPreview = Number.isFinite(previewIndex) && previewIndex > 0;
  let current = clamp(readInitialIndex(), 0, slides.length - 1);
  let notesDrawer = null;
  let overview = null;
  let presenterWindow = null;
  let startedAt = Date.now();

  if (printMode) {
    document.body.classList.add("print-mode");
    slides.forEach((slide) => slide.classList.add("is-active"));
    return;
  }

  if (isPreview) {
    document.body.classList.add("preview-mode");
    goTo(previewIndex - 1, { silent: true });
    window.addEventListener("message", (event) => {
      if (event.data?.type === "preview-goto") {
        goTo(Number(event.data.index), { silent: true });
      }
    });
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

    updateNotesDrawer();
    updatePresenter();
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

  function currentSlideId(index = current) {
    return slides[index]?.getAttribute("data-slide-id") || "";
  }

  function currentSlideTitle(index = current) {
    const slide = slides[index];
    const heading = slide?.querySelector("h1,h2");
    return heading?.textContent?.trim() || `Slide ${index + 1}`;
  }

  function currentNotes(index = current) {
    const slideId = currentSlideId(index);
    const note = notes.find((item) => item.getAttribute("data-notes-for") === slideId);
    return note?.textContent?.trim() || "No speaker notes for this slide yet.";
  }

  function buildDeckUrl(index) {
    const url = new URL(window.location.href);
    url.searchParams.set("preview", String(index + 1));
    url.hash = "";
    return url.toString();
  }

  function toggleNotesDrawer() {
    if (!notesDrawer) {
      notesDrawer = document.createElement("aside");
      notesDrawer.className = "notes-drawer";
      notesDrawer.innerHTML = '<button type="button" aria-label="Close speaker notes">×</button><h2></h2><p></p>';
      notesDrawer.querySelector("button")?.addEventListener("click", toggleNotesDrawer);
      document.body.append(notesDrawer);
    }

    notesDrawer.classList.toggle("is-open");
    updateNotesDrawer();
  }

  function updateNotesDrawer() {
    if (!notesDrawer) {
      return;
    }

    const title = notesDrawer.querySelector("h2");
    const body = notesDrawer.querySelector("p");
    if (title) {
      title.textContent = currentSlideTitle();
    }
    if (body) {
      body.textContent = currentNotes();
    }
  }

  function toggleOverview() {
    if (!overview) {
      overview = document.createElement("aside");
      overview.className = "deck-overview";
      overview.innerHTML = `
        <div class="deck-overview-panel">
          <button type="button" aria-label="Close slide overview">×</button>
          <h2>Slides</h2>
          <div class="deck-overview-grid"></div>
        </div>
      `;
      overview.querySelector("button")?.addEventListener("click", toggleOverview);
      overview.querySelector(".deck-overview-grid").innerHTML = slides
        .map(
          (_slide, index) => `
            <button type="button" data-overview-slide="${index}">
              <span>${String(index + 1).padStart(2, "0")}</span>
              ${escapeText(currentSlideTitle(index))}
            </button>
          `
        )
        .join("");
      overview.addEventListener("click", (event) => {
        const target = event.target instanceof Element ? event.target.closest("[data-overview-slide]") : null;
        if (!target) {
          return;
        }

        goTo(Number(target.getAttribute("data-overview-slide")));
        toggleOverview();
      });
      document.body.append(overview);
    }

    overview.classList.toggle("is-open");
  }

  function openPresenter() {
    presenterWindow = window.open("", "ai-deck-presenter", "width=1320,height=760");

    if (!presenterWindow) {
      return;
    }

    presenterWindow.document.open();
    presenterWindow.document.write(presenterHtml());
    presenterWindow.document.close();

    const presenterPrev = presenterWindow.document.querySelector("[data-presenter-prev]");
    const presenterNext = presenterWindow.document.querySelector("[data-presenter-next]");
    const presenterReset = presenterWindow.document.querySelector("[data-presenter-reset]");

    presenterPrev?.addEventListener("click", prev);
    presenterNext?.addEventListener("click", next);
    presenterReset?.addEventListener("click", () => {
      startedAt = Date.now();
      updatePresenter();
    });

    presenterWindow.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        prev();
      }
      if (event.key.toLowerCase() === "r") {
        startedAt = Date.now();
        updatePresenter();
      }
    });

    updatePresenter();
    presenterWindow.setInterval(updatePresenterClock, 1000);
  }

  function presenterHtml() {
    return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Presenter · ${escapeText(document.title)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #0b0f17;
            color: #e5edf7;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .presenter-shell {
            display: grid;
            grid-template-columns: 1.12fr 0.88fr;
            gap: 14px;
            min-height: 100vh;
            padding: 14px;
          }
          .presenter-card {
            overflow: hidden;
            border: 1px solid rgba(148, 163, 184, 0.24);
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.9);
            box-shadow: 0 24px 64px rgba(0, 0, 0, 0.34);
          }
          .presenter-card h2 {
            margin: 0;
            padding: 13px 16px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.18);
            color: #94a3b8;
            font-size: 12px;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          .preview-card iframe {
            display: block;
            width: 100%;
            height: calc((100vw - 46px) * 0.5625 / 2);
            min-height: 330px;
            border: 0;
            background: #111827;
          }
          .side {
            display: grid;
            gap: 14px;
            grid-template-rows: auto 1fr auto;
          }
          .script {
            padding: 18px 20px 24px;
            color: #f8fafc;
            font-size: 24px;
            line-height: 1.5;
            white-space: pre-wrap;
          }
          .meta {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 10px;
            padding: 14px;
          }
          .metric {
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 8px;
            padding: 13px;
          }
          .metric span {
            display: block;
            margin-bottom: 6px;
            color: #94a3b8;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .metric strong {
            color: #ffffff;
            font-size: 24px;
          }
          .controls {
            display: flex;
            gap: 10px;
            padding: 14px;
          }
          .controls button {
            flex: 1;
            border: 0;
            border-radius: 999px;
            background: #e5edf7;
            color: #0b0f17;
            cursor: pointer;
            font: inherit;
            font-weight: 850;
            padding: 12px 16px;
          }
        </style>
      </head>
      <body>
        <main class="presenter-shell">
          <section class="presenter-card preview-card">
            <h2>Current</h2>
            <iframe data-current-frame src="${buildDeckUrl(current)}"></iframe>
          </section>
          <div class="side">
            <section class="presenter-card preview-card">
              <h2>Next</h2>
              <iframe data-next-frame src="${buildDeckUrl(clamp(current + 1, 0, slides.length - 1))}"></iframe>
            </section>
            <section class="presenter-card">
              <h2>Speaker Script</h2>
              <div class="script" data-presenter-notes></div>
            </section>
            <section class="presenter-card">
              <div class="meta">
                <div class="metric"><span>Slide</span><strong data-presenter-progress></strong></div>
                <div class="metric"><span>Timer</span><strong data-presenter-timer></strong></div>
                <div class="metric"><span>Next</span><strong data-presenter-next-title></strong></div>
              </div>
              <div class="controls">
                <button type="button" data-presenter-prev>Previous</button>
                <button type="button" data-presenter-reset>Reset timer</button>
                <button type="button" data-presenter-next>Next</button>
              </div>
            </section>
          </div>
        </main>
      </body>
      </html>`;
  }

  function updatePresenter() {
    if (!presenterWindow || presenterWindow.closed) {
      return;
    }

    const doc = presenterWindow.document;
    const nextIndex = clamp(current + 1, 0, slides.length - 1);
    const currentFrame = doc.querySelector("[data-current-frame]");
    const nextFrame = doc.querySelector("[data-next-frame]");
    const notesPanel = doc.querySelector("[data-presenter-notes]");
    const progressPanel = doc.querySelector("[data-presenter-progress]");
    const nextTitle = doc.querySelector("[data-presenter-next-title]");

    if (currentFrame) {
      currentFrame.src = buildDeckUrl(current);
    }
    if (nextFrame) {
      nextFrame.src = buildDeckUrl(nextIndex);
    }
    if (notesPanel) {
      notesPanel.textContent = currentNotes();
    }
    if (progressPanel) {
      progressPanel.textContent = `${current + 1}/${slides.length}`;
    }
    if (nextTitle) {
      nextTitle.textContent = current === slides.length - 1 ? "End" : currentSlideTitle(nextIndex);
    }

    updatePresenterClock();
  }

  function updatePresenterClock() {
    if (!presenterWindow || presenterWindow.closed) {
      return;
    }

    const timer = presenterWindow.document.querySelector("[data-presenter-timer]");
    if (!timer) {
      return;
    }

    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = String(elapsed % 60).padStart(2, "0");
    timer.textContent = `${minutes}:${seconds}`;
  }

  function escapeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
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

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      toggleNotesDrawer();
    }

    if (event.key.toLowerCase() === "o") {
      event.preventDefault();
      toggleOverview();
    }

    if (event.key.toLowerCase() === "s") {
      event.preventDefault();
      openPresenter();
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
    count: slides.length,
    openPresenter,
    toggleNotesDrawer,
    toggleOverview
  };

  goTo(current, { silent: true });
})();
