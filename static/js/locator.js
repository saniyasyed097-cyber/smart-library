/**
 * Smart Floor & Rack Locator Engine
 * Supports 4 Floors, Racks 1-100 per floor, and Numbered Shelves 1 to 5.
 */

class LibraryLocator {
  constructor() {
    this.currentFloor = "First Floor";
    this.targetRack = 16;
    this.targetShelf = "Shelf 3";
    this.targetBook = null;
  }

  locateBook(book) {
    this.targetBook = book;
    this.currentFloor = book.floor_number || book.floor || "First Floor";
    this.targetRack = parseInt(book.rack_number || book.rack || 16, 10);
    this.targetShelf = book.shelf_number || (book.shelf ? (book.shelf.startsWith('Shelf') ? book.shelf : `Shelf ${book.shelf}`) : "Shelf 3");

    this.renderFloorMap();
    this.renderShelfElevation();
    this.renderDirections();
  }

  getFloorRacks(floor) {
    switch (floor) {
      case "Ground Floor":
        return { start: 1, end: 100, wing: "General Knowledge (GK) & Magazines Lounge" };
      case "First Floor":
        return { start: 1, end: 100, wing: "Programming Books, Mathematics & Engineering Wing" };
      case "Second Floor":
        return { start: 1, end: 100, wing: "Science, Commerce & Medical Research Wing" };
      case "Third Floor":
        return { start: 1, end: 100, wing: "English, Story Books, History, Indian Polity, Competitive Exams, Novels & Aptitude" };
      default:
        return { start: 1, end: 100, wing: "Main Library Stacks" };
    }
  }

  renderFloorMap(containerId = "floor-map-canvas") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const floorInfo = this.getFloorRacks(this.currentFloor);
    const width = 820;
    const height = 480;

    let racksSvg = "";
    let targetCoords = null;
    let entranceCoords = { x: 80, y: 430 };

    const startX = 140;
    const startY = 90;
    const rackWidth = 85;
    const rackHeight = 44;
    const gapX = 35;
    const gapY = 22;
    const cols = 5;

    // View current 25-rack block around the target rack (e.g. 1-25, 26-50, 51-75, 76-100)
    const blockIndex = Math.floor((this.targetRack - 1) / 25);
    const blockStart = blockIndex * 25 + 1;
    const blockEnd = blockStart + 24;

    for (let i = 0; i < 25; i++) {
      const currentRack = blockStart + i;
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = startX + col * (rackWidth + gapX);
      const y = startY + row * (rackHeight + gapY);

      const isTarget = currentRack === this.targetRack;
      if (isTarget) {
        targetCoords = { x: x + rackWidth / 2, y: y + rackHeight / 2 };
      }

      const rackClass = isTarget ? "rack-box-light target-rack-light" : "rack-box-light";
      const fillColor = isTarget ? "#dbeafe" : "#ffffff";
      const strokeColor = isTarget ? "#2563eb" : "#cbd5e1";
      const textColor = isTarget ? "#1e3a8a" : "#334155";

      racksSvg += `
        <g class="rack-group" data-rack="${currentRack}" onclick="window.onRackClick(${currentRack})">
          <rect x="${x}" y="${y}" width="${rackWidth}" height="${rackHeight}" rx="8" 
                fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isTarget ? '3' : '1.5'}"
                class="${rackClass}" />
          <text x="${x + rackWidth / 2}" y="${y + 20}" fill="${textColor}" font-size="12" font-weight="700" text-anchor="middle">
            Rack ${currentRack}
          </text>
          <text x="${x + rackWidth / 2}" y="${y + 34}" fill="${isTarget ? '#1d4ed8' : '#64748b'}" font-size="9.5" text-anchor="middle">
            Shelves 1 - 5
          </text>
          ${isTarget ? `
            <circle cx="${x + rackWidth - 10}" cy="${y + 10}" r="5" fill="#2563eb">
              <animate attributeName="r" values="3;7;3" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
          ` : ''}
        </g>
      `;
    }

    let pathSvg = "";
    if (targetCoords) {
      const midX = 100;
      const aisleY = targetCoords.y;
      pathSvg = `
        <path d="M ${entranceCoords.x} ${entranceCoords.y} L ${midX} ${aisleY} L ${targetCoords.x} ${aisleY}" 
              fill="none" stroke="#2563eb" stroke-width="3.5" stroke-dasharray="6,6" class="nav-path-light">
          <animate attributeName="stroke-dashoffset" values="24;0" dur="1s" repeatCount="indefinite" />
        </path>
        <circle cx="${entranceCoords.x}" cy="${entranceCoords.y}" r="8" fill="#10b981" />
        <text x="${entranceCoords.x}" y="${entranceCoords.y - 12}" fill="#059669" font-size="11" font-weight="800" text-anchor="middle">
          Start Here
        </text>
        <g transform="translate(${targetCoords.x}, ${targetCoords.y - 28})">
          <path d="M 0 0 C -12 -15, -12 -28, 0 -28 C 12 -28, 12 -15, 0 0 Z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5" />
          <circle cx="0" cy="-18" r="4" fill="#ffffff" />
        </g>
      `;
    }

    const svg = `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="lightGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
          </pattern>
        </defs>

        <rect width="${width}" height="${height}" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="2"/>
        <rect width="${width}" height="${height}" rx="16" fill="url(#lightGrid)" />

        <rect x="25" y="380" width="110" height="75" rx="8" fill="#ffffff" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="80" y="405" fill="#2563eb" font-size="11" font-weight="800" text-anchor="middle">🚪 ENTRANCE</text>
        <text x="80" y="420" fill="#64748b" font-size="9.5" text-anchor="middle">& Turnstile Kiosk</text>

        <rect x="685" y="25" width="110" height="65" rx="8" fill="#ffffff" stroke="#7c3aed" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="740" y="50" fill="#7c3aed" font-size="11" font-weight="800" text-anchor="middle">🛗 ELEVATOR</text>
        <text x="740" y="65" fill="#64748b" font-size="9" text-anchor="middle">& Stairwell Access</text>

        <rect x="25" y="25" width="105" height="55" rx="8" fill="#ffffff" stroke="#059669" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="77" y="48" fill="#059669" font-size="11" font-weight="800" text-anchor="middle">ℹ️ INFO DESK</text>
        <text x="77" y="62" fill="#64748b" font-size="9" text-anchor="middle">Help Desk</text>

        <rect x="220" y="16" width="380" height="34" rx="17" fill="#ffffff" stroke="#cbd5e1" />
        <text x="410" y="38" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">
          📍 ${this.currentFloor.toUpperCase()} — ${floorInfo.wing}
        </text>

        <text x="110" y="120" fill="#94a3b8" font-size="10.5" font-weight="700">Aisle 1</text>
        <text x="110" y="185" fill="#94a3b8" font-size="10.5" font-weight="700">Aisle 2</text>
        <text x="110" y="250" fill="#94a3b8" font-size="10.5" font-weight="700">Aisle 3</text>
        <text x="110" y="315" fill="#94a3b8" font-size="10.5" font-weight="700">Aisle 4</text>

        ${racksSvg}
        ${pathSvg}
      </svg>
    `;

    container.innerHTML = svg;
  }

  renderShelfElevation(containerId = "shelf-elevation-canvas") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const shelves = [
      { id: "Shelf 1", label: "Shelf 1 (Top Level)", heightLevel: "2.1m" },
      { id: "Shelf 2", label: "Shelf 2 (Upper-Mid Level)", heightLevel: "1.7m" },
      { id: "Shelf 3", label: "Shelf 3 (Eye Level)", heightLevel: "1.3m" },
      { id: "Shelf 4", label: "Shelf 4 (Lower-Mid Level)", heightLevel: "0.9m" },
      { id: "Shelf 5", label: "Shelf 5 (Bottom Level)", heightLevel: "0.4m" }
    ];

    let shelvesHtml = "";
    const cleanTargetShelf = this.targetShelf.replace("Shelf ", "").trim();

    shelves.forEach(shelf => {
      const cleanShelfNum = shelf.id.replace("Shelf ", "").trim();
      const isTargetShelf = cleanTargetShelf === cleanShelfNum || this.targetShelf === shelf.id;
      const activeClass = isTargetShelf ? "shelf-level-light active-shelf-light" : "shelf-level-light";
      
      let spineBooks = "";
      for (let i = 0; i < 14; i++) {
        const isTargetBookSpine = isTargetShelf && i === 6;
        const width = 16 + (i % 4) * 4;
        const color = isTargetBookSpine 
          ? "linear-gradient(180deg, #3b82f6, #1d4ed8)" 
          : `hsl(${(i * 45 + (isTargetShelf ? 210 : 190)) % 360}, 55%, ${isTargetShelf ? '45%' : '65%'})`;
        
        spineBooks += `
          <div class="book-spine-light ${isTargetBookSpine ? 'highlighted-spine-light' : ''}" 
               style="width: ${width}px; background: ${color};" 
               title="${isTargetBookSpine ? (this.targetBook?.title || 'Target Book') : 'Shelved Book'}">
            ${isTargetBookSpine ? '<div class="spine-marker-light">TARGET</div>' : ''}
          </div>
        `;
      }

      shelvesHtml += `
        <div class="${activeClass}">
          <div class="shelf-header flex justify-between items-center px-3 py-1.5 text-xs font-semibold">
            <span class="flex items-center gap-2">
              <span class="shelf-tag ${isTargetShelf ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'} px-2 py-0.5 rounded font-bold">
                ${shelf.id}
              </span>
              <span class="${isTargetShelf ? 'text-blue-700 font-extrabold' : 'text-slate-600 font-medium'}">
                ${shelf.label}
              </span>
            </span>
            <span class="text-slate-400 text-[11px] font-mono">${shelf.heightLevel}</span>
          </div>
          <div class="shelf-books flex items-end gap-1 px-4 py-2 h-16 bg-slate-100 border-b-4 border-amber-800">
            ${spineBooks}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="rack-cabinet bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
          <div>
            <h4 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <span>🗄️ Rack #${this.targetRack} — Shelf Elevation</span>
              <span class="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                ${this.currentFloor}
              </span>
            </h4>
            <p class="text-xs text-slate-500">5 shelf tiers (Shelf 1 to Shelf 5)</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-700 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              Target: <b class="text-blue-600">${this.targetShelf}</b>
            </span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          ${shelvesHtml}
        </div>
      </div>
    `;
  }

  renderDirections(containerId = "locator-directions") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const floorName = this.currentFloor;
    const rackNo = this.targetRack;
    const shelfName = this.targetShelf;

    let floorAction = "";
    if (floorName === "Ground Floor") {
      floorAction = "Enter through the **Ground Floor Main Turnstiles** and head towards the General Knowledge & Magazines section.";
    } else if (floorName === "First Floor") {
      floorAction = "Take the **Elevator or Main Staircase to the First Floor** (Programming, Mathematics & Engineering Wing).";
    } else if (floorName === "Second Floor") {
      floorAction = "Take the **Elevator to the Second Floor** (Science, Commerce & Medical Research Wing).";
    } else {
      floorAction = "Take the **Elevator to the Third Floor** (English, Story Books, History, Indian Polity, Competitive Exams & Novels).";
    }

    const aisleNo = Math.ceil(((rackNo % 25) || 25) / 5);

    container.innerHTML = `
      <div class="directions-card bg-blue-50/70 p-4 rounded-2xl border border-blue-200">
        <h4 class="font-extrabold text-blue-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>🧭 Quick Walking Navigation</span>
        </h4>
        <ol class="space-y-1.5 text-xs text-slate-700">
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
            <span>${floorAction}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
            <span>Walk into **Aisle ${aisleNo}** with overhead signage.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
            <span>Locate **Rack #${rackNo}** with blue placard.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
            <span>Pick the book from **${shelfName}**.</span>
          </li>
        </ol>
      </div>
    `;
  }
}

window.locator = new LibraryLocator();
