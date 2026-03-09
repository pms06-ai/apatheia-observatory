/**
 * Apatheia Political Observatory - Enhanced Visualizations
 * Additional chart components and data visualization utilities
 */

// Position stance values for chart positioning
const POSITION_VALUES = {
  'strongly-support': 2,
  'support': 1,
  'lean-support': 0.5,
  'neutral': 0,
  'lean-oppose': -0.5,
  'oppose': -1,
  'strongly-oppose': -2
};

const POSITION_LABELS = {
  'strongly-support': 'Strongly Support',
  'support': 'Support',
  'lean-support': 'Lean Support',
  'neutral': 'Neutral',
  'lean-oppose': 'Lean Oppose',
  'oppose': 'Oppose',
  'strongly-oppose': 'Strongly Oppose'
};

const POSITION_COLORS = {
  'strongly-support': '#4ade80',
  'support': '#86efac',
  'lean-support': '#bbf7d0',
  'neutral': '#9ca3af',
  'lean-oppose': '#fecaca',
  'oppose': '#f87171',
  'strongly-oppose': '#dc2626'
};

const FACT_CHECK_COLORS = {
  'true': '#22c55e',
  'mostly-true': '#84cc16',
  'half-true': '#eab308',
  'mostly-false': '#f97316',
  'false': '#ef4444',
  'pants-on-fire': '#dc2626',
  'unchecked': '#6b7280'
};

const PARTY_COLORS = {
  'Democrat': '#3b82f6',
  'Republican': '#ef4444',
  'Independent': '#8b5cf6',
  'Unknown': '#6b7280'
};

function chartSignature(value) {
  try {
    return JSON.stringify(value);
  } catch (_) {
    return String(Date.now());
  }
}

function syncObject(target, source) {
  if (!target || !source || typeof target !== 'object' || typeof source !== 'object') return;
  Object.keys(target).forEach(key => {
    if (!(key in source)) delete target[key];
  });
  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      target[key] = value.slice();
      return;
    }
    if (value && typeof value === 'object') {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {};
      }
      syncObject(target[key], value);
      return;
    }
    target[key] = value;
  });
}

function syncDatasets(targetDatasets, sourceDatasets) {
  targetDatasets.length = sourceDatasets.length;
  sourceDatasets.forEach((dataset, index) => {
    if (!targetDatasets[index]) targetDatasets[index] = {};
    syncObject(targetDatasets[index], dataset);
  });
}

function syncChartData(targetData, sourceData) {
  targetData.labels = (sourceData.labels || []).slice();
  if (!Array.isArray(targetData.datasets)) targetData.datasets = [];
  syncDatasets(targetData.datasets, sourceData.datasets || []);
}

function upsertChart(canvas, type, data, options, signature, updateMode = 'none') {
  const existingChart = Chart.getChart(canvas);
  if (existingChart && existingChart.config.type === type) {
    if (canvas.dataset.apatheiaChartSig === signature) return existingChart;
    syncChartData(existingChart.data, data);
    syncObject(existingChart.options, options);
    existingChart.update(updateMode);
    canvas.dataset.apatheiaChartSig = signature;
    return existingChart;
  }
  if (existingChart) existingChart.destroy();
  const chart = new Chart(canvas, { type, data, options });
  canvas.dataset.apatheiaChartSig = signature;
  return chart;
}

/**
 * Render a position evolution line chart for a politician on a specific issue
 */
function renderPositionEvolutionChart(canvasId, positions, issueId = null, renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Filter positions by issue if specified
  const filteredPositions = issueId
    ? positions.filter(p => p.issue_id === issueId)
    : positions;

  // Sort by date
  const sortedPositions = [...filteredPositions].sort((a, b) =>
    new Date(a.date) - new Date(b.date)
  );

  if (sortedPositions.length === 0) {
    return null;
  }

  const labels = sortedPositions.map(p => {
    const date = new Date(p.date);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  });

  const data = sortedPositions.map(p => POSITION_VALUES[p.position] || 0);
  const pointColors = sortedPositions.map(p => POSITION_COLORS[p.position] || '#9ca3af');

  const dataConfig = {
    labels,
    datasets: [{
      data,
      borderColor: '#d8b46f',
      backgroundColor: 'rgba(216, 180, 111, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: pointColors,
      pointBorderColor: pointColors,
      pointRadius: 8,
      pointHoverRadius: 12,
      fill: true,
      tension: 0.3
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4',
        padding: 12,
        callbacks: {
          label: function(context) {
            const pos = sortedPositions[context.dataIndex];
            return [
              POSITION_LABELS[pos.position] || pos.position,
              pos.stance_label || '',
              pos.explanation ? pos.explanation.substring(0, 60) + '...' : ''
            ].filter(Boolean);
          }
        }
      }
    },
    scales: {
      y: {
        min: -2.5,
        max: 2.5,
        grid: {
          color: 'rgba(194, 202, 208, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 10 },
          callback: function(value) {
            const labelsMap = {
              2: 'Strong Support',
              1: 'Support',
              0: 'Neutral',
              '-1': 'Oppose',
              '-2': 'Strong Oppose'
            };
            return labelsMap[value] || '';
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(194, 202, 208, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 10 }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, issueId || '', labels, data, pointColors]);
  return upsertChart(canvas, 'line', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render a fact-check distribution donut chart
 */
function renderFactCheckDonut(canvasId, claims, renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Count by fact-check status
  const counts = {};
  claims.forEach(claim => {
    const status = claim.fact_check_status || 'unchecked';
    counts[status] = (counts[status] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);
  const colors = labels.map(label => FACT_CHECK_COLORS[label] || '#6b7280');

  const dataConfig = {
    labels: labels.map(l => l.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())),
    datasets: [{
      data,
      backgroundColor: colors,
      borderColor: '#0b0c0f',
      borderWidth: 2,
      hoverOffset: 8
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#b9b1a5',
          font: { size: 11 },
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4',
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, labels, data]);
  return upsertChart(canvas, 'doughnut', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render party breakdown bar chart
 */
function renderPartyBreakdownChart(canvasId, politicians, metric = 'count', renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Group by party
  const partyData = {};
  politicians.forEach(p => {
    const party = p.party || 'Unknown';
    if (!partyData[party]) {
      partyData[party] = { count: 0, claims: 0, positions: 0 };
    }
    partyData[party].count++;
    partyData[party].claims += p.claim_count || 0;
    partyData[party].positions += p.position_count || 0;
  });

  const labels = Object.keys(partyData);
  const data = labels.map(party => partyData[party][metric] || partyData[party].count);
  const colors = labels.map(party => PARTY_COLORS[party] || '#6b7280');

  const dataConfig = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map(c => c + '80'),
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 6,
      barThickness: 40
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(194, 202, 208, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 11 }
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#f4efe4',
          font: { size: 12, weight: 600 }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, metric, labels, data]);
  return upsertChart(canvas, 'bar', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render a position comparison chart across multiple politicians
 */
function renderPositionComparisonChart(canvasId, positions, issueId, renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Filter positions by issue
  const issuePositions = positions.filter(p => p.issue_id === issueId);

  // Group by politician, get latest position for each
  const latestByPolitician = {};
  issuePositions.forEach(p => {
    if (!latestByPolitician[p.politician_id] ||
        new Date(p.date) > new Date(latestByPolitician[p.politician_id].date)) {
      latestByPolitician[p.politician_id] = p;
    }
  });

  const positionData = Object.values(latestByPolitician);

  // Sort by position value
  positionData.sort((a, b) =>
    (POSITION_VALUES[b.position] || 0) - (POSITION_VALUES[a.position] || 0)
  );

  const labels = positionData.map(p => {
    const name = p.politician_id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return name.length > 15 ? name.substring(0, 15) + '...' : name;
  });
  const data = positionData.map(p => POSITION_VALUES[p.position] || 0);
  const colors = positionData.map(p => POSITION_COLORS[p.position] || '#9ca3af');

  const dataConfig = {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.map(c => c + 'cc'),
      borderColor: colors,
      borderWidth: 2,
      borderRadius: 4
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4',
        callbacks: {
          label: function(context) {
            const pos = positionData[context.dataIndex];
            return [
              POSITION_LABELS[pos.position] || pos.position,
              pos.stance_label || ''
            ].filter(Boolean);
          }
        }
      }
    },
    scales: {
      x: {
        min: -2.5,
        max: 2.5,
        grid: {
          color: 'rgba(194, 202, 208, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 10 },
          callback: function(value) {
            const labelsMap = {
              2: 'Strong +',
              1: 'Support',
              0: 'Neutral',
              '-1': 'Oppose',
              '-2': 'Strong -'
            };
            return labelsMap[value] || '';
          }
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: '#f4efe4',
          font: { size: 11 }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, issueId || '', labels, data]);
  return upsertChart(canvas, 'bar', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render issue category breakdown chart
 */
function renderIssueCategoryChart(canvasId, issues, renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Count by category
  const counts = {};
  issues.forEach(issue => {
    const cat = issue.category || 'Other';
    counts[cat] = (counts[cat] || 0) + 1;
  });

  const sortedCategories = Object.entries(counts)
    .sort((a, b) => b[1] - a[1]);

  const labels = sortedCategories.map(([cat]) => cat);
  const data = sortedCategories.map(([, count]) => count);

  const categoryColors = [
    '#d8b46f', '#b87d52', '#8f9aa3', '#b56c5d', '#c2cad0',
    '#59626d', '#90b08e', '#ca7b6a', '#6e8fa3', '#a7967c'
  ];

  const dataConfig = {
    labels,
    datasets: [{
      data,
      backgroundColor: categoryColors.map(c => c + '80'),
      borderColor: categoryColors,
      borderWidth: 2
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#b9b1a5',
          font: { size: 10 },
          padding: 8,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4'
      }
    },
    scales: {
      r: {
        grid: { color: 'rgba(194, 202, 208, 0.1)' },
        ticks: {
          color: '#b9b1a5',
          backdropColor: 'transparent',
          font: { size: 10 }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, labels, data]);
  return upsertChart(canvas, 'polarArea', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render talking points comparison by party
 */
function renderTalkingPointsComparison(canvasId, talkingPoints, renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Group by party and issue
  const partyIssues = {};
  talkingPoints.forEach(tp => {
    const party = tp.party || 'Unknown';
    if (!partyIssues[party]) {
      partyIssues[party] = {};
    }
    const issue = tp.issue_id || 'other';
    partyIssues[party][issue] = (partyIssues[party][issue] || 0) + 1;
  });

  // Get unique issues
  const allIssues = [...new Set(talkingPoints.map(tp => tp.issue_id))].slice(0, 8);
  const parties = Object.keys(partyIssues);

  const datasets = parties.map((party, idx) => ({
    label: party,
    data: allIssues.map(issue => partyIssues[party][issue] || 0),
    backgroundColor: (PARTY_COLORS[party] || '#6b7280') + '80',
    borderColor: PARTY_COLORS[party] || '#6b7280',
    borderWidth: 2,
    borderRadius: 4
  }));

  const chartLabels = allIssues.map(id => id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  const dataConfig = {
    labels: chartLabels,
    datasets
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#b9b1a5',
          font: { size: 11 },
          padding: 16,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(194, 202, 208, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 10 },
          maxRotation: 45
        }
      },
      y: {
        grid: {
          color: 'rgba(194, 202, 208, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 11 }
        }
      }
    }
  };
  const sig = chartSignature([canvasId, chartLabels, datasets.map(d => ({ l: d.label, d: d.data }))]);
  return upsertChart(canvas, 'bar', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

/**
 * Render a timeline activity chart showing events over time
 */
function renderActivityTimeline(canvasId, data, dateField = 'date', renderOptions = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Group by month
  const monthCounts = {};
  data.forEach(item => {
    if (!item[dateField]) return;
    const date = new Date(item[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[key] = (monthCounts[key] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthCounts).sort();
  const labels = sortedMonths.map(m => {
    const [year, month] = m.split('-');
    return new Date(year, parseInt(month) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: '2-digit'
    });
  });
  const values = sortedMonths.map(m => monthCounts[m]);

  const dataConfig = {
    labels,
    datasets: [{
      data: values,
      borderColor: '#d8b46f',
      backgroundColor: 'rgba(216, 180, 111, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#d8b46f'
    }]
  };
  const optionsConfig = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(12, 13, 16, 0.96)',
        borderColor: 'rgba(216, 180, 111, 0.24)',
        borderWidth: 1,
        titleColor: '#f4efe4',
        bodyColor: '#f4efe4'
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(194, 202, 208, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 10 }
        }
      },
      y: {
        grid: {
          color: 'rgba(194, 202, 208, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#b9b1a5',
          font: { size: 11 }
        },
        beginAtZero: true
      }
    }
  };
  const sig = chartSignature([canvasId, dateField, labels, values]);
  return upsertChart(canvas, 'line', dataConfig, optionsConfig, sig, renderOptions.updateMode || 'none');
}

// Export functions to global scope
window.ApatheiViz = {
  renderPositionEvolutionChart,
  renderFactCheckDonut,
  renderPartyBreakdownChart,
  renderPositionComparisonChart,
  renderIssueCategoryChart,
  renderTalkingPointsComparison,
  renderActivityTimeline,
  POSITION_VALUES,
  POSITION_LABELS,
  POSITION_COLORS,
  FACT_CHECK_COLORS,
  PARTY_COLORS
};
