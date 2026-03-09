const state = {
  data: null,
  search: '',
  lens: 'all',
  theme: 'all',
  doc: 'all',
  profile: 'all',
  activeProfileId: null,
  activeIssue: null,
  evidencePage: 1,
  evidencePerPage: 15,
  docSortCol: null,
  docSortAsc: true,
  contradictionExpanded: new Set(),
  activeTab: 'overview',
  drawerOpen: false,
  actorDirectory: [],
  actorCategory: 'all',
};

const els = {};
let charts = {};

const metallicPalette = {
  gold: '#d8b46f',
  bronze: '#b87d52',
  copper: '#b56c5d',
  steel: '#8f9aa3',
  silver: '#c2cad0',
  gunmetal: '#59626d',
  ink: '#f4efe4',
  success: '#90b08e',
  danger: '#ca7b6a',
  line: 'rgba(194, 202, 208, 0.15)',
};

const issueDescriptors = {
  'Legality and War Powers': {
    category: 'Constitutional process',
    policyTrack: 'Congressional authority',
    summary: 'Tracks whether the case for military action clears the constitutional and statutory threshold for war powers and congressional authorization.',
    focusKeys: ['Legality and War Powers']
  },
  'Imminence and Threat': {
    category: 'Security rationale',
    policyTrack: 'Threat verification',
    summary: 'Tracks whether the administration established an imminent threat with evidence strong enough to justify escalation.',
    focusKeys: ['Imminence and Threat']
  },
  'Strategy and Exit Plan': {
    category: 'War planning',
    policyTrack: 'Operational strategy',
    summary: 'Tracks whether the archive shows a coherent plan, clear objectives, and a credible path to de-escalation.',
    focusKeys: ['Strategy and Exit Plan']
  },
  'Public Opinion': {
    category: 'Electoral legitimacy',
    policyTrack: 'Voter consent',
    summary: 'Tracks polling, democratic legitimacy, and whether the conflict aligns with what the public is prepared to support.',
    focusKeys: ['Public Opinion']
  },
  Diplomacy: {
    category: 'Negotiation policy',
    policyTrack: 'Diplomatic leverage',
    summary: 'Tracks whether talks, mediation, or off-ramps were available and whether force displaced a viable diplomatic path.',
    focusKeys: ['Diplomacy']
  },
  'Domestic Priorities': {
    category: 'Domestic policy',
    policyTrack: 'Budget pressure',
    summary: 'Tracks how war spending and political attention are weighed against domestic affordability, health, and welfare concerns.',
    focusKeys: ['Domestic Priorities']
  },
  'Historical Comparisons': {
    category: 'Precedent testing',
    policyTrack: 'Iraq and Vietnam parallels',
    summary: 'Tracks whether the archive treats this conflict as a repetition of earlier justification failures or as a materially different case.',
    focusKeys: ['Historical Comparisons']
  },
  'Jeffries Evolution': {
    category: 'Leadership positioning',
    policyTrack: 'House Democratic leadership',
    summary: 'Tracks how Jeffries moves from threat recognition into a more aggressive process, evidence, and accountability critique.',
    focusKeys: ['Hakeem Jeffries', 'Jeffries Evolution']
  },
  'Intra-party Division': {
    category: 'Coalition management',
    policyTrack: 'Party fracture',
    summary: 'Tracks where Democratic messaging splits between anti-war, leadership, and hawkish lanes.',
    focusKeys: ['Intra-party Division']
  },
  'Israel and Delegation': {
    category: 'Alliance governance',
    policyTrack: 'US-Israel decision chain',
    summary: 'Tracks whether US decision-making is framed as independent strategy or as a reaction to Israeli goals and timing.',
    focusKeys: ['Israel and Delegation']
  },
  'Nuclear Program': {
    category: 'Nonproliferation policy',
    policyTrack: 'Nuclear risk',
    summary: 'Tracks whether the nuclear rationale is evidenced, stable over time, and compatible with earlier claims about program degradation.',
    focusKeys: ['Nuclear Program']
  },
  'Proxy Violence': {
    category: 'Regional security',
    policyTrack: 'Proxy escalation',
    summary: 'Tracks regional militia, cross-border retaliation, and proxy-network arguments used to widen or justify the case for force.',
    focusKeys: ['Proxy Violence']
  },
  'Human Rights': {
    category: 'Human rights policy',
    policyTrack: 'Regime conduct',
    summary: 'Tracks how regime brutality, protest repression, and rights abuses enter the argument for or against escalation.',
    focusKeys: ['Human Rights']
  },
  'Cyber Threats': {
    category: 'Cyber policy',
    policyTrack: 'Cyber escalation',
    summary: 'Tracks cyber-risk arguments that expand the case beyond kinetic conflict into infrastructure and homeland exposure.',
    focusKeys: ['Cyber Threats']
  },
  'Hostages and Detention': {
    category: 'Consular security',
    policyTrack: 'Detention risk',
    summary: 'Tracks hostage-taking and detention as a policy pressure point inside the broader case narrative.',
    focusKeys: ['Hostages and Detention']
  },
  'Narcotics Networks': {
    category: 'Domestic spillover',
    policyTrack: 'Border and crime pressure',
    summary: 'Tracks how foreign policy rhetoric is linked to domestic harm through trafficking, border, and criminal-network framing.',
    focusKeys: ['Narcotics Networks']
  },
  'Fiscal Irony': {
    category: 'Budget accountability',
    policyTrack: 'Spending consistency',
    summary: 'Tracks whether fiscal arguments about war costs are consistent with prior spending positions and affordability claims.',
    focusKeys: ['Fiscal Irony']
  },
  'Moral Irony': {
    category: 'Moral accountability',
    policyTrack: 'Casualty framing',
    summary: 'Tracks whether moral urgency is being applied consistently across foreign casualties, soldier deaths, and domestic policy harms.',
    focusKeys: ['Moral Irony']
  },
  'Omissions and Blind Spots': {
    category: 'Analytical integrity',
    policyTrack: 'Missing context',
    summary: 'Tracks which material facts are absent, minimized, or selectively foregrounded inside the archive debate.',
    focusKeys: ['Omissions and Blind Spots']
  }
};

async function loadData() {
  const [dashboardResponse, actorDirectoryResponse] = await Promise.all([
    fetch('/api/dashboard'),
    fetch('/api/actors').catch(() => null),
  ]);
  if (!dashboardResponse.ok) throw new Error('Failed to load dashboard data');
  state.data = await dashboardResponse.json();
  if (actorDirectoryResponse?.ok) {
    const actorDirectoryPayload = await actorDirectoryResponse.json();
    state.actorDirectory = Array.isArray(actorDirectoryPayload?.actors)
      ? actorDirectoryPayload.actors
      : [];
  } else {
    state.actorDirectory = [];
  }
  state.activeProfileId = state.data.profiles?.[0]?.id || null;
  state.activeIssue = state.data.themes?.[0]?.name || null;
}

function getById(id) {
  return document.getElementById(id);
}

function cacheElements() {
  [
    'hero-summary', 'active-lens-summary', 'active-focus-summary', 'top-insights-list', 'metrics-grid',
    'timeline-list', 'theme-cloud', 'theme-filter-row', 'manifest-list', 'party-mini', 'track-mini',
    'lens-select', 'profile-select', 'search-input', 'reset-filters', 'matrix-table', 'evidence-list',
    'evidence-empty', 'quote-list', 'quote-empty', 'doc-chip-row', 'docs-table', 'actor-list',
    'system-grid', 'model-block', 'actor-cloud', 'evidence-count-label', 'profile-name', 'profile-party',
    'profile-bloc', 'profile-role', 'profile-evidence', 'profile-summary', 'profile-positioning',
    'profile-signals', 'profile-watchpoints', 'profile-phases', 'profile-linked-contradictions',
    'profile-dossier-grid', 'profile-representative-grid', 'profile-list', 'profile-focus-button', 'contradiction-list', 'contradiction-count-label',
    'contradiction-empty', 'track-list', 'evidence-pagination', 'profile-avatar',
    'cmd-palette-overlay', 'cmd-palette-input', 'cmd-palette-results',
    'back-to-top', 'sidebar', 'hamburger-btn', 'nav-links', 'cmd-k-hint',
    'mobile-bottom-nav', 'workspace-meta-grid', 'active-filter-row', 'result-summary',
    'clear-filter-pills', 'workspace-updated', 'app-tab-bar', 'detail-overlay', 'detail-drawer',
    'detail-kicker', 'detail-title', 'detail-meta', 'detail-body', 'detail-actions', 'detail-close',
    'lens-scope-summary', 'lens-theme-row', 'quick-route-list',
    'issue-name', 'issue-priority', 'issue-category', 'issue-policy-track', 'issue-summary',
    'issue-brief', 'issue-stat-grid', 'issue-lead-actors', 'issue-source-chips',
    'issue-linked-contradictions', 'issue-evidence-samples', 'issue-timeline-list',
    'issue-action-row', 'issue-count-label', 'issue-list', 'actor-category-select'
  ].forEach(id => { els[id] = getById(id); });
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function titleCase(text) {
  return text.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function truncateText(text, maxLength = 220) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`;
}

function profileById(id) {
  return state.data.profiles.find(item => item.id === id) || null;
}

function profileByName(name) {
  return state.data.profiles.find(item => item.name === name) || null;
}

function actorDirectory() {
  if (Array.isArray(state.actorDirectory) && state.actorDirectory.length) {
    return state.actorDirectory;
  }
  return (state.data.profiles || []).map(profile => ({
    id: `politicians:${profile.id}`,
    name: profile.name,
    category: 'politicians',
    affiliation: profile.party || 'Political actor',
    summary: profile.summary || '',
    evidence_count: profile.evidence_count || 0,
    themes: profile.themes || [],
    profile_id: profile.id,
  }));
}

function filteredActorDirectory() {
  const directory = actorDirectory();
  if (state.actorCategory === 'all') return directory;
  return directory.filter(item => item.category === state.actorCategory);
}

function documentById(id) {
  return state.data.documents.find(item => item.id === id) || null;
}

function documentByLabel(label) {
  return state.data.documents.find(item => item.label === label || item.title === label) || null;
}

function evidenceById(id) {
  return state.data.evidence.find(item => item.id === id) || null;
}

function contradictionById(id) {
  return state.data.contradictions.find(item => item.id === id) || null;
}

function overlapCount(values = [], otherValues = []) {
  const otherSet = new Set(otherValues);
  return values.filter(value => otherSet.has(value)).length;
}

function topEntries(values, limit = 3) {
  const counts = new Map();
  values
    .filter(Boolean)
    .forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

function severityRank(severity) {
  return { high: 0, medium: 1, low: 2 }[severity] ?? 3;
}

function priorityFromEvidenceCount(count) {
  if (count >= 45) return 'Critical';
  if (count >= 25) return 'High';
  if (count >= 12) return 'Watch';
  return 'Emerging';
}

function issueDescriptor(themeName) {
  return issueDescriptors[themeName] || {
    category: 'Case issue',
    policyTrack: 'General monitoring',
    summary: `Tracks how ${themeName.toLowerCase()} appears across the archive's evidence, source files, and contradiction records.`,
    focusKeys: [themeName]
  };
}

function filteredEvidenceByScope({ includeTheme = true } = {}) {
  const lensThemes = activeLensThemes();
  return state.data.evidence.filter(item => {
    const haystack = [item.title, item.text, ...(item.actors || []), ...(item.themes || []), item.doc_title].join(' ').toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesTheme = !includeTheme || state.theme === 'all' || (item.themes || []).includes(state.theme);
    const matchesDoc = state.doc === 'all' || item.doc_id === state.doc;
    const matchesLens = !lensThemes || (item.themes || []).some(theme => lensThemes.includes(theme));
    const matchesProfile = evidenceMatchesProfile(item);
    return matchesSearch && matchesTheme && matchesDoc && matchesLens && matchesProfile;
  });
}

function filteredContradictionsByScope({ includeTheme = true } = {}) {
  const profile = state.profile === 'all'
    ? null
    : profileById(state.profile) || null;
  const lensThemes = activeLensThemes();
  const doc = state.doc === 'all'
    ? null
    : documentById(state.doc) || null;
  return state.data.contradictions.filter(item => {
    const matchesSearch = contradictionMatchesSearch(item);
    const matchesTheme = !includeTheme || state.theme === 'all' || (item.themes || []).includes(state.theme);
    const matchesLens = !lensThemes || (item.themes || []).some(theme => lensThemes.includes(theme));
    const matchesProfile = !profile
      || item.actor === profile.name
      || item.counterparty === profile.name
      || (profile.linked_contradictions || []).includes(item.id);
    const matchesDoc = !doc
      || (item.related_documents || []).includes(doc.label)
      || (item.related_documents || []).includes(doc.title);
    return matchesSearch && matchesTheme && matchesLens && matchesProfile && matchesDoc;
  });
}

function issueTimeline(themeName) {
  const descriptor = issueDescriptor(themeName);
  const keys = new Set([themeName, ...(descriptor.focusKeys || [])]);
  return state.data.timeline.filter(item =>
    (item.focus || []).some(focus => keys.has(focus))
  );
}

function issueRecord(themeName, scopedEvidence, scopedContradictions) {
  const themeMeta = state.data.themes.find(item => item.name === themeName) || { name: themeName, examples: [] };
  const descriptor = issueDescriptor(themeName);
  const evidence = scopedEvidence.filter(item => (item.themes || []).includes(themeName));
  const contradictions = scopedContradictions.filter(item => (item.themes || []).includes(themeName));
  const docs = topEntries(evidence.map(item => item.doc_id), 3).map(([docId, count]) => ({
    doc: documentById(docId),
    count
  })).filter(entry => entry.doc);
  const actors = topEntries(evidence.flatMap(item => item.actors || []), 4).map(([actor, count]) => ({
    name: actor,
    count,
    profile: profileByName(actor)
  }));
  const samples = [...evidence].sort((a, b) => {
    const kindRank = { quote: 0, claim: 1, section: 2, excerpt: 3 };
    return (kindRank[a.kind] ?? 4) - (kindRank[b.kind] ?? 4);
  }).slice(0, 3);
  const timeline = issueTimeline(themeName).slice(0, 4);

  return {
    name: themeName,
    descriptor,
    priority: priorityFromEvidenceCount(evidence.length || themeMeta.evidence_count || 0),
    evidenceCount: evidence.length,
    contradictionCount: contradictions.length,
    docCount: new Set(evidence.map(item => item.doc_id)).size,
    actorCount: new Set(evidence.flatMap(item => item.actors || [])).size,
    docs,
    actors,
    evidence,
    contradictions,
    examples: themeMeta.examples || [],
    samples,
    timeline
  };
}

function issueRecords() {
  const scopedEvidence = filteredEvidenceByScope({ includeTheme: false });
  const scopedContradictions = filteredContradictionsByScope({ includeTheme: false });
  const lensThemes = activeLensThemes();
  return state.data.themes
    .filter(theme => !lensThemes || lensThemes.includes(theme.name))
    .map(theme => issueRecord(theme.name, scopedEvidence, scopedContradictions))
    .filter(issue => issue.evidenceCount > 0 || issue.contradictionCount > 0)
    .sort((a, b) => b.evidenceCount - a.evidenceCount || b.contradictionCount - a.contradictionCount || a.name.localeCompare(b.name));
}

function detailProse(text) {
  const clean = String(text || '').trim();
  if (!clean) {
    return '<p class="workspace-note">No archive excerpt is available for this record yet.</p>';
  }
  const formatted = escapeHtml(clean)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\n{2,}/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return `<div class="detail-prose">${formatted}</div>`;
}

function renderActionButton(label, action, value = '', tone = 'secondary', tabTarget = '') {
  const attrs = [
    `class="pill-button ${tone}"`,
    'type="button"',
    `data-ui-action="${escapeHtml(action)}"`
  ];
  if (value) attrs.push(`data-value="${escapeHtml(value)}"`);
  if (tabTarget) attrs.push(`data-tab-target="${escapeHtml(tabTarget)}"`);
  return `<button ${attrs.join(' ')}>${escapeHtml(label)}</button>`;
}

function renderInlineAction(label, action, value = '', tabTarget = '') {
  const attrs = [
    'class="inline-action"',
    'type="button"',
    `data-ui-action="${escapeHtml(action)}"`
  ];
  if (value) attrs.push(`data-value="${escapeHtml(value)}"`);
  if (tabTarget) attrs.push(`data-tab-target="${escapeHtml(tabTarget)}"`);
  return `<button ${attrs.join(' ')}>${escapeHtml(label)}</button>`;
}

function syncControlValues() {
  if (els['search-input']) els['search-input'].value = state.search ? state.search : '';
  if (els['lens-select']) els['lens-select'].value = state.lens;
  if (els['profile-select']) els['profile-select'].value = state.profile;
}

function resetAllFilters() {
  state.search = '';
  state.lens = 'all';
  state.theme = 'all';
  state.doc = 'all';
  state.profile = 'all';
  state.activeProfileId = state.data.profiles?.[0]?.id || null;
  state.evidencePage = 1;
  syncControlValues();
}

function clearFilter(key) {
  if (key === 'search') state.search = '';
  if (key === 'lens') state.lens = 'all';
  if (key === 'theme') state.theme = 'all';
  if (key === 'doc') state.doc = 'all';
  if (key === 'profile') state.profile = 'all';
  state.evidencePage = 1;
  syncControlValues();
}

function focusActorSearch(actorName) {
  state.search = actorName.toLowerCase();
  const profile = profileByName(actorName);
  if (profile) state.activeProfileId = profile.id;
  state.evidencePage = 1;
  syncControlValues();
}

function setActiveTab(tabId, shouldFocus = false) {
  state.activeTab = tabId;
  document.querySelectorAll('[data-tab-panel]').forEach(panel => {
    panel.hidden = panel.dataset.tabPanel !== tabId;
  });
  document.querySelectorAll('.app-tab').forEach(tab => {
    const active = tab.dataset.tab === tabId;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    const active = link.dataset.section === tabId;
    link.classList.toggle('active', active);
  });
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    const active = btn.dataset.section === tabId;
    btn.classList.toggle('active', active);
  });
  if (shouldFocus) {
    document.getElementById(tabId)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

function openDetailDrawer(config) {
  if (!els['detail-overlay']) return;
  els['detail-kicker'].textContent = config.kicker || 'Record detail';
  els['detail-title'].textContent = config.title || 'Inspector panel';
  els['detail-meta'].innerHTML = (config.meta || []).map(item => `<span class="data-badge">${escapeHtml(item)}</span>`).join('');
  els['detail-body'].innerHTML = config.body || '';
  els['detail-actions'].innerHTML = config.actions || '';
  els['detail-overlay'].classList.add('open');
  els['detail-overlay'].setAttribute('aria-hidden', 'false');
  state.drawerOpen = true;
  document.body.classList.add('drawer-open');
}

function closeDetailDrawer() {
  if (!els['detail-overlay']) return;
  els['detail-overlay'].classList.remove('open');
  els['detail-overlay'].setAttribute('aria-hidden', 'true');
  state.drawerOpen = false;
  document.body.classList.remove('drawer-open');
}

function relatedContradictionsForEvidence(record, limit = 3) {
  return state.data.contradictions
    .map(item => {
      let score = 0;
      if ((record.actors || []).includes(item.actor)) score += 4;
      if ((record.actors || []).includes(item.counterparty)) score += 4;
      score += overlapCount(record.themes || [], item.themes || []) * 2;
      if ((item.related_documents || []).includes(record.doc_title)) score += 2;
      return { item, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || severityRank(a.item.severity) - severityRank(b.item.severity))
    .slice(0, limit)
    .map(entry => entry.item);
}

function relatedEvidenceForContradiction(item, limit = 4) {
  const relatedDocs = new Set(item.related_documents || []);
  return state.data.evidence
    .map(record => {
      let score = 0;
      if ((record.actors || []).includes(item.actor)) score += 4;
      if ((record.actors || []).includes(item.counterparty)) score += 4;
      score += overlapCount(record.themes || [], item.themes || []) * 2;
      if (relatedDocs.has(record.doc_title)) score += 2;
      return { record, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(entry => entry.record);
}

function relatedContradictionsForDocument(doc, limit = 4) {
  return state.data.contradictions
    .map(item => {
      let score = 0;
      if ((item.related_documents || []).includes(doc.label)) score += 4;
      score += overlapCount(doc.themes || [], item.themes || []);
      return { item, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || severityRank(a.item.severity) - severityRank(b.item.severity))
    .slice(0, limit)
    .map(entry => entry.item);
}

function openEvidenceRecord(record) {
  const sourceDoc = documentById(record.doc_id);
  const relatedContradictions = relatedContradictionsForEvidence(record);
  const sameDocCount = state.data.evidence.filter(item => item.doc_id === record.doc_id).length;
  const dominantActors = (record.actors || []).slice(0, 4);
  openDetailDrawer({
    kicker: 'Evidence record',
    title: record.title,
    meta: [titleCase(record.kind), record.doc_title, ...(record.actors || []).slice(0, 2)],
    body: `
      <div class="detail-section">
        <span class="nav-section-title">Source file</span>
        <p>${escapeHtml(sourceDoc?.title || record.doc_title)}</p>
        <div class="detail-tag-row">
          <span class="data-badge"><strong>${formatNumber(sameDocCount)}</strong> linked records</span>
          ${sourceDoc ? `<span class="data-badge">${escapeHtml(sourceDoc.type)}</span>` : ''}
          ${sourceDoc ? `<span class="data-badge">${escapeHtml(sourceDoc.scope)}</span>` : ''}
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Related contradictions</span>
        ${relatedContradictions.length ? `
          <div class="drawer-related-list">
            ${relatedContradictions.map(item => `
              <article class="drawer-related-card">
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.summary)}</p>
                <div class="detail-tag-row">
                  <span class="data-badge">${escapeHtml(item.type)}</span>
                  <span class="data-badge">${escapeHtml(item.date_range)}</span>
                </div>
                ${renderInlineAction('Inspect contradiction', 'inspect-contradiction', item.id)}
              </article>
            `).join('')}
          </div>
        ` : '<p class="workspace-note">No contradiction records are directly linked to this evidence slice yet.</p>'}
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Archive excerpt</span>
        ${detailProse(record.text)}
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Themes</span>
        <div class="detail-tag-row">
          ${(record.themes || []).map(theme => `<button class="tag action-tag" type="button" data-ui-action="set-theme" data-value="${escapeHtml(theme)}" data-tab-target="evidence">${escapeHtml(theme)}</button>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Actors</span>
        <div class="detail-tag-row">
          ${dominantActors.map(actor => `<button class="tag action-tag" type="button" data-ui-action="search-actor" data-value="${escapeHtml(actor)}" data-tab-target="evidence">${escapeHtml(actor)}</button>`).join('')}
        </div>
      </div>
    `,
    actions: [
      renderActionButton('Filter to this source', 'set-doc', record.doc_id, 'primary', 'evidence'),
      renderActionButton('Open source record', 'inspect-document', record.doc_id),
      dominantActors[0] ? renderActionButton(`Search ${dominantActors[0]}`, 'search-actor', dominantActors[0], 'secondary', 'evidence') : ''
    ].join('')
  });
}

function openContradictionRecord(item) {
  const relatedEvidence = relatedEvidenceForContradiction(item);
  const relatedDocuments = (item.related_documents || [])
    .map(label => documentByLabel(label))
    .filter(Boolean);
  const actorProfile = profileByName(item.actor);
  openDetailDrawer({
    kicker: 'Contradiction record',
    title: item.title,
    meta: [item.type, titleCase(item.severity), item.date_range],
    body: `
      <div class="detail-section">
        <span class="nav-section-title">Tension summary</span>
        <p>${escapeHtml(item.summary)}</p>
        ${detailProse(item.tension)}
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Actors in tension</span>
        <div class="detail-tag-row">
          <button class="tag action-tag" type="button" data-ui-action="${escapeHtml(actorProfile ? 'spotlight-profile' : 'search-actor')}" data-value="${escapeHtml(actorProfile ? actorProfile.id : item.actor)}" data-tab-target="${escapeHtml(actorProfile ? 'profiles' : 'evidence')}">${escapeHtml(item.actor)}</button>
          <span class="tag">${escapeHtml(item.counterparty)}</span>
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Themes</span>
        <div class="detail-tag-row">
          ${(item.themes || []).map(theme => `<button class="tag action-tag" type="button" data-ui-action="set-theme" data-value="${escapeHtml(theme)}" data-tab-target="contradictions">${escapeHtml(theme)}</button>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Source files cited</span>
        ${relatedDocuments.length ? `
          <div class="drawer-related-list">
            ${relatedDocuments.map(doc => `
              <article class="drawer-related-card">
                <strong>${escapeHtml(doc.label)}</strong>
                <p>${escapeHtml(doc.scope)}</p>
                ${renderInlineAction('Inspect source', 'inspect-document', doc.id)}
              </article>
            `).join('')}
          </div>
        ` : '<p class="workspace-note">No linked source files were resolved for this contradiction.</p>'}
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Matching evidence</span>
        ${relatedEvidence.length ? `
          <div class="drawer-related-list">
            ${relatedEvidence.map(record => `
              <article class="drawer-related-card">
                <strong>${escapeHtml(record.title)}</strong>
                <p>${escapeHtml(truncateText(record.text, 180))}</p>
                <div class="detail-tag-row">
                  <span class="data-badge">${escapeHtml(record.doc_title)}</span>
                  ${(record.themes || []).slice(0, 2).map(theme => `<span class="data-badge">${escapeHtml(theme)}</span>`).join('')}
                </div>
                ${renderInlineAction('Inspect evidence', 'inspect-evidence', record.id)}
              </article>
            `).join('')}
          </div>
        ` : '<p class="workspace-note">No evidence excerpts matched this contradiction strongly enough to surface here.</p>'}
      </div>
    `,
    actions: [
      actorProfile ? renderActionButton(`Open ${item.actor} profile`, 'spotlight-profile', actorProfile.id, 'primary', 'profiles') : '',
      item.themes?.[0] ? renderActionButton(`Filter ${item.themes[0]}`, 'set-theme', item.themes[0], 'secondary', 'contradictions') : ''
    ].join('')
  });
}

function openDocumentRecord(doc) {
  const docEvidence = state.data.evidence.filter(item => item.doc_id === doc.id);
  const docContradictions = relatedContradictionsForDocument(doc);
  const topActors = topEntries(docEvidence.flatMap(item => item.actors || []), 3);
  openDetailDrawer({
    kicker: 'Source file',
    title: doc.label,
    meta: [doc.type, doc.scope, `${formatNumber(doc.word_count)} words`],
    body: `
      <div class="detail-section">
        <span class="nav-section-title">Case role</span>
        <p>${escapeHtml(doc.title)}</p>
        <div class="detail-tag-row">
          <span class="data-badge"><strong>${formatNumber(docEvidence.length)}</strong> evidence records</span>
          <span class="data-badge"><strong>${formatNumber(docContradictions.length)}</strong> contradiction links</span>
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Core themes</span>
        <div class="detail-tag-row">
          ${(doc.themes || []).map(theme => `<button class="tag action-tag" type="button" data-ui-action="set-theme" data-value="${escapeHtml(theme)}" data-tab-target="evidence">${escapeHtml(theme)}</button>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Most represented actors</span>
        <div class="detail-tag-row">
          ${topActors.map(([actor, count]) => `<button class="tag action-tag" type="button" data-ui-action="search-actor" data-value="${escapeHtml(actor)}" data-tab-target="evidence">${escapeHtml(actor)} ${count}</button>`).join('')}
        </div>
      </div>
      <div class="detail-section">
        <span class="nav-section-title">Linked contradiction records</span>
        ${docContradictions.length ? `
          <div class="drawer-related-list">
            ${docContradictions.map(item => `
              <article class="drawer-related-card">
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.summary)}</p>
                <div class="detail-tag-row">
                  <span class="data-badge">${escapeHtml(titleCase(item.severity))}</span>
                  <span class="data-badge">${escapeHtml(item.date_range)}</span>
                </div>
                ${renderInlineAction('Inspect contradiction', 'inspect-contradiction', item.id)}
              </article>
            `).join('')}
          </div>
        ` : '<p class="workspace-note">No contradiction records are explicitly tied to this source file yet.</p>'}
      </div>
    `,
    actions: [
      renderActionButton('Filter to this source', 'set-doc', doc.id, 'primary', 'evidence'),
      docContradictions[0] ? renderActionButton('Inspect strongest contradiction', 'inspect-contradiction', docContradictions[0].id) : ''
    ].join('')
  });
}

function handleUiAction(event) {
  const trigger = event.target.closest('[data-ui-action]');
  if (!trigger) return;
  const action = trigger.dataset.uiAction;
  const value = trigger.dataset.value || '';
  const tabTarget = trigger.dataset.tabTarget || '';

  if (action === 'inspect-evidence') {
    const record = evidenceById(value);
    if (record) openEvidenceRecord(record);
    return;
  }

  if (action === 'inspect-contradiction') {
    const record = contradictionById(value);
    if (record) openContradictionRecord(record);
    return;
  }

  if (action === 'inspect-document') {
    const doc = documentById(value);
    if (doc) openDocumentRecord(doc);
    return;
  }

  if (action === 'set-theme') {
    state.theme = value || 'all';
    if (value && value !== 'all') state.activeIssue = value;
    state.evidencePage = 1;
    closeDetailDrawer();
    render();
    if (tabTarget) setActiveTab(tabTarget, true);
    return;
  }

  if (action === 'set-issue') {
    state.activeIssue = value || state.activeIssue;
    render();
    setActiveTab(tabTarget || 'issues', true);
    return;
  }

  if (action === 'set-doc') {
    state.doc = value || 'all';
    state.evidencePage = 1;
    closeDetailDrawer();
    render();
    setActiveTab(tabTarget || 'evidence', true);
    return;
  }

  if (action === 'spotlight-profile') {
    state.activeProfileId = value;
    state.profile = 'all';
    state.evidencePage = 1;
    syncControlValues();
    closeDetailDrawer();
    render();
    setActiveTab(tabTarget || 'profiles', true);
    return;
  }

  if (action === 'search-actor') {
    focusActorSearch(value);
    closeDetailDrawer();
    render();
    setActiveTab(tabTarget || 'evidence', true);
    return;
  }

  if (action === 'clear-filter') {
    clearFilter(value);
    render();
    return;
  }

  if (action === 'reset-filters') {
    resetAllFilters();
    closeDetailDrawer();
    render();
    return;
  }

  if (action === 'set-tab') {
    setActiveTab(value, true);
  }
}

/* ---------- EVENTS ---------- */

function attachEvents() {
  els['search-input'].addEventListener('input', event => {
    state.search = event.target.value.trim().toLowerCase();
    state.evidencePage = 1;
    render();
  });

  els['lens-select'].addEventListener('change', event => {
    state.lens = event.target.value;
    const lens = currentLens();
    const lensThemes = lens?.themes || null;
    if (lensThemes && state.theme !== 'all' && !lensThemes.includes(state.theme)) {
      state.theme = 'all';
    }
    state.evidencePage = 1;
    render();
  });

  els['profile-select'].addEventListener('change', event => {
    const value = event.target.value;
    state.profile = value;
    if (value !== 'all') {
      state.activeProfileId = value;
    }
    state.evidencePage = 1;
    render();
  });

  els['reset-filters'].addEventListener('click', () => {
    resetAllFilters();
    render();
  });
  els['clear-filter-pills']?.addEventListener('click', () => {
    resetAllFilters();
    render();
  });

  els['profile-focus-button'].addEventListener('click', () => {
    const profile = activeProfile();
    if (!profile) return;
    state.profile = profile.id;
    els['profile-select'].value = profile.id;
    state.evidencePage = 1;
    render();
    setActiveTab('evidence', true);
  });

  // Hamburger toggle
  els['hamburger-btn'].addEventListener('click', () => {
    const sidebar = els['sidebar'];
    const isOpen = sidebar.classList.toggle('sidebar-open');
    els['hamburger-btn'].setAttribute('aria-expanded', String(isOpen));
  });

  // Back to top
  const mainEl = document.querySelector('.main');
  const backBtn = els['back-to-top'];
  if (mainEl && backBtn) {
    const scrollTarget = mainEl.scrollHeight > mainEl.clientHeight ? mainEl : window;
    const getScroll = () => scrollTarget === window ? window.scrollY : mainEl.scrollTop;
    const onScroll = () => {
      if (getScroll() > 400) backBtn.classList.add('visible');
      else backBtn.classList.remove('visible');
    };
    (scrollTarget === window ? window : mainEl).addEventListener('scroll', onScroll, { passive: true });
    backBtn.addEventListener('click', () => {
      if (scrollTarget === window) window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      else mainEl.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
    });
  }

  // CMD+K command palette
  document.addEventListener('keydown', handleGlobalKeydown);
  els['cmd-palette-overlay'].addEventListener('click', event => {
    if (event.target === els['cmd-palette-overlay']) closeCmdPalette();
  });
  els['cmd-palette-input'].addEventListener('input', renderCmdResults);
  els['cmd-palette-input'].addEventListener('keydown', handleCmdKeydown);
  document.addEventListener('click', handleUiAction);

  // Update Cmd/Ctrl hint
  if (els['cmd-k-hint']) {
    els['cmd-k-hint'].textContent = navigator.platform.indexOf('Mac') > -1 ? '⌘K' : 'Ctrl+K';
  }

  document.querySelectorAll('.app-tab').forEach(tab => {
    tab.setAttribute('role', 'tab');
    tab.addEventListener('click', () => setActiveTab(tab.dataset.tab, true));
  });

  // Mobile bottom nav
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.dataset.section;
      setActiveTab(section, true);
    });
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const section = link.dataset.section;
      setActiveTab(section, true);
    });
  });

  els['detail-close']?.addEventListener('click', closeDetailDrawer);
  els['detail-overlay']?.addEventListener('click', event => {
    if (event.target === els['detail-overlay']) closeDetailDrawer();
  });

  // Intersection Observer for active nav highlighting
  setupSectionObserver();
}

/* ---------- SECTION OBSERVER ---------- */

function setupSectionObserver() {
  const sections = ['overview', 'issues', 'timeline', 'profiles', 'contradictions', 'evidence', 'documents', 'analytics', 'scaling'];
  const targets = sections.map(id => document.getElementById(id)).filter(Boolean);
  if (!targets.length) return;

  const observer = new IntersectionObserver(entries => {
    let bestId = null;
    let bestRatio = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
        bestRatio = entry.intersectionRatio;
        bestId = entry.target.id;
      }
    });
    if (bestId) highlightNavSection(bestId);
  }, {
    root: document.querySelector('.main'),
    threshold: [0.1, 0.3, 0.5],
  });

  targets.forEach(t => observer.observe(t));
}

function highlightNavSection(sectionId) {
  if (!els['nav-links']) return;
  if (state.activeTab !== sectionId) return;
  els['nav-links'].querySelectorAll('a').forEach(a => {
    if (a.dataset.section === sectionId) a.classList.add('active');
    else a.classList.remove('active');
  });
  document.querySelectorAll('.app-tab').forEach(tab => {
    tab.classList.toggle('is-active', tab.dataset.tab === sectionId);
  });
  // Mobile bottom nav
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    if (btn.dataset.section === sectionId) btn.classList.add('active');
    else btn.classList.remove('active');
  });
}

/* ---------- CMD+K PALETTE ---------- */

function handleGlobalKeydown(event) {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    openCmdPalette();
  }
  if (event.key === 'Escape' && state.drawerOpen) {
    closeDetailDrawer();
    return;
  }
  if (event.key === '/' && !isInputFocused()) {
    event.preventDefault();
    els['search-input'].focus();
  }
}

function isInputFocused() {
  const tag = document.activeElement?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function openCmdPalette() {
  els['cmd-palette-overlay'].classList.add('open');
  els['cmd-palette-overlay'].setAttribute('aria-hidden', 'false');
  els['cmd-palette-input'].value = '';
  renderCmdResults();
  setTimeout(() => els['cmd-palette-input'].focus(), 50);
}

function closeCmdPalette() {
  els['cmd-palette-overlay'].classList.remove('open');
  els['cmd-palette-overlay'].setAttribute('aria-hidden', 'true');
}

function getCmdItems() {
  const items = [];
  // Sections
  const sectionLabels = {
    overview: 'Brief',
    issues: 'Issue Map',
    timeline: 'Timeline',
    profiles: 'Actors',
    contradictions: 'Tension Map',
    evidence: 'Evidence Log',
    documents: 'Source Library',
    analytics: 'Analytics',
    scaling: 'Roadmap'
  };
  Object.entries(sectionLabels).forEach(([id, label]) => {
    items.push({ type: 'section', id, label, icon: '§' });
  });
  // Profiles
  if (state.data?.profiles) {
    state.data.profiles.forEach(p => {
      items.push({ type: 'profile', id: p.id, label: p.name, icon: p.name.charAt(0).toUpperCase() });
    });
  }
  // Documents
  if (state.data?.documents) {
    state.data.documents.forEach(doc => {
      items.push({ type: 'document', id: doc.id, label: doc.label, icon: 'D' });
    });
  }
  // Contradictions
  if (state.data?.contradictions) {
    state.data.contradictions.forEach(item => {
      items.push({ type: 'contradiction', id: item.id, label: item.title, icon: '!' });
    });
  }
  // Themes
  if (state.data?.themes) {
    state.data.themes.slice(0, 12).forEach(t => {
      items.push({ type: 'theme', id: t.name, label: t.name, icon: '#' });
    });
  }
  return items;
}

function renderCmdResults() {
  const query = (els['cmd-palette-input'].value || '').toLowerCase();
  const allItems = getCmdItems();
  const filtered = query
    ? allItems.filter(item => item.label.toLowerCase().includes(query))
    : allItems;

  els['cmd-palette-results'].innerHTML = filtered.slice(0, 20).map((item, i) =>
    `<div class="cmd-result ${i === 0 ? 'active' : ''}" data-cmd-type="${item.type}" data-cmd-id="${escapeHtml(item.id)}" data-index="${i}">
      <span class="cmd-result-icon">${escapeHtml(item.icon)}</span>
      <span>${escapeHtml(item.label)}</span>
    </div>`
  ).join('');

  els['cmd-palette-results'].querySelectorAll('.cmd-result').forEach(el => {
    el.addEventListener('click', () => executeCmdResult(el));
  });
}

function handleCmdKeydown(event) {
  if (event.key === 'Escape') { closeCmdPalette(); return; }
  const results = els['cmd-palette-results'].querySelectorAll('.cmd-result');
  if (!results.length) return;
  let activeIndex = Array.from(results).findIndex(r => r.classList.contains('active'));
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    results[activeIndex]?.classList.remove('active');
    activeIndex = (activeIndex + 1) % results.length;
    results[activeIndex].classList.add('active');
    results[activeIndex].scrollIntoView({ block: 'nearest' });
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    results[activeIndex]?.classList.remove('active');
    activeIndex = (activeIndex - 1 + results.length) % results.length;
    results[activeIndex].classList.add('active');
    results[activeIndex].scrollIntoView({ block: 'nearest' });
  } else if (event.key === 'Enter') {
    event.preventDefault();
    const active = results[activeIndex];
    if (active) executeCmdResult(active);
  }
}

function executeCmdResult(el) {
  const type = el.dataset.cmdType;
  const id = el.dataset.cmdId;
  closeCmdPalette();

  if (type === 'section') {
    setActiveTab(id, true);
  } else if (type === 'profile') {
    setActiveTab('profiles', true);
    state.activeProfileId = id;
    state.profile = id;
    els['profile-select'].value = id;
    state.evidencePage = 1;
    render();
    document.getElementById('profiles')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
  } else if (type === 'document') {
    state.doc = id;
    state.evidencePage = 1;
    render();
    setActiveTab('evidence', true);
  } else if (type === 'contradiction') {
    const contradiction = contradictionById(id);
    if (contradiction) {
      setActiveTab('contradictions', true);
      openContradictionRecord(contradiction);
    }
  } else if (type === 'theme') {
    state.theme = id;
    state.activeIssue = id;
    state.evidencePage = 1;
    render();
    setActiveTab('issues', true);
  }
}

/* ---------- DATA HELPERS ---------- */

function currentLens() {
  if (state.lens === 'all') return null;
  return state.data.lenses.find(item => item.id === state.lens) || null;
}

function activeLensThemes() {
  return currentLens()?.themes || null;
}

function activeProfile() {
  const fallback = state.data.profiles?.[0] || null;
  const id = state.activeProfileId || fallback?.id;
  return profileById(id) || fallback;
}

function evidenceMatchesProfile(item) {
  if (state.profile === 'all') return true;
  const profile = profileById(state.profile);
  if (!profile) return true;
  const haystack = [item.title, item.text, item.doc_title].join(' ').toLowerCase();
  return haystack.includes(profile.name.toLowerCase())
    || (item.actors || []).includes(profile.name);
}

function contradictionMatchesSearch(item) {
  const haystack = [item.title, item.summary, item.tension, item.actor, item.counterparty, ...(item.themes || []), ...(item.related_documents || [])].join(' ').toLowerCase();
  return !state.search || haystack.includes(state.search);
}

function filterEvidence() {
  return filteredEvidenceByScope({ includeTheme: true });
}

function filteredContradictions() {
  return filteredContradictionsByScope({ includeTheme: true });
}

function activeFilterLabels() {
  const labels = [];
  const lens = currentLens();
  const profile = state.profile === 'all'
    ? null
    : profileById(state.profile) || null;
  const doc = state.doc === 'all'
    ? null
    : documentById(state.doc) || null;

  if (state.search) labels.push({ key: 'search', label: 'Search', value: state.search });
  if (lens) labels.push({ key: 'lens', label: 'Lens', value: lens.title });
  if (state.theme !== 'all') labels.push({ key: 'theme', label: 'Theme', value: state.theme });
  if (profile) labels.push({ key: 'profile', label: 'Profile', value: profile.name });
  if (doc) labels.push({ key: 'doc', label: 'Document', value: doc.label });

  return labels;
}

function renderWorkspaceStrip() {
  const filtered = filterEvidence();
  const contradictions = filteredContradictions();
  const docs = new Set(filtered.map(item => item.doc_id)).size;
  const actors = new Set(filtered.flatMap(item => item.actors || [])).size;
  const quotes = filtered.filter(item => item.kind === 'quote').length;
  const activeFilters = activeFilterLabels();
  const docLeader = topEntries(filtered.map(item => item.doc_id), 1)[0];
  const actorLeader = topEntries(filtered.flatMap(item => item.actors || []), 1)[0];
  const topContradiction = contradictions[0] || null;

  const cards = [
    {
      label: 'Evidence in view',
      value: formatNumber(filtered.length),
      note: `${formatNumber(docs)} source files represented`
    },
    {
      label: 'Source spread',
      value: formatNumber(docs),
      note: docLeader ? `${documentById(docLeader[0])?.label || docLeader[0]} leads with ${formatNumber(docLeader[1])} records` : 'No source file is leading this view'
    },
    {
      label: 'Actor coverage',
      value: formatNumber(actors),
      note: actorLeader ? `${actorLeader[0]} appears ${formatNumber(actorLeader[1])} times in the current slice` : 'No actor footprint in the current slice'
    },
    {
      label: 'Pressure points',
      value: formatNumber(contradictions.length),
      note: topContradiction ? topContradiction.title : `${formatNumber(quotes)} direct quotations available`
    }
  ];

  els['workspace-meta-grid'].innerHTML = cards.map(card => `
    <div class="workspace-meta-card">
      <span class="small-label">${escapeHtml(card.label)}</span>
      <span class="metric-value">${escapeHtml(card.value)}</span>
      <p class="workspace-note">${escapeHtml(card.note)}</p>
    </div>
  `).join('');

  els['active-filter-row'].innerHTML = activeFilters.length
    ? activeFilters.map(item => `
      <button class="active-filter-chip active-filter-chip-button" type="button" data-ui-action="clear-filter" data-value="${escapeHtml(item.key)}"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><span aria-hidden="true">×</span></button>
    `).join('')
    : '<span class="active-filter-chip"><span>View</span><strong>Default archive scope</strong></span>';

  const summary = activeFilters.length
    ? `Showing ${formatNumber(filtered.length)} evidence items across ${formatNumber(actors)} actors. The current view is heaviest in ${docLeader ? `${documentById(docLeader[0])?.label || docLeader[0]}` : 'the active source slice'} and is anchored by ${topContradiction ? `"${topContradiction.title}"` : 'the visible evidence set'}.`
    : `Showing the full case baseline: ${formatNumber(filtered.length)} evidence items, ${formatNumber(actors)} actors, and ${formatNumber(contradictions.length)} contradiction records, led by ${docLeader ? `${documentById(docLeader[0])?.label || docLeader[0]}` : 'the core archive'}.`;
  els['result-summary'].textContent = summary;
  if (els['workspace-updated']) {
    els['workspace-updated'].textContent = activeFilters.length ? 'Custom view active' : 'Baseline archive view';
  }
}

/* ---------- RENDER FUNCTIONS ---------- */

function renderSidebar() {
  const { manifest, parties, expansion_tracks: tracks, lenses, themes, profiles } = state.data;
  const manifestItems = [
    ['Documents', manifest.document_count],
    ['Evidence items', manifest.evidence_count],
    ['Actors', manifest.actor_count],
    ['Themes', manifest.theme_count],
  ];

  els['manifest-list'].innerHTML = manifestItems.map(([label, value]) => `
    <li>
      <span class="small-label">${escapeHtml(label)}</span>
      <span class="mini-value">${formatNumber(value)}</span>
    </li>
  `).join('');

  els['party-mini'].innerHTML = parties.map(party => `
    <li>
      <strong>${escapeHtml(party.party)}</strong>
      <span class="small-label">${formatNumber(party.actor_count)} actors · ${formatNumber(party.evidence_count)} evidence links</span>
    </li>
  `).join('');

  els['track-mini'].innerHTML = tracks.slice(0, 4).map(track => `
    <li>
      <strong>${escapeHtml(track.name)}</strong>
      <span class="small-label">${escapeHtml(track.priority)} · ${formatNumber(track.coverage)} coverage score</span>
    </li>
  `).join('');

  const lensOptions = ['<option value="all">All lenses</option>'].concat(
    lenses.map(lens => `<option value="${escapeHtml(lens.id)}">${escapeHtml(lens.title)}</option>`)
  );
  els['lens-select'].innerHTML = lensOptions.join('');
  els['lens-select'].value = state.lens;

  const profileOptions = ['<option value="all">All profiles</option>'].concat(
    profiles.map(profile => `<option value="${escapeHtml(profile.id)}">${escapeHtml(profile.name)}</option>`)
  );
  els['profile-select'].innerHTML = profileOptions.join('');
  els['profile-select'].value = state.profile;

  const lensThemes = activeLensThemes();
  const themeButtons = [{ name: 'all', label: 'All themes' }].concat(
    themes
      .filter(theme => !lensThemes || lensThemes.includes(theme.name))
      .slice(0, 18)
      .map(theme => ({ name: theme.name, label: theme.name }))
  );

  els['theme-filter-row'].innerHTML = themeButtons.map(theme => `
    <button class="theme-tag ${state.theme === theme.name ? 'active' : ''}" data-theme="${escapeHtml(theme.name)}" type="button">${escapeHtml(theme.label)}</button>
  `).join('');

  els['theme-filter-row'].querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.theme = button.dataset.theme;
      if (state.theme !== 'all') state.activeIssue = state.theme;
      state.evidencePage = 1;
      render();
    });
  });
}

function renderHero() {
  const { manifest, top_insights: topInsights } = state.data;
  const lens = currentLens();
  const profile = activeProfile();
  const filtered = filterEvidence();
  const contradictions = filteredContradictions();
  const lensThemeCounts = topEntries(filtered.flatMap(item => item.themes || []), 4);
  const leadDoc = topEntries(filtered.map(item => item.doc_id), 1)[0];
  const leadActor = topEntries(filtered.flatMap(item => item.actors || []), 1)[0];
  const hotContradiction = contradictions[0] || null;
  const effectiveLensThemes = lens?.themes || state.data.themes.slice(0, 4).map(item => item.name);
  const quickRoutes = [
    hotContradiction ? {
      kicker: 'Hot contradiction',
      title: hotContradiction.title,
      detail: `${titleCase(hotContradiction.severity)} severity · ${hotContradiction.date_range}`,
      action: 'inspect-contradiction',
      value: hotContradiction.id
    } : null,
    leadDoc ? {
      kicker: 'Dense source',
      title: documentById(leadDoc[0])?.label || leadDoc[0],
      detail: `${formatNumber(leadDoc[1])} records in the current slice`,
      action: 'inspect-document',
      value: leadDoc[0]
    } : null,
    leadActor ? {
      kicker: 'Lead actor',
      title: leadActor[0],
      detail: `${formatNumber(leadActor[1])} appearances in view`,
      action: 'search-actor',
      value: leadActor[0],
      tabTarget: 'evidence'
    } : null
  ].filter(Boolean);

  els['hero-summary'].textContent = `This case observatory tracks how the 2026 Iran war debate is argued, sourced, and challenged across legality, imminence, strategy, diplomacy, public opinion, and internal party fracture. Use the current lens, filters, and source file pivots to move from the case thesis into supporting evidence and contradiction records.`;
  els['active-lens-summary'].textContent = lens
    ? `${lens.title} narrows the case to ${lens.themes.length} recurring argument lines and ${formatNumber(filtered.length)} visible evidence records.`
    : `All ${formatNumber(manifest.theme_count)} themes remain visible across the full case bundle.`;
  els['active-focus-summary'].textContent = state.profile !== 'all' && profile
    ? `${profile.name} is the active archive filter, with contradictions and evidence narrowed to that figure.`
    : `${profile?.name || 'The current spotlight'} remains loaded as the working dossier, but the archive itself is still in baseline mode.`;
  els['lens-scope-summary'].textContent = lens
    ? `${lens.summary}`
    : 'Start broad, then apply a lens to compress the archive down to a specific argumentative frame.';

  els['lens-theme-row'].innerHTML = effectiveLensThemes.slice(0, 6).map(theme => {
    const count = lensThemeCounts.find(entry => entry[0] === theme)?.[1]
      || state.data.themes.find(item => item.name === theme)?.evidence_count
      || 0;
    return `<button class="tag action-tag" type="button" data-ui-action="set-theme" data-value="${escapeHtml(theme)}" data-tab-target="evidence">${escapeHtml(theme)} <strong>${formatNumber(count)}</strong></button>`;
  }).join('');

  els['quick-route-list'].innerHTML = quickRoutes.map(route => `
    <button class="quick-route-card" type="button" data-ui-action="${escapeHtml(route.action)}" data-value="${escapeHtml(route.value)}"${route.tabTarget ? ` data-tab-target="${escapeHtml(route.tabTarget)}"` : ''}>
      <span class="nav-section-title">${escapeHtml(route.kicker)}</span>
      <strong>${escapeHtml(route.title)}</strong>
      <p>${escapeHtml(route.detail)}</p>
    </button>
  `).join('');

  const insights = lens
    ? [{ title: `Lens focus: ${lens.title}`, detail: lens.summary }, ...topInsights]
    : topInsights;
  els['top-insights-list'].innerHTML = insights.slice(0, 5).map(item => `
    <li class="insight-item">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.detail)}</p>
    </li>
  `).join('');
}

function renderMetrics() {
  const filtered = filterEvidence();
  const contradictions = filteredContradictions();
  const uniqueDocs = new Set(filtered.map(item => item.doc_id)).size;
  const uniqueActors = new Set(filtered.flatMap(item => item.actors || [])).size;
  const quoteCount = filtered.filter(item => item.kind === 'quote').length;

  const metrics = [
    {
      label: 'Filtered evidence',
      value: filtered.length,
      tone: 'gold',
      caption: 'Active claim and excerpt set',
      spark: [18, 26, 33, 41, 49, 54, Math.max(24, filtered.length)]
    },
    {
      label: 'Contradiction hits',
      value: contradictions.length,
      tone: 'bronze',
      caption: 'Visible pressure points',
      spark: [1, 2, 3, 4, 5, 6, Math.max(2, contradictions.length)]
    },
    {
      label: 'Actors linked',
      value: uniqueActors,
      tone: 'steel',
      caption: 'Figures present in current slice',
      spark: [4, 8, 12, 16, 19, 22, Math.max(4, uniqueActors)]
    },
    {
      label: 'Documents in play',
      value: uniqueDocs,
      tone: 'success',
      caption: `${quoteCount} quotation samples live`,
      spark: [2, 3, 4, 5, 6, 7, Math.max(2, uniqueDocs)]
    }
  ];

  els['metrics-grid'].innerHTML = metrics.map((metric, index) => `
    <article class="card metric fade-in">
      <span class="metric-label">${escapeHtml(metric.label)}</span>
      <span class="metric-value" data-count="${metric.value}" id="metric-count-${index}">0</span>
      <span class="metric-delta ${metric.tone}">${escapeHtml(metric.caption)}</span>
      <svg class="sparkline" viewBox="0 0 100 38" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="spark-fill-${index}" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="${toneToStroke(metric.tone)}" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="${toneToStroke(metric.tone)}" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <polygon fill="url(#spark-fill-${index})" points="${sparkPolygon(metric.spark)}"></polygon>
        <polyline fill="none" stroke="${toneToStroke(metric.tone)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${sparkPoints(metric.spark)}"></polyline>
      </svg>
    </article>
  `).join('');

  metrics.forEach((metric, index) => animateCount(getById(`metric-count-${index}`), metric.value));
}

function toneToStroke(tone) {
  return {
    gold: metallicPalette.gold,
    steel: metallicPalette.steel,
    bronze: metallicPalette.bronze,
    success: metallicPalette.success
  }[tone] || metallicPalette.gold;
}

function sparkPoints(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * 100;
    const y = 34 - ((value - min) / range) * 28;
    return `${x},${y}`;
  }).join(' ');
}

function sparkPolygon(values) {
  const line = sparkPoints(values);
  return `0,36 ${line} 100,36`;
}

function animateCount(el, target) {
  if (!el) return;
  if (reducedMotion()) {
    el.textContent = formatNumber(target);
    el.dataset.current = String(target);
    return;
  }
  const duration = 700;
  const start = performance.now();
  const startValue = Number(el.dataset.current || 0);
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(startValue + (target - startValue) * eased);
    el.textContent = formatNumber(value);
    if (progress < 1) requestAnimationFrame(tick);
    else el.dataset.current = String(target);
  }
  requestAnimationFrame(tick);
}

function renderIssues() {
  const issues = issueRecords();
  const selectedIssue = (state.theme !== 'all' && issues.find(issue => issue.name === state.theme))
    || issues.find(issue => issue.name === state.activeIssue)
    || issues[0]
    || null;

  if (!selectedIssue) {
    els['issue-name'].textContent = 'No issues in scope';
    els['issue-count-label'].textContent = 'No issue records match the current filters.';
    els['issue-priority'].textContent = 'Waiting';
    els['issue-category'].textContent = 'Issue tracker';
    els['issue-policy-track'].textContent = 'Adjust filters';
    els['issue-summary'].textContent = 'Clear or broaden filters to restore the issue tracker.';
    els['issue-brief'].textContent = 'The current combination of lens, search, profile, and source filters leaves no issue-level evidence in view.';
    els['issue-action-row'].innerHTML = renderActionButton('Reset view', 'reset-filters', '', 'primary', 'issues');
    els['issue-stat-grid'].innerHTML = '';
    els['issue-lead-actors'].innerHTML = '';
    els['issue-source-chips'].innerHTML = '';
    els['issue-linked-contradictions'].innerHTML = '<div class="empty-state">No contradictions are available in the current issue scope.</div>';
    els['issue-evidence-samples'].innerHTML = '<div class="empty-state">No evidence samples are available in the current issue scope.</div>';
    els['issue-timeline-list'].innerHTML = '<li class="timeline-item"><div><span class="timeline-date">Scope empty</span><h3>No linked events</h3><p>Broaden the current filters to restore issue timeline coverage.</p></div></li>';
    els['issue-list'].innerHTML = '';
    renderHorizontalBarChart('issues-chart', [], [], []);
    return;
  }

  state.activeIssue = selectedIssue.name;
  const leadDoc = selectedIssue.docs[0]?.doc || null;
  const leadActor = selectedIssue.actors[0] || null;

  els['issue-name'].textContent = selectedIssue.name;
  els['issue-count-label'].textContent = `${issues.length} issues active in the current scope.`;
  els['issue-priority'].textContent = selectedIssue.priority;
  els['issue-category'].textContent = selectedIssue.descriptor.category;
  els['issue-policy-track'].textContent = selectedIssue.descriptor.policyTrack;
  els['issue-summary'].textContent = selectedIssue.descriptor.summary;
  els['issue-brief'].textContent = `This issue currently carries ${formatNumber(selectedIssue.evidenceCount)} evidence records across ${formatNumber(selectedIssue.docCount)} source files and ${formatNumber(selectedIssue.contradictionCount)} linked contradiction records. ${leadDoc ? `${leadDoc.label} is the heaviest source file in this track.` : 'No single source file dominates this issue yet.'}`;
  els['issue-action-row'].innerHTML = [
    renderActionButton('Focus evidence', 'set-theme', selectedIssue.name, 'primary', 'evidence'),
    renderActionButton('Open contradictions', 'set-theme', selectedIssue.name, 'secondary', 'contradictions'),
    leadDoc ? renderActionButton('Inspect lead source', 'inspect-document', leadDoc.id) : '',
    leadActor ? renderActionButton(`Search ${leadActor.name}`, 'search-actor', leadActor.name, 'secondary', 'evidence') : ''
  ].join('');

  const statCards = [
    {
      label: 'Evidence footprint',
      value: formatNumber(selectedIssue.evidenceCount),
      note: `${formatNumber(selectedIssue.docCount)} source files`
    },
    {
      label: 'Contradiction pressure',
      value: formatNumber(selectedIssue.contradictionCount),
      note: selectedIssue.contradictions[0]?.title || 'No visible contradiction record'
    },
    {
      label: 'Actors linked',
      value: formatNumber(selectedIssue.actorCount),
      note: leadActor ? `${leadActor.name} leads this issue track` : 'No dominant actor yet'
    },
    {
      label: 'Timeline overlap',
      value: formatNumber(selectedIssue.timeline.length),
      note: selectedIssue.timeline[0]?.title || 'No direct timeline event match'
    }
  ];
  els['issue-stat-grid'].innerHTML = statCards.map(card => `
    <div class="workspace-meta-card">
      <span class="small-label">${escapeHtml(card.label)}</span>
      <span class="metric-value">${escapeHtml(card.value)}</span>
      <p class="workspace-note">${escapeHtml(card.note)}</p>
    </div>
  `).join('');

  els['issue-lead-actors'].innerHTML = selectedIssue.actors.length
    ? selectedIssue.actors.map(actor => {
      const action = actor.profile ? 'spotlight-profile' : 'search-actor';
      const value = actor.profile ? actor.profile.id : actor.name;
      const tabTarget = actor.profile ? 'profiles' : 'evidence';
      return `<button class="tag action-tag" type="button" data-ui-action="${escapeHtml(action)}" data-value="${escapeHtml(value)}" data-tab-target="${escapeHtml(tabTarget)}">${escapeHtml(actor.name)} <strong>${formatNumber(actor.count)}</strong></button>`;
    }).join('')
    : '<span class="workspace-note">No lead actors surfaced for this issue.</span>';

  els['issue-source-chips'].innerHTML = selectedIssue.docs.length
    ? selectedIssue.docs.map(({ doc, count }) => `<button class="tag action-tag" type="button" data-ui-action="inspect-document" data-value="${escapeHtml(doc.id)}">${escapeHtml(doc.label)} <strong>${formatNumber(count)}</strong></button>`).join('')
    : '<span class="workspace-note">No source files surfaced for this issue.</span>';

  els['issue-linked-contradictions'].innerHTML = selectedIssue.contradictions.length
    ? selectedIssue.contradictions.slice(0, 4).map(item => `
      <article class="drawer-related-card">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.summary)}</p>
        <div class="detail-tag-row">
          <span class="data-badge">${escapeHtml(titleCase(item.severity))}</span>
          <span class="data-badge">${escapeHtml(item.date_range)}</span>
        </div>
        ${renderInlineAction('Inspect contradiction', 'inspect-contradiction', item.id)}
      </article>
    `).join('')
    : '<div class="empty-state">No contradiction records match this issue in the current scope.</div>';

  els['issue-evidence-samples'].innerHTML = selectedIssue.samples.length
    ? selectedIssue.samples.map(record => `
      <article class="drawer-related-card">
        <strong>${escapeHtml(record.title)}</strong>
        <p>${escapeHtml(truncateText(record.text, 190))}</p>
        <div class="detail-tag-row">
          <span class="data-badge">${escapeHtml(record.doc_title)}</span>
          <span class="data-badge">${escapeHtml(titleCase(record.kind))}</span>
        </div>
        ${renderInlineAction('Inspect evidence', 'inspect-evidence', record.id)}
      </article>
    `).join('')
    : '<div class="empty-state">No representative evidence records match this issue in the current scope.</div>';

  els['issue-timeline-list'].innerHTML = selectedIssue.timeline.length
    ? selectedIssue.timeline.map(item => `
      <li class="timeline-item">
        <div>
          <span class="timeline-date">${escapeHtml(item.date)}</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.detail)}</p>
          <div class="focus-row">${(item.focus || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </li>
    `).join('')
    : '<li class="timeline-item"><div><span class="timeline-date">No direct event</span><h3>No explicit timeline overlap</h3><p>This issue currently has no direct timeline focus match in the archive metadata.</p></div></li>';

  const issueChartItems = issues.slice(0, 8);
  renderHorizontalBarChart(
    'issues-chart',
    issueChartItems.map(issue => issue.name),
    issueChartItems.map(issue => issue.evidenceCount),
    issueChartItems.map((_, index) => [
      metallicPalette.gold,
      metallicPalette.bronze,
      metallicPalette.steel,
      metallicPalette.copper,
      metallicPalette.silver
    ][index % 5])
  );

  els['issue-list'].innerHTML = issues.map(issue => `
    <li class="issue-item ${issue.name === selectedIssue.name ? 'active' : ''}">
      <button class="issue-item-button" type="button" data-ui-action="set-issue" data-value="${escapeHtml(issue.name)}" data-tab-target="issues">
        <div class="profile-item-head">
          <div>
            <h3>${escapeHtml(issue.name)}</h3>
            <p class="profile-role-line">${escapeHtml(issue.descriptor.category)} · ${escapeHtml(issue.descriptor.policyTrack)}</p>
          </div>
          <span class="data-badge">${escapeHtml(issue.priority)}</span>
        </div>
        <p>${escapeHtml(issue.descriptor.summary)}</p>
        <div class="profile-meta">
          <span class="data-badge"><strong>${formatNumber(issue.evidenceCount)}</strong> evidence</span>
          <span class="data-badge"><strong>${formatNumber(issue.contradictionCount)}</strong> flags</span>
          <span class="data-badge"><strong>${formatNumber(issue.docCount)}</strong> sources</span>
        </div>
      </button>
    </li>
  `).join('');
}

function renderTimeline() {
  const items = state.data.timeline;
  els['timeline-list'].innerHTML = items.map(item => `
    <li class="timeline-item">
      <div>
        <span class="timeline-date">${escapeHtml(item.date)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.detail)}</p>
        <div class="focus-row">${(item.focus || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </li>
  `).join('');
}

function renderThemes() {
  const lensThemes = activeLensThemes();
  const themes = state.data.themes
    .filter(theme => !lensThemes || lensThemes.includes(theme.name))
    .slice(0, 16);

  els['theme-cloud'].innerHTML = themes.map(theme => `
    <button class="theme-tag ${state.theme === theme.name ? 'active' : ''}" data-cloud-theme="${escapeHtml(theme.name)}" type="button">${escapeHtml(theme.name)} <strong>${theme.evidence_count}</strong></button>
  `).join('');

  els['theme-cloud'].querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.theme = button.dataset.cloudTheme;
      if (state.theme !== 'all') state.activeIssue = state.theme;
      state.evidencePage = 1;
      render();
    });
  });

  const labels = themes.slice(0, 8).map(theme => theme.name);
  const values = themes.slice(0, 8).map(theme => theme.evidence_count);
  renderHorizontalBarChart('themes-chart', labels, values, [
    metallicPalette.gold,
    metallicPalette.bronze,
    metallicPalette.steel,
    metallicPalette.gunmetal,
    metallicPalette.copper,
    '#a7967c',
    '#d4c5a3',
    '#92755f'
  ]);
}

function renderProfiles() {
  const profiles = state.data.profiles;
  const profile = activeProfile();
  if (!profile) return;

  const profileEvidence = state.data.evidence.filter(item =>
    ((item.actors || []).includes(profile.name)) || item.text.toLowerCase().includes(profile.name.toLowerCase())
  );
  const profileDocs = new Set(profileEvidence.map(item => item.doc_title).filter(Boolean));
  const profileThemes = Array.from(new Set(profileEvidence.flatMap(item => item.themes || [])));
  const latestPhase = (profile.phases || []).slice(-1)[0] || null;
  const quoteEvidence = profileEvidence.filter(item => item.kind === 'quote');
  const keyQuote = quoteEvidence[0] || profileEvidence[0] || null;
  const representativeCards = [];
  if (latestPhase) {
    representativeCards.push({
      kicker: 'Latest posture',
      title: latestPhase.label,
      summary: latestPhase.detail,
      meta: [latestPhase.date, latestPhase.stance],
      action: 'Open trajectory'
    });
  }
  if (keyQuote) {
    representativeCards.push({
      kicker: keyQuote.kind === 'quote' ? 'Representative quote' : 'Representative evidence',
      title: keyQuote.title,
      summary: keyQuote.text,
      meta: [keyQuote.doc_title, ...(keyQuote.themes || []).slice(0, 2)],
      action: 'Open evidence'
    });
  }
  if ((profile.linked_contradictions || []).length) {
    const contradiction = state.data.contradictions.find(item => item.id === profile.linked_contradictions[0]);
    if (contradiction) {
      representativeCards.push({
        kicker: 'Main pressure point',
        title: contradiction.title,
        summary: contradiction.summary,
        meta: [contradiction.type, contradiction.date_range],
        action: 'Open contradiction'
      });
    }
  }

  els['profile-name'].textContent = profile.name;
  els['profile-avatar'].textContent = profile.name.charAt(0).toUpperCase();
  els['profile-party'].textContent = profile.party;
  els['profile-bloc'].textContent = profile.bloc;
  els['profile-role'].textContent = profile.role;
  els['profile-evidence'].innerHTML = `<strong>${formatNumber(profile.evidence_count)}</strong> evidence links`;
  els['profile-summary'].textContent = profile.summary;
  els['profile-positioning'].textContent = profile.positioning;
  els['profile-signals'].innerHTML = (profile.signals || []).map(signal => `<span class="tag">${escapeHtml(signal)}</span>`).join('');
  els['profile-watchpoints'].innerHTML = (profile.watchpoints || []).map(item => `<li>${escapeHtml(item)}</li>`).join('');

  els['profile-dossier-grid'].innerHTML = [
    { label: 'Archive footprint', value: `${formatNumber(profileEvidence.length)} linked records`, detail: `${formatNumber(profileDocs.size)} source files` },
    { label: 'Theme reach', value: `${formatNumber(profileThemes.length)} active themes`, detail: (profile.dominant_themes || []).slice(0, 2).join(' · ') || 'No dominant themes yet' },
    { label: 'Current posture', value: latestPhase?.stance || 'Monitoring', detail: latestPhase?.date || 'No phase log yet' },
    { label: 'Watch intensity', value: `${formatNumber((profile.watchpoints || []).length)} watchpoints`, detail: `${formatNumber((profile.linked_contradictions || []).length)} contradiction links` }
  ].map(item => `
    <article class="profile-dossier-card panel-surface">
      <span class="nav-section-title">${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(item.value)}</strong>
      <p>${escapeHtml(item.detail)}</p>
    </article>
  `).join('');

  els['profile-representative-grid'].innerHTML = representativeCards.length ? representativeCards.map((card, index) => `
    <article class="profile-representative-card" data-representative-index="${index}" role="button" tabindex="0">
      <span class="nav-section-title">${escapeHtml(card.kicker)}</span>
      <h3>${escapeHtml(card.title)}</h3>
      <p>${escapeHtml(card.summary)}</p>
      <div class="profile-meta">${card.meta.map(item => `<span class="data-badge">${escapeHtml(item)}</span>`).join('')}</div>
      <span class="representative-action">${escapeHtml(card.action)}</span>
    </article>
  `).join('') : `<article class="profile-representative-card"><span class="nav-section-title">Representative cards</span><h3>Profile detail pending</h3><p>No representative card has been derived for this figure yet.</p></article>`;

  // Radar chart
  renderProfileRadar(profile);

  els['profile-phases'].innerHTML = (profile.phases || []).map(phase => `
    <li class="timeline-item">
      <div>
        <span class="timeline-date">${escapeHtml(phase.date)}</span>
        <h3>${escapeHtml(phase.label)}</h3>
        <p>${escapeHtml(phase.detail)}</p>
        <div class="focus-row"><span class="tag">${escapeHtml(phase.stance)}</span></div>
      </div>
    </li>
  `).join('');

  const linked = state.data.contradictions.filter(item => (profile.linked_contradictions || []).includes(item.id));
  els['profile-linked-contradictions'].innerHTML = linked.map(item => `
    <article class="linked-card severity-${escapeHtml(item.severity)}">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.summary)}</p>
      <div class="meta-row">
        <span class="data-badge">${escapeHtml(item.type)}</span>
        <span class="data-badge">${escapeHtml(item.date_range)}</span>
      </div>
    </article>
  `).join('');

  const directory = actorDirectory();
  const categoryCounts = directory.reduce((acc, item) => {
    const key = item.category || 'politicians';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  if (els['actor-category-select']) {
    const categoryOptions = [
      { id: 'all', label: `All categories (${formatNumber(directory.length)})` },
      { id: 'politicians', label: `Politicians (${formatNumber(categoryCounts.politicians || 0)})` },
      { id: 'news_networks', label: `News networks (${formatNumber(categoryCounts.news_networks || 0)})` },
      { id: 'reporters', label: `Reporters (${formatNumber(categoryCounts.reporters || 0)})` },
    ];
    els['actor-category-select'].innerHTML = categoryOptions
      .map(option => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`)
      .join('');
    els['actor-category-select'].value = state.actorCategory;
    els['actor-category-select'].onchange = event => {
      state.actorCategory = event.target.value;
      renderProfiles();
    };
  }

  const visibleActors = filteredActorDirectory();
  els['profile-list'].innerHTML = visibleActors.length
    ? visibleActors.map(item => {
      const linkedProfile = item.profile_id ? profileById(item.profile_id) : profileByName(item.name);
      const isActive = linkedProfile?.id === profile.id;
      const categoryLabel = titleCase((item.category || 'politicians').replace('_', ' '));
      const affiliation = item.affiliation || linkedProfile?.party || 'Unspecified';
      const roleLine = linkedProfile
        ? `${linkedProfile.role || 'Political actor'} · ${affiliation}`
        : `${categoryLabel} · ${affiliation}`;
      const summary = item.summary || linkedProfile?.summary || 'No summary available.';
      return `
      <li class="profile-item ${isActive ? 'active' : ''}">
        <button class="profile-item-button" data-directory-name="${escapeHtml(item.name)}" data-profile-id="${escapeHtml(linkedProfile?.id || '')}" type="button">
          <div class="profile-item-head">
            <span class="profile-avatar profile-avatar-small">${escapeHtml(item.name.charAt(0).toUpperCase())}</span>
            <div>
              <h3>${escapeHtml(item.name)}</h3>
              <p class="profile-role-line">${escapeHtml(roleLine)}</p>
            </div>
          </div>
          <p>${escapeHtml(summary)}</p>
          <div class="profile-meta">
            <span class="data-badge">${escapeHtml(categoryLabel)}</span>
            <span class="data-badge"><strong>${formatNumber(item.evidence_count || 0)}</strong> records</span>
            ${(item.themes || []).length ? `<span class="data-badge">${escapeHtml(item.themes[0])}</span>` : ''}
          </div>
        </button>
      </li>
    `;
    }).join('')
    : '<li class="empty-state">No actors found in this category.</li>';

  els['profile-list'].querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const profileId = button.dataset.profileId;
      if (profileId) {
        state.activeProfileId = profileId;
        renderProfiles();
        return;
      }
      const name = button.dataset.directoryName || 'Actor';
      openDetailDrawer({
        kicker: 'Actor directory',
        title: name,
        meta: [titleCase(state.actorCategory.replace('_', ' '))],
        body: `<p>This actor is part of the curated actor directory. No profile dossier exists yet, but you can pivot into evidence search.</p>`,
        actions: renderActionButton(`Search ${name}`, 'search-actor', name, 'primary', 'evidence'),
      });
    });
  });

  els['profile-representative-grid'].querySelectorAll('.profile-representative-card').forEach((cardEl, index) => {
    const runCardAction = () => {
      const card = representativeCards[index];
      if (!card) return;
      openDetailDrawer({
        kicker: card.kicker,
        title: card.title,
        meta: card.meta,
        body: `<p>${escapeHtml(card.summary)}</p><div class="detail-section"><span class="nav-section-title">Profile</span><div class="detail-tag-row"><span class="tag">${escapeHtml(profile.name)}</span><span class="tag">${escapeHtml(profile.positioning)}</span></div></div>`,
        actions: '<button class="pill-button secondary" type="button" data-drawer-action="close">Close</button>'
      });
      document.querySelector('[data-drawer-action="close"]')?.addEventListener('click', closeDetailDrawer);
    };
    cardEl.addEventListener('click', runCardAction);
    cardEl.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        runCardAction();
      }
    });
  });
}

function renderProfileRadar(profile) {
  const themeNames = (profile.dominant_themes || []).slice(0, 6);
  if (themeNames.length < 3) return;

  // Calculate evidence counts per theme for this profile
  const evidence = state.data.evidence;
  const counts = themeNames.map(theme => {
    return evidence.filter(item =>
      (item.themes || []).includes(theme) &&
      ((item.actors || []).includes(profile.name) ||
       item.text.toLowerCase().includes(profile.name.toLowerCase()))
    ).length;
  });

  const canvas = getById('profile-radar-chart');
  if (!canvas) return;
  if (charts['profile-radar']) charts['profile-radar'].destroy();

  charts['profile-radar'] = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: themeNames,
      datasets: [{
        data: counts,
        backgroundColor: 'rgba(216, 180, 111, 0.12)',
        borderColor: metallicPalette.gold,
        borderWidth: 2,
        pointBackgroundColor: metallicPalette.gold,
        pointBorderColor: metallicPalette.gold,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion() ? false : { duration: 600, easing: 'easeOutCubic' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(12, 13, 16, 0.96)',
          borderColor: 'rgba(216, 180, 111, 0.24)',
          borderWidth: 1,
          titleColor: metallicPalette.ink,
          bodyColor: metallicPalette.ink,
          displayColors: false,
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            color: metallicPalette.silver,
            backdropColor: 'transparent',
            font: { family: 'Inter', size: 10 },
          },
          grid: { color: 'rgba(194, 202, 208, 0.1)' },
          angleLines: { color: 'rgba(194, 202, 208, 0.08)' },
          pointLabels: {
            color: metallicPalette.silver,
            font: { family: 'Inter', size: 11 },
          },
        },
      },
    },
  });
}

function renderActors() {
  const filtered = filterEvidence();
  const counts = new Map();
  filtered.forEach(item => {
    (item.actors || []).forEach(actor => counts.set(actor, (counts.get(actor) || 0) + 1));
  });
  const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const labels = ranked.map(item => item[0]);
  const values = ranked.map(item => item[1]);
  renderHorizontalBarChart('actors-chart', labels, values, labels.map((_, index) => [
    metallicPalette.gold,
    metallicPalette.bronze,
    metallicPalette.steel,
    metallicPalette.copper,
    metallicPalette.silver
  ][index % 5]));

  els['actor-cloud'].innerHTML = ranked.map(([actor, count]) => `
    <button class="actor-chip" data-actor="${escapeHtml(actor)}" type="button">${escapeHtml(actor)} <strong>${count}</strong></button>
  `).join('');

  els['actor-cloud'].querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const actor = button.dataset.actor || '';
      focusActorSearch(actor);
      render();
      setActiveTab('evidence', true);
    });
  });
}

function renderMatrix() {
  const lensThemes = activeLensThemes();
  const themeNames = state.data.themes
    .map(theme => theme.name)
    .filter(name => !lensThemes || lensThemes.includes(name))
    .slice(0, 8);

  const filtered = filterEvidence();
  const actorCounts = new Map();
  filtered.forEach(item => {
    (item.actors || []).forEach(actor => actorCounts.set(actor, (actorCounts.get(actor) || 0) + 1));
  });
  const topActors = Array.from(actorCounts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(item => item[0]);

  const header = `
    <thead>
      <tr>
        <th>Actor</th>
        ${themeNames.map((theme, ci) => `<th data-col="${ci}">${escapeHtml(theme)}</th>`).join('')}
      </tr>
    </thead>
  `;

  const rows = topActors.map(actor => {
    const rowCells = themeNames.map((theme, ci) => {
      const count = filtered.filter(item => (item.actors || []).includes(actor) && (item.themes || []).includes(theme)).length;
      return `<td data-col="${ci}" title="${escapeHtml(actor)} × ${escapeHtml(theme)}: ${count}"><span class="matrix-value ${count >= 6 ? 'matrix-high' : count >= 3 ? 'matrix-mid' : 'matrix-low'}">${count}</span></td>`;
    }).join('');
    return `<tr><td><strong>${escapeHtml(actor)}</strong></td>${rowCells}</tr>`;
  }).join('');

  els['matrix-table'].innerHTML = `${header}<tbody>${rows}</tbody>`;

  // Crosshair hover effect
  const table = els['matrix-table'];
  table.addEventListener('mouseover', event => {
    const td = event.target.closest('td[data-col]');
    if (!td) return;
    const col = td.dataset.col;
    table.querySelectorAll('td.col-highlight').forEach(c => c.classList.remove('col-highlight'));
    table.querySelectorAll(`td[data-col="${col}"], th[data-col="${col}"]`).forEach(c => c.classList.add('col-highlight'));
  });
  table.addEventListener('mouseleave', () => {
    table.querySelectorAll('.col-highlight').forEach(c => c.classList.remove('col-highlight'));
  });
}

function renderContradictions() {
  const contradictions = filteredContradictions()
    .sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2);
    });
  els['contradiction-count-label'].textContent = `${contradictions.length} contradiction records in the current view.`;
  els['contradiction-list'].innerHTML = contradictions.map(item => {
    const expanded = state.contradictionExpanded.has(item.id);
    return `
    <li class="contradiction-item severity-${escapeHtml(item.severity)}">
      <h3><span class="severity-icon ${escapeHtml(item.severity)}"></span>${escapeHtml(item.title)}</h3>
      <div class="tension-connector">
        <span>${escapeHtml(item.actor)}</span>
        <span class="tension-arrow">⇄</span>
        <span>${escapeHtml(item.counterparty)}</span>
      </div>
      <div class="item-actions">
        ${renderInlineAction('Inspect record', 'inspect-contradiction', item.id)}
        ${renderInlineAction(`Search ${item.actor}`, 'search-actor', item.actor, 'evidence')}
      </div>
      <div class="contradiction-body ${expanded ? '' : 'collapsed'}" style="${expanded ? '' : 'max-height:0;'}">
        <p style="margin-top:0.65rem;">${escapeHtml(item.summary)}</p>
        <div class="contradiction-meta">
          <span class="data-badge">${escapeHtml(item.type)}</span>
          <span class="data-badge">${escapeHtml(item.date_range)}</span>
        </div>
        <div class="related-docs">${(item.themes || []).map(theme => `<button class="tag action-tag" type="button" data-ui-action="set-theme" data-value="${escapeHtml(theme)}" data-tab-target="contradictions">${escapeHtml(theme)}</button>`).join('')}</div>
        <p style="margin-top: 0.85rem;">${escapeHtml(item.tension)}</p>
        <div class="related-docs">${(item.related_documents || []).map(doc => {
          const linkedDoc = documentByLabel(doc);
          return linkedDoc
            ? `<button class="data-badge badge-button" type="button" data-ui-action="inspect-document" data-value="${escapeHtml(linkedDoc.id)}">${escapeHtml(doc)}</button>`
            : `<span class="data-badge">${escapeHtml(doc)}</span>`;
        }).join('')}</div>
      </div>
      <button class="contradiction-toggle" data-cid="${escapeHtml(item.id)}" type="button">${expanded ? '▾ Collapse' : '▸ Expand details'}</button>
    </li>
  `;
  }).join('');

  els['contradiction-list'].querySelectorAll('.contradiction-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const cid = btn.dataset.cid;
      const body = btn.previousElementSibling;
      if (state.contradictionExpanded.has(cid)) {
        state.contradictionExpanded.delete(cid);
        body.classList.add('collapsed');
        body.style.maxHeight = '0';
        btn.textContent = '▸ Expand details';
      } else {
        state.contradictionExpanded.add(cid);
        body.classList.remove('collapsed');
        body.style.maxHeight = body.scrollHeight + 'px';
        btn.textContent = '▾ Collapse';
      }
    });
  });

  els['contradiction-empty'].hidden = contradictions.length > 0;
}

function renderPartyScaling() {
  const parties = state.data.parties;

  // Doughnut chart for party distribution
  const canvas = getById('party-chart');
  if (!canvas) return;
  if (charts['party-chart']) charts['party-chart'].destroy();

  charts['party-chart'] = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: parties.map(p => p.party),
      datasets: [{
        data: parties.map(p => p.evidence_count),
        backgroundColor: [
          metallicPalette.gold,
          metallicPalette.steel,
          metallicPalette.bronze,
          metallicPalette.gunmetal,
          metallicPalette.copper,
        ],
        borderColor: 'rgba(11, 12, 15, 0.8)',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '55%',
      animation: reducedMotion() ? false : { duration: 700, easing: 'easeOutCubic' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: metallicPalette.silver,
            font: { family: 'Inter', size: 11 },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          }
        },
        tooltip: {
          backgroundColor: 'rgba(12, 13, 16, 0.96)',
          borderColor: 'rgba(216, 180, 111, 0.24)',
          borderWidth: 1,
          titleColor: metallicPalette.ink,
          bodyColor: metallicPalette.ink,
          displayColors: true,
        },
      },
    },
  });

  els['track-list'].innerHTML = state.data.expansion_tracks.map(track => `
    <article class="track-item">
      <div class="track-topline">
        <h3>${escapeHtml(track.name)}</h3>
        <span class="data-badge">${escapeHtml(track.priority)}</span>
      </div>
      <p>${escapeHtml(track.description)}</p>
      <div class="coverage-bar" aria-hidden="true"><div class="coverage-fill" style="width:${Math.min(track.coverage, 100)}%"></div></div>
      <div class="related-docs"><span class="data-badge"><strong>${formatNumber(track.coverage)}</strong> coverage score</span></div>
    </article>
  `).join('');
}

function renderEvidence() {
  const filtered = filterEvidence();
  const docs = state.data.documents;
  const activeDoc = state.doc === 'all' ? null : documentById(state.doc);
  const activeProfileRecord = state.profile === 'all' ? null : profileById(state.profile);
  const docCounts = new Map();
  filtered.forEach(item => docCounts.set(item.doc_id, (docCounts.get(item.doc_id) || 0) + 1));
  const docButtons = [{ id: 'all', label: 'All documents', count: filtered.length }].concat(
    docs
      .filter(doc => docCounts.has(doc.id))
      .map(doc => ({ id: doc.id, label: doc.label, count: docCounts.get(doc.id) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 9)
  );

  els['doc-chip-row'].innerHTML = docButtons.map(doc => `
    <button class="doc-chip ${state.doc === doc.id ? 'active' : ''}" data-doc="${escapeHtml(doc.id)}" type="button">${escapeHtml(doc.label)} <strong>${doc.count}</strong></button>
  `).join('');
  els['doc-chip-row'].querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      state.doc = button.dataset.doc;
      state.evidencePage = 1;
      render();
    });
  });

  // Pagination
  const total = filtered.length;
  const perPage = state.evidencePerPage;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (state.evidencePage > totalPages) state.evidencePage = totalPages;
  const startIdx = (state.evidencePage - 1) * perPage;
  const visible = filtered.slice(startIdx, startIdx + perPage);
  const rangeStart = total ? startIdx + 1 : 0;
  const rangeEnd = total ? Math.min(startIdx + perPage, total) : 0;

  const scopeBits = [
    activeDoc ? `source focus: ${activeDoc.label}` : null,
    activeProfileRecord ? `profile focus: ${activeProfileRecord.name}` : null,
    currentLens() ? `lens: ${currentLens().title}` : null
  ].filter(Boolean);
  els['evidence-count-label'].textContent = `Showing ${rangeStart}–${rangeEnd} of ${total} evidence items${scopeBits.length ? ` · ${scopeBits.join(' · ')}` : ''}.`;

  const kindIcons = { quote: 'Q', claim: 'C', excerpt: 'E', section: 'S' };

  els['evidence-list'].innerHTML = visible.map(item => `
    <li class="evidence-item" data-evidence-id="${escapeHtml(item.id)}">
      <h3><span class="evidence-kind-icon ${escapeHtml(item.kind)}">${kindIcons[item.kind] || 'E'}</span> ${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(truncateText(item.text))}</p>
      <div class="evidence-meta">
        <span class="data-badge"><strong>${escapeHtml(titleCase(item.kind))}</strong></span>
        <button class="data-badge badge-button" type="button" data-doc-filter="${escapeHtml(item.doc_id)}">${escapeHtml(item.doc_title)}</button>
        ${(item.actors || []).slice(0, 3).map(actor => `<button class="data-badge badge-button" type="button" data-actor-filter="${escapeHtml(actor)}">${escapeHtml(actor)}</button>`).join('')}
        ${(item.themes || []).slice(0, 3).map(theme => `<button class="data-badge badge-button" type="button" data-theme-filter="${escapeHtml(theme)}">${escapeHtml(theme)}</button>`).join('')}
      </div>
    </li>
  `).join('');

  els['evidence-list'].querySelectorAll('[data-actor-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const actor = button.dataset.actorFilter || '';
      focusActorSearch(actor);
      render();
    });
  });

  els['evidence-list'].querySelectorAll('[data-theme-filter]').forEach(button => {
    button.addEventListener('click', () => {
      state.theme = button.dataset.themeFilter || 'all';
      if (state.theme !== 'all') state.activeIssue = state.theme;
      render();
    });
  });

  els['evidence-list'].querySelectorAll('[data-doc-filter]').forEach(button => {
    button.addEventListener('click', () => {
      state.doc = button.dataset.docFilter || 'all';
      state.evidencePage = 1;
      render();
    });
  });

  els['evidence-list'].querySelectorAll('.evidence-item').forEach(itemEl => {
    itemEl.addEventListener('click', event => {
      if (event.target.closest('.badge-button')) return;
      const evidenceId = itemEl.dataset.evidenceId;
      const record = filtered.find(item => item.id === evidenceId);
      if (!record) return;
      openEvidenceRecord(record);
    });
  });

  // Pagination controls
  if (totalPages > 1) {
    els['evidence-pagination'].innerHTML = `
      <div class="pagination-controls">
        <button type="button" id="page-prev" ${state.evidencePage <= 1 ? 'disabled' : ''}>← Previous</button>
        <span class="pagination-info">Page ${state.evidencePage} of ${totalPages}</span>
        <button type="button" id="page-next" ${state.evidencePage >= totalPages ? 'disabled' : ''}>Next →</button>
      </div>
    `;
    getById('page-prev')?.addEventListener('click', () => {
      if (state.evidencePage > 1) { state.evidencePage--; renderEvidence(); }
    });
    getById('page-next')?.addEventListener('click', () => {
      if (state.evidencePage < totalPages) { state.evidencePage++; renderEvidence(); }
    });
  } else {
    els['evidence-pagination'].innerHTML = '';
  }

  els['evidence-empty'].hidden = visible.length > 0;

  const quotes = filtered.filter(item => item.kind === 'quote').slice(0, 10);
  els['quote-list'].innerHTML = quotes.map(item => `
    <li class="quote-item">
      <p class="quote-text">\u201C${escapeHtml(item.text)}\u201D</p>
      <div class="quote-meta">
        <span class="data-badge">${escapeHtml(item.doc_title)}</span>
        ${(item.actors || []).slice(0, 2).map(actor => `<span class="data-badge">${escapeHtml(actor)}</span>`).join('')}
      </div>
    </li>
  `).join('');
  els['quote-empty'].hidden = quotes.length > 0;
}

function renderDocuments() {
  const docs = [...state.data.documents];
  const maxWords = Math.max(...docs.map(d => d.word_count || 0));
  const contradictionCounts = new Map(state.data.documents.map(doc => [doc.id, relatedContradictionsForDocument(doc).length]));
  const evidenceCounts = new Map(state.data.documents.map(doc => [doc.id, state.data.evidence.filter(item => item.doc_id === doc.id).length]));

  // Sort
  if (state.docSortCol !== null) {
    const col = state.docSortCol;
    const asc = state.docSortAsc;
    docs.sort((a, b) => {
      let va, vb;
      if (col === 'label') { va = a.label; vb = b.label; }
      else if (col === 'type') { va = a.type; vb = b.type; }
      else if (col === 'scope') { va = a.scope; vb = b.scope; }
      else if (col === 'word_count') { va = a.word_count; vb = b.word_count; }
      else if (col === 'evidence_count') { va = evidenceCounts.get(a.id) || 0; vb = evidenceCounts.get(b.id) || 0; }
      else if (col === 'contradiction_count') { va = contradictionCounts.get(a.id) || 0; vb = contradictionCounts.get(b.id) || 0; }
      else { va = ''; vb = ''; }
      if (typeof va === 'number') return asc ? va - vb : vb - va;
      return asc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }

  const sortIcon = (col) => {
    if (state.docSortCol === col) {
      return `<span class="sort-icon active">${state.docSortAsc ? '▲' : '▼'}</span>`;
    }
    return '<span class="sort-icon">⇅</span>';
  };

  const header = `
    <thead>
      <tr>
        <th class="sortable" data-sort="label">Document ${sortIcon('label')}</th>
        <th class="sortable" data-sort="type">Type ${sortIcon('type')}</th>
        <th class="sortable" data-sort="scope">Scope ${sortIcon('scope')}</th>
        <th class="sortable" data-sort="word_count">Word count ${sortIcon('word_count')}</th>
        <th class="sortable" data-sort="evidence_count">Evidence ${sortIcon('evidence_count')}</th>
        <th class="sortable" data-sort="contradiction_count">Flags ${sortIcon('contradiction_count')}</th>
        <th>Core themes</th>
      </tr>
    </thead>
  `;
  const rows = docs.map(doc => {
    const pct = maxWords > 0 ? Math.round((doc.word_count / maxWords) * 100) : 0;
    const evidenceCount = evidenceCounts.get(doc.id) || 0;
    const contradictionCount = contradictionCounts.get(doc.id) || 0;
    return `
    <tr class="${state.doc === doc.id ? 'is-active' : ''}">
      <td>
        <strong>${escapeHtml(doc.label)}</strong><br>
        <span class="small-label">${escapeHtml(doc.title)}</span>
      </td>
      <td>${escapeHtml(doc.type)}</td>
      <td>${escapeHtml(doc.scope)}</td>
      <td>
        <div class="word-bar-wrap">
          <span class="word-bar" style="width:${pct}px;max-width:80px;"></span>
          <span>${formatNumber(doc.word_count)}</span>
        </div>
      </td>
      <td><span class="data-badge"><strong>${formatNumber(evidenceCount)}</strong> records</span></td>
      <td><span class="data-badge"><strong>${formatNumber(contradictionCount)}</strong> links</span></td>
      <td>${(doc.themes || []).map(theme => `<span class="data-badge">${escapeHtml(theme)}</span>`).join('')}</td>
    </tr>
  `;
  }).join('');
  els['docs-table'].innerHTML = `${header}<tbody>${rows}</tbody>`;

  // Sortable columns
  els['docs-table'].querySelectorAll('th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      if (state.docSortCol === col) {
        state.docSortAsc = !state.docSortAsc;
      } else {
        state.docSortCol = col;
        state.docSortAsc = true;
      }
      renderDocuments();
    });
  });

  els['docs-table'].querySelectorAll('tbody tr').forEach((row, index) => {
    row.addEventListener('click', () => {
      const doc = docs[index];
      if (!doc) return;
      openDocumentRecord(doc);
    });
  });

  els['actor-list'].innerHTML = state.data.actors.slice(0, 10).map(actor => {
    const linkedProfile = profileByName(actor.name);
    return `
    <li class="actor-item">
      <h3>${escapeHtml(actor.name)}</h3>
      <p>${escapeHtml(truncateText(actor.sample_excerpt, 180))}</p>
      <div class="actor-meta">
        <span class="data-badge"><strong>${actor.evidence_count}</strong> evidence hits</span>
        ${(actor.dominant_themes || []).map(theme => `<span class="data-badge">${escapeHtml(theme)}</span>`).join('')}
      </div>
      <div class="item-actions">
        ${linkedProfile
          ? renderInlineAction('Open profile', 'spotlight-profile', linkedProfile.id, 'profiles')
          : renderInlineAction('Search actor', 'search-actor', actor.name, 'evidence')}
      </div>
    </li>
  `;
  }).join('');
}

function renderScaling() {
  const rawSystemModel = state.data.system_model;
  const systemModelItems = Array.isArray(rawSystemModel)
    ? rawSystemModel
    : Object.entries(rawSystemModel || {}).map(([entity, purpose]) => ({
      entity,
      purpose: typeof purpose === 'string' ? purpose : JSON.stringify(purpose),
    }));

  els['system-grid'].innerHTML = systemModelItems.map(item => `
    <article class="entity-item system-card">
      <h3>${escapeHtml(item.entity)}</h3>
      <p>${escapeHtml(item.purpose)}</p>
    </article>
  `).join('');

  els['model-block'].textContent = [
    'political_observatory/',
    '  figures.csv                # unique public figures and roles',
    '  parties.csv                # party, bloc, caucus, and coalition lanes',
    '  profiles.json              # curated actor summaries and stance phases',
    '  statements.csv             # dated remarks with venue and medium',
    '  claims.csv                 # normalized claim taxonomy',
    '  premises.csv               # logic chain per claim',
    '  evidence.csv               # cited facts, polls, briefings, tables',
    '  omissions.csv              # absent or minimized context',
    '  contradictions.csv         # cross-time or cross-actor inconsistencies',
    '  issues.csv                 # policy domains and geopolitical threads',
    '  timeline_events.csv        # external events tied to rhetoric shifts',
    '  source_docs/               # archived reports, transcripts, and notes',
    '  dashboards/                # issue and figure-specific analytical views',
    '',
    'Key joins:',
    'figure -> statement -> claim -> premise -> evidence',
    'figure -> profile -> contradiction -> issue timeline',
    'party -> bloc -> figure -> cross-party comparison',
  ].join('\n');
}

/* ---------- CHART HELPERS ---------- */

function renderHorizontalBarChart(canvasId, labels, data, colors) {
  const canvas = getById(canvasId);
  if (!canvas) return;
  if (charts[canvasId]) charts[canvasId].destroy();

  // Create gradient colors
  const ctx = canvas.getContext('2d');

  charts[canvasId] = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.map((color, i) => {
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, color + '66');
          return gradient;
        }),
        borderRadius: 8,
        maxBarThickness: 24,
      }],
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      animation: reducedMotion() ? false : { duration: 700, easing: 'easeOutCubic' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(12, 13, 16, 0.96)',
          borderColor: 'rgba(216, 180, 111, 0.24)',
          borderWidth: 1,
          titleColor: metallicPalette.ink,
          bodyColor: metallicPalette.ink,
          displayColors: false,
        },
      },
      scales: {
        x: {
          ticks: {
            color: metallicPalette.silver,
            font: { family: 'Inter', size: 11 },
          },
          grid: { color: 'rgba(194, 202, 208, 0.06)' },
          border: { color: metallicPalette.line },
        },
        y: {
          ticks: {
            color: metallicPalette.silver,
            font: { family: 'Inter', size: 11 },
          },
          grid: { display: false },
          border: { color: metallicPalette.line },
        },
      },
    },
  });
}

/* ---------- ANALYTICS RENDERING ---------- */

function renderAnalytics() {
  // Check if analytics elements exist
  const statsGrid = getById('analytics-stats-grid');
  if (!statsGrid) return;

  // Render statistics
  const stats = state.data.stats || {};
  const statPoliticians = getById('stat-politicians');
  const statClaims = getById('stat-claims');
  const statIssues = getById('stat-issues');
  const statPositions = getById('stat-positions');

  if (statPoliticians) animateCount(statPoliticians, stats.total_politicians || state.data.politicians?.length || 0);
  if (statClaims) animateCount(statClaims, stats.total_claims || state.data.claims?.length || 0);
  if (statIssues) animateCount(statIssues, stats.total_issues || state.data.issues?.length || 0);
  if (statPositions) animateCount(statPositions, stats.total_positions || state.data.position_history?.length || 0);

  // Render fact-check distribution chart
  if (window.ApatheiViz && state.data.claims) {
    window.ApatheiViz.renderFactCheckDonut('fact-check-chart', state.data.claims);
  }

  // Render party breakdown chart
  if (window.ApatheiViz && state.data.politicians) {
    window.ApatheiViz.renderPartyBreakdownChart('party-breakdown-chart', state.data.politicians);
  }

  // Render issue category chart
  if (window.ApatheiViz && state.data.issues) {
    window.ApatheiViz.renderIssueCategoryChart('issue-category-chart', state.data.issues);
  }

  // Populate position evolution selects
  const issueSelect = getById('position-issue-select');
  const politicianSelect = getById('position-politician-select');

  if (issueSelect && state.data.issues) {
    const currentValue = issueSelect.value;
    issueSelect.innerHTML = '<option value="">Select an issue...</option>' +
      state.data.issues.map(issue =>
        `<option value="${escapeHtml(issue.id)}">${escapeHtml(issue.name)}</option>`
      ).join('');
    if (currentValue) issueSelect.value = currentValue;

    issueSelect.onchange = () => updatePositionCharts();
  }

  if (politicianSelect && state.data.politicians) {
    const currentValue = politicianSelect.value;
    politicianSelect.innerHTML = '<option value="">Select a politician...</option>' +
      state.data.politicians.map(p =>
        `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)} (${escapeHtml(p.party)})</option>`
      ).join('');
    if (currentValue) politicianSelect.value = currentValue;

    politicianSelect.onchange = () => updatePositionCharts();
  }

  // Render initial position charts
  updatePositionCharts();

  // Render talking points comparison
  if (window.ApatheiViz && state.data.talking_points) {
    window.ApatheiViz.renderTalkingPointsComparison('talking-points-chart', state.data.talking_points);
  }

  // Render activity timeline
  if (window.ApatheiViz && state.data.claims) {
    window.ApatheiViz.renderActivityTimeline('activity-timeline-chart', state.data.claims, 'date');
  }
}

function updatePositionCharts() {
  const issueSelect = getById('position-issue-select');
  const politicianSelect = getById('position-politician-select');
  const positions = state.data.position_history || [];

  if (!window.ApatheiViz) return;

  const selectedIssue = issueSelect?.value || '';
  const selectedPolitician = politicianSelect?.value || '';

  // Update position evolution chart for selected politician
  if (selectedPolitician) {
    const politicianPositions = positions.filter(p => p.politician_id === selectedPolitician);
    window.ApatheiViz.renderPositionEvolutionChart('position-evolution-chart', politicianPositions, selectedIssue || null);
  } else if (positions.length > 0) {
    // Show first politician's positions as default
    const firstPolitician = state.data.politicians?.[0]?.id;
    if (firstPolitician) {
      const politicianPositions = positions.filter(p => p.politician_id === firstPolitician);
      window.ApatheiViz.renderPositionEvolutionChart('position-evolution-chart', politicianPositions, selectedIssue || null);
    }
  }

  // Update position comparison chart for selected issue
  if (selectedIssue) {
    window.ApatheiViz.renderPositionComparisonChart('position-comparison-chart', positions, selectedIssue);
  } else if (state.data.issues?.length > 0) {
    // Show first issue as default
    window.ApatheiViz.renderPositionComparisonChart('position-comparison-chart', positions, state.data.issues[0].id);
  }
}

/* ---------- RENDER ALL ---------- */

function render() {
  renderSidebar();
  renderWorkspaceStrip();
  renderHero();
  renderMetrics();
  renderIssues();
  renderTimeline();
  renderThemes();
  renderProfiles();
  renderContradictions();
  renderPartyScaling();
  renderActors();
  renderMatrix();
  renderEvidence();
  renderDocuments();
  renderScaling();
  renderAnalytics();
  setActiveTab(state.activeTab);
}

async function init() {
  try {
    await loadData();
    cacheElements();
    attachEvents();
    render();
    setActiveTab(state.activeTab);
  } catch (error) {
    document.body.innerHTML = `<main style="padding:2rem;color:white;font-family:Inter,sans-serif;">Unable to load the dashboard data. ${escapeHtml(error.message)}</main>`;
  }
}

init();
