// frontend/js/admin.js - Admin dashboard with Chart.js analytics

let chartInstances = {};

// ── Load Admin Dashboard ───────────────────────────────────────────────────────
async function loadAdminDashboard() {
  const container = document.getElementById('admin-stats-row');
  if (!container) return;
  container.innerHTML = spinnerHTML();

  const data = await api.getDashboardStats();
  if (!data.success) {
    container.innerHTML = emptyStateHTML('❌', 'Failed to load dashboard data');
    return;
  }

  const s = data.stats;

  // ── Stat Cards ───────────────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-label">Total Appointments</div><div class="stat-value">${s.totalAppointments}</div></div></div>
    <div class="stat-card"><div class="stat-icon">👤</div><div><div class="stat-label">Total Patients</div><div class="stat-value">${s.totalPatients}</div></div></div>
    <div class="stat-card"><div class="stat-icon">👨‍⚕️</div><div><div class="stat-label">Total Doctors</div><div class="stat-value">${s.totalDoctors}</div></div></div>
    <div class="stat-card"><div class="stat-icon">💰</div><div><div class="stat-label">Total Revenue</div><div class="stat-value">₹${s.totalRevenue.toLocaleString('en-IN')}</div></div></div>
  `;

  // Destroy old charts before recreating
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  // ── Pie Chart: Status Breakdown ──────────────────────────────────────────────
  renderStatusPie(s.statusBreakdown);

  // ── Bar Chart: Appointments per Category ─────────────────────────────────────
  renderCategoryBar(s.categoryStats);

  // ── Bar Chart: Doctor-wise appointments ──────────────────────────────────────
  renderDoctorBar(s.doctorStats);

  // ── Line Chart: Monthly trend ────────────────────────────────────────────────
  renderMonthlyLine(s.monthlyTrend);
}

// ── Status Pie Chart ───────────────────────────────────────────────────────────
function renderStatusPie(breakdown) {
  const ctx = document.getElementById('statusPieChart');
  if (!ctx) return;

  chartInstances.pie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      datasets: [{
        data: [breakdown.pending, breakdown.accepted, breakdown.rejected, breakdown.completed],
        backgroundColor: ['#f0a500', '#2d9e6b', '#d64045', '#1565c0'],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { family: 'DM Sans', size: 12 } } },
        tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.parsed}` } }
      },
      cutout: '60%'
    }
  });
}

// ── Category Bar Chart ─────────────────────────────────────────────────────────
function renderCategoryBar(categoryStats) {
  const ctx = document.getElementById('categoryBarChart');
  if (!ctx) return;

  const sorted = [...categoryStats].sort((a, b) => b.count - a.count);

  chartInstances.catBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(c => c.name),
      datasets: [{
        label: 'Appointments',
        data: sorted.map(c => c.count),
        backgroundColor: 'rgba(10, 110, 110, 0.75)',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ── Doctor Bar Chart ───────────────────────────────────────────────────────────
function renderDoctorBar(doctorStats) {
  const ctx = document.getElementById('doctorBarChart');
  if (!ctx) return;

  const colors = ['#0a6e6e','#f0a500','#2d9e6b','#d64045','#1565c0','#7b1fa2','#e08c00','#0d8f8f'];

  chartInstances.docBar = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: doctorStats.map(d => d.name.replace('Dr. ', '')),
      datasets: [{
        label: 'Appointments',
        data: doctorStats.map(d => d.count),
        backgroundColor: doctorStats.map((_, i) => colors[i % colors.length]),
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
        y: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}

// ── Monthly Line Chart ─────────────────────────────────────────────────────────
function renderMonthlyLine(monthlyTrend) {
  const ctx = document.getElementById('monthlyLineChart');
  if (!ctx) return;

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const labels = monthlyTrend.map(m => `${monthNames[m._id.month]} ${m._id.year}`);
  const values = monthlyTrend.map(m => m.count);

  chartInstances.line = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Appointments',
        data: values,
        borderColor: '#0a6e6e',
        backgroundColor: 'rgba(10, 110, 110, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0a6e6e',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
        x: { ticks: { font: { size: 11 } }, grid: { display: false } }
      }
    }
  });
}
