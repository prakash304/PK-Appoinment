// frontend/js/utils.js - Shared utility functions

// ── Toast Notifications ────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Page Navigation ────────────────────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ── Star Rating HTML ───────────────────────────────────────────────────────────
function renderStars(rating, total = 0) {
  let html = '<div class="star-display">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= Math.round(rating) ? 'filled' : ''}">★</span>`;
  }
  if (total > 0) html += `<span class="rating-count">${Number(rating).toFixed(1)} (${total})</span>`;
  html += '</div>';
  return html;
}

// ── Interactive Star Picker ────────────────────────────────────────────────────
function renderStarPicker(containerId, onSelect) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  let selected = 0;
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('span');
    star.className = 'star';
    star.textContent = '★';
    star.dataset.value = i;
    star.addEventListener('mouseover', () => {
      container.querySelectorAll('.star').forEach((s, idx) => {
        s.classList.toggle('active', idx < i);
      });
    });
    star.addEventListener('mouseout', () => {
      container.querySelectorAll('.star').forEach((s, idx) => {
        s.classList.toggle('active', idx < selected);
      });
    });
    star.addEventListener('click', () => {
      selected = i;
      if (onSelect) onSelect(i);
      container.querySelectorAll('.star').forEach((s, idx) => {
        s.classList.toggle('filled', idx < i);
        s.classList.toggle('active', false);
      });
    });
    container.appendChild(star);
  }
  container.style.display = 'flex';
  container.style.gap = '4px';
  container.style.fontSize = '1.8rem';
  container.style.cursor = 'pointer';
}

// ── Status Badge HTML ──────────────────────────────────────────────────────────
function statusBadge(status) {
  const labels = { pending: '⏳ Pending', accepted: '✅ Accepted', rejected: '❌ Rejected', completed: '🏁 Completed' };
  return `<span class="badge badge-${status}">${labels[status] || status}</span>`;
}

// ── Format Date ────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── Format Time (12hr) ─────────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// ── Loading spinner ────────────────────────────────────────────────────────────
function spinnerHTML() {
  return '<div class="loading-wrapper"><div class="spinner"></div></div>';
}

// ── Empty State HTML ───────────────────────────────────────────────────────────
function emptyStateHTML(icon, message) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${message}</p></div>`;
}

// ── Doctor Avatar fallback ─────────────────────────────────────────────────────
function doctorAvatar(doctor) {
  return doctor?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`;
}
