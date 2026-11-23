/* ============================================================
   ARRIETA GUADALUPE — PORTAFOLIO 2026
   JavaScript vanilla, sin dependencias.
   ------------------------------------------------------------
   ⚙️  ZONA DE EDICIÓN RÁPIDA
   Cambiá los textos del typewriter y la zona horaria acá.
   Los enlaces (WhatsApp, redes, proyectos) se editan en index.html.
   ============================================================ */

(() => {
  "use strict";

  const CONFIG = {
    // Frases que rota el efecto máquina de escribir del Hero
    typewriterPhrases: [
      "Técnica en Programación",
      "Desarrolladora Web",
      "Apasionada por el Código",
    ],
    // 🎂 Fecha de nacimiento (AAAA-MM-DD). La edad se calcula y actualiza sola.
    birthDate: "2008-04-28",
    timeZone: "America/Argentina/Buenos_Aires",
    locale: "es-AR",
  };

  /* ── Helpers ─────────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /* ══════════════════════════════════════════════════════════
     SONIDOS PIXEL (Web Audio API)
     Apagados por defecto. Se activan con el botón del HUD y
     la preferencia se guarda en el navegador.
     ══════════════════════════════════════════════════════════ */
  const SOUND_KEY = "arrieta-sound";
  const soundToggle = $("#soundToggle");
  const coinCountEl = $("#coinCount");

  let soundEnabled = false;
  let audioCtx = null;
  let masterGain = null;
  let coinCount = 26;

  function ensureAudio() {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioCtx) {
      audioCtx = new AudioCtx();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.55;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  // Un tono corto tipo chip de 8 bits
  function tone({ freq, endFreq = freq, start = 0, dur = 0.1, type = "square", volume = 0.06 }) {
    if (!soundEnabled) return;
    const ctx = ensureAudio();
    if (!ctx || !masterGain) return;

    const t0 = ctx.currentTime + start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + dur);
    }

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  // Moneda: dos notas brillantes (B5 → E6)
  function playCoin() {
    tone({ freq: 988, dur: 0.07, volume: 0.05 });
    tone({ freq: 1319, start: 0.07, dur: 0.13, volume: 0.05 });
    tone({ freq: 1760, start: 0.12, dur: 0.07, volume: 0.025, type: "triangle" });
  }

  // Salto: barrido ascendente
  function playJump() {
    tone({ freq: 220, endFreq: 760, dur: 0.16, volume: 0.045 });
  }

  // 1-UP: arpegio ascendente
  function playOneUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone({ freq, start: i * 0.085, dur: 0.12, volume: 0.04 });
    });
  }

  // Clic de menú
  function playClick() {
    tone({ freq: 440, endFreq: 660, dur: 0.055, volume: 0.032 });
  }

  // Error / bloqueo
  function playError() {
    tone({ freq: 240, endFreq: 110, dur: 0.22, volume: 0.045, type: "sawtooth" });
  }

  const SOUNDS = {
    coin: playCoin,
    jump: playJump,
    oneup: playOneUp,
    click: playClick,
    error: playError,
  };

  function playSound(name) {
    const fn = SOUNDS[name];
    if (fn) fn();
  }

  function bumpCoins(amount = 1) {
    coinCount += amount;
    if (coinCountEl) coinCountEl.textContent = String(coinCount).padStart(2, "0");
  }

  function setSound(on, persist = true) {
    soundEnabled = Boolean(on);
    root.dataset.sound = soundEnabled ? "on" : "off";
    soundToggle?.setAttribute("aria-pressed", String(soundEnabled));
    soundToggle?.setAttribute("aria-label", soundEnabled ? "Desactivar sonidos" : "Activar sonidos");
    soundToggle?.setAttribute("title", soundEnabled ? "Sonido activado" : "Sonido apagado");

    if (persist) {
      try {
        localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
      } catch {
        /* modo privado: sin persistencia */
      }
    }
  }

  function toggleSound() {
    if (soundEnabled) {
      playClick();
      setSound(false);
      return;
    }
    setSound(true);
    playOneUp();
    bumpCoins(1);
  }

  soundToggle?.addEventListener("click", toggleSound);

  // Preferencia guardada: apagado por defecto
  try {
    soundEnabled = localStorage.getItem(SOUND_KEY) === "on";
  } catch {
    soundEnabled = false;
  }
  setSound(soundEnabled, false);

  // Sonido para cualquier botón o enlace que no tenga un efecto propio
  document.addEventListener("click", (event) => {
    if (!soundEnabled) return;
    const target = event.target.closest(
      "a, button, [role='tab'], .accent-switch__dot, .social-btn, .project-card__link, .carousel__arrow, .to-top"
    );
    if (!target) return;
    if (target.closest("#soundToggle, [data-copy]")) return;

    if (target.matches(".carousel__arrow, #toTop, .nav__link, .mobile-menu__links a, .to-top")) {
      playJump();
    } else if (target.matches(".accent-switch__dot, .social-btn, .project-card__link, .contact-card, .footer__nav a, .footer__socials a")) {
      playCoin();
    } else {
      playClick();
    }
  });

  /* ── Edad automática ─────────────────────────────────────────
     Calcula los años cumplidos según la fecha de nacimiento y
     actualiza todos los elementos con [data-age]. Se recalcula
     cada hora y al volver a la pestaña, así nunca queda vieja. */
  function calculateAge(birthDate = CONFIG.birthDate, today = new Date()) {
    const [year, month, day] = birthDate.split("-").map(Number);
    if (!year || !month || !day) return null;
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() - (month - 1);
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) age -= 1;
    return age;
  }

  function updateAge() {
    const age = calculateAge();
    if (age === null) return;
    $$("[data-age]:not(html):not(body)").forEach((el) => {
      el.textContent = String(age);
    });
    // Atributo distinto de data-age para no seleccionar <html> en la próxima pasada
    root.dataset.currentAge = String(age);
  }

  updateAge();
  setInterval(updateAge, 60 * 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) updateAge();
  });

  /* ══════════════════════════════════════════════════════════
     PRELOADER
     ══════════════════════════════════════════════════════════ */
  const loader = $("#loader");
  const loaderBar = $("#loaderBar");
  const loaderPercent = $("#loaderPercent");
  let loadProgress = 0;
  let pageLoaded = false;
  let loaderFinished = false;

  function paintLoader() {
    if (!loaderBar) return;
    loaderBar.style.width = loadProgress + "%";
    if (loaderPercent) loaderPercent.textContent = Math.floor(loadProgress) + "%";
  }

  function finishLoader() {
    if (loaderFinished) return;
    loaderFinished = true;
    loadProgress = 100;
    paintLoader();
    setTimeout(() => {
      loader?.classList.add("is-done");
      startReveals();
      startCounters();
      startSkillBars();
    }, prefersReduced ? 80 : 380);
  }

  const loaderInterval = setInterval(() => {
    if (loaderFinished) return;
    const step = pageLoaded ? 8 : Math.random() * 11 + 3;
    loadProgress = Math.min(loadProgress + step, pageLoaded ? 100 : 93);
    paintLoader();
    if (loadProgress >= 100) {
      clearInterval(loaderInterval);
      finishLoader();
    }
  }, 110);

  window.addEventListener("load", () => {
    pageLoaded = true;
    loadProgress = Math.max(loadProgress, 96);
    paintLoader();
  });

  // Red de seguridad: nunca dejar el loader bloqueando la página
  setTimeout(finishLoader, 5000);

  /* ══════════════════════════════════════════════════════════
     CURSOR PERSONALIZADO (solo desktop)
     ══════════════════════════════════════════════════════════ */
  const cursorDot = $("#cursorDot");
  const cursorRing = $("#cursorRing");

  if (!isTouch && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let cursorVisible = false;

    document.addEventListener("pointermove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

      if (!cursorVisible) {
        cursorVisible = true;
        document.body.classList.add("has-cursor");
      }

      const interactive = e.target.closest("a, button, input, [data-cursor], .tab, .skill");
      document.body.classList.toggle("cursor-hover", Boolean(interactive));
    });

    document.addEventListener("pointerdown", () => document.body.classList.add("cursor-down"));
    document.addEventListener("pointerup", () => document.body.classList.remove("cursor-down"));
    document.addEventListener("pointerleave", () => {
      cursorVisible = false;
      document.body.classList.remove("has-cursor");
    });

    (function animateCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    })();
  }

  /* ══════════════════════════════════════════════════════════
     NAVBAR, PROGRESO DE SCROLL, SCROLLSPY Y VOLVER ARRIBA
     ══════════════════════════════════════════════════════════ */
  const nav = $("#nav");
  const scrollProgress = $("#scrollProgress");
  const toTop = $("#toTop");
  const toTopRing = $("#toTopRing");
  const sections = $$("section[id]");
  const navLinks = $$(".nav__link");
  const RING_LENGTH = 2 * Math.PI * 20; // radio 20 del anillo

  if (toTopRing) {
    toTopRing.style.strokeDasharray = String(RING_LENGTH);
    toTopRing.style.strokeDashoffset = String(RING_LENGTH);
  }

  let scrollTicking = false;

  function updateScrollUI() {
    const y = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? clamp(y / docHeight, 0, 1) : 0;

    nav?.classList.toggle("is-scrolled", y > 24);
    if (scrollProgress) scrollProgress.style.width = progress * 100 + "%";
    if (toTop) toTop.classList.toggle("is-visible", y > 620);
    if (toTopRing) toTopRing.style.strokeDashoffset = String(RING_LENGTH * (1 - progress));

    // Sección activa
    const marker = y + window.innerHeight * 0.32;
    let currentId = sections[0]?.id;
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top + y <= marker) currentId = section.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + currentId);
    });

    scrollTicking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(updateScrollUI);
    },
    { passive: true }
  );
  updateScrollUI();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  /* ══════════════════════════════════════════════════════════
     MENÚ MÓVIL
     ══════════════════════════════════════════════════════════ */
  const burger = $("#burger");
  const mobileMenu = $("#mobileMenu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    mobileMenu?.classList.toggle("is-open", open);
    mobileMenu?.setAttribute("aria-hidden", String(!open));
    burger?.setAttribute("aria-expanded", String(open));
    burger?.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    syncBodyLock();
  }

  burger?.addEventListener("click", () => {
    setMenu(!mobileMenu?.classList.contains("is-open"));
  });

  $$("a", mobileMenu || document.createElement("div")).forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setMenu(false);
  });

  /* ══════════════════════════════════════════════════════════
     TYPEWRITER
     ══════════════════════════════════════════════════════════ */
  const typeEl = $("#typewriter");
  const phrases = CONFIG.typewriterPhrases;

  if (typeEl) {
    if (prefersReduced) {
      typeEl.textContent = phrases[0];
    } else {
      let phraseIndex = 0;
      let charIndex = 0;
      let deleting = false;

      const type = () => {
        const phrase = phrases[phraseIndex];
        if (!deleting) {
          charIndex++;
          typeEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === phrase.length) {
            deleting = true;
            setTimeout(type, 1900);
            return;
          }
          setTimeout(type, 68);
        } else {
          charIndex--;
          typeEl.textContent = phrase.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(type, 380);
            return;
          }
          setTimeout(type, 34);
        }
      };

      setTimeout(type, 900);
    }
  }

  /* ══════════════════════════════════════════════════════════
     REVEAL AL SCROLL
     ══════════════════════════════════════════════════════════ */
  let revealObserver = null;

  function startReveals() {
    if (revealObserver) return;
    const items = $$("[data-reveal]");

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    items.forEach((item) => revealObserver.observe(item));
  }

  /* ══════════════════════════════════════════════════════════
     CONTADORES ANIMADOS
     ══════════════════════════════════════════════════════════ */
  function animateCounter(el) {
    const target = Number(el.dataset.count || 0);
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1700;
    const start = performance.now();

    const step = (now) => {
      const progress = clamp((now - start) / duration, 0, 1);
      el.textContent = String(Math.round(target * easeOutCubic(progress)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    const counters = $$("[data-count]");
    if (!counters.length) return;

    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ══════════════════════════════════════════════════════════
     HABILIDADES: TABS + BARRAS DE PROGRESO
     ══════════════════════════════════════════════════════════ */
  const tabs = $$(".tab");
  const panels = $$(".tab-panel");
  let barsStarted = false;

  function animateBars(panel) {
    if (!panel) return;
    const bars = $$(".skill__bar span", panel);
    bars.forEach((bar, i) => {
      const level = bar.dataset.level || "0";
      if (prefersReduced) {
        bar.style.transition = "none";
        bar.style.width = level + "%";
        return;
      }
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = level + "%";
      }, 60 + i * 70);
    });
  }

  function startSkillBars() {
    if (barsStarted) return;
    barsStarted = true;
    const activePanel = $(".tab-panel.is-active");
    if (!activePanel) return;

    if (!("IntersectionObserver" in window)) {
      animateBars(activePanel);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateBars(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(activePanel);
  }

  function activateTab(tab) {
    tabs.forEach((t) => {
      const isActive = t === tab;
      t.classList.toggle("is-active", isActive);
      t.setAttribute("aria-selected", String(isActive));
      t.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === tab.dataset.tab;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
      if (isActive) animateBars(panel);
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateTab(tab));

    tab.addEventListener("keydown", (e) => {
      let nextIndex = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") nextIndex = (i + 1) % tabs.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") nextIndex = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") nextIndex = 0;
      if (e.key === "End") nextIndex = tabs.length - 1;
      if (nextIndex === null) return;
      e.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });

  /* ══════════════════════════════════════════════════════════
     BOTONES MAGNÉTICOS
     ══════════════════════════════════════════════════════════ */
  if (!isTouch && !prefersReduced) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     TILT 3D + SPOTLIGHT
     ══════════════════════════════════════════════════════════ */
  if (!isTouch && !prefersReduced) {
    $$("[data-tilt]").forEach((el) => {
      const maxTilt = 8;

      el.addEventListener("pointermove", (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotateY = (px - 0.5) * maxTilt * 2;
        const rotateX = (0.5 - py) * maxTilt * 2;
        const lift = el.classList.contains("service-card") ? " translateY(-4px)" : "";
        el.style.transition = "transform 0.12s ease-out";
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)${lift}`;
      });

      el.addEventListener("pointerleave", () => {
        el.style.transition = "";
        el.style.transform = "";
      });
    });

    $$(".spotlight").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     CARRUSEL DE PROYECTOS
     ══════════════════════════════════════════════════════════ */
  const viewport = $("#carouselViewport");
  const track = $("#carouselTrack");
  const dotsWrap = $("#carouselDots");
  const prevBtn = $("#prevProject");
  const nextBtn = $("#nextProject");
  const currentSlideEl = $("#currentSlide");
  const carouselProgress = $("#carouselProgress");

  if (viewport && track) {
    const slides = $$(".project-card", track);
    const total = slides.length;
    let index = 0;
    let autoplayTimer = null;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let dragX = 0;
    let axis = null;
    let suppressClick = false;

    const pad = (n) => String(n).padStart(2, "0");

    // Construir puntos indicadores
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      slides.forEach((_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir al proyecto ${i + 1}`);
        dot.addEventListener("click", () => {
          goTo(i);
          stopAutoplay();
        });
        dotsWrap.appendChild(dot);
      });
    }

    const dots = dotsWrap ? $$("button", dotsWrap) : [];

    function updateCarouselUI() {
      dots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
      if (currentSlideEl) currentSlideEl.textContent = pad(index + 1);
      if (carouselProgress) carouselProgress.style.width = ((index + 1) / total) * 100 + "%";
      slides.forEach((slide, i) => {
        slide.setAttribute("aria-hidden", String(i !== index));
        // Evita que se pueda tabular dentro de las tarjetas fuera de vista
        slide.inert = i !== index;
      });
    }

    function goTo(i) {
      index = (i + total) % total;
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      updateCarouselUI();
    }

    function startAutoplay() {
      if (prefersReduced || total < 2) return;
      stopAutoplay();
      autoplayTimer = setInterval(() => goTo(index + 1), 6800);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }

    prevBtn?.addEventListener("click", () => {
      goTo(index - 1);
      stopAutoplay();
    });
    nextBtn?.addEventListener("click", () => {
      goTo(index + 1);
      stopAutoplay();
    });

    // Teclado
    viewport.tabIndex = 0;
    viewport.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
        stopAutoplay();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
        stopAutoplay();
      }
    });

    // Arrastre con mouse / dedo
    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      dragX = 0;
      axis = null;
      track.classList.add("is-dragging");
      viewport.classList.add("is-dragging");
      stopAutoplay();
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (!axis) {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "x") {
          viewport.setPointerCapture?.(e.pointerId);
        } else {
          // Es un scroll vertical: cancelamos el arrastre del carrusel
          resetDrag();
          return;
        }
      }

      if (axis !== "x") return;

      dragX = dx;
      track.style.transform = `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)`;
    });

    function resetDrag() {
      isDragging = false;
      axis = null;
      dragX = 0;
      track.classList.remove("is-dragging");
      viewport.classList.remove("is-dragging");
      goTo(index);
    }

    viewport.addEventListener("pointerup", () => {
      if (!isDragging) return;
      const threshold = Math.max(50, viewport.clientWidth * 0.12);
      if (axis === "x" && dragX < -threshold) goTo(index + 1);
      else if (axis === "x" && dragX > threshold) goTo(index - 1);
      if (Math.abs(dragX) > 8) suppressClick = true;
      resetDrag();
      startAutoplay();
    });

    viewport.addEventListener("pointercancel", () => {
      if (!isDragging) return;
      resetDrag();
      startAutoplay();
    });

    // Evita abrir un enlace si el usuario estaba arrastrando
    viewport.addEventListener(
      "click",
      (e) => {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
        suppressClick = false;
      },
      true
    );

    // Pausar autoplay al interactuar
    viewport.addEventListener("pointerenter", stopAutoplay);
    viewport.addEventListener("pointerleave", startAutoplay);
    viewport.addEventListener("focusin", stopAutoplay);
    viewport.addEventListener("focusout", startAutoplay);
    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopAutoplay() : startAutoplay();
    });

    // Reajustar al cambiar tamaño
    window.addEventListener("resize", () => {
      if (!isDragging) goTo(index);
    });

    goTo(0);
    startAutoplay();
  }

  /* ══════════════════════════════════════════════════════════
     TOASTS + COPIAR EMAIL
     ══════════════════════════════════════════════════════════ */
  const toastStack = $("#toastStack");

  function toast(message, type = "success") {
    if (!toastStack) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `
      <span class="toast__icon${type === "error" ? " toast__icon--error" : ""}">${type === "error" ? "!" : "✓"}</span>
      <span>${message}</span>
    `;
    toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add("is-out");
      el.addEventListener("animationend", () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 600);
    }, 3200);
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback para navegadores sin permisos de clipboard
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.cssText = "position:fixed;opacity:0;pointer-events:none;";
      document.body.appendChild(textarea);
      textarea.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      textarea.remove();
      return ok;
    }
  }

  const copyTimers = new WeakMap();
  const originalCopyHTML = new WeakMap();

  function handleCopy(text, button) {
    copyToClipboard(text).then((ok) => {
      if (ok) {
        playCoin();
        bumpCoins(1);
        toast("Email copiado. ¡Ya podés escribirme!");
        if (button) {
          if (!originalCopyHTML.has(button)) originalCopyHTML.set(button, button.innerHTML);
          clearTimeout(copyTimers.get(button));
          button.classList.add("is-copied");
          button.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m20 6-11 11-5-5"/></svg> ¡Copiado!`;
          copyTimers.set(
            button,
            setTimeout(() => {
              button.classList.remove("is-copied");
              button.innerHTML = originalCopyHTML.get(button);
            }, 2400)
          );
        }
      } else {
        playError();
        toast("No pude copiar automáticamente. El mail es " + text, "error");
      }
    });
  }

  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", () => handleCopy(button.dataset.copy, button));
  });

  /* ══════════════════════════════════════════════════════════
     TEMA DE ACENTO (cian / violeta / esmeralda)
     ══════════════════════════════════════════════════════════ */
  const ACCENT_KEY = "arrieta-accent";
  const LEGACY_ACCENT_KEY = "arrita-accent";
  const accentButtons = $$("[data-set-accent]");

  function setAccent(name) {
    if (!["cyan", "violet", "emerald"].includes(name)) return;
    root.dataset.accent = name;
    accentButtons.forEach((btn) => {
      btn.setAttribute("aria-pressed", String(btn.dataset.setAccent === name));
    });
    try {
      localStorage.setItem(ACCENT_KEY, name);
      localStorage.removeItem(LEGACY_ACCENT_KEY);
    } catch {
      /* modo privado: sin persistencia */
    }
  }

  accentButtons.forEach((btn) => {
    btn.addEventListener("click", () => setAccent(btn.dataset.setAccent));
  });

  try {
    const savedAccent = localStorage.getItem(ACCENT_KEY) || localStorage.getItem(LEGACY_ACCENT_KEY);
    if (savedAccent) setAccent(savedAccent);
  } catch {
    /* sin persistencia */
  }

  /* ══════════════════════════════════════════════════════════
     TEMA CLARO / OSCURO
     ══════════════════════════════════════════════════════════ */
  const THEME_KEY = "arrieta-theme";
  const LEGACY_THEME_KEY = "arrita-theme";
  const themeToggle = $("#themeToggle");
  const themeColorMeta = $('meta[name="theme-color"]');

  function setTheme(name, persist = true) {
    const theme = name === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    themeToggle?.setAttribute("aria-pressed", String(theme === "light"));
    themeToggle?.setAttribute("aria-label", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    themeColorMeta?.setAttribute("content", theme === "light" ? "#a9d7ff" : "#080d22");
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, theme);
        localStorage.removeItem(LEGACY_THEME_KEY);
      } catch {
        /* sin persistencia */
      }
    }
  }

  themeToggle?.addEventListener("click", () => {
    setTheme(root.dataset.theme === "light" ? "dark" : "light");
  });

  setTheme(root.dataset.theme === "light" ? "light" : "dark", false);

  /* ══════════════════════════════════════════════════════════
     RELOJ LOCAL
     ══════════════════════════════════════════════════════════ */
  const clockEl = $("#localClock");

  if (clockEl) {
    const formatter = new Intl.DateTimeFormat(CONFIG.locale, {
      timeZone: CONFIG.timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const updateClock = () => {
      clockEl.textContent = `${formatter.format(new Date())} GMT-3`;
    };
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ══════════════════════════════════════════════════════════
     AÑO DEL FOOTER
     ══════════════════════════════════════════════════════════ */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ══════════════════════════════════════════════════════════
     PALETA DE COMANDOS (Ctrl / Cmd + K)
     ══════════════════════════════════════════════════════════ */
  const palette = $("#palette");
  const paletteInput = $("#paletteInput");
  const paletteList = $("#paletteList");
  const openPaletteBtn = $("#openPalette");
  const emailToCopy = $("[data-copy]")?.dataset.copy || "arrietaguadalupe@gmail.com";

  // Mantiene el scroll bloqueado si el menú móvil o la paleta siguen abiertos
  function syncBodyLock() {
    const locked =
      Boolean(mobileMenu?.classList.contains("is-open")) ||
      Boolean(palette?.classList.contains("is-open"));
    document.body.classList.toggle("is-locked", locked);
  }

  const goToSection = (hash) => {
    const target = $(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
  };

  const commands = [
    { label: "Ir a Inicio", hint: "Sección", icon: "01", group: "Navegación", run: () => goToSection("#inicio") },
    { label: "Ir a Sobre mí", hint: "Sección", icon: "02", group: "Navegación", run: () => goToSection("#sobre-mi") },
    { label: "Ir a Servicios", hint: "Sección", icon: "03", group: "Navegación", run: () => goToSection("#servicios") },
    { label: "Ir a Habilidades", hint: "Sección", icon: "04", group: "Navegación", run: () => goToSection("#habilidades") },
    { label: "Ir a Proyectos", hint: "Sección", icon: "05", group: "Navegación", run: () => goToSection("#proyectos") },
    { label: "Ir a Contacto", hint: "Sección", icon: "06", group: "Navegación", run: () => goToSection("#contacto") },
    {
      label: "Descargar CV",
      hint: "PDF",
      icon: "↓",
      group: "Acciones",
      run: () => {
        const a = document.createElement("a");
        a.href = "assets/cv.pdf";
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast("Descargando mi CV…");
      },
    },
    {
      label: "Copiar mi email",
      hint: emailToCopy,
      icon: "@",
      group: "Acciones",
      run: () => handleCopy(emailToCopy),
    },
    {
      label: "Abrir WhatsApp",
      hint: "wa.me",
      icon: "wa",
      group: "Acciones",
      run: () => window.open("https://wa.me/5491100000000", "_blank", "noopener"),
    },
    {
      label: "Abrir GitHub",
      hint: "github.com",
      icon: "gh",
      group: "Acciones",
      run: () => window.open("https://github.com/arrietaguadalupe", "_blank", "noopener"),
    },
    { label: "Acento: Estrella (dorado)", hint: "Acento", icon: "★", group: "Apariencia", run: () => setAccent("cyan") },
    { label: "Acento: Fuego (naranja)", hint: "Acento", icon: "✹", group: "Apariencia", run: () => setAccent("violet") },
    { label: "Acento: 1-UP (verde)", hint: "Acento", icon: "●", group: "Apariencia", run: () => setAccent("emerald") },
    { label: "Activar o desactivar sonido", hint: "Audio", icon: "♪", group: "Apariencia", run: toggleSound },
    { label: "Modo claro", hint: "Apariencia", icon: "☀", group: "Apariencia", run: () => setTheme("light") },
    { label: "Modo oscuro", hint: "Apariencia", icon: "☾", group: "Apariencia", run: () => setTheme("dark") },
  ];

  let filteredCommands = [...commands];
  let selectedIndex = 0;
  let paletteOpen = false;
  let lastFocused = null;

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  function renderPalette() {
    if (!paletteList) return;
    paletteList.innerHTML = "";

    if (!filteredCommands.length) {
      paletteList.innerHTML = '<p class="palette__empty">Sin resultados. Probá con “proyectos” o “tema”.</p>';
      return;
    }

    let lastGroup = "";
    filteredCommands.forEach((command, i) => {
      if (command.group !== lastGroup) {
        lastGroup = command.group;
        const group = document.createElement("p");
        group.className = "palette__group";
        group.textContent = command.group;
        paletteList.appendChild(group);
      }

      const item = document.createElement("button");
      item.type = "button";
      item.className = "palette__item" + (i === selectedIndex ? " is-selected" : "");
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(i === selectedIndex));
      item.innerHTML = `
        <span class="palette__item-icon">${command.icon}</span>
        <span>${command.label}</span>
        <span class="palette__item-hint">${command.hint}</span>
      `;
      item.addEventListener("pointerenter", () => {
        selectedIndex = i;
        updatePaletteSelection();
      });
      item.addEventListener("click", () => runCommand(command));
      paletteList.appendChild(item);
    });
  }

  function updatePaletteSelection() {
    if (!paletteList) return;
    const items = $$(".palette__item", paletteList);
    items.forEach((item, i) => {
      item.classList.toggle("is-selected", i === selectedIndex);
      item.setAttribute("aria-selected", String(i === selectedIndex));
    });
    items[selectedIndex]?.scrollIntoView({ block: "nearest" });
  }

  function filterPalette(query) {
    const q = normalize(query.trim());
    filteredCommands = q
      ? commands.filter((c) => normalize(`${c.label} ${c.group} ${c.hint}`).includes(q))
      : [...commands];
    selectedIndex = 0;
    renderPalette();
  }

  function openPalette() {
    if (!palette || !paletteInput) return;
    paletteOpen = true;
    lastFocused = document.activeElement;
    palette.classList.add("is-open");
    palette.setAttribute("aria-hidden", "false");
    syncBodyLock();
    paletteInput.value = "";
    filterPalette("");
    setTimeout(() => paletteInput.focus(), 60);
  }

  function closePalette() {
    if (!palette) return;
    paletteOpen = false;
    palette.classList.remove("is-open");
    palette.setAttribute("aria-hidden", "true");
    syncBodyLock();
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function runCommand(command) {
    closePalette();
    setTimeout(() => command.run(), 80);
  }

  openPaletteBtn?.addEventListener("click", openPalette);
  $$("[data-close-palette]").forEach((el) => el.addEventListener("click", closePalette));

  paletteInput?.addEventListener("input", (e) => filterPalette(e.target.value));

  paletteInput?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % Math.max(filteredCommands.length, 1);
      updatePaletteSelection();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + filteredCommands.length) % Math.max(filteredCommands.length, 1);
      updatePaletteSelection();
    }
    if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      runCommand(filteredCommands[selectedIndex]);
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      paletteOpen ? closePalette() : openPalette();
      return;
    }
    if (e.key === "Escape") {
      if (paletteOpen) closePalette();
      if (mobileMenu?.classList.contains("is-open")) setMenu(false);
    }
    // Atajo "g" para volver arriba cuando no se está escribiendo
    const typing = /input|textarea|select/i.test(document.activeElement?.tagName || "");
    if (!typing && !paletteOpen && e.key.toLowerCase() === "g" && window.scrollY > 700) {
      window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
    }
  });

  /* ══════════════════════════════════════════════════════════
     EASTER EGG: triple clic en el logo
     ══════════════════════════════════════════════════════════ */
  const logo = $("#logo");
  let logoClicks = 0;
  let logoTimer = null;

  function celebrate() {
    const colors = ["#ffd23f", "#ff7a45", "#5eea8b", "#7dd3fc", "#f472b6"];
    const rect = logo?.getBoundingClientRect();
    if (!rect) return;
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    for (let i = 0; i < 26; i++) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      const angle = (Math.PI * 2 * i) / 26;
      const distance = 60 + Math.random() * 110;
      piece.style.cssText = `
        left:${originX}px; top:${originY}px;
        background:${colors[i % colors.length]};
        --dx:${Math.cos(angle) * distance}px;
        --dy:${Math.sin(angle) * distance}px;
        --rot:${Math.random() * 720 - 360}deg;
      `;
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 1100);
    }
    toast("✦ Modo creativo desbloqueado. Seguí explorando.");
    playOneUp();
    bumpCoins(3);
  }

  logo?.addEventListener("click", () => {
    logoClicks++;
    clearTimeout(logoTimer);
    logoTimer = setTimeout(() => (logoClicks = 0), 900);
    if (logoClicks >= 3) {
      logoClicks = 0;
      celebrate();
    }
  });

  /* ══════════════════════════════════════════════════════════
     MENSAJE PARA CURIOSOS EN LA CONSOLA
     ══════════════════════════════════════════════════════════ */
  const consoleStyle = "color:#ffd23f;font-family:monospace;font-size:13px;";
  console.log("%c★ Hola, curiosa/o. Si estás acá, hablamos el mismo idioma.", consoleStyle);
  console.log("%c   ¿Construimos algo juntos? → arrietaguadalupe@gmail.com", consoleStyle);
  console.log("%c   Ctrl / Cmd + K para abrir la paleta de comandos.", "color:#b9b096;font-family:monospace;font-size:11px;");

  /* Exponer utilidades mínimas para debug (opcional) */
  window.ArrietaPortfolio = {
    setAccent,
    setTheme,
    setSound,
    playSound,
    toggleSound,
    toast,
    age: () => calculateAge(),
    birthDate: CONFIG.birthDate,
  };
})();
