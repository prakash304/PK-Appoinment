// frontend/js/patient.js - Patient dashboard, categories, doctors, booking

// ── Load Patient Dashboard ─────────────────────────────────────────────────────
async function loadPatientDashboard() {
  const container = document.getElementById('patient-stats');
  if (!container) return;

  container.innerHTML = spinnerHTML();
  const data = await api.getMyAppointments();
  const appointments = data.appointments || [];

  const counts = { pending: 0, accepted: 0, rejected: 0, completed: 0 };
  appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  container.innerHTML = `
    <div class="stat-card"><div class="stat-icon">📋</div><div><div class="stat-label">Total</div><div class="stat-value">${appointments.length}</div></div></div>
    <div class="stat-card"><div class="stat-icon">⏳</div><div><div class="stat-label">Pending</div><div class="stat-value">${counts.pending}</div></div></div>
    <div class="stat-card"><div class="stat-icon">✅</div><div><div class="stat-label">Accepted</div><div class="stat-value">${counts.accepted}</div></div></div>
    <div class="stat-card"><div class="stat-icon">🏁</div><div><div class="stat-label">Completed</div><div class="stat-value">${counts.completed}</div></div></div>
  `;

  // Recent appointments
  const recentEl = document.getElementById('patient-recent-appointments');
  if (!recentEl) return;
  const recent = appointments.slice(0, 5);

  if (recent.length === 0) {
    recentEl.innerHTML = emptyStateHTML('📭', 'No appointments yet. Book your first appointment!');
    return;
  }

  recentEl.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Doctor</th><th>Category</th><th>Date & Time</th><th>Status</th></tr></thead>
        <tbody>
          ${recent.map(a => `
            <tr>
              <td><strong>${a.doctorId?.userId?.name || 'N/A'}</strong><br><small style="color:var(--text-muted)">${a.doctorId?.specialization || ''}</small></td>
              <td>${a.categoryId?.icon || ''} ${a.categoryId?.name || ''}</td>
              <td>${formatDate(a.date)}<br><small>${formatTime(a.time)}</small></td>
              <td>${statusBadge(a.status)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Load Categories ────────────────────────────────────────────────────────────
async function loadCategories() {
  const container = document.getElementById('categories-grid');
  if (!container) return;

  container.innerHTML = spinnerHTML();
  const data = await api.getCategories();
  const categories = data.categories || [];

  if (categories.length === 0) {
    container.innerHTML = emptyStateHTML('🏥', 'No categories found');
    return;
  }

  container.innerHTML = `<div class="grid-4">
    ${categories.map(cat => `
      <div class="card category-card" onclick="selectCategory('${cat._id}', '${cat.name.replace(/'/g, "\\'")}')">
        <img class="cat-img" src="${cat.image}" alt="${cat.name}" onerror="this.src='https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=80'">
        <div class="cat-body">
          <div class="cat-icon">${cat.icon}</div>
          <div class="cat-name">${cat.name}</div>
          <div class="cat-desc">${cat.description}</div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ── Select Category → Load Doctors ────────────────────────────────────────────
async function selectCategory(categoryId, categoryName) {
  showPage('doctors-page');
  document.getElementById('doctors-page-title').textContent = categoryName + ' Specialists';

  const container = document.getElementById('doctors-grid');
  container.innerHTML = spinnerHTML();

  const data = await api.getDoctors(categoryId);
  const doctors = data.doctors || [];

  if (doctors.length === 0) {
    container.innerHTML = emptyStateHTML('👨‍⚕️', 'No doctors available in this category');
    return;
  }

  container.innerHTML = `<div class="grid-3">
    ${doctors.map(d => `
      <div class="card doctor-card">
        <img class="doctor-avatar" src="${d.avatar || doctorAvatar(d)}" alt="${d.userId?.name}" onerror="this.src='https://i.pravatar.cc/300?img=47'">
        <div class="doctor-info">
          <div class="doctor-name">${d.userId?.name || 'Doctor'}</div>
          <div class="doctor-spec">${d.specialization}</div>
          <div style="margin: 6px 0">${renderStars(d.averageRating, d.totalRatings)}</div>
          <div class="doctor-meta">
            <span>🎓 ${d.qualifications}</span>
            <span>📅 ${d.experience} yrs exp</span>
          </div>
          <div class="doctor-fee">₹${d.fee} / consultation</div>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" onclick="openBookingModal('${d._id}', '${d.userId?.name?.replace(/'/g, "\\'")}', '${categoryId}')">Book Now</button>
            <button class="btn btn-outline btn-sm" onclick="viewDoctorProfile('${d._id}')">View Profile</button>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ── Load All Doctors (All Categories) ─────────────────────────────────────────
async function loadAllDoctors() {
  showPage('doctors-page');
  document.getElementById('doctors-page-title').textContent = 'All Doctors';

  const container = document.getElementById('doctors-grid');
  container.innerHTML = spinnerHTML();

  const data = await api.getDoctors();
  const doctors = data.doctors || [];

  if (doctors.length === 0) {
    container.innerHTML = emptyStateHTML('👨‍⚕️', 'No doctors available');
    return;
  }

  container.innerHTML = `<div class="grid-3">
    ${doctors.map(d => `
      <div class="card doctor-card">
        <img class="doctor-avatar" src="${d.avatar || doctorAvatar(d)}" alt="${d.userId?.name}" onerror="this.src='https://i.pravatar.cc/300?img=47'">
        <div class="doctor-info">
          <div class="doctor-name">${d.userId?.name || 'Doctor'}</div>
          <div class="doctor-spec">${d.specialization}</div>
          <div style="color: var(--primary); font-size: 0.82rem; font-weight: 600;">${d.categoryId?.icon || ''} ${d.categoryId?.name || ''}</div>
          <div style="margin: 6px 0">${renderStars(d.averageRating, d.totalRatings)}</div>
          <div class="doctor-meta">
            <span>📅 ${d.experience} yrs exp</span>
          </div>
          <div class="doctor-fee">₹${d.fee} / consultation</div>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button class="btn btn-primary btn-sm" onclick="openBookingModal('${d._id}', '${d.userId?.name?.replace(/'/g, "\\'")}', '${d.categoryId?._id}')">Book Now</button>
            <button class="btn btn-outline btn-sm" onclick="viewDoctorProfile('${d._id}')">View Profile</button>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

// ── View Doctor Profile ────────────────────────────────────────────────────────
async function viewDoctorProfile(doctorId) {
  showPage('doctor-profile-page');
  const container = document.getElementById('doctor-profile-content');
  container.innerHTML = spinnerHTML();

  const data = await api.getDoctorById(doctorId);
  if (!data.success) {
    container.innerHTML = emptyStateHTML('❌', 'Doctor not found');
    return;
  }

  const d = data.doctor;
  const ratings = data.ratings || [];

  container.innerHTML = `
    <div style="display:grid; grid-template-columns: 300px 1fr; gap: 28px; align-items:start;" class="doctor-profile-grid">
      <div class="card" style="text-align:center; padding: 28px;">
        <img src="${d.avatar || doctorAvatar(d)}" alt="${d.userId?.name}" class="avatar" style="width:120px;height:120px;margin:0 auto 16px;" onerror="this.src='https://i.pravatar.cc/150?img=47'">
        <div style="font-size:1.2rem; font-weight:700; margin-bottom:4px;">${d.userId?.name}</div>
        <div style="color:var(--primary); font-weight:600; margin-bottom:8px;">${d.specialization}</div>
        <div style="margin-bottom:16px;">${renderStars(d.averageRating, d.totalRatings)}</div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">📅 ${d.experience} years experience</div>
        <div style="font-size:0.85rem; color:var(--text-muted); margin-bottom:8px;">🎓 ${d.qualifications}</div>
        <div style="font-size:1.1rem; font-weight:700; color:var(--accent); margin-bottom:20px;">₹${d.fee} / consultation</div>
        ${currentUser?.role === 'patient' ? `
          <button class="btn btn-primary" style="width:100%" onclick="openBookingModal('${d._id}', '${d.userId?.name?.replace(/'/g, "\\'")}', '${d.categoryId?._id}')">
            📅 Book Appointment
          </button>
        ` : ''}
      </div>
      <div>
        <div class="card" style="padding:24px; margin-bottom:20px;">
          <h3 style="font-weight:700; margin-bottom:12px; color:var(--primary);">About</h3>
          <p style="color:var(--text-muted); line-height:1.6;">${d.bio || 'No bio available.'}</p>
          <div style="margin-top:16px; display:flex; gap:16px; flex-wrap:wrap;">
            <div><strong>Category:</strong> ${d.categoryId?.icon} ${d.categoryId?.name}</div>
            <div><strong>Available:</strong> ${d.availableDays?.join(', ')}</div>
            <div><strong>Hours:</strong> ${d.availableTime?.start} – ${d.availableTime?.end}</div>
          </div>
        </div>
        <div class="card" style="padding:24px;">
          <h3 style="font-weight:700; margin-bottom:16px; color:var(--primary);">Patient Reviews (${ratings.length})</h3>
          ${ratings.length === 0 ? '<p style="color:var(--text-muted);">No reviews yet. Be the first to rate!</p>' :
            ratings.map(r => `
              <div class="review-item">
                <div class="review-header">
                  <span class="review-author">👤 ${r.patientId?.name || 'Patient'}</span>
                  <span class="review-date">${formatDate(r.createdAt)}</span>
                </div>
                <div style="margin-bottom:4px;">${renderStars(r.rating)}</div>
                ${r.review ? `<div class="review-text">"${r.review}"</div>` : ''}
              </div>
            `).join('')
          }
        </div>
      </div>
    </div>
    <style>
      @media (max-width: 700px) {
        .doctor-profile-grid { grid-template-columns: 1fr !important; }
      }
    </style>
  `;
}

// ── Booking Modal ──────────────────────────────────────────────────────────────
let bookingState = { doctorId: null, categoryId: null };

function openBookingModal(doctorId, doctorName, categoryId) {
  if (!currentUser) {
    showToast('Please login to book an appointment', 'warning');
    showPage('auth-page');
    showAuthTab('login');
    return;
  }
  if (currentUser.role !== 'patient') {
    showToast('Only patients can book appointments', 'warning');
    return;
  }

  bookingState = { doctorId, categoryId };
  document.getElementById('booking-doctor-name').textContent = doctorName;
  document.getElementById('booking-date').min = new Date().toISOString().split('T')[0];
  document.getElementById('booking-symptoms').value = '';
  document.getElementById('booking-modal').classList.add('open');
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.remove('open');
}

async function submitBooking() {
  const date     = document.getElementById('booking-date').value;
  const time     = document.getElementById('booking-time').value;
  const symptoms = document.getElementById('booking-symptoms').value.trim();

  if (!date || !time || !symptoms) {
    showToast('Please fill all fields', 'warning');
    return;
  }

  const btn = document.getElementById('confirm-booking-btn');
  btn.disabled = true;
  btn.textContent = 'Booking...';

  const data = await api.bookAppointment({
    doctorId: bookingState.doctorId,
    categoryId: bookingState.categoryId,
    date, time, symptoms
  });

  btn.disabled = false;
  btn.textContent = 'Confirm Booking';

  if (data.success) {
    closeBookingModal();
    showToast('Appointment booked successfully! 🎉');
    if (currentUser?.role === 'patient') loadPatientDashboard();
  } else {
    showToast(data.message || 'Booking failed', 'error');
  }
}

// ── Patient Records Page ───────────────────────────────────────────────────────
async function loadPatientRecords() {
  const container = document.getElementById('patient-records-content');
  if (!container) return;
  container.innerHTML = spinnerHTML();

  const data = await api.getMyAppointments();
  const appointments = data.appointments || [];

  if (appointments.length === 0) {
    container.innerHTML = emptyStateHTML('📭', 'No appointments found. Book your first one!');
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Doctor</th><th>Category</th><th>Date & Time</th><th>Symptoms</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          ${appointments.map((a, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <strong>${a.doctorId?.userId?.name || 'N/A'}</strong><br>
                <small style="color:var(--text-muted)">${a.doctorId?.specialization || ''}</small>
              </td>
              <td>${a.categoryId?.icon || ''} ${a.categoryId?.name || ''}</td>
              <td>${formatDate(a.date)}<br><small>${formatTime(a.time)}</small></td>
              <td style="max-width:160px; font-size:0.85rem; color:var(--text-muted);">${a.symptoms.substring(0, 60)}${a.symptoms.length > 60 ? '...' : ''}</td>
              <td>${statusBadge(a.status)}</td>
              <td>
                ${a.status === 'completed' && !a.isRated
                  ? `<button class="btn btn-accent btn-sm" onclick="openRatingModal('${a._id}', '${a.doctorId?.userId?.name?.replace(/'/g, "\\'")}')">⭐ Rate</button>`
                  : a.isRated ? '<span style="color:var(--text-muted);font-size:0.82rem;">Rated ✓</span>' : '—'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ── Rating Modal ───────────────────────────────────────────────────────────────
let ratingState = { appointmentId: null, rating: 0 };

function openRatingModal(appointmentId, doctorName) {
  ratingState = { appointmentId, rating: 0 };
  document.getElementById('rating-doctor-name').textContent = doctorName;
  document.getElementById('rating-review').value = '';
  renderStarPicker('rating-stars', (val) => { ratingState.rating = val; });
  document.getElementById('rating-modal').classList.add('open');
}

function closeRatingModal() {
  document.getElementById('rating-modal').classList.remove('open');
}

async function submitRating() {
  if (!ratingState.rating) {
    showToast('Please select a star rating', 'warning');
    return;
  }

  const review = document.getElementById('rating-review').value.trim();
  const btn = document.getElementById('submit-rating-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  const data = await api.submitRating({
    appointmentId: ratingState.appointmentId,
    rating: ratingState.rating,
    review
  });

  btn.disabled = false;
  btn.textContent = 'Submit Rating';

  if (data.success) {
    closeRatingModal();
    showToast('Rating submitted! Thank you 🌟');
    loadPatientRecords();
  } else {
    showToast(data.message || 'Rating failed', 'error');
  }
}
