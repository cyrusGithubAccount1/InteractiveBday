/* ==========================================================================
   INTERACTIONS.JS: reusable animation and interaction helpers.
   Exposes a single global: window.GardenInteractions
   Nothing here knows about the page's stages or content, so later stages
   (gallery, letters, discoveries, finale) can reuse these helpers directly.
   ========================================================================== */
(function (global) {
  'use strict';

  /* ---------- Motion preferences ---------- */
  const reducedMotionQuery = global.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReducedMotion = () => reducedMotionQuery.matches;

  const randomBetween = (min, max) => min + Math.random() * (max - min);

  /* Soft petal colours drawn from the brand palette */
  const PETAL_COLOURS = ['#D9A6AE', '#E8BFC5', '#F0D3D6', '#C99BA3', '#E2B4BB'];

  /* ---------- Floating petals ---------- */
  /**
   * Creates a field of gently falling petals inside `layer`.
   * Returns { setCount(n) }: call it to make the field denser or sparser.
   */
  function createPetalField(layer) {
    let desiredCount = 0;

    function buildPetal() {
      const petal = document.createElement('span');
      const size = randomBetween(9, 19);
      petal.className = 'petal';
      petal.style.setProperty('--x', randomBetween(0, 100).toFixed(1) + 'vw');
      petal.style.setProperty('--size', size.toFixed(1) + 'px');
      petal.style.setProperty('--colour', PETAL_COLOURS[Math.floor(Math.random() * PETAL_COLOURS.length)]);
      petal.style.setProperty('--dur', randomBetween(14, 26).toFixed(1) + 's');
      // Negative delay: petals are already mid-fall when the page appears
      petal.style.setProperty('--delay', (-randomBetween(0, 24)).toFixed(1) + 's');
      petal.style.setProperty('--drift', randomBetween(-18, 18).toFixed(1) + 'vw');
      petal.style.setProperty('--spin', randomBetween(-540, 540).toFixed(0) + 'deg');
      petal.style.setProperty('--sway', randomBetween(2.5, 5).toFixed(1) + 's');
      return petal;
    }

    function render() {
      const target = prefersReducedMotion() ? 0 : desiredCount;
      while (layer.childElementCount < target) layer.appendChild(buildPetal());
      while (layer.childElementCount > target) layer.lastElementChild.remove();
    }

    // React if the visitor changes their motion preference mid-visit
    if (reducedMotionQuery.addEventListener) reducedMotionQuery.addEventListener('change', render);

    return {
      setCount(count) {
        desiredCount = Math.max(0, count);
        render();
      }
    };
  }

  /* ---------- Petal burst (used when a flower is touched) ---------- */
  function burstPetals(originX, originY, count) {
    if (prefersReducedMotion() || !document.body.animate) return;
    const total = count || 10;

    for (let i = 0; i < total; i += 1) {
      const petal = document.createElement('span');
      petal.className = 'petal-burst';
      petal.style.left = originX + 'px';
      petal.style.top = originY + 'px';
      petal.style.background = PETAL_COLOURS[i % PETAL_COLOURS.length];
      document.body.appendChild(petal);

      const angle = randomBetween(0, Math.PI * 2);
      const distance = randomBetween(40, 130);
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance - randomBetween(10, 50); // drift slightly upward
      const rotation = randomBetween(-300, 300);

      const animation = petal.animate(
        [
          { transform: 'translate(-50%, -50%) scale(.4) rotate(0deg)', opacity: 1 },
          { transform: 'translate(calc(-50% + ' + dx + 'px), calc(-50% + ' + (dy + 40) + 'px)) scale(1) rotate(' + rotation + 'deg)', opacity: 0 }
        ],
        { duration: randomBetween(900, 1500), easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' }
      );
      animation.onfinish = () => petal.remove();
    }
  }

  /* ---------- Toast (small gentle message) ---------- */
  let toastTimer = null;
  function showToast(message, duration) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    global.clearTimeout(toastTimer);
    toastTimer = global.setTimeout(() => toast.classList.remove('is-visible'), duration || 4200);
  }

  /* ---------- Clickable flower bed ---------- */
  /**
   * Wires up a set of flower buttons.
   * options.flowers : array of <button> elements
   * options.onBloom : function({ index, foundCount, total, isFirstVisit })
   * Returns { reset(), getFoundCount() }
   */
  function initFlowerBed(options) {
    const flowers = options.flowers;
    const visited = new Set();

    flowers.forEach((flower, index) => {
      flower.addEventListener('click', () => {
        const bloom = flower.querySelector('.flower__bloom') || flower;
        const rect = bloom.getBoundingClientRect();
        burstPetals(rect.left + rect.width / 2, rect.top + rect.height / 2, 11);

        // Restart the bloom animation even on repeat taps
        flower.classList.remove('is-bloomed');
        void flower.offsetWidth;
        flower.classList.add('is-bloomed', 'is-visited');

        const isFirstVisit = !visited.has(index);
        visited.add(index);
        options.onBloom({ index, foundCount: visited.size, total: flowers.length, isFirstVisit });
      });
    });

    return {
      reset() {
        visited.clear();
        flowers.forEach((flower) => flower.classList.remove('is-bloomed', 'is-visited'));
      },
      getFoundCount() { return visited.size; }
    };
  }

  global.GardenInteractions = {
    prefersReducedMotion,
    createPetalField,
    burstPetals,
    showToast,
    initFlowerBed
  };
})(window);
