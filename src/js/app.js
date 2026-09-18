import { store } from './store.js';
import { renderHomeView, initHomeEvents } from './views/homeView.js';
import { renderRegisterView, initRegisterEvents } from './views/registerView.js';
import { renderAdminCoursesView, initAdminCoursesEvents } from './views/adminCoursesView.js';
import { renderAdminStudentsView, initAdminStudentsEvents } from './views/adminStudentsView.js';
import { renderAdminGradingView, initAdminGradingEvents } from './views/adminGradingView.js';
import { renderCertificateView, initCertificateEvents } from './views/certificateView.js';
import { renderVerifyView, initVerifyEvents } from './views/verifyView.js';

class AppRouter {
  constructor() {
    this.currentView = 'home';
    this.currentParams = {};
    this.pendingAdminRoute = null;
    this.appContainer = document.getElementById('appMainContent');
    this.toastContainer = document.getElementById('toastContainer');
    this.loginModal = document.getElementById('adminLoginModal');
    this.init();
  }

  init() {
    // Listen for hashchange
    window.addEventListener('hashchange', () => this.handleRouteFromHash());

    // Navigation links click listener
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.getAttribute('data-nav');
        this.navigate(route);
      });
    });

    // Mobile nav toggle
    const mobileToggle = document.getElementById('navMobileToggle');
    const navLinks = document.getElementById('navLinks');
    mobileToggle?.addEventListener('click', () => {
      navLinks?.classList.toggle('open');
    });

    // Initialize Login Modal Handlers
    this.initLoginModalEvents();

    // Sync Navbar Auth Status UI
    this.updateNavbarAuthUI();

    // Initial Route
    this.handleRouteFromHash();
  }

  initLoginModalEvents() {
    const closeBtn = document.getElementById('closeLoginModalBtn');
    const fillDemoBtn = document.getElementById('fillDemoLoginBtn');
    const togglePassBtn = document.getElementById('toggleLoginPasswordBtn');
    const loginForm = document.getElementById('adminLoginForm');
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const errorMsg = document.getElementById('loginErrorMessage');

    // Close Modal
    closeBtn?.addEventListener('click', () => this.closeLoginModal());

    // Close on Backdrop Click
    this.loginModal?.addEventListener('click', (e) => {
      if (e.target === this.loginModal) this.closeLoginModal();
    });

    // Fill Demo Credentials
    fillDemoBtn?.addEventListener('click', () => {
      if (usernameInput) usernameInput.value = 'admin';
      if (passwordInput) passwordInput.value = 'admin123';
      if (errorMsg) errorMsg.style.display = 'none';
    });

    // Toggle Password Visibility
    togglePassBtn?.addEventListener('click', () => {
      if (passwordInput) {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        togglePassBtn.textContent = isPass ? '🙈' : '👁️';
      }
    });

    // Submit Login Form
    loginForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = usernameInput?.value || '';
      const pass = passwordInput?.value || '';
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      const btnText = document.getElementById('loginBtnText');

      if (errorMsg) errorMsg.style.display = 'none';

      // Show loading spinner
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.innerHTML = '⏳ កំពុងផ្ទៀងផ្ទាត់ជាមួយ Firebase...';

      try {
        const result = await store.loginAdmin(user, pass);
        if (result.success) {
          this.closeLoginModal();
          this.updateNavbarAuthUI();
          this.showToast('✅ ចូលគ្រប់គ្រងប្រព័ន្ធ Admin ដោយជោគជ័យ!', 'success');

          // Navigate to target admin route or default admin-courses
          const target = this.pendingAdminRoute || { viewName: 'admin-courses', params: {} };
          this.pendingAdminRoute = null;
          this.navigate(target.viewName, target.params);
        } else {
          if (errorMsg) {
            errorMsg.textContent = result.message;
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = `កំហុសប្រព័ន្ធ៖ ${err.message}`;
          errorMsg.style.display = 'block';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.innerHTML = '🔐 ចូលគ្រប់គ្រង (Sign In)';
      }
    });
  }

  openLoginModal(targetView = 'admin-courses', targetParams = {}) {
    this.pendingAdminRoute = { viewName: targetView, params: targetParams };
    const errorMsg = document.getElementById('loginErrorMessage');
    if (errorMsg) errorMsg.style.display = 'none';
    this.loginModal?.classList.add('open');

    // Focus input
    setTimeout(() => {
      document.getElementById('loginUsername')?.focus();
    }, 150);
  }

  closeLoginModal() {
    this.loginModal?.classList.remove('open');
  }

  updateNavbarAuthUI() {
    const navAdminBtn = document.getElementById('navAdminBtn');
    if (!navAdminBtn) return;

    const isLoggedIn = store.isAdminLoggedIn();
    const session = store.getAdminSession();

    let badge = navAdminBtn.querySelector('.nav-admin-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'nav-admin-badge';
      navAdminBtn.appendChild(badge);
    }

    if (isLoggedIn) {
      badge.className = 'nav-admin-status-online';
      badge.innerHTML = '🟢 Admin Online';

      // Check if Logout button already exists in nav
      let logoutLi = document.getElementById('navLogoutItem');
      if (!logoutLi) {
        const navUl = document.getElementById('navLinks');
        logoutLi = document.createElement('li');
        logoutLi.id = 'navLogoutItem';
        logoutLi.innerHTML = `
          <button class="nav-item-btn" id="navLogoutBtn" style="color: #fca5a5; border-color: rgba(239, 68, 68, 0.3);">
            <span>🚪 ចាកចេញ (${session?.username || 'Admin'})</span>
          </button>
        `;
        navUl?.appendChild(logoutLi);

        document.getElementById('navLogoutBtn')?.addEventListener('click', () => {
          if (confirm('តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធ Admin នេះមែនទេ?')) {
            store.logoutAdmin();
            this.updateNavbarAuthUI();
            this.showToast('បានចាកចេញពីប្រព័ន្ធ Admin ដោយជោគជ័យ!', 'info');
            this.navigate('home');
          }
        });
      }
    } else {
      badge.className = 'nav-admin-badge';
      badge.innerHTML = '🔒 Admin';
      const logoutLi = document.getElementById('navLogoutItem');
      if (logoutLi) logoutLi.remove();
    }
  }

  handleRouteFromHash() {
    const rawHash = window.location.hash.replace('#', '') || 'home';
    const [routePart, queryPart] = rawHash.split('?');
    const route = routePart || 'home';

    const params = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    this.render(route, params);
  }

  navigate(route, params = {}) {
    this.currentView = route;
    this.currentParams = params;

    // Route Guard for Admin views
    if (route.startsWith('admin') && !store.isAdminLoggedIn()) {
      this.openLoginModal(route, params);
      return;
    }

    // Build URL hash
    let hash = `#${route}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const qs = new URLSearchParams(params).toString();
      hash += `?${qs}`;
    }

    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      this.render(route, params);
    }

    // Close mobile nav if open
    document.getElementById('navLinks')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render(viewName, params = {}) {
    // Protected Admin Route Check
    if (viewName.startsWith('admin') && !store.isAdminLoggedIn()) {
      this.openLoginModal(viewName, params);
      viewName = 'home'; // Fallback view until logged in
    }

    this.currentView = viewName;
    this.currentParams = params;

    // Check if in standalone verification mode (e.g. from QR scan)
    const isStandaloneVerify = viewName === 'verify' && Boolean(
      params.studentId || 
      params.certNo || 
      (typeof window !== 'undefined' && (window.location.hash.includes('studentId') || window.location.hash.includes('certNo')))
    );
    if (isStandaloneVerify) {
      document.body.classList.add('verify-standalone-mode');
    } else {
      document.body.classList.remove('verify-standalone-mode');
    }

    // Update active nav button
    document.querySelectorAll('[data-nav]').forEach(el => {
      const navTarget = el.getAttribute('data-nav');
      if (navTarget === viewName || (viewName.startsWith('admin') && navTarget === 'admin-courses')) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    let html = '';

    switch (viewName) {
      case 'home':
        html = renderHomeView((r, p) => this.navigate(r, p));
        break;

      case 'register':
        html = renderRegisterView(params);
        break;

      case 'admin-courses':
        html = renderAdminCoursesView();
        break;

      case 'admin-students':
        html = renderAdminStudentsView();
        break;

      case 'admin-grading':
        html = renderAdminGradingView(params);
        break;

      case 'certificate':
        html = renderCertificateView(params);
        break;

      case 'verify':
        html = renderVerifyView(params);
        break;

      default:
        html = renderHomeView((r, p) => this.navigate(r, p));
        break;
    }

    if (this.appContainer) {
      this.appContainer.innerHTML = html;
      this.bindEvents(viewName, params);
    }
  }

  bindEvents(viewName, params) {
    const navCallback = (r, p) => this.navigate(r, p);
    const toastCallback = (msg, type) => this.showToast(msg, type);

    switch (viewName) {
      case 'home':
        initHomeEvents(navCallback);
        break;
      case 'register':
        initRegisterEvents(navCallback);
        break;
      case 'admin-courses':
        initAdminCoursesEvents(navCallback, toastCallback);
        break;
      case 'admin-students':
        initAdminStudentsEvents(navCallback, toastCallback);
        break;
      case 'admin-grading':
        initAdminGradingEvents(navCallback, toastCallback, params.targetStudentId);
        break;
      case 'certificate':
        initCertificateEvents(navCallback, toastCallback, params.studentId);
        break;
      case 'verify':
        initVerifyEvents(navCallback, toastCallback, params);
        break;
    }
  }

  showToast(message, type = 'info', duration = 3800) {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    if (type === 'gold') icon = '🏆';

    toast.innerHTML = `
      <span style="font-size: 18px;">${icon}</span>
      <span style="flex-grow: 1;">${message}</span>
    `;

    this.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastFadeOut 0.3s forwards';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Instantiate router when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppRouter();
});

