/**
 * Study Space & Reading Section Engine (Flask Backend API Client)
 * Single-click direct Study access with zero sub-options.
 * Interacts with /api/study/spaces and /api/study/reserve.
 */

class StudySpaceManager {
  constructor() {
    this.activePasses = [];
  }

  async loadMyPasses() {
    try {
      const res = await fetch("/api/study/my-passes");
      const data = await res.json();
      this.activePasses = data.passes || [];
    } catch (e) {
      console.error(e);
    }
  }

  async render(containerId = "study-view-container", currentUser) {
    const container = document.getElementById(containerId);
    if (!container) return;

    await this.loadMyPasses();

    let spaces = [];
    try {
      const res = await fetch("/api/study/spaces");
      const data = await res.json();
      spaces = data.spaces || [];
    } catch (e) {
      console.error(e);
    }

    container.innerHTML = `
      <div class="study-direct-wrapper space-y-6">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-700/80 shadow-2xl">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
                <span>🪑 CENTRAL LIBRARY STUDY SECTION</span>
              </div>
              <h2 class="text-2xl md:text-3xl font-black text-white">Study & Reading Space Section</h2>
              <p class="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
                Direct access to library reading spaces across Ground, 1st, 2nd, and 3rd floors. Click any floor below to instantly reserve a reading space.
              </p>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="p-3 px-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
                <span class="text-xs text-slate-400 block">Total Reading Desks</span>
                <span class="text-xl font-bold text-white">94 Seats</span>
              </div>
              <div class="p-3 px-5 bg-slate-950/80 rounded-2xl border border-slate-800 text-center">
                <span class="text-xs text-slate-400 block">Status</span>
                <span class="text-xl font-bold text-emerald-400">Open Now</span>
              </div>
            </div>
          </div>
        </div>

        ${this.activePasses.length > 0 ? `
          <!-- Active Study Passes Widget -->
          <div class="p-5 rounded-3xl bg-gradient-to-r from-sky-950/80 to-indigo-950/80 border border-sky-500/40 shadow-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-bold text-white text-sm flex items-center gap-2">
                <span>🎫 Your Active Study Space Passes (${this.activePasses.length})</span>
              </h3>
              <span class="text-xs text-sky-300 font-mono">Present pass at library turnstiles</span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${this.activePasses.map(b => `
                <div class="bg-slate-900/90 p-4 rounded-2xl border border-sky-900/60 flex items-center justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-black text-sky-300 text-base">Desk ${b.seat_number}</span>
                      <span class="text-xs bg-sky-950 text-sky-400 px-2 py-0.5 rounded font-bold">${b.floor_name}</span>
                    </div>
                    <p class="text-xs text-slate-300 mt-1">${b.user_type}: ${b.user_name} (${b.user_id_code})</p>
                    <p class="text-[11px] text-slate-400">Valid: Today (${b.time_slot})</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="window.studyManager.showPassModal('${b.pass_code}', '${b.seat_number}', '${b.floor_name}', '${b.user_name}', '${b.user_type}', '${b.user_id_code}')" 
                            class="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-md">
                      Show QR Pass
                    </button>
                    <button onclick="window.studyManager.cancelReservation(${b.id})" 
                            class="px-2.5 py-2 bg-slate-800 hover:bg-rose-950/80 text-rose-400 rounded-xl text-xs font-bold" title="Cancel Booking">
                      ✕
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 4 DIRECT FLOOR STUDY SPACES (1-CLICK DIRECT ACCESS) -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-black text-lg text-white flex items-center gap-2">
              <span>📍 Available Study Sections (All 4 Floors)</span>
            </h3>
            <span class="text-xs text-slate-400 font-mono">1-Click Instant Reservation</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${spaces.map(space => `
              <div class="study-card bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-sky-500/50 hover:shadow-2xl transition-all">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-center gap-3">
                      <span class="text-4xl p-2.5 bg-slate-800 rounded-2xl border border-slate-700">${space.icon}</span>
                      <div>
                        <span class="text-xs font-bold uppercase tracking-wider text-sky-400">${space.floor}</span>
                        <h4 class="font-bold text-white text-base leading-tight">${space.title}</h4>
                      </div>
                    </div>
                  </div>

                  <div class="my-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs">
                    <div class="flex justify-between items-center py-1 border-b border-slate-800">
                      <span class="text-slate-400">Atmosphere</span>
                      <span class="font-semibold text-white">${space.badge}</span>
                    </div>
                    <div class="flex justify-between items-center py-1 border-b border-slate-800">
                      <span class="text-slate-400">Features</span>
                      <span class="font-semibold text-slate-200">${space.features}</span>
                    </div>
                    <div class="flex justify-between items-center py-1">
                      <span class="text-slate-400">Available Desks</span>
                      <span class="font-bold text-emerald-400">${space.available} of ${space.total} Desks Free</span>
                    </div>
                  </div>
                </div>

                <div class="pt-2">
                  <button onclick="window.studyManager.directBookStudySpace('${space.floor}', ${space.id})" 
                          class="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all">
                    <span>🪑</span>
                    <span>Reserve Reading Space (${space.floor})</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Quick Info Banner -->
        <div class="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span>ℹ️</span>
            <span>Study spaces are open from <b>08:30 AM to 09:30 PM</b> daily for all students and faculty members.</span>
          </div>
          <button onclick="window.app.setView('borrow')" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl font-bold text-xs whitespace-nowrap">
            Switch to Borrow Book →
          </button>
        </div>
      </div>
    `;
  }

  async directBookStudySpace(floorName, floorId) {
    try {
      const res = await fetch("/api/study/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floor: floorName, floor_id: floorId })
      });
      const data = await res.json();
      if (data.success) {
        window.app.showToast(data.message, "success");
        const p = data.pass;
        this.showPassModal(p.pass_code, p.seat_number, p.floor_name, p.user_name, p.user_type, p.user_id_code);
        this.render("study-view-container");
      } else {
        window.app.showToast(data.message || "Reservation failed", "error");
      }
    } catch (e) {
      window.app.showToast("Server communication error", "error");
    }
  }

  async cancelReservation(passId) {
    if (confirm("Are you sure you want to cancel this study space reservation?")) {
      try {
        const res = await fetch("/api/study/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pass_id: passId })
        });
        const data = await res.json();
        if (data.success) {
          window.app.showToast(data.message, "info");
          this.render("study-view-container");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  showPassModal(passCode, seatNum, floorName, userName, userRole, userId) {
    const modal = document.getElementById("pass-modal");
    const content = document.getElementById("pass-modal-content");
    if (!modal || !content) return;

    content.innerHTML = `
      <div class="digital-pass-card bg-slate-900 border-2 border-sky-500 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div class="absolute -right-12 -top-12 w-36 h-36 bg-sky-500/20 rounded-full blur-2xl"></div>
        <div class="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div class="flex items-center gap-3">
            <span class="text-3xl">🏛️</span>
            <div>
              <h3 class="font-bold text-white text-base">CENTRAL LIBRARY STUDY PASS</h3>
              <p class="text-xs text-sky-400 font-mono">PASS ID: ${passCode}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded-full text-xs font-bold">
            ACTIVE FOR TODAY
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 my-4">
          <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Reserved Reading Desk</span>
            <span class="text-2xl font-black text-sky-400 block mt-0.5">Desk ${seatNum}</span>
          </div>
          <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Floor Location</span>
            <span class="text-base font-bold text-white block mt-0.5">${floorName}</span>
          </div>
          <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">User Details</span>
            <span class="text-xs font-bold text-slate-200 block mt-0.5">${userName}</span>
            <span class="text-[11px] text-slate-400">${userRole} • ${userId}</span>
          </div>
          <div class="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <span class="text-[10px] text-slate-400 uppercase font-semibold">Duration</span>
            <span class="text-xs font-bold text-slate-200 block mt-0.5">Full Day Reading</span>
            <span class="text-[11px] text-slate-400">08:30 AM – 09:30 PM</span>
          </div>
        </div>

        <div class="bg-slate-950/90 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 mt-4">
          <div class="text-left text-xs text-slate-400">
            <p class="font-bold text-slate-200 mb-1">Access Guidelines:</p>
            <p>1. Scan QR code at entrance turnstile.</p>
            <p>2. Maintain quiet study atmosphere.</p>
          </div>
          <div class="flex-shrink-0 bg-white p-2 rounded-lg text-center">
            <!-- QR Code Simulation -->
            <svg width="68" height="68" viewBox="0 0 100 100" fill="black">
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" fill="black" />
              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" fill="black" />
              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" fill="black" />
              <rect x="40" y="10" width="10" height="20" />
              <rect x="10" y="40" width="20" height="10" />
              <rect x="40" y="40" width="20" height="20" />
              <rect x="70" y="50" width="20" height="10" />
              <rect x="50" y="70" width="30" height="10" />
              <rect x="80" y="80" width="10" height="10" />
            </svg>
            <span class="block text-[8px] text-slate-800 font-mono font-bold mt-1">TURNSTILE PASS</span>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-5">
          <button onclick="window.print()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
            <span>🖨️</span> Print Pass
          </button>
          <button onclick="document.getElementById('pass-modal').classList.add('hidden')" class="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold">
            Done
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
  }
}

window.studyManager = new StudySpaceManager();
