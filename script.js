(() => {
  "use strict";

  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        // The site still works when private browsing blocks local storage.
      }
    },
  };

  const pad = (value) => String(value).padStart(2, "0");
  const select = (selector, context = document) => context.querySelector(selector);
  const selectAll = (selector, context = document) => [...context.querySelectorAll(selector)];

  // Header, scroll progress, and mobile navigation.
  const header = select("#site-header");
  const progressBar = select("#page-progress-bar");
  const navToggle = select("#nav-toggle");
  const siteNav = select("#site-nav");

  function updateScrollUi() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle("is-scrolled", scrollTop > 24);
    if (progressBar) {
      progressBar.style.width = `${scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0}%`;
    }
  }

  updateScrollUi();
  window.addEventListener("scroll", updateScrollUi, { passive: true });

  function closeNavigation() {
    navToggle?.setAttribute("aria-expanded", "false");
    siteNav?.classList.remove("is-open");
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    siteNav?.classList.toggle("is-open", !isOpen);
  });

  selectAll("a", siteNav).forEach((link) => link.addEventListener("click", closeNavigation));
  document.addEventListener("click", (event) => {
    if (siteNav?.classList.contains("is-open") && !header?.contains(event.target)) closeNavigation();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavigation();
  });

  // Theme preference.
  const themeToggle = select("#theme-toggle");
  const savedTheme = storage.get("love-archive-theme");
  if (savedTheme === "night") root.dataset.theme = "night";

  function updateThemeLabel() {
    const isNight = root.dataset.theme === "night";
    const label = isNight ? "切换日间模式" : "切换夜间模式";
    themeToggle?.setAttribute("aria-label", label);
    themeToggle?.setAttribute("title", label);
  }

  updateThemeLabel();
  themeToggle?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "night" ? "day" : "night";
    if (nextTheme === "night") root.dataset.theme = "night";
    else delete root.dataset.theme;
    storage.set("love-archive-theme", nextTheme);
    updateThemeLabel();
  });

  // Reveal elements and highlight the current navigation section.
  const revealElements = selectAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -5%" },
    );
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }

  const navLinks = selectAll(".site-nav a");
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-38% 0px -52%", threshold: 0 },
    );
    selectAll("main section[id]").forEach((section) => sectionObserver.observe(section));
  }

  // Count the time since the shared milestone.
  const milestone = new Date("2026-07-21T11:38:00+08:00").getTime();
  const counterFields = {
    days: select('[data-counter="days"]'),
    hours: select('[data-counter="hours"]'),
    minutes: select('[data-counter="minutes"]'),
    seconds: select('[data-counter="seconds"]'),
  };

  function updateLoveCounter() {
    const elapsed = Math.max(0, Date.now() - milestone);
    const day = 86_400_000;
    const hour = 3_600_000;
    const minute = 60_000;
    if (counterFields.days) counterFields.days.textContent = String(Math.floor(elapsed / day));
    if (counterFields.hours) counterFields.hours.textContent = pad(Math.floor((elapsed % day) / hour));
    if (counterFields.minutes) counterFields.minutes.textContent = pad(Math.floor((elapsed % hour) / minute));
    if (counterFields.seconds) counterFields.seconds.textContent = pad(Math.floor((elapsed % minute) / 1000));
  }

  updateLoveCounter();
  window.setInterval(updateLoveCounter, 1000);

  // Gallery lightbox.
  const galleryItems = selectAll("[data-gallery-index]").map((card) => {
    const image = select("img", card);
    const caption = select("span", card);
    return { src: image.currentSrc || image.src, alt: image.alt, caption: caption.textContent.trim().replace(/\s+/g, " ") };
  });
  const lightbox = select("#lightbox");
  const lightboxImage = select("#lightbox-image");
  const lightboxCaption = select("#lightbox-caption");
  let activeImage = 0;

  function renderLightbox(index) {
    if (!galleryItems.length) return;
    activeImage = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[activeImage];
    lightboxImage.src = item.src;
    lightboxImage.alt = item.alt;
    lightboxCaption.textContent = `${activeImage + 1} / ${galleryItems.length} · ${item.caption}`;
  }

  selectAll("[data-gallery-index]").forEach((card) => {
    card.addEventListener("click", () => {
      renderLightbox(Number(card.dataset.galleryIndex));
      lightbox?.showModal();
    });
  });
  select(".lightbox__close", lightbox)?.addEventListener("click", () => lightbox.close());
  select(".lightbox__nav--prev", lightbox)?.addEventListener("click", () => renderLightbox(activeImage - 1));
  select(".lightbox__nav--next", lightbox)?.addEventListener("click", () => renderLightbox(activeImage + 1));
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") renderLightbox(activeImage - 1);
    if (event.key === "ArrowRight") renderLightbox(activeImage + 1);
  });

  // Toast notifications.
  const toast = select("#toast");
  let toastTimer;
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  // Lightweight canvas celebration, with no external dependency.
  const celebration = select("#celebration");
  const context = celebration?.getContext("2d");
  let celebrationFrame = 0;

  function burstHearts(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
    if (!context || reducedMotion.matches) return;
    window.cancelAnimationFrame(celebrationFrame);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    celebration.width = Math.floor(window.innerWidth * ratio);
    celebration.height = Math.floor(window.innerHeight * ratio);
    celebration.style.width = `${window.innerWidth}px`;
    celebration.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);

    const colors = ["#a85f68", "#d98e91", "#ba925b", "#9eb9c1", "#76806a"];
    const particles = Array.from({ length: 42 }, (_, index) => ({
      x: originX,
      y: originY,
      vx: Math.cos((Math.PI * 2 * index) / 42) * (2 + Math.random() * 5),
      vy: Math.sin((Math.PI * 2 * index) / 42) * (2 + Math.random() * 5) - 2,
      size: 5 + Math.random() * 7,
      color: colors[index % colors.length],
      rotation: Math.random() * Math.PI,
      life: 1,
    }));

    function drawHeart(x, y, size, rotation, color, alpha) {
      context.save();
      context.translate(x, y);
      context.rotate(rotation);
      context.scale(size / 24, size / 24);
      context.beginPath();
      context.moveTo(12, 21);
      context.bezierCurveTo(10, 18, 3, 14, 3, 8);
      context.bezierCurveTo(3, 3, 10, 1, 12, 6);
      context.bezierCurveTo(14, 1, 21, 3, 21, 8);
      context.bezierCurveTo(21, 14, 14, 18, 12, 21);
      context.fillStyle = color;
      context.globalAlpha = alpha;
      context.fill();
      context.restore();
    }

    function animate() {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let alive = false;
      particles.forEach((particle) => {
        if (particle.life <= 0) return;
        alive = true;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.075;
        particle.vx *= 0.992;
        particle.rotation += 0.045;
        particle.life -= 0.012;
        drawHeart(particle.x, particle.y, particle.size, particle.rotation, particle.color, Math.max(0, particle.life));
      });
      if (alive) celebrationFrame = window.requestAnimationFrame(animate);
      else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }

    animate();
  }

  // Interactive reason cards.
  selectAll(".reason-card").forEach((card) => {
    card.addEventListener("click", () => {
      const isLoved = card.classList.toggle("is-loved");
      card.setAttribute("aria-pressed", String(isLoved));
      if (isLoved) {
        const rect = card.getBoundingClientRect();
        burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  });

  // Bucket-list state persists locally.
  const promiseInputs = selectAll('#promise-list input[type="checkbox"]');
  const promiseComplete = select("#promise-complete");
  const promiseTotal = select("#promise-total");
  const promiseProgressBar = select("#promise-progress-bar");
  let savedPromises = [];
  try {
    savedPromises = JSON.parse(storage.get("love-archive-promises", "[]"));
    if (!Array.isArray(savedPromises)) savedPromises = [];
  } catch {
    savedPromises = [];
  }

  promiseInputs.forEach((input) => {
    input.checked = savedPromises.includes(input.value);
  });

  function updatePromiseProgress(celebrate = false) {
    const completed = promiseInputs.filter((input) => input.checked).length;
    if (promiseComplete) promiseComplete.textContent = String(completed);
    if (promiseTotal) promiseTotal.textContent = String(promiseInputs.length);
    if (promiseProgressBar) promiseProgressBar.style.width = `${promiseInputs.length ? (completed / promiseInputs.length) * 100 : 0}%`;
    storage.set("love-archive-promises", JSON.stringify(promiseInputs.filter((input) => input.checked).map((input) => input.value)));
    if (celebrate && completed === promiseInputs.length && completed > 0) {
      burstHearts(window.innerWidth / 2, window.innerHeight * 0.62);
      showToast("约定全部点亮，接下来一起去实现吧 ♡");
    }
  }

  updatePromiseProgress();
  promiseInputs.forEach((input) => input.addEventListener("change", () => updatePromiseProgress(true)));

  // Love letter dialog.
  const letterDialog = select("#letter-dialog");
  select("#open-letter")?.addEventListener("click", (event) => {
    letterDialog?.showModal();
    const rect = event.currentTarget.getBoundingClientRect();
    burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
  select(".letter-dialog__close", letterDialog)?.addEventListener("click", () => letterDialog.close());
  letterDialog?.addEventListener("click", (event) => {
    if (event.target === letterDialog) letterDialog.close();
  });

  // Share with Web Share API, then gracefully fall back to copying the URL.
  select("#share-site")?.addEventListener("click", async () => {
    const shareData = {
      title: document.title,
      text: "日子缓缓，爱意漫漫。来看看我们的恋爱纪念册。",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        showToast("链接已复制，去分享这份心意吧");
      } else {
        window.prompt("复制这个链接分享：", window.location.href);
      }
    } catch (error) {
      if (error?.name !== "AbortError") showToast("暂时无法分享，请复制浏览器地址");
    }
  });

  // A private note stored only in this browser.
  const noteForm = select("#note-form");
  const privateNote = select("#private-note");
  const noteCount = select("#note-count");
  if (privateNote) privateNote.value = storage.get("love-archive-note", "");

  function updateNoteCount() {
    if (noteCount && privateNote) noteCount.textContent = String(privateNote.value.length);
  }

  updateNoteCount();
  privateNote?.addEventListener("input", updateNoteCount);
  noteForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = privateNote.value.trim();
    if (!value) {
      privateNote.focus();
      showToast("先写下一句话，再把它珍藏起来吧");
      return;
    }
    storage.set("love-archive-note", value);
    showToast("这句话已经替未来的你们收好啦");
    const rect = noteForm.getBoundingClientRect();
    burstHearts(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  // Subtle cursor hearts on fine-pointer devices.
  let lastHeartAt = 0;
  window.addEventListener(
    "pointermove",
    (event) => {
      const now = performance.now();
      if (!canHover.matches || reducedMotion.matches || now - lastHeartAt < 110) return;
      lastHeartAt = now;
      const heart = document.createElement("span");
      heart.className = "cursor-heart";
      heart.textContent = "♡";
      heart.style.left = `${event.clientX}px`;
      heart.style.top = `${event.clientY}px`;
      heart.style.fontSize = `${10 + Math.random() * 7}px`;
      document.body.append(heart);
      window.setTimeout(() => heart.remove(), 950);
    },
    { passive: true },
  );

  const year = select("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
