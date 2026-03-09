(function () {
  function createSelectorCache() {
    const cache = new Map();
    return {
      get(key) {
        return cache.get(key);
      },
      set(key, value) {
        cache.set(key, value);
      },
      clear() {
        cache.clear();
      }
    };
  }

  function buildEvidenceIndexes(evidence) {
    const byDoc = new Map();
    const byActor = new Map();
    const byTheme = new Map();
    const byActorTheme = new Map();

    (evidence || []).forEach(item => {
      const docId = item.doc_id || '';
      if (docId) byDoc.set(docId, (byDoc.get(docId) || 0) + 1);

      const actors = item.actors || [];
      const themes = item.themes || [];
      actors.forEach(actor => {
        byActor.set(actor, (byActor.get(actor) || 0) + 1);
        themes.forEach(theme => {
          const key = `${actor}::${theme}`;
          byActorTheme.set(key, (byActorTheme.get(key) || 0) + 1);
        });
      });
      themes.forEach(theme => byTheme.set(theme, (byTheme.get(theme) || 0) + 1));
    });

    return { byDoc, byActor, byTheme, byActorTheme };
  }

  function debounce(fn, delayMs) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delayMs);
    };
  }

  window.ApatheiaSelectors = {
    createSelectorCache,
    buildEvidenceIndexes,
    debounce,
  };
})();
