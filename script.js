//paralax
const el = document.querySelector(".title");
const speed = 0.3; // 0 = static, 1 = same speed as scroll

window.addEventListener(
  "scroll",
  () => {
    const y = window.scrollY;
    // move element down at fraction of page scroll
    el.style.top = `${y * speed}px`;
  },
  { passive: true },
);
// CONFIGURATION

// Sensitivity scaling (if you want extra damping)
// e.g. 1 = full travel, <1 slows movement, >1 exaggerates it
const sensitivity = 2;

const irisConfigs = [
  {
    selector: "#irisleft",
    baseXPct: 0.6,
    baseYPct: 0.02,
    maxMoveXPct: 0.25,
    maxMoveYPct: 0.25,
  },
  {
    selector: "#irisright",
    baseXPct: 0.4,
    baseYPct: 0.02,
    maxMoveXPct: 0.25,
    maxMoveYPct: 0.25,
  },
];

// INITIALIZATION

// Cache DOM elements
const irises = irisConfigs.map((cfg) => ({
  ...cfg,
  el: document.querySelector(cfg.selector),
}));

// Track viewport dimensions & center
let vw = window.innerWidth;
let vh = window.innerHeight;
let cx = vw / 2;
let cy = vh / 2;

// Update viewport vars on resize
window.addEventListener("resize", () => {
  vw = window.innerWidth;
  vh = window.innerHeight;
  cx = vw / 2;
  cy = vh / 2;
});

// MOUSEMOVE HANDLER
document.addEventListener("mousemove", (e) => {
  // Normalize cursor into [-1, +1] range
  const nx = (e.clientX - cx) / cx;
  const ny = (e.clientY - cy) / cy;

  irises.forEach(({ el, baseXPct, baseYPct, maxMoveXPct, maxMoveYPct }) => {
    const rect = el.getBoundingClientRect();
    const w = rect.width,
      h = rect.height;

    // Compute pixel-based “rest” point and max travel
    const baseX = w * baseXPct;
    const baseY = h * baseYPct;
    const maxX = w * maxMoveXPct;
    const maxY = h * maxMoveYPct;

    // Calculate final translation
    const tx = baseX + nx * maxX * sensitivity;
    const ty = baseY + ny * maxY * sensitivity;

    // Apply
    el.style.transform = `translate(${tx}px, ${ty + (1 / 100) * vh * -1}px)`;
  });
});

//tilt
const tiltElements = document.querySelectorAll(".projimg");

// Helper: initialize VanillaTilt on all .projimg
function enableTilt() {
  // If already initialized, don’t re‐initialize
  if (tiltElements[0] && tiltElements[0].vanillaTilt) return;

  // Save original transforms before VanillaTilt mutates them
  tiltElements.forEach((el) => {
    const computedTransform = getComputedStyle(el).transform;
    if (computedTransform !== "none") {
      el.style.transform = computedTransform;
    }
    el.dataset.originalTransform = computedTransform;
  });

  // Init VanillaTilt
  VanillaTilt.init(tiltElements, {
    scale: 1.5,
    glare: true,
    "max-glare": 1,
    reverse: true,
  });
  tiltElements.forEach((el) => {
    // Get the computed transform from CSS (e.g., rotateZ(-30deg))
    const computedTransform = getComputedStyle(el).transform;

    // If it's not "none", apply it directly to inline style before VanillaTilt kicks in
    if (computedTransform !== "none") {
      el.style.transform = computedTransform;
    }

    // Save original transform to restore on mouseleave
    el.dataset.originalTransform = computedTransform;
  });

  // After init, restore on mouseleave
  tiltElements.forEach((el) => {
    el.addEventListener("mouseleave", () => {
      setTimeout(() => {
        el.style.transform = el.dataset.originalTransform || "";
      }, 0);
    });
  });
}

// Helper: destroy VanillaTilt on all .projimg
function disableTilt() {
  tiltElements.forEach((el) => {
    if (el.vanillaTilt) {
      el.vanillaTilt.destroy();
      delete el.vanillaTilt;
      // Restore original transform once more, in case destroy reset it
      el.style.transform = el.dataset.originalTransform || "";
    }
  });
}

// Check current width and enable/disable accordingly
function checkWidthAndToggleTilt() {
  if (window.innerWidth >= 500) {
    enableTilt();
  } else {
    disableTilt();
  }
}

// Run once on page load
checkWidthAndToggleTilt();

// Re‐check whenever the window is resized
window.addEventListener("resize", () => {
  checkWidthAndToggleTilt();
});

//gsap

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.matchMedia({
  // mobile only
  "(max-width: 500px)": function () {
    const container = document.querySelector("#wallcontainer");
    const wall = container.querySelector(".wall");

    // how far to drag the image
    const scrollDist = () => wall.scrollWidth - window.innerWidth;

    // set up the tween + scrollTrigger
    const tl = gsap.to(wall, {
      x: () => -scrollDist(),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: true,
        end: () => `+=${scrollDist()}`,
      },
    });

    // optional: return a cleanup function so that if you ever
    // switch out of this media-query, ScrollTriggers are killed
    return () => {
      tl.scrollTrigger.kill();
      tl.kill();
    };
  },

  // everything else (>=501px)—do nothing / kill any stray triggers
  all: function () {
    // nothing here, so no horizontal-scroll on desktop
  },
});
