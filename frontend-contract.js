(function () {
  const REQUIRED_ARRAY_KEYS = [
    'top_insights',
    'timeline',
    'profiles',
    'parties',
    'themes',
    'evidence',
    'documents',
    'contradictions',
    'lenses',
    'expansion_tracks',
    'actors',
    'system_model',
  ];

  const REQUIRED_OBJECT_KEYS = ['manifest', 'stats'];

  function normalizeDashboardPayload(input) {
    const payload = (input && typeof input === 'object') ? { ...input } : {};
    const manifest = payload.manifest && typeof payload.manifest === 'object'
      ? payload.manifest
      : {};

    payload.manifest = {
      project: manifest.project || 'Apatheia Political Rhetoric Observatory',
      description: manifest.description || 'Canonical dashboard payload.',
      document_count: Number.isInteger(manifest.document_count) ? manifest.document_count : Number(manifest.sources) || 0,
      evidence_count: Number.isInteger(manifest.evidence_count) ? manifest.evidence_count : Number(manifest.claims) || 0,
      actor_count: Number.isInteger(manifest.actor_count) ? manifest.actor_count : Number(manifest.politicians) || 0,
      theme_count: Number.isInteger(manifest.theme_count) ? manifest.theme_count : Number(manifest.issues) || 0,
    };

    REQUIRED_ARRAY_KEYS.forEach(key => {
      if (!Array.isArray(payload[key])) payload[key] = [];
    });
    REQUIRED_OBJECT_KEYS.forEach(key => {
      if (!payload[key] || typeof payload[key] !== 'object' || Array.isArray(payload[key])) payload[key] = {};
    });

    payload.schemaVersion = payload.schemaVersion || 'dashboard.v1';
    return payload;
  }

  function validateDashboardPayload(payload) {
    const errors = [];
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return ['payload must be an object'];
    }
    REQUIRED_OBJECT_KEYS.forEach(key => {
      if (!payload[key] || typeof payload[key] !== 'object' || Array.isArray(payload[key])) {
        errors.push(`missing object key: ${key}`);
      }
    });
    REQUIRED_ARRAY_KEYS.forEach(key => {
      if (!Array.isArray(payload[key])) errors.push(`missing array key: ${key}`);
    });
    ['document_count', 'evidence_count', 'actor_count', 'theme_count'].forEach(key => {
      if (!Number.isInteger(payload.manifest?.[key])) errors.push(`manifest.${key} must be an integer`);
    });
    return errors;
  }

  window.ApatheiaContract = {
    normalizeDashboardPayload,
    validateDashboardPayload,
  };
})();
