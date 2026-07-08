// Scroll-linked spine fill, active-zone highlighting, and section reveal.
// Kept dependency-free on purpose: IntersectionObserver + rAF-throttled scroll.

(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Page background video: play only when motion + bandwidth allow ---- */
  // Tune HERO_VIDEO_SPEED to taste — 1 is native speed, lower is slower.
  // Kept as a single constant so pacing is a one-line change, not a re-encode.
  var HERO_VIDEO_SPEED = 0.55;

  (function initPageVideo() {
    var root = document.body;
    var video = document.getElementById("heroVideo");
    if (!video) return;

    var isNarrow = window.matchMedia("(max-width: 640px)").matches;
    var saveData = !!(navigator.connection && navigator.connection.saveData);

    if (reduceMotion || isNarrow || saveData) {
      root.classList.add("is-static-bg");
      return; // poster stays visible, video never requested
    }

    video.addEventListener("error", function () {
      root.classList.add("is-static-bg");
    });

    video.playbackRate = HERO_VIDEO_SPEED;

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Autoplay blocked by the browser — fall back to the static poster
        // rather than showing a paused first frame with playback controls.
        root.classList.add("is-static-bg");
      });
    }
  })();

  /* ---- Section reveal on scroll ---- */
  var sections = document.querySelectorAll(".section");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    sections.forEach(function (s) { revealObserver.observe(s); });
  } else {
    // No IO support, or user prefers reduced motion: show everything immediately.
    sections.forEach(function (s) { s.classList.add("is-visible"); });
  }

  /* ---- Spine progress fill + active node highlight + node positioning ---- */
  var spineFill = document.getElementById("spineFill");
  var nodes = document.querySelectorAll(".spine-node");
  var zoneSections = document.querySelectorAll("[data-zone]");

  // Position each spine node at the same fraction down the rail as its
  // section is down the whole scrollable document — the rail is a literal
  // scroll-progress bar, so node position must track real layout, not a
  // guessed percentage.
  function layoutNodes() {
    var doc = document.documentElement;
    var scrollRange = doc.scrollHeight - window.innerHeight;
    if (scrollRange <= 0) return;

    nodes.forEach(function (node) {
      var zoneId = node.getAttribute("data-zone");
      var section = document.querySelector('[data-zone="' + zoneId + '"]');
      if (!section) return;
      var sectionMid = section.offsetTop + section.offsetHeight * 0.35;
      var pct = Math.min(98, Math.max(2, (sectionMid / scrollRange) * 100));
      node.style.top = pct + "%";
    });
  }

  function currentActiveZoneId() {
    var mid = window.innerHeight * 0.45;
    var activeId = null;
    zoneSections.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom >= mid) {
        activeId = el.getAttribute("data-zone");
      }
    });
    return activeId;
  }

  var ticking = false;
  function updateOnScroll() {
    if (spineFill) {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var scrollHeight = doc.scrollHeight - window.innerHeight;
      var pct = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
      spineFill.style.height = pct + "%";
    }

    var activeId = currentActiveZoneId();
    nodes.forEach(function (node) {
      node.classList.toggle("is-active", node.getAttribute("data-zone") === activeId);
    });

    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    layoutNodes();
    updateOnScroll();
  });

  // Fonts/images loading can change document height after first paint —
  // re-layout nodes once more shortly after load to stay accurate.
  window.addEventListener("load", function () {
    layoutNodes();
    updateOnScroll();
  });

  layoutNodes();
  updateOnScroll();

  /* ---- Spine nodes jump to their section ---- */
  nodes.forEach(function (node) {
    node.addEventListener("click", function () {
      var zoneId = node.getAttribute("data-zone");
      var target = document.querySelector('[data-zone="' + zoneId + '"]');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
})();
