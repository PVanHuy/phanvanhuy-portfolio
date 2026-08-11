(() => {
  const STORAGE_KEY = "portfolio-lang";
  const dict = window.PORTFOLIO_I18N || {};
  const supported = ["en", "vi"];

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const year = document.getElementById("year");
  const langToggle = document.getElementById("langToggle");
  const langCurrent = document.getElementById("langCurrent");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const detectLang = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (supported.includes(saved)) return saved;
    const browser = (navigator.language || "en").toLowerCase();
    return browser.startsWith("vi") ? "vi" : "en";
  };

  let lang = detectLang();

  const t = (key) => {
    return (dict[lang] && dict[lang][key]) || (dict.en && dict.en[key]) || key;
  };

  const applyLanguage = (nextLang) => {
    lang = nextLang;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;

    const title = t("meta.title");
    const description = t("meta.description");
    document.title = title;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", description);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      if (!key) return;
      el.innerHTML = t(key);
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(key));
    });

    if (langCurrent) {
      langCurrent.textContent = lang === "vi" ? "VI" : "EN";
    }

    if (langToggle) {
      langToggle.setAttribute("aria-label", t("lang.switch"));
      langToggle.setAttribute("data-lang", lang);
      const next = lang === "vi" ? "EN" : "VI";
      const hint = langToggle.querySelector(".lang-switch__next");
      if (hint) hint.textContent = next;
    }

    if (toggle) {
      const open = links && links.classList.contains("is-open");
      toggle.setAttribute("aria-label", open ? t("nav.close") : t("nav.open"));
    }
  };

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      applyLanguage(lang === "en" ? "vi" : "en");
    });
  }

  applyLanguage(lang);

  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && links && nav) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? t("nav.close") : t("nav.open"));
    });

    links.querySelectorAll("a").forEach((anchor) => {
      anchor.addEventListener("click", () => {
        links.classList.remove("is-open");
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", t("nav.open"));
      });
    });
  }

  // —— Gallery lightbox ——
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  const galleryItems = Array.from(document.querySelectorAll(".gallery__item"));
  let galleryIndex = 0;

  const openLightbox = (index) => {
    if (!lightbox || !lightboxImg || !galleryItems.length) return;
    galleryIndex = (index + galleryItems.length) % galleryItems.length;
    const item = galleryItems[galleryIndex];
    const img = item.querySelector("img");
    if (!img) return;

    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt || "";
    if (lightboxCaption) {
      lightboxCaption.textContent = img.alt || "";
    }

    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      if (!lightbox.classList.contains("is-open")) {
        lightbox.hidden = true;
        if (lightboxImg) lightboxImg.removeAttribute("src");
      }
    }, 250);
  };

  const showNext = (delta) => openLightbox(galleryIndex + delta);

  galleryItems.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener("click", () => showNext(-1));
  if (lightboxNext) lightboxNext.addEventListener("click", () => showNext(1));

  if (lightbox) {
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showNext(-1);
    if (event.key === "ArrowRight") showNext(1);
  });

  // —— Reveal animations ——
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  reveals.forEach((el) => observer.observe(el));
})();
