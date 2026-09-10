/**
 * Smart Library Frontend Application Controller
 * Handles Split-Screen Login, 2 Main Dashboard Options (Study in Library & Borrow Book),
 * 15 Categories & 100+ Subjects, Exact Book Location Cards, and Admin CRUD.
 */

class SmartLibraryApp {
  constructor() {
    this.currentUser = null;
    this.categories = [];
    this.selectedCategoryId = null;
    this.selectedSubject = "Python";
    this.currentView = "borrow"; // 'borrow', 'study', 'loans', 'admin'
    this.searchQuery = "";
    this.floorFilter = "all";
    this.availabilityFilter = "all";
    this.currentBooksList = [];
    this.isAuthenticated = false;

    this.init();
  }

  async init() {
    await this.checkAuth();
    await this.fetchCategories();
    this.render();
    this.setupGlobalEvents();
  }

  async checkAuth() {
    try {
      const res = await fetch("/api/auth/current");
      const data = await res.json();
      if (data && data.user) {
        this.currentUser = data.user;
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    } catch (e) {
      this.isAuthenticated = false;
    }
  }

  async fetchCategories() {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      this.categories = data.categories || [];
      if (this.categories.length > 0 && !this.selectedCategoryId) {
        this.selectedCategoryId = this.categories[0].id;
        if (this.categories[0].subjects && this.categories[0].subjects.length > 0) {
          this.selectedSubject = this.categories[0].subjects[0];
        }
      }
    } catch (e) {
      console.error("Categories fetch error:", e);
    }
  }

  setupGlobalEvents() {
    window.onRackClick = async (rackNo) => {
      try {
        const res = await fetch(`/api/books?query=rack ${rackNo}`);
        const data = await res.json();
        const matchingBooks = data.books || [];
        if (matchingBooks.length > 0) {
          this.showRackInfoModal(rackNo, matchingBooks);
        } else {
          this.showToast(`Rack #${rackNo} has no books matching current search.`, 'info');
        }
      } catch (e) {
        console.error(e);
      }
    };
  }

  showRackInfoModal(rackNo, books) {
    const modal = document.getElementById('rack-detail-modal');
    const content = document.getElementById('rack-detail-content');
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="p-6 bg-white border border-slate-200 rounded-3xl text-slate-800 shadow-2xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span class="text-2xl p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">🗄️</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Rack #${rackNo} Catalog</h3>
              <p class="text-xs text-blue-600 font-medium">${books[0]?.floor_number || 'Library Rack'} • ${books.length} Titles Shelved</p>
            </div>
          </div>
          <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">✕</button>
        </div>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          ${books.map(b => `
            <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:border-blue-300 transition-colors">
              <div>
                <h4 class="font-bold text-sm text-slate-900">${b.book_name || b.title}</h4>
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span>✍️ ${b.author}</span>
                  <span>•</span>
                  <span class="text-blue-700 font-mono font-bold">${b.shelf_number || `Shelf ${b.shelf}`}</span>
                  <span>•</span>
                  <span class="${b.status === 'Available' ? 'text-emerald-600' : 'text-rose-600'} font-bold">
                    ${b.status} (${b.available_copies}/${b.total_copies})
                  </span>
                </div>
              </div>
              <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden'); window.app.openBookLocator(${b.id})" 
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold whitespace-nowrap">
                Locate
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    modal.classList.remove('hidden');
  }

  render() {
    const root = document.getElementById("app-root");
    if (!root) return;

    if (!this.isAuthenticated) {
      this.renderSplitLogin(root);
    } else {
      this.renderMainDashboard(root);
    }
  }

  // =========================================================================
  // 1. SPLIT-SCREEN LOGIN PAGE
  // =========================================================================
  renderSplitLogin(container) {
    container.innerHTML = `
      <div class="login-split-container w-full min-h-screen bg-white flex flex-col lg:flex-row">
        
        <!-- LEFT SIDE: Branding, Graphics & Welcome Message -->
        <div class="lg:w-1/2 bg-slate-900 text-white p-8 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <!-- Top Brand -->
          <div class="flex items-center gap-3 z-10">
            <div class="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-500/30">
              🏛️
            </div>
            <div>
              <h2 class="text-xl font-black tracking-tight">SMART LIBRARY</h2>
              <p class="text-xs text-blue-400 font-medium tracking-wide">Campus Book Locator System</p>
            </div>
          </div>

          <!-- Middle Hero Text & Illustration -->
          <div class="my-10 z-10 max-w-lg">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-300 text-xs font-semibold mb-4">
              <span>📍 Exact Book Navigation</span>
              <span>•</span>
              <span>4 Floors & Racks 1-100</span>
            </div>

            <h1 class="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Smart Library Book Locator & Management System
            </h1>

            <p class="text-sm text-slate-300 mt-4 leading-relaxed">
              Quickly discover and locate books inside the library without manual searching. Get real-time Floor Number, Rack Number, Shelf Number, and Availability Status instantly.
            </p>

            <!-- Features Grid -->
            <div class="grid grid-cols-2 gap-3 mt-8 text-xs text-slate-200">
              <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span class="text-lg">👨‍🎓</span>
                <div>
                  <b class="text-white block">Student Access</b>
                  <span class="text-slate-400">14 Days Loan Limit</span>
                </div>
              </div>
              <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span class="text-lg">👨‍🏫</span>
                <div>
                  <b class="text-white block">Faculty Access</b>
                  <span class="text-slate-400">30 Days Loan Limit</span>
                </div>
              </div>
              <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span class="text-lg">🗺️</span>
                <div>
                  <b class="text-white block">Interactive Maps</b>
                  <span class="text-slate-400">Floor & Shelf Elevation</span>
                </div>
              </div>
              <div class="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span class="text-lg">🪑</span>
                <div>
                  <b class="text-white block">Study Entry</b>
                  <span class="text-slate-400">Direct Free Seating</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Quote -->
          <div class="z-10 text-xs text-slate-400 pt-6 border-t border-slate-800">
            © 2026 Smart Library System. Python (Flask) + MySQL Full-Stack Web Application.
          </div>
        </div>

        <!-- RIGHT SIDE: Modern Clean Login Form Card -->
        <div class="lg:w-1/2 bg-slate-50 p-8 lg:p-16 flex items-center justify-center">
          <div class="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
            
            <div class="mb-6">
              <h3 class="text-2xl font-black text-slate-900">Sign In to Your Account</h3>
              <p class="text-xs text-slate-500 mt-1">Select your user role and enter your institutional ID card number.</p>
            </div>

            <!-- Role Selector Tabs -->
            <div class="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 mb-5 text-xs font-bold" id="login-role-tabs">
              <button onclick="window.app.setLoginRole('Student')" id="tab-student" 
                      class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5">
                <span>👨‍🎓</span> Student
              </button>
              <button onclick="window.app.setLoginRole('Faculty')" id="tab-faculty" 
                      class="flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                <span>👨‍🏫</span> Faculty
              </button>
              <button onclick="window.app.setLoginRole('Admin')" id="tab-admin" 
                      class="flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5">
                <span>🛡️</span> Admin
              </button>
            </div>

            <!-- Login Form -->
            <form onsubmit="window.app.handleLoginSubmit(event)" class="space-y-3.5">
              <input type="hidden" id="login-selected-role" value="Student" />

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Full Name
                </label>
                <div class="relative">
                  <input type="text" id="login-name-input" 
                         placeholder="Enter your name (e.g. Syed)" 
                         class="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-xs lg:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition-all" />
                  <span class="absolute right-3.5 top-2.5 text-slate-400 text-sm">👤</span>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" id="login-id-label">
                  Student Roll Number (241FA18001 - 241FA18700)
                </label>
                <div class="relative">
                  <input type="text" id="login-card-input" required 
                         placeholder="e.g. 241FA18001" 
                         value="241FA18001"
                         class="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-xs lg:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition-all uppercase" />
                  <span class="absolute right-3.5 top-2.5 text-slate-400 text-sm">💳</span>
                </div>
              </div>

              <div id="login-password-group" class="hidden">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input type="password" id="login-password-input" 
                       placeholder="Enter password (admin123 for admin)" 
                       class="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-xs lg:text-sm font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition-all" />
              </div>

              <button type="submit" 
                      class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2">
                <span>Sign In & Open Dashboard</span>
                <span>→</span>
              </button>
            </form>

            <!-- 1-Click Quick Demo Accounts -->
            <div class="mt-5 pt-4 border-t border-slate-100">
              <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick 1-Click Demo Profiles:
                </span>
                <span class="text-[10px] text-blue-600 font-semibold font-mono">Roll: 241FA18001-700 | Faculty: 1001-2001</span>
              </div>
              <div class="grid grid-cols-3 gap-2.5 text-center text-xs">
                <button onclick="window.app.quickLoginDemo('241FA18001', 'Student', '')" 
                        class="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 font-semibold text-slate-700 transition-all">
                  👨‍🎓 Student<br><span class="text-[10px] text-slate-500 font-mono">241FA18001</span>
                </button>
                <button onclick="window.app.quickLoginDemo('1001', 'Faculty', '')" 
                        class="p-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 font-semibold text-slate-700 transition-all">
                  👨‍🏫 Faculty<br><span class="text-[10px] text-slate-500 font-mono">1001</span>
                </button>
                <button onclick="window.app.quickLoginDemo('ADMIN-001', 'Admin', '')" 
                        class="p-2.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:border-purple-300 border border-slate-200 font-semibold text-slate-700 transition-all">
                  🛡️ Admin<br><span class="text-[10px] text-slate-500 font-mono">admin123</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  setLoginRole(role) {
    document.getElementById("login-selected-role").value = role;
    
    const tabStudent = document.getElementById("tab-student");
    const tabFaculty = document.getElementById("tab-faculty");
    const tabAdmin = document.getElementById("tab-admin");
    const label = document.getElementById("login-id-label");
    const input = document.getElementById("login-card-input");
    const passGroup = document.getElementById("login-password-group");
    const nameInput = document.getElementById("login-name-input");

    // Reset styles
    [tabStudent, tabFaculty, tabAdmin].forEach(t => {
      t.className = "flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5";
    });

    if (role === "Student") {
      tabStudent.className = "flex-1 py-2.5 rounded-xl bg-blue-600 text-white shadow-sm transition-all flex items-center justify-center gap-1.5";
      label.innerText = "Student Roll Number (241FA18001 - 241FA18700)";
      input.value = "241FA18001";
      input.placeholder = "e.g. 241FA18001 to 241FA18700";
      if (nameInput) nameInput.placeholder = "Enter your student name (e.g. Syed)";
      passGroup.classList.add("hidden");
    } else if (role === "Faculty") {
      tabFaculty.className = "flex-1 py-2.5 rounded-xl bg-amber-500 text-white shadow-sm transition-all flex items-center justify-center gap-1.5";
      label.innerText = "Faculty ID Number (1001 - 2001)";
      input.value = "1001";
      input.placeholder = "e.g. 1001 to 2001";
      if (nameInput) nameInput.placeholder = "Enter your faculty name (e.g. Prof. Syed)";
      passGroup.classList.add("hidden");
    } else {
      tabAdmin.className = "flex-1 py-2.5 rounded-xl bg-slate-900 text-white shadow-sm transition-all flex items-center justify-center gap-1.5";
      label.innerText = "Admin Username";
      input.value = "admin";
      input.placeholder = "admin";
      passGroup.classList.remove("hidden");
    }
  }

  async handleLoginSubmit(event) {
    event.preventDefault();
    const role = document.getElementById("login-selected-role").value;
    const cardId = document.getElementById("login-card-input").value.trim();
    const name = document.getElementById("login-name-input") ? document.getElementById("login-name-input").value.trim() : "";
    const password = document.getElementById("login-password-input") ? document.getElementById("login-password-input").value.trim() : "";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId, role: role, name: name, username: cardId, password: password })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        this.isAuthenticated = true;
        this.currentView = "borrow";
        this.showToast(data.message, "success");
        this.render();
      } else {
        this.showToast(data.message || "Invalid credentials", "error");
      }
    } catch (e) {
      this.showToast("Login connection error", "error");
    }
  }

  async quickLoginDemo(cardId, role, defaultName = "") {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId, role: role, name: defaultName, username: cardId === "ADMIN-001" ? "admin" : cardId, password: "admin123" })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        this.isAuthenticated = true;
        this.currentView = "borrow";
        this.showToast(data.message, "success");
        this.render();
      } else {
        this.showToast(data.message || "Login failed", "error");
      }
    } catch (e) {
      this.showToast("Login connection error", "error");
    }
  }

  openChangeNameModal() {
    const modal = document.getElementById("rack-detail-modal");
    const content = document.getElementById("rack-detail-content");
    if (!modal || !content) return;

    const user = this.currentUser;

    content.innerHTML = `
      <div class="p-6 bg-white border border-slate-200 rounded-3xl text-slate-800 shadow-2xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-200">✏️</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Change Your Profile Name</h3>
              <p class="text-xs text-slate-500">ID: <span class="font-mono font-bold text-blue-700">${user.id}</span> (${user.role})</p>
            </div>
          </div>
          <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">✕</button>
        </div>

        <form onsubmit="window.app.saveNewName(event)" class="space-y-4 text-xs">
          <div>
            <label class="block text-slate-700 font-bold mb-1.5 uppercase tracking-wider">Your Full Name *</label>
            <input type="text" id="change-profile-name-input" required 
                   value="${user.name || ''}" 
                   placeholder="Enter your name (e.g. Syed)" 
                   class="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 text-sm font-semibold focus:border-blue-600 focus:bg-white focus:outline-none" />
          </div>

          <div class="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <button type="button" onclick="document.getElementById('rack-detail-modal').classList.add('hidden')" 
                    class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/25">
              Save Name
            </button>
          </div>
        </form>
      </div>
    `;

    modal.classList.remove("hidden");
    setTimeout(() => {
      const inp = document.getElementById("change-profile-name-input");
      if (inp) inp.focus();
    }, 100);
  }

  async saveNewName(event) {
    event.preventDefault();
    const newName = document.getElementById("change-profile-name-input").value.trim();
    if (!newName) return;

    try {
      const res = await fetch("/api/auth/update-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        document.getElementById("rack-detail-modal").classList.add("hidden");
        await this.checkAuth();
        this.render();
      } else {
        this.showToast(data.message || "Failed to update name", "error");
      }
    } catch (e) {
      this.showToast("Failed to update name", "error");
    }
  }

  async logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      this.currentUser = null;
      this.isAuthenticated = false;
      this.render();
      this.showToast("Signed out successfully", "info");
    } catch (e) {
      this.isAuthenticated = false;
      this.render();
    }
  }

  // =========================================================================
  // 2. MAIN APPLICATION DASHBOARD (Navy Navbar, 2 Main Options)
  // =========================================================================
  renderMainDashboard(container) {
    const user = this.currentUser;
    const isStudent = user.role === "Student";
    const isFaculty = user.role === "Faculty";
    const isAdmin = user.role === "Admin";

    container.innerHTML = `
      <div class="min-h-screen bg-white flex flex-col">
        
        <!-- NAVY BLUE NAVBAR (#0F172A) -->
        <header class="navbar-navy sticky top-0 z-40 shadow-lg">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <!-- Brand -->
            <div class="flex items-center gap-3 cursor-pointer" onclick="window.app.setView('borrow')">
              <div class="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl shadow-md">
                🏛️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h1 class="text-lg font-black text-white tracking-tight">SMART LIBRARY</h1>
                  <span class="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-blue-900 text-blue-300 rounded border border-blue-700">
                    LOCATOR
                  </span>
                </div>
                <p class="text-[11px] text-slate-400 font-medium">Campus Book Locator & Management</p>
              </div>
            </div>

            <!-- Navigation Tabs -->
            <nav class="hidden md:flex items-center gap-2">
              <button onclick="window.app.setView('borrow')" 
                      class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        this.currentView === 'borrow' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }">
                📖 Borrow a Book
              </button>

              <button onclick="window.app.setView('study')" 
                      class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        this.currentView === 'study' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }">
                🪑 Study in Library
              </button>

              <button onclick="window.app.setView('loans')" 
                      class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        this.currentView === 'loans' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                      }">
                📚 My Loans (${user.active_loans || 0}/${user.max_books || 3})
              </button>

              ${isAdmin ? `
                <button onclick="window.app.setView('admin')" 
                        class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          this.currentView === 'admin' ? 'bg-blue-600 text-white shadow' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                        }">
                  🛡️ Admin Panel
                </button>
              ` : ''}
            </nav>

            <!-- User Profile & Sign Out -->
            <div class="flex items-center gap-3">
              <!-- Clickable Profile Chip with Edit Name -->
              <div onclick="window.app.openChangeNameModal()" 
                   class="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700 hover:border-blue-400 cursor-pointer transition-all group"
                   title="Click to Change Your Name">
                <span class="text-xl">${user.avatar || '👨‍🎓'}</span>
                <div class="text-left hidden sm:block">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">${user.name}</span>
                    <span class="text-[10px] text-blue-400 group-hover:inline opacity-75">✏️</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isFaculty ? 'bg-amber-500 text-slate-950 font-black' : (isAdmin ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white')
                    }">
                      ${user.role} (${user.loan_duration_days}d)
                    </span>
                  </div>
                  <p class="text-[10px] text-slate-400 font-mono">ID: ${user.id}</p>
                </div>
              </div>

              <button onclick="window.app.logout()" 
                      class="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all" title="Sign Out">
                🚪 Exit
              </button>
            </div>
          </div>
        </header>

        <!-- MAIN VIEW CONTAINER -->
        <main id="main-content" class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <!-- Dynamically populated below -->
        </main>

        <!-- FOOTER -->
        <footer class="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-center text-xs">
          <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© 2026 Smart Library Book Locator & Management System. Python (Flask) + MySQL.</p>
            <div class="flex items-center gap-2 text-[11px]">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>4 Floors • Racks 1-100 • Numbered Shelves 1-5</span>
            </div>
          </div>
        </footer>

      </div>
    `;

    this.renderCurrentView();
  }

  setView(viewName) {
    this.currentView = viewName;
    this.render();
  }

  async renderCurrentView() {
    const main = document.getElementById("main-content");
    if (!main) return;

    if (this.currentView === "study") {
      this.renderStudyView(main);
    } else if (this.currentView === "borrow") {
      await this.renderBorrowView(main);
    } else if (this.currentView === "loans") {
      await this.renderLoansView(main);
    } else if (this.currentView === "admin") {
      await this.renderAdminView(main);
    }
  }

  // =========================================================================
  // OPTION 1: STUDY IN LIBRARY (Direct Free Entry, No Seat Reservation)
  // =========================================================================
  renderStudyView(container) {
    const user = this.currentUser;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Two Main Dashboard Cards -->
        ${this.renderTopTwoOptionCards('study')}

        <!-- Study in Library Content Card -->
        <div class="card-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto">
          <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 border border-blue-100 shadow-inner">
            🪑
          </div>

          <h2 class="text-2xl font-black text-slate-900">Study in Library</h2>
          <p class="text-xs lg:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Direct entry to the campus library. <b>No seat reservation or reading space reservation is needed</b>. You can directly go inside and choose any available seat across all 4 floors.
          </p>

          <!-- 4 Floors Overview -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left text-xs">
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <b class="text-blue-700 block">Ground Floor</b>
              <span class="text-slate-500 text-[11px]">GK & Magazines Lounge</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <b class="text-blue-700 block">First Floor</b>
              <span class="text-slate-500 text-[11px]">Programming & Engineering</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <b class="text-blue-700 block">Second Floor</b>
              <span class="text-slate-500 text-[11px]">Science, Commerce & Medical</span>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <b class="text-blue-700 block">Third Floor</b>
              <span class="text-slate-500 text-[11px]">Polity, English, History & Novels</span>
            </div>
          </div>

          <!-- Enter Library Button -->
          <button onclick="window.app.enterLibraryForStudy()" 
                  class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2">
            <span>🚪</span>
            <span>Enter Library (Generate Digital Pass)</span>
          </button>
        </div>

      </div>
    `;
  }

  async enterLibraryForStudy() {
    try {
      const res = await fetch("/api/study/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        this.showStudyPassModal(data.entry);
      }
    } catch (e) {
      this.showToast("Could not record entry", "error");
    }
  }

  showStudyPassModal(entry) {
    const modal = document.getElementById("study-pass-modal");
    const content = document.getElementById("study-pass-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="bg-white border-2 border-blue-600 rounded-3xl p-6 shadow-2xl relative">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🏛️</span>
            <div>
              <h3 class="font-extrabold text-slate-900 text-base">CENTRAL LIBRARY STUDY PASS</h3>
              <p class="text-xs text-blue-600 font-mono">PASS ID: ${entry.pass_code}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
            AUTHORIZED
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 my-4 text-xs">
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">User Name</span>
            <span class="text-xs font-bold text-slate-800 block mt-0.5">${entry.user_name}</span>
            <span class="text-[11px] text-slate-500">${entry.user_type} (${entry.user_id_code})</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Seating Policy</span>
            <span class="text-xs font-bold text-blue-700 block mt-0.5">Free Choice Seating</span>
            <span class="text-[11px] text-slate-500">Any Available Seat (All 4 Floors)</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Department</span>
            <span class="text-xs font-bold text-slate-800 block mt-0.5">${entry.department}</span>
          </div>
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Entry Time</span>
            <span class="text-xs font-bold text-slate-800 block mt-0.5">${entry.entry_time}</span>
          </div>
        </div>

        <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs text-slate-600 my-4">
          <p class="font-bold text-slate-800 mb-1">Library Guidelines:</p>
          <p>• Please choose any open study desk on Ground, 1st, 2nd, or 3rd Floor.</p>
          <p>• Maintain a quiet study environment.</p>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
            🖨️ Print Pass
          </button>
          <button onclick="document.getElementById('study-pass-modal').classList.add('hidden')" 
                  class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
            Done
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  // =========================================================================
  // OPTION 2: BORROW A BOOK (Category -> Subject -> Book Details Location)
  // =========================================================================
  async renderBorrowView(container) {
    const activeCat = this.categories.find(c => c.id === this.selectedCategoryId) || this.categories[0] || {};
    
    // Fetch filtered books
    let url = `/api/books?category_id=${this.selectedCategoryId || ''}&subcategory=${encodeURIComponent(this.selectedSubject || '')}`;
    if (this.searchQuery) {
      url = `/api/books?query=${encodeURIComponent(this.searchQuery)}`;
    }
    if (this.floorFilter !== "all") {
      url += `&floor=${encodeURIComponent(this.floorFilter)}`;
    }
    if (this.availabilityFilter === "available") {
      url += `&available_only=true`;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      this.currentBooksList = data.books || [];
    } catch (e) {
      this.currentBooksList = [];
    }

    const books = this.currentBooksList;

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Two Main Dashboard Cards -->
        ${this.renderTopTwoOptionCards('borrow')}

        <!-- Live Search Bar -->
        <div class="card-light p-5 rounded-3xl border border-slate-200">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
                🔍 Search Books by Title, Author, Category, Subject, Rack # or Floor
              </span>
              <h3 class="text-xl font-black text-slate-900">Search & Locate Books</h3>
            </div>

            <div class="w-full md:w-96 relative">
              <input type="text" 
                     placeholder="Search Python Programming, Reema Thareja, Rack 16..." 
                     value="${this.searchQuery}"
                     oninput="window.app.onSearch(this.value)"
                     class="w-full bg-white border-2 border-slate-300 focus:border-blue-600 text-slate-900 rounded-2xl pl-11 pr-10 py-3 text-xs lg:text-sm font-medium focus:outline-none transition-all shadow-sm" />
              <span class="absolute left-4 top-3 text-slate-400 text-base">🔍</span>
              ${this.searchQuery ? `
                <button onclick="window.app.onSearch('')" class="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 text-sm">✕</button>
              ` : ''}
            </div>
          </div>

          <!-- Floor Filter Buttons -->
          <div class="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-200 text-xs">
            <span class="text-slate-500 font-bold">Filter By Floor:</span>
            
            <button onclick="window.app.setFloorFilter('all')" class="px-3 py-1 rounded-xl font-semibold transition-all ${this.floorFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              All Floors
            </button>
            <button onclick="window.app.setFloorFilter('Ground')" class="px-3 py-1 rounded-xl font-semibold transition-all ${this.floorFilter === 'Ground' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              Ground Floor (GK & Magazines)
            </button>
            <button onclick="window.app.setFloorFilter('First')" class="px-3 py-1 rounded-xl font-semibold transition-all ${this.floorFilter === 'First' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              First Floor (Programming, Math & Engineering)
            </button>
            <button onclick="window.app.setFloorFilter('Second')" class="px-3 py-1 rounded-xl font-semibold transition-all ${this.floorFilter === 'Second' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              Second Floor (Science, Commerce & Medical)
            </button>
            <button onclick="window.app.setFloorFilter('Third')" class="px-3 py-1 rounded-xl font-semibold transition-all ${this.floorFilter === 'Third' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}">
              Third Floor (Polity, English, History, Exams & Novels)
            </button>
          </div>
        </div>

        ${!this.searchQuery ? `
          <!-- 15 BOOK CATEGORIES (4 Floors Allocation) -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-extrabold text-sm text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>📚 1. Select Book Category (${this.categories.length} Categories)</span>
              </h3>
              <span class="text-xs text-slate-500">Click any category</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              ${this.categories.map((cat, idx) => {
                const isSelected = cat.id === activeCat.id;
                return `
                  <div onclick="window.app.selectCategory(${cat.id})" 
                       class="cursor-pointer p-4 rounded-2xl border transition-all ${
                         isSelected 
                           ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-400/30 text-blue-900 shadow-md' 
                           : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:shadow-sm'
                       }">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-2xl p-1.5 rounded-xl bg-slate-100">${cat.icon}</span>
                      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-600'}">
                        ${cat.floor_number ? cat.floor_number.replace(' Floor', '') : 'Floor'}
                      </span>
                    </div>
                    <h4 class="font-bold text-xs line-clamp-1">${idx + 1}. ${cat.name}</h4>
                    <p class="text-[11px] text-slate-500 mt-1">${cat.subjects ? cat.subjects.length : 0} Subjects</p>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- SUBJECT / SUBCATEGORY SELECTOR -->
          <div class="card-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">${activeCat.icon || '📖'}</span>
                <div>
                  <h4 class="font-bold text-slate-900 text-sm">2. Select Subject in ${activeCat.name || 'Category'}</h4>
                  <span class="text-xs text-blue-600 font-semibold">${activeCat.floor_number || 'First Floor'} • ${activeCat.default_racks || 'Racks 1-100'}</span>
                </div>
              </div>
              <span class="text-xs text-slate-400 font-medium">${activeCat.subjects ? activeCat.subjects.length : 0} Subjects Available</span>
            </div>

            <!-- Subject Pills -->
            <div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
              ${(activeCat.subjects || []).map(subject => {
                const isSubSelected = subject === this.selectedSubject;
                return `
                  <button onclick="window.app.selectSubject('${subject}')" 
                          class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSubSelected 
                              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300/40' 
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }">
                    ${subject}
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- BOOKS RESULTS GRID WITH EXACT PHYSICAL LOCATION -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <h3 class="font-black text-slate-900 text-base lg:text-lg">
                ${this.searchQuery ? `Search Results for "${this.searchQuery}"` : `${this.selectedSubject} Books & Locations`}
              </h3>
              <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-blue-700 text-xs font-bold border border-slate-200">
                ${books.length} Books Found
              </span>
            </div>
            ${this.searchQuery ? `
              <button onclick="window.app.onSearch('')" class="text-xs text-blue-600 hover:underline font-bold">
                Clear Search & View Categories
              </button>
            ` : ''}
          </div>

          ${books.length === 0 ? `
            <div class="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
              <span class="text-5xl block mb-2">🔍</span>
              <h4 class="text-base font-bold text-slate-800">No books found</h4>
              <p class="text-xs text-slate-500 mt-1">Try changing your search query or selecting another subject.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              ${books.map(book => this.renderBookCard(book)).join('')}
            </div>
          `}
        </div>

      </div>
    `;
  }

  renderTopTwoOptionCards(activeOption) {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Option 1: Study in Library -->
        <div onclick="window.app.setView('study')" 
             class="cursor-pointer p-6 rounded-3xl transition-all ${
               activeOption === 'study'
                 ? 'bg-blue-50/80 border-2 border-blue-600 shadow-md'
                 : 'card-light hover:border-blue-300'
             }">
          <div class="flex items-center justify-between mb-2">
            <span class="text-3xl p-2.5 rounded-2xl bg-blue-100 text-blue-700">🪑</span>
            <span class="text-xs font-bold px-3 py-1 rounded-full ${
              activeOption === 'study' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }">
              ${activeOption === 'study' ? 'Active Selection ✓' : 'Option 1 →'}
            </span>
          </div>
          <h3 class="text-lg font-black text-slate-900 mt-1">Study in Library</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter the library for self-study. No seat reservation needed. Directly walk in and choose any available seat across all 4 floors.
          </p>
        </div>

        <!-- Option 2: Borrow a Book -->
        <div onclick="window.app.setView('borrow')" 
             class="cursor-pointer p-6 rounded-3xl transition-all ${
               activeOption === 'borrow'
                 ? 'bg-blue-50/80 border-2 border-blue-600 shadow-md'
                 : 'card-light hover:border-blue-300'
             }">
          <div class="flex items-center justify-between mb-2">
            <span class="text-3xl p-2.5 rounded-2xl bg-blue-100 text-blue-700">📖</span>
            <span class="text-xs font-bold px-3 py-1 rounded-full ${
              activeOption === 'borrow' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
            }">
              ${activeOption === 'borrow' ? 'Active Selection ✓' : 'Option 2 →'}
            </span>
          </div>
          <h3 class="text-lg font-black text-slate-900 mt-1">Borrow a Book</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">
            Browse 15 categories, select subject (e.g. Python), and locate exact Floor, Rack (1-100), Shelf (1-5), and Availability.
          </p>
        </div>
      </div>
    `;
  }

  // Exact Book Details Card
  renderBookCard(book) {
    const isBorrowedByMe = (this.currentUser?.borrowed_book_ids || []).includes(book.id);
    const isAvailable = book.status === "Available";
    const loanDuration = this.currentUser.loan_duration_days || (this.currentUser.role === 'Faculty' ? 30 : 14);

    let statusBadge = isAvailable 
      ? `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">● ${book.status}</span>`
      : `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">○ Not Available</span>`;
    
    if (isBorrowedByMe) {
      statusBadge = `<span class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">✓ Borrowed by You</span>`;
    }

    return `
      <div class="card-white p-5 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-lg flex flex-col justify-between transition-all duration-200 ${isBorrowedByMe ? 'ring-2 ring-blue-500/30 bg-blue-50/20' : ''}">
        <div>
          <!-- Header Badge -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <span class="px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-600">
              ${book.subject || book.subcategory || 'Reference'}
            </span>
            ${statusBadge}
          </div>

          <!-- Book Title & Author -->
          <h4 class="font-extrabold text-base text-slate-900 leading-snug line-clamp-2">
            ${book.book_name || book.title}
          </h4>
          <p class="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>✍️</span> <span>Author: <b>${book.author}</b></span>
          </p>

          <!-- EXACT LOCATION BLUEPRINT (Floor, Rack 1-100, Shelf 1-5, Book ID) -->
          <div class="my-4 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80">
            <div class="flex items-center justify-between text-[11px] font-extrabold text-blue-900 uppercase tracking-wider mb-2">
              <span>📍 EXACT BOOK LOCATION</span>
              <span class="text-amber-600 font-mono font-bold">ID: ${book.book_id || book.book_code}</span>
            </div>
            
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 rounded-xl bg-white border border-slate-200">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Floor</span>
                <span class="font-black text-slate-900 text-xs mt-0.5">${book.floor_number || book.floor}</span>
              </div>
              <div class="p-2 rounded-xl bg-blue-100/70 border border-blue-300">
                <span class="block text-[10px] text-blue-800 uppercase font-bold">Rack #</span>
                <span class="font-black text-blue-700 text-sm mt-0.5">${book.rack_number || book.rack}</span>
              </div>
              <div class="p-2 rounded-xl bg-white border border-slate-200">
                <span class="block text-[10px] text-slate-400 uppercase font-semibold">Shelf</span>
                <span class="font-black text-slate-900 text-xs mt-0.5">${book.shelf_number || `Shelf ${book.shelf}`}</span>
              </div>
            </div>
          </div>

          <div class="text-[11px] text-slate-500 flex items-center justify-between py-1 border-t border-slate-100 mb-3">
            <span>Copies: <b>${book.available_copies} of ${book.total_copies} Available</b></span>
            <span class="text-blue-600 font-semibold font-mono">⏱️ ${loanDuration} Days Duration</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2 pt-2">
          <button onclick="window.app.openBookLocator(${book.id})" 
                  class="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-slate-200 transition-all">
            <span>🗺️</span>
            <span>Locate on Map</span>
          </button>

          ${isBorrowedByMe ? `
            <button onclick="window.app.returnBook(${book.id})" 
                    class="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all">
              <span>↩️</span>
              <span>Return Book</span>
            </button>
          ` : (isAvailable ? `
            <button onclick="window.app.borrowBook(${book.id})" 
                    class="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-all">
              <span>📖</span>
              <span>Borrow Book</span>
            </button>
          ` : `
            <button class="flex-1 py-2.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed border border-slate-200" disabled>
              <span>○ Not Available</span>
            </button>
          `)}
        </div>
      </div>
    `;
  }

  async openBookLocator(bookId) {
    try {
      const res = await fetch(`/api/books/${bookId}`);
      const data = await res.json();
      const book = data.book;
      if (!book) return;

      const modal = document.getElementById("locator-modal");
      const headerTitle = document.getElementById("locator-modal-title");
      const badgeContainer = document.getElementById("locator-book-badge");

      if (!modal) return;

      headerTitle.innerHTML = `
        <div class="flex items-center gap-2">
          <span>Locating: <b class="text-slate-900">${book.book_name || book.title}</b></span>
        </div>
      `;

      badgeContainer.innerHTML = `
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <span class="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl font-bold font-mono">
            Book ID: ${book.book_id || book.book_code}
          </span>
          <span class="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl font-bold">
            ${book.floor_number}
          </span>
          <span class="px-3 py-1 bg-blue-600 text-white rounded-xl font-black">
            Rack #${book.rack_number}
          </span>
          <span class="px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-black">
            ${book.shelf_number || `Shelf ${book.shelf}`}
          </span>
          <span class="px-3 py-1 ${book.status === 'Available' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'} border rounded-xl font-bold">
            Status: ${book.status}
          </span>
        </div>
      `;

      modal.classList.remove("hidden");
      window.locator.locateBook(book);
    } catch (e) {
      console.error(e);
    }
  }

  async borrowBook(bookId) {
    try {
      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        await this.checkAuth();
        this.renderCurrentView();
      } else {
        this.showToast(data.message || "Borrowing failed", "error");
        if (data.message && data.message.includes("Borrowing limit reached")) {
          this.showLimitReachedModal();
        }
      }
    } catch (e) {
      this.showToast("Server error during borrowing", "error");
    }
  }

  showLimitReachedModal() {
    const modal = document.getElementById("rack-detail-modal");
    const content = document.getElementById("rack-detail-content");
    if (!modal || !content) return;

    const user = this.currentUser;
    const maxBooks = user.max_books || (user.role === 'Faculty' ? 10 : 3);

    content.innerHTML = `
      <div class="p-6 bg-white border border-slate-200 rounded-3xl text-slate-800 shadow-2xl">
        <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <span class="text-3xl p-2 bg-amber-50 text-amber-600 rounded-2xl border border-amber-200">⚠️</span>
            <div>
              <h3 class="text-lg font-bold text-slate-900">Borrowing Limit Reached (${maxBooks} Books)</h3>
              <p class="text-xs text-slate-500">As a ${user.role}, you can hold up to ${maxBooks} books simultaneously.</p>
            </div>
          </div>
          <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden')" class="p-2 text-slate-400 hover:text-slate-700 rounded-lg">✕</button>
        </div>

        <p class="text-xs text-slate-600 mb-4 leading-relaxed">
          You currently have <b>${user.active_loans || maxBooks} books issued</b>. To borrow new books, you can return a book or reset your active loans below:
        </p>

        <div class="flex flex-col sm:flex-row gap-2.5">
          <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden'); window.app.returnAllBooks()" 
                  class="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md">
            <span>↩️</span>
            <span>Return All Books (Reset Limit)</span>
          </button>
          
          <button onclick="document.getElementById('rack-detail-modal').classList.add('hidden'); window.app.setView('loans')" 
                  class="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5">
            <span>📚</span>
            <span>View & Return in My Loans</span>
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }

  // =========================================================================
  // 3. MY LOANS VIEW
  // =========================================================================
  async renderLoansView(container) {
    const user = this.currentUser;
    let loans = [];
    try {
      const res = await fetch("/api/my-loans");
      const data = await res.json();
      loans = data.loans || [];
    } catch (e) {
      console.error(e);
    }

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- User Profile Summary Banner -->
        <div class="card-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl shadow-md">
              ${user.avatar || '👨‍🎓'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-black text-slate-900">${user.name}</h2>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  ${user.role}
                </span>
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${user.department} • ID: <span class="font-mono text-blue-700 font-bold">${user.id}</span></p>
            </div>
          </div>

          <div class="flex items-center gap-3 text-center">
            <div class="p-3 px-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="text-[11px] text-slate-400 block">Active Loans</span>
              <span class="text-lg font-bold text-blue-600">${loans.length} / ${user.max_books}</span>
            </div>
            <div class="p-3 px-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span class="text-[11px] text-slate-400 block">Loan Duration</span>
              <span class="text-lg font-bold text-slate-800">${user.loan_duration_days} Days</span>
            </div>
          </div>
        </div>

        <!-- Loans List -->
        <div>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h3 class="font-black text-slate-900 text-base">Active Borrowed Books (${loans.length})</h3>
            <div class="flex items-center gap-3">
              ${loans.length > 0 ? `
                <button onclick="window.app.returnAllBooks()" 
                        class="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                  <span>↩️</span>
                  <span>Return All Books (Reset Limit)</span>
                </button>
              ` : ''}
              <button onclick="window.app.setView('borrow')" class="text-xs text-blue-600 font-bold hover:underline">
                + Search & Borrow More
              </button>
            </div>
          </div>

          ${loans.length === 0 ? `
            <div class="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200">
              <span class="text-4xl block mb-2">📖</span>
              <h4 class="text-base font-bold text-slate-800">No active book loans</h4>
              <p class="text-xs text-slate-500 mt-1">Browse the library catalog to borrow books.</p>
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${loans.map(item => `
                <div class="card-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div class="flex justify-between items-start gap-2 mb-2">
                      <span class="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200 font-mono">
                        Book ID: ${item.book_code}
                      </span>
                      <span class="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                        Due: ${item.due_date}
                      </span>
                    </div>
                    <h4 class="font-bold text-base text-slate-900">${item.title || item.book_title}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">Author: ${item.author || 'Author'}</p>
                    
                    <div class="my-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span>Location: <b>${item.floor_number}</b>, <b>Rack ${item.rack_number}</b>, <b>${item.shelf_code}</b></span>
                      <span class="text-slate-400">Issued: ${item.borrow_date}</span>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-slate-100">
                    <button onclick="window.app.returnBook(${item.book_id})" 
                            class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all">
                      ↩️ Return Book
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

      </div>
    `;
  }

  async returnBook(bookId) {
    try {
      const res = await fetch("/api/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        await this.checkAuth();
        this.renderCurrentView();
      } else {
        this.showToast(data.message, "error");
      }
    } catch (e) {
      this.showToast("Return failed", "error");
    }
  }

  async returnAllBooks() {
    try {
      const res = await fetch("/api/loans/return-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        await this.checkAuth();
        this.renderCurrentView();
      } else {
        this.showToast(data.message, "error");
      }
    } catch (e) {
      this.showToast("Return all failed", "error");
    }
  }

  // =========================================================================
  // 4. ADMIN PANEL (Add/Edit/Delete Books, Location & Status Management)
  // =========================================================================
  async renderAdminView(container) {
    let stats = {};
    let issued = [];
    try {
      const [resStats, resIssued] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/issued").then(r => r.json())
      ]);
      stats = resStats;
      issued = resIssued.issued || [];
    } catch (e) {
      console.error(e);
    }

    container.innerHTML = `
      <div class="space-y-6">
        
        <!-- Admin Dashboard Header Banner -->
        <div class="card-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-xs font-extrabold text-blue-600 uppercase tracking-wider block mb-1">
              🛡️ Administrator Management Console
            </span>
            <h2 class="text-2xl font-black text-slate-900">Manage Books & Locations</h2>
            <p class="text-xs text-slate-500 mt-1">Add new books, update floor/rack/shelf assignments, and manage catalog availability.</p>
          </div>

          <button onclick="window.app.openAddBookModal()" 
                  class="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md">
            <span>➕</span> Add New Book
          </button>
        </div>

        <!-- Metrics -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span class="text-xs text-slate-500">Total Book Titles</span>
            <span class="text-2xl font-black text-slate-900 block mt-1">${stats.total_books || 0}</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span class="text-xs text-slate-500">Total Copies</span>
            <span class="text-2xl font-black text-slate-900 block mt-1">${stats.total_copies || 0}</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span class="text-xs text-slate-500">Issued Books</span>
            <span class="text-2xl font-black text-amber-600 block mt-1">${stats.issued_copies || 0}</span>
          </div>
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span class="text-xs text-slate-500">Available on Shelves</span>
            <span class="text-2xl font-black text-emerald-600 block mt-1">${stats.available_copies || 0}</span>
          </div>
        </div>

        <!-- Issued Books Ledger -->
        <div class="card-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <h3 class="font-bold text-slate-900 text-sm">Active Issued Books Ledger (${issued.length})</h3>
            <span class="text-xs text-blue-600 font-mono font-bold">Circulation Log</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-700">
              <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th class="p-4">Book Title & ID</th>
                  <th class="p-4">Borrower Name & ID</th>
                  <th class="p-4">Role</th>
                  <th class="p-4">Location</th>
                  <th class="p-4">Borrow Date</th>
                  <th class="p-4">Due Date</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${issued.length === 0 ? `
                  <tr><td colspan="6" class="p-4 text-center text-slate-400">No active book loans at present.</td></tr>
                ` : issued.map(b => `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="p-4 font-bold text-slate-900">${b.book_title} <span class="block text-amber-700 font-mono font-normal">ID: ${b.book_code}</span></td>
                    <td class="p-4">${b.user_name} <span class="block text-slate-500 font-mono">${b.user_id_code}</span></td>
                    <td class="p-4"><span class="px-2 py-0.5 rounded ${b.user_type === 'Faculty' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'} font-bold">${b.user_type}</span></td>
                    <td class="p-4">${b.floor_number}, Rack ${b.rack_number}, ${b.shelf_code}</td>
                    <td class="p-4">${b.borrow_date}</td>
                    <td class="p-4 font-mono font-bold text-blue-700">${b.due_date}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }

  openAddBookModal() {
    const modal = document.getElementById("add-book-modal");
    if (modal) modal.classList.remove("hidden");
  }

  async saveNewBookFromForm(event) {
    event.preventDefault();
    const title = document.getElementById("new-book-title").value.trim();
    const author = document.getElementById("new-book-author").value.trim();
    const category_id = document.getElementById("new-book-category").value;
    const subcategory = document.getElementById("new-book-subject").value.trim();
    const floor = document.getElementById("new-book-floor").value;
    const rack = document.getElementById("new-book-rack").value;
    const shelf = document.getElementById("new-book-shelf").value;
    const copies = document.getElementById("new-book-copies").value;

    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author, category_id, subcategory, floor, rack, shelf, copies })
      });
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message, "success");
        document.getElementById("add-book-modal").classList.add("hidden");
        document.getElementById("add-book-form").reset();
        await this.fetchCategories();
        this.renderCurrentView();
      } else {
        this.showToast(data.message, "error");
      }
    } catch (e) {
      this.showToast("Failed to save book", "error");
    }
  }

  // Filter & Search Helpers
  selectCategory(catId) {
    this.selectedCategoryId = catId;
    const cat = this.categories.find(c => c.id === catId);
    if (cat && cat.subjects && cat.subjects.length > 0) {
      this.selectedSubject = cat.subjects[0];
    }
    this.searchQuery = "";
    this.renderCurrentView();
  }

  selectSubject(subjectName) {
    this.selectedSubject = subjectName;
    this.searchQuery = "";
    this.renderCurrentView();
  }

  onSearch(query) {
    this.searchQuery = query;
    this.renderCurrentView();
  }

  setFloorFilter(floor) {
    this.floorFilter = floor;
    this.renderCurrentView();
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    const bgColors = {
      success: "bg-emerald-600 text-white",
      error: "bg-rose-600 text-white",
      info: "bg-blue-600 text-white"
    };

    toast.className = `p-4 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-3 transform transition-all duration-300 translate-y-2 opacity-0 ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ️'}</span><span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.classList.remove("translate-y-2", "opacity-0"), 10);
    setTimeout(() => {
      toast.classList.add("opacity-0", "-translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new SmartLibraryApp();
});
