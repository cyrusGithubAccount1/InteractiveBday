/* ==========================================================================
   MAIN.JS: application logic
   1. Setup & helpers          4. Navigation controls
   2. Session (visitor name)   5. Stage 1: Welcome
   3. StageManager             6. Stage 2: Garden
                               7. Start-up
   Later stages plug in by calling StageManager.register({...}).
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- 1. SETUP & HELPERS ---------- */
  const content = window.SITE_CONTENT;
  const fx = window.GardenInteractions;

  if (!content || !fx) {
    console.error('content.js and interactions.js must load before main.js.');
    return;
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const STAGE = { WELCOME: 1, GARDEN: 2, MEMORIES: 3, LETTERS: 4, DISCOVERIES: 5, FINALE: 6 };

  /** Reads a value from content.js using a dotted path, e.g. "garden.heading". */
  function getContent(path) {
    return path.split('.').reduce((node, key) => (node == null ? undefined : node[key]), content);
  }

  /** Replaces {tokens} in text, e.g. "Welcome, {name}". Unknown tokens are left untouched. */
  function fillTemplate(template, values) {
    return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in values ? values[key] : match));
  }

  /* ---------- 2. SESSION (visitor name) ---------- */
  const Session = (() => {
    const STORAGE_KEY = 'gardenVisitorName';
    let memoryFallback = ''; // Used if sessionStorage is unavailable (e.g. private mode)

    return {
      getName() {
        try { return sessionStorage.getItem(STORAGE_KEY) || memoryFallback; }
        catch (error) { return memoryFallback; }
      },
      setName(name) {
        memoryFallback = name;
        try { sessionStorage.setItem(STORAGE_KEY, name); } catch (error) { /* ignore */ }
      }
    };
  })();

  const displayName = () => Session.getName() || (content.meta && content.meta.fallbackName) || 'friend';
  const templateValues = (extra) => Object.assign({ name: displayName() }, extra);

  /**
   * Pushes content.js text into the page.
   * If a content entry is missing or empty, the fallback text written in the HTML stays in place.
   */
  function renderContent() {
    const values = templateValues();

    $$('[data-content]').forEach((element) => {
      const value = getContent(element.dataset.content);
      if (typeof value === 'string' && value.trim() !== '') {
        element.textContent = fillTemplate(value, values); // textContent: never interprets HTML
      }
    });

    $$('[data-content-placeholder]').forEach((element) => {
      const value = getContent(element.dataset.contentPlaceholder);
      if (typeof value === 'string' && value.trim() !== '') element.setAttribute('placeholder', value);
    });

    $$('[data-visitor-name]').forEach((element) => { element.textContent = values.name; });
  }

  /* ---------- 3. STAGE MANAGER ---------- */
  const StageManager = (() => {
    const registry = new Map(); // order -> { order, el, onEnter, onExit, focusSelector }
    let currentOrder = 0;
    let highestUnlocked = 1; // Furthest stage the visitor has reached
    const listeners = [];

    function register(config) {
      const el = document.querySelector('[data-stage="' + config.order + '"]');
      if (!el) { console.warn('No element found for stage', config.order); return; }
      registry.set(config.order, Object.assign({ el }, config));
    }

    const isImplemented = (order) => registry.has(order);
    const getCurrent = () => currentOrder;
    const getHighestUnlocked = () => highestUnlocked;
    const onChange = (callback) => listeners.push(callback);

    function focusLater(element) {
      if (!element) return;
      window.setTimeout(() => element.focus({ preventScroll: true }), fx.prefersReducedMotion() ? 0 : 500);
    }

    /**
     * Moves to another stage with a smooth cross-fade.
     * options.fromHistory: true when triggered by the browser's back/forward buttons.
     */
    function goTo(order, options = {}) {
      const next = registry.get(order);
      if (!next || order === currentOrder) return false;
      if (order > highestUnlocked + 1) return false; // Cannot skip ahead

      const previousOrder = currentOrder;
      const previous = registry.get(previousOrder);

      if (previous) {
        if (previous.onExit) previous.onExit();
        previous.el.classList.remove('is-active');
        previous.el.setAttribute('inert', '');
      }

      next.el.removeAttribute('inert');
      next.el.scrollTop = 0;
      next.el.classList.add('is-active');

      currentOrder = order;
      highestUnlocked = Math.max(highestUnlocked, order);
      document.body.dataset.stage = String(order);

      if (!options.fromHistory) {
        try { history.pushState({ stage: order }, ''); } catch (error) { /* file:// restrictions: ignore */ }
      }

      if (next.onEnter) next.onEnter({ previousOrder });
      if (next.focusSelector && previousOrder !== 0 && !(next.focusOnReturnOnly && previousOrder < order)) {
        focusLater($(next.focusSelector, next.el));
      }
      listeners.forEach((callback) => callback(order));
      return true;
    }

    /** Activates the first stage without a transition (page load). */
    function start(order) {
      const first = registry.get(order);
      if (!first) return;
      currentOrder = order;
      first.el.classList.add('is-active');
      first.el.removeAttribute('inert');
      document.body.dataset.stage = String(order);
      try { history.replaceState({ stage: order }, ''); } catch (error) { /* ignore */ }
      if (first.onEnter) first.onEnter({ previousOrder: 0 });
      listeners.forEach((callback) => callback(order));
    }

    return { register, goTo, start, isImplemented, getCurrent, getHighestUnlocked, onChange };
  })();

  /* Browser back / forward buttons (and the Android back gesture) move between stages */
  window.addEventListener('popstate', (event) => {
    const order = event.state && event.state.stage ? event.state.stage : STAGE.WELCOME;
    if (order <= StageManager.getHighestUnlocked()) StageManager.goTo(order, { fromHistory: true });
  });

  /* ---------- Petals: density depends on the stage and the screen size ---------- */
  const petalField = fx.createPetalField($('#petalLayer'));
  const smallScreenQuery = window.matchMedia('(max-width: 600px)');

  function updatePetalDensity(order) {
    const baseCounts = {};
    baseCounts[STAGE.WELCOME] = 6;
    baseCounts[STAGE.GARDEN] = 16;
    const base = baseCounts[order] !== undefined ? baseCounts[order] : 10;
    petalField.setCount(smallScreenQuery.matches ? Math.round(base * 0.6) : base);
  }

  /* ---------- 4. NAVIGATION CONTROLS ---------- */
  const siteNav = $('#siteNav');
  const backButton = $('#backButton');
  const progressList = $('#progressList');

  /** Builds one dot per stage from content.js. */
  function buildProgressDots() {
    progressList.textContent = '';
    (content.stages || []).forEach((stage) => {
      const item = document.createElement('li');
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'progress__dot';
      dot.dataset.order = String(stage.order);
      dot.addEventListener('click', () => StageManager.goTo(stage.order));
      item.appendChild(dot);
      progressList.appendChild(item);
    });
  }

  /** Reflects the current position in the dots, the back button and the nav bar. */
  function updateNavigation(order) {
    const showNav = order > STAGE.WELCOME;
    siteNav.classList.toggle('is-visible', showNav);
    if (showNav) siteNav.removeAttribute('inert'); else siteNav.setAttribute('inert', '');

    backButton.disabled = order <= STAGE.WELCOME;

    const stageLabels = {};
    (content.stages || []).forEach((stage) => { stageLabels[stage.order] = stage.label; });

    $$('.progress__dot', progressList).forEach((dot) => {
      const dotOrder = Number(dot.dataset.order);
      const label = stageLabels[dotOrder] || 'Section ' + dotOrder;
      const reachable = StageManager.isImplemented(dotOrder) && dotOrder <= StageManager.getHighestUnlocked();

      dot.disabled = !reachable;
      dot.classList.toggle('is-reached', reachable && dotOrder !== order);
      dot.title = reachable ? label : label + ' (not open yet)';
      dot.setAttribute('aria-label', reachable ? label : label + ', not open yet');
      if (dotOrder === order) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current');
    });
  }

  backButton.addEventListener('click', () => {
    const target = StageManager.getCurrent() - 1;
    if (target >= STAGE.WELCOME) StageManager.goTo(target);
  });

  /* ---------- 5. STAGE 1: WELCOME ---------- */
  /**
   * Validates the visitor's name.
   * Returns { valid: true, name } or { valid: false, message }.
   */
  function validateName(rawValue) {
    const errors = (content.welcome && content.welcome.errors) || {};
    const maxLength = (content.meta && content.meta.maxNameLength) || 40;
    const name = rawValue.replace(/\s+/g, ' ').trim(); // Collapse stray spaces

    if (name === '') {
      return { valid: false, message: errors.empty || 'Please enter your name.' };
    }
    if (name.length > maxLength) {
      return { valid: false, message: errors.tooLong || 'That name is a little too long.' };
    }
    // Letters from any language, plus spaces, hyphens, apostrophes and full stops
    if (!/^[\p{L}\p{M}][\p{L}\p{M} '’.\-]*$/u.test(name)) {
      return { valid: false, message: errors.invalid || 'Please use letters only.' };
    }
    return { valid: true, name };
  }

  function initWelcome() {
    const form = $('#welcomeForm');
    const input = $('#visitorName');
    const errorMessage = $('#nameError');
    const enterButton = $('#enterButton');

    input.value = Session.getName(); // Pre-fill if the visitor comes back to this screen

    function showError(message) {
      errorMessage.textContent = message;
      input.setAttribute('aria-invalid', 'true');
      errorMessage.classList.remove('is-shaking');
      void errorMessage.offsetWidth; // Restart the nudge animation
      errorMessage.classList.add('is-shaking');
    }

    function clearError() {
      errorMessage.textContent = '';
      input.setAttribute('aria-invalid', 'false');
    }

    input.addEventListener('input', clearError);

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = validateName(input.value);

      if (!result.valid) {
        showError(result.message);
        input.focus();
        return;
      }

      Session.setName(result.name);
      input.value = result.name;
      renderContent(); // Carries the name into every greeting

      // A brief, calm pause before the gate opens
      enterButton.disabled = true;
      enterButton.classList.add('is-busy');
      window.setTimeout(() => {
        StageManager.goTo(STAGE.GARDEN);
        enterButton.disabled = false;
        enterButton.classList.remove('is-busy');
      }, fx.prefersReducedMotion() ? 0 : 500);
    });

    StageManager.register({
      order: STAGE.WELCOME,
      focusSelector: '#visitorName',
      onEnter() {
        input.value = Session.getName();
        clearError();
        updatePetalDensity(STAGE.WELCOME);
      }
    });
  }

  /* ---------- 6. STAGE 2: THE GARDEN ---------- */
  function initGarden() {
    const flowers = $$('.flower');
    const whisperText = $('#whisperText');
    const whisperCount = $('#whisperCount');
    const whisperDots = $('#whisperDots');
    const nextButton = $('#nextStageButton');
    const changeNameButton = $('#changeNameButton');
    const total = flowers.length;
    let renderedForName = null;

    // One small dot per flower
    for (let i = 0; i < total; i += 1) whisperDots.appendChild(document.createElement('span'));

    function updateProgress(found) {
      const garden = content.garden || {};
      const allFound = found === total && total > 0;
      const label = allFound && garden.allFoundMessage
        ? garden.allFoundMessage
        : fillTemplate(garden.progressLabel || '{found} of {total} whispers found', { found, total });
      whisperCount.textContent = label;
      $$('span', whisperDots).forEach((dot, index) => dot.classList.toggle('is-found', index < found));
    }

    function showWhisper(index) {
      const whispers = getContent('garden.whispers');
      const fallback = getContent('garden.whisperFallback') || '';
      const text = Array.isArray(whispers) && whispers.length ? whispers[index % whispers.length] : fallback;

      whisperText.textContent = fillTemplate(text, templateValues());
      whisperText.classList.remove('is-new');
      void whisperText.offsetWidth; // Restart the fade-in
      whisperText.classList.add('is-new');
    }

    function resetWhisper() {
      whisperText.classList.remove('is-new');
      whisperText.textContent = getContent('garden.whisperPrompt') || whisperText.textContent;
      updateProgress(0);
    }

    const flowerBed = fx.initFlowerBed({
      flowers,
      onBloom({ index, foundCount }) {
        showWhisper(index);
        updateProgress(foundCount);
      }
    });

    nextButton.addEventListener('click', () => {
      // Stage 3 will register itself later; until then, respond gracefully.
      if (!StageManager.goTo(STAGE.MEMORIES)) {
        fx.showToast(getContent('garden.nextUnavailable') || 'The next part of the garden is still being planted.');
      }
    });

    changeNameButton.addEventListener('click', () => StageManager.goTo(STAGE.WELCOME));

    StageManager.register({
      order: STAGE.GARDEN,
      focusSelector: '#garden-title',
      onEnter() {
        renderContent();
        // If a different visitor entered a new name, start the garden afresh
        if (renderedForName !== displayName()) {
          flowerBed.reset();
          resetWhisper();
          renderedForName = displayName();
        }
        updatePetalDensity(STAGE.GARDEN);
      }
    });

    updateProgress(0);
  }

  /* ---------- 7. START-UP ---------- */
  function init() {
    renderContent();
    buildProgressDots();
    initWelcome();
    initGarden();

    StageManager.onChange(updateNavigation);
    smallScreenQuery.addEventListener
      ? smallScreenQuery.addEventListener('change', () => updatePetalDensity(StageManager.getCurrent()))
      : null;

    StageManager.start(STAGE.WELCOME);
  }

  init();
})();
