// frontend/js/doctor.js - Doctor panel logic

let doctorAppointments = [];

// ── Load Doctor Panel ──────────────────────────────────────────────────────────
async function loadDoctorPanel() {
  const container = document.getElementById('doctor-appointments-list');
  if (!container) return;
  container.innerHTML = spinnerHTML();

  // Stats
  const profileData = await api.getMyDrProfile();
  if (profileData.success) {
    const d = profileData.doctor;
    const statsEl = document.getElementById('doctor-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card">
          <img src="${d.avatar || doctorAvatar(d)}" class="avatar" style="width:56px;height:56px;" onerror="this.src='https://i.pravatar.cc/150?img=47'">
          <div>
            <div class="stat-label">My Profile</div>
            <div style="font-weight:700;">${d.userId?.name}</div>
            <div style="font-size:0.83rem;color:var(--primary)">${d.specialization}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⭐</div>
          <div>
            <div class="stat-label">Avg Rating</div>
            <div class="stat-value">${d.averageRating > 0 ? d.averageRating.toFixed(1) : '—'}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div>
            <div class="stat-label">Total Reviews</div>
            <div class="stat-value">${d.totalRatings}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div>
            <div class="stat-label">Consultation Fee</div>
            <div class="stat-value">₹${d.fee}</div>
          </div>
        </div>
      `;
    }
  }

  const data = await api.getDoctorAppointments();
  doctorAppointments = data.appointments || [];

  renderDoctorAppointments('all');
}

// ── Render filtered appointments ───────────────────────────────────────────────
function renderDoctorAppointments(filter = 'all') {
  const container = document.getElementById('doctor-appointments-list');
  if (!container) return;

  // Update tab active state
  document.querySelectorAll('.dr-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });

  const filtered = filter === 'all'
    ? doctorAppointments
    : doctorAppointments.filter(a => a.status === filter);

  if (filtered.length === 0) {
    container.innerHTML = emptyStateHTML('📭', `No ${filter === 'all' ? '' : filter} appointments`);
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Patient</th><th>Date & Time</th><th>Symptoms</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(a => `
            <tr>
              <td>
                <strong>${a.patientId?.name || 'N/A'}</strong><br>
                <small style="color:var(--text-muted)">${a.patientId?.email || ''}</small><br>
                <small style="color:var(--text-muted)">${a.patientId?.phone ? '📞 ' + a.patientId.phone : ''}</small>
                ${a.patientId?.age ? `<br><small style="color:var(--text-muted)">Age: ${a.patientId.age} | ${a.patientId.gender || ''}</small>` : ''}
              </td>
              <td>${formatDate(a.date)}<br><small>${formatTime(a.time)}</small></td>
              <td style="max-width:180px; font-size:0.85rem; color:var(--text-muted);">${a.symptoms}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                <div class="action-btns">
                  ${a.status === 'pending' ? `
                    <button class="btn btn-success btn-sm" onclick="updateAppStatus('${a._id}', 'accepted')">✅ Accept</button>
                    <button class="btn btn-danger btn-sm" onclick="updateAppStatus('${a._id}', 'rejected')">❌ Reject</button>
                  ` : ''}
                  ${a.status === 'accepted' ? `
                    <button class="btn btn-primary btn-sm" onclick="markCompleted('${a._id}')">🏁 Complete</button>
                  ` : ''}
                  ${a.status === 'rejected' || a.status === 'completed' ? '<span style="color:var(--text-muted);font-size:0.82rem;">—</span>' : ''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Accept / Reject appointment ────────────────────────────────────────────────
async function updateAppStatus(appointmentId, status) {
  const data = await api.updateAppStatus(appointmentId, { status });
  if (data.success) {
    showToast(`Appointment ${status === 'accepted' ? 'accepted ✅' : 'rejected ❌'}`);
    loadDoctorPanel();
  } else {
    showToast(data.message || 'Update failed', 'error');
  }
}

// ── Mark appointment as completed ─────────────────────────────────────────────
async function markCompleted(appointmentId) {
  const data = await api.completeAppointment(appointmentId);
  if (data.success) {
    showToast('Appointment marked as completed 🏁');
    loadDoctorPanel();
  } else {
    showToast(data.message || 'Failed', 'error');
  }
}
