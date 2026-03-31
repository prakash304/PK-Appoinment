// frontend/js/auth.js - Login & Registration logic

let currentUser = null;

// ── Check session on load ──────────────────────────────────────────────────────
async function checkSession() {
  const data = await api.session();
  if (data.success) {
    currentUser = data.user;
    updateNavForUser(currentUser);
    return true;
  }
  updateNavForGuest();
  return false;
}

// ── Update Navbar based on role ────────────────────────────────────────────────
function updateNavForUser(user) {
  document.getElementById('nav-guest').style.display = 'none';
  document.getElementById('nav-user').style.display = 'flex';
  document.getElementById('nav-user-name').textContent = user.name.split(' ')[0];

  const patientLinks = document.getElementById('nav-patient-links');
  const doctorLinks = document.getElementById('nav-doctor-links');
  const adminLinks = document.getElementById('nav-admin-links');

  if (patientLinks) patientLinks.style.display = user.role === 'patient' ? 'flex' : 'none';
  if (doctorLinks)  doctorLinks.style.display  = user.role === 'doctor'  ? 'flex' : 'none';
  if (adminLinks)   adminLinks.style.display   = user.role === 'admin'   ? 'flex' : 'none';
}

function updateNavForGuest() {
  document.getElementById('nav-guest').style.display = 'flex';
  document.getElementById('nav-user').style.display = 'none';
  const patientLinks = document.getElementById('nav-patient-links');
  const doctorLinks = document.getElementById('nav-doctor-links');
  const adminLinks = document.getElementById('nav-admin-links');
  if (patientLinks) patientLinks.style.display = 'none';
  if (doctorLinks)  doctorLinks.style.display  = 'none';
  if (adminLinks)   adminLinks.style.display   = 'none';
}

// ── Login Form Submit ──────────────────────────────────────────────────────────
async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const data = await api.login({ email, password });
  btn.disabled = false;
  btn.textContent = 'Login';

  if (data.success) {
    currentUser = data.user;
    updateNavForUser(currentUser);
    showToast(`Welcome back, ${currentUser.name.split(' ')[0]}! 👋`);
    redirectAfterLogin(currentUser.role);
  } else {
    showToast(data.message || 'Login failed', 'error');
  }
}

// ── Register Form Submit ───────────────────────────────────────────────────────
async function handleRegister(e) {
  e.preventDefault();
  const btn = document.getElementById('register-btn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;
  const phone    = document.getElementById('reg-phone').value.trim();
  const age      = document.getElementById('reg-age').value;
  const gender   = document.getElementById('reg-gender').value;

  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account';
    return;
  }
  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    btn.disabled = false;
    btn.textContent = 'Create Account';
    return;
  }

  const data = await api.register({ name, email, password, phone, age, gender });
  btn.disabled = false;
  btn.textContent = 'Create Account';

  if (data.success) {
    currentUser = data.user;
    updateNavForUser(currentUser);
    showToast('Account created successfully! 🎉');
    showPage('patient-dashboard');
    loadPatientDashboard();
  } else {
    showToast(data.message || 'Registration failed', 'error');
  }
}

// ── Logout ─────────────────────────────────────────────────────────────────────
async function handleLogout() {
  await api.logout();
  currentUser = null;
  updateNavForGuest();
  showToast('Logged out successfully');
  showPage('home');
}

// ── Redirect based on role ─────────────────────────────────────────────────────
function redirectAfterLogin(role) {
  if (role === 'admin') {
    showPage('admin-dashboard');
    loadAdminDashboard();
  } else if (role === 'doctor') {
    showPage('doctor-panel');
    loadDoctorPanel();
  } else {
    showPage('patient-dashboard');
    loadPatientDashboard();
  }
}

// ── Toggle Login / Register tabs ───────────────────────────────────────────────
function showAuthTab(tab) {
  document.getElementById('login-form-wrap').style.display  = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form-wrap').style.display = tab === 'register' ? 'block' : 'none';
  document.querySelectorAll('.auth-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}
