(function () {
  "use strict";

  var body = document.body;
  var header = document.querySelector("[data-header]");
  var menuToggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-menu]");
  var menuScrim = document.querySelector("[data-menu-scrim]");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  function setMenu(open, returnFocus) {
    if (!menuToggle || !menu) return;
    body.classList.toggle("lnc-menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");

    if (open) {
      var firstLink = menu.querySelector("a");
      window.setTimeout(function () { if (firstLink) firstLink.focus(); }, 30);
    } else if (returnFocus) {
      menuToggle.focus();
    }
  }

  function setActiveNavigation() {
    var currentPage = body.getAttribute("data-page");
    if (!currentPage) return;
    document.querySelectorAll("[data-nav-page]").forEach(function (link) {
      var isActive = link.getAttribute("data-nav-page") === currentPage;
      link.classList.toggle("lnc-active", isActive);
      if (isActive) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function handleMenuKeyboard(event) {
    if (!body.classList.contains("lnc-menu-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false, true);
      return;
    }
    if (event.key !== "Tab" || !menuToggle || !menu) return;
    var focusable = [menuToggle].concat(Array.from(menu.querySelectorAll("a[href], button:not([disabled])")));
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(menuToggle.getAttribute("aria-expanded") !== "true", false);
    });
  }
  if (menuScrim) menuScrim.addEventListener("click", function () { setMenu(false, true); });
  if (menu) menu.addEventListener("click", function (event) { if (event.target.closest("a")) setMenu(false, false); });
  document.addEventListener("keydown", handleMenuKeyboard);
  window.addEventListener("resize", function () { if (window.innerWidth > 768) setMenu(false, false); });
  window.addEventListener("scroll", updateHeader, { passive: true });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      var target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  var lightbox = document.querySelector("[data-lightbox]");
  var lightboxImage = document.querySelector("[data-lightbox-image]");
  var lightboxCaption = document.querySelector("[data-lightbox-caption]");
  var lightboxCloseButtons = document.querySelectorAll("[data-lightbox-close]");
  var lastFocusedElement = null;

  function openLightbox(source, alternative) {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lastFocusedElement = document.activeElement;
    lightboxImage.src = source;
    lightboxImage.alt = alternative;
    lightboxCaption.textContent = alternative;
    lightbox.hidden = false;
    body.classList.add("lnc-lightbox-open");
    var closeButton = lightbox.querySelector(".lnc-lightbox-close");
    if (closeButton) closeButton.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    body.classList.remove("lnc-lightbox-open");
    if (lightboxImage) {
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    }
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.querySelectorAll("[data-lightbox-src]").forEach(function (button) {
    button.addEventListener("click", function () {
      openLightbox(button.getAttribute("data-lightbox-src"), button.getAttribute("data-lightbox-alt") || "L&C 공간 사진");
    });
  });
  lightboxCloseButtons.forEach(function (button) { button.addEventListener("click", closeLightbox); });
  document.addEventListener("keydown", function (event) {
    if (!lightbox || lightbox.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }
    if (event.key !== "Tab") return;
    var focusable = Array.from(lightbox.querySelectorAll("button:not([disabled])"));
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  var revealItems = document.querySelectorAll(".lnc-reveal");
  if (!reduceMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("lnc-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("lnc-visible"); });
  }

  updateHeader();
  setActiveNavigation();
}());
