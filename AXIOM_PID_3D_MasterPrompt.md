# AXIOM ENGINEERING SUITE — MASTER PROMPT
## P&ID + Interactive 3D Plant Model Generator
### Author: ENG_ALAA MOHAMMED | Version: 2.0 PROFESSIONAL

---

## 🎯 ROLE DEFINITION

You are a **Senior Full-Stack Engineer** with deep expertise in:
- Oil & Gas Process Engineering (10+ years)
- 3D Visualization & WebGL (Three.js / React Three Fiber)
- P&ID Design (ISA 5.1 / ISO 10628 standards)
- Real-Time Systems Architecture
- Engineering HMI/SCADA Dashboard Design

Your task is to build a **production-grade, fully functional** web application that:
1. Generates professional, standards-compliant **P&ID diagrams**
2. Renders a **fully interactive 3D plant model** synchronized with the P&ID
3. Provides a complete **engineering dashboard** with data management

> ⚠️ CRITICAL RULES — NEVER VIOLATE:
> - NO mockups. NO placeholders. NO "TODO" comments.
> - Every function must be fully implemented and working.
> - Every UI element must be interactive and connected to real logic.
> - All components must be wired together end-to-end.

---

## 📐 ARCHITECTURE OVERVIEW

```
/axiom-plant-suite
 ├── /frontend               → React 18 + Vite + Tailwind CSS
 │    ├── /src
 │    │    ├── /components
 │    │    │    ├── /pid          → P&ID rendering engine
 │    │    │    ├── /3d           → Three.js 3D engine
 │    │    │    ├── /sidebar      → Component palette & properties
 │    │    │    ├── /toolbar      → Top action bar
 │    │    │    └── /shared       → Reusable UI primitives
 │    │    ├── /hooks             → Custom React hooks
 │    │    ├── /store             → Zustand global state
 │    │    ├── /engine            → Core logic (layout, routing, sync)
 │    │    ├── /data              → JSON schemas & sample data
 │    │    └── /styles            → Global CSS / Tailwind config
 ├── /backend                → Node.js + Express + WebSocket
 │    ├── /routes             → REST API endpoints
 │    ├── /services           → Business logic
 │    └── /data               → Persistent JSON storage
 └── sample-project.json     → Full sample plant definition
```

---

## 🧩 PART 1 — DATA MODEL (JSON Schema)

Define a strict JSON schema for a plant project. Every entity must include:

### Equipment Node
```json
{
  "id": "string (unique, e.g. P-101)",
  "type": "enum: pump|compressor|heatExchanger|separator|tank|valve|flare|column|sensor|pipe",
  "subtype": "string (e.g. centrifugal, gate, 3-phase)",
  "tag": "string (ISA tag, e.g. P-101A)",
  "label": "string (display name)",
  "description": "string",
  "processFluid": "enum: oil|gas|water|mixed|steam|chemical",
  "operatingConditions": {
    "pressure": { "value": "number", "unit": "bar|psi|kPa" },
    "temperature": { "value": "number", "unit": "C|F|K" },
    "flowRate": { "value": "number", "unit": "m3/h|kg/h|MMSCFD" }
  },
  "position": {
    "pid": { "x": "number", "y": "number" },
    "model3d": { "x": "number", "y": "number", "z": "number" }
  },
  "dimensions": {
    "width": "number", "height": "number", "depth": "number", "unit": "m"
  },
  "processStage": "enum: upstream|midstream|downstream",
  "status": "enum: active|standby|maintenance|shutdown",
  "metadata": {
    "manufacturer": "string",
    "model": "string",
    "installDate": "ISO8601",
    "lastInspection": "ISO8601",
    "specifications": {}
  }
}
```

### Connection (Pipe/Line)
```json
{
  "id": "string (e.g. L-001)",
  "lineNumber": "string (e.g. 6\"-OIL-P-101-A1A)",
  "from": "equipment_id",
  "fromPort": "string (inlet|outlet|vent|drain|bypass)",
  "to": "equipment_id",
  "toPort": "string",
  "fluid": "enum: oil|gas|water|mixed|steam|chemical",
  "nominalDiameter": "number (mm or inches)",
  "diameterUnit": "mm|inch",
  "schedule": "string (e.g. SCH-40)",
  "material": "string (e.g. CS, SS316)",
  "insulation": "boolean",
  "flowDirection": "forward|reverse|bidirectional",
  "waypoints": [{ "x": "number", "y": "number" }],
  "waypoints3d": [{ "x": "number", "y": "number", "z": "number" }]
}
```

### Instrument Loop
```json
{
  "id": "string (e.g. FIC-101)",
  "type": "enum: PIC|TIC|FIC|LIC|PT|TT|FT|LT|PDT|AT",
  "tag": "string",
  "connectedTo": "equipment_id",
  "connectionPoint": "string",
  "range": { "min": "number", "max": "number", "unit": "string" },
  "setpoint": "number",
  "alarmLow": "number",
  "alarmHigh": "number",
  "currentValue": "number",
  "position": { "x": "number", "y": "number" }
}
```

---

## 🖥️ PART 2 — BACKEND API (Node.js + Express)

### Server Setup
- Port: 3001
- Enable CORS for localhost:5173
- Enable WebSocket (ws library) for real-time updates
- Use express-validator for input validation
- Use fs/promises for JSON file persistence

### REST Endpoints — implement ALL of the following:

```
GET    /api/projects              → List all saved projects
POST   /api/projects              → Create new project
GET    /api/projects/:id          → Load project by ID
PUT    /api/projects/:id          → Update full project
DELETE /api/projects/:id          → Delete project

GET    /api/projects/:id/equipment          → List all equipment
POST   /api/projects/:id/equipment          → Add equipment node
PUT    /api/projects/:id/equipment/:eqId    → Update equipment
DELETE /api/projects/:id/equipment/:eqId    → Remove equipment

GET    /api/projects/:id/connections        → List connections
POST   /api/projects/:id/connections        → Add connection
PUT    /api/projects/:id/connections/:connId → Update connection
DELETE /api/projects/:id/connections/:connId → Remove connection

GET    /api/projects/:id/instruments        → List instruments
POST   /api/projects/:id/instruments        → Add instrument
PUT    /api/projects/:id/instruments/:instId → Update instrument

POST   /api/projects/:id/layout/auto        → Trigger auto-layout algorithm
POST   /api/projects/:id/export/svg         → Export P&ID as SVG
POST   /api/projects/:id/export/json        → Export full project JSON
POST   /api/validate                        → Validate project structure
```

### WebSocket Events
```
SERVER → CLIENT:
  "equipment:updated"   → { id, changes }
  "connection:updated"  → { id, changes }
  "instrument:value"    → { id, value, timestamp }
  "simulation:tick"     → { timestamp, all live values }

CLIENT → SERVER:
  "subscribe:project"   → { projectId }
  "equipment:select"    → { id }
  "simulation:start"    → {}
  "simulation:stop"     → {}
```

---

## 🎨 PART 3 — P&ID ENGINE (SVG-based)

### Symbol Library — implement precise ISA 5.1 SVG symbols for ALL:

| Equipment Type | Symbol Requirements |
|---|---|
| Centrifugal Pump | Circle with triangle arrow inside, suction/discharge nozzles |
| Reciprocating Pump | Rectangle with piston symbol |
| Compressor | Circle with blade symbols |
| Shell & Tube HX | Rectangle with internal tube lines, two inlet/outlet pairs |
| Air Cooler HX | Rectangle with fin lines and fan symbol |
| 2-Phase Separator | Horizontal vessel with boot, liquid level line |
| 3-Phase Separator | Horizontal vessel with boot, two liquid level lines |
| Vertical Tank | Vertical cylinder with domed heads |
| Horizontal Tank | Horizontal cylinder |
| Gate Valve | Bowtie symbol (ISA standard) |
| Globe Valve | Circle in line |
| Control Valve | Bowtie with actuator circle on top |
| Check Valve | Arrow in circle |
| Ball Valve | Circle with line |
| Safety Relief Valve | Standard ISA SRV symbol |
| Flare | Triangle on stick symbol |
| Distillation Column | Vertical vessel with tray lines |
| Pressure Sensor (PT) | Circle with "PT" tag |
| Temperature Sensor (TT) | Circle with "TT" tag |
| Flow Transmitter (FT) | Circle with "FT" tag |
| Level Transmitter (LT) | Circle with "LT" tag |

### Auto-Layout Algorithm
Implement a **Sugiyama-style layered graph layout**:
1. **Rank assignment**: Assign each node a column based on topological sort (upstream=0, midstream=1, downstream=2+)
2. **Crossing minimization**: Sort nodes within each rank to minimize edge crossings
3. **Coordinate assignment**: Distribute nodes vertically with even spacing (min 120px between nodes)
4. **Edge routing**: Orthogonal routing — horizontal then vertical segments only, with bend minimization
5. **Label placement**: Auto-position instrument bubbles to avoid overlap with pipes

### P&ID Rendering
- SVG viewport with pan (drag) and zoom (scroll wheel, 0.2x to 5x)
- Grid background (10px minor, 50px major) that scales with zoom
- Equipment nodes: drag to reposition, snap to grid (10px grid snap)
- Pipes: click on two nodes to connect; auto-route orthogonally
- Instrument bubbles: diamond line to equipment, dashed for wireless
- Clicking a node: opens properties panel, highlights all connected pipes, highlights same node in 3D view
- Hover: show tooltip with tag, description, and live values
- Color coding by process fluid: oil=black pipe, gas=yellow, water=blue, steam=gray dashed
- Line style by service: process=solid, instrument=dashed, utility=dotted
- Equipment status indicator: colored border (green=active, yellow=standby, red=shutdown)

---

## 🌐 PART 4 — 3D ENGINE (Three.js)

### Scene Setup
```javascript
// Required Three.js version: r160+
// Required add-ons: OrbitControls, TransformControls, CSS2DRenderer, TWEEN.js
```

### 3D Equipment Models — build parametric geometry for ALL types:

#### Centrifugal Pump
```
- Casing: Lathe geometry (volute cross-section) → brown/gray metallic material
- Shaft: thin CylinderGeometry extending both sides
- Impeller: disc with 6 curved blade meshes
- Motor: BoxGeometry with cooling fin ridges (ExtrudeGeometry)
- Nozzles: Short CylinderGeometry for inlet/outlet flanges
- Flange plates: TorusGeometry at pipe connections
- Nameplate: PlaneGeometry with canvas texture showing tag/data
```

#### Compressor
```
- Body: CylinderGeometry (fat, low aspect ratio)
- Stage casings: stacked CylinderGeometry with decreasing radius
- Intercooler pipes: TubeGeometry curved between stages
- Inlet filter: BoxGeometry with mesh texture
- Discharge: short CylinderGeometry
```

#### Shell & Tube Heat Exchanger
```
- Shell: CylinderGeometry (horizontal, long)
- Channel heads: SphereGeometry (half-sphere) capped on both ends
- Nozzles: 4× CylinderGeometry (shell-side in/out, tube-side in/out)
- Support saddles: 2× BoxGeometry with curved base
- Tube sheet: thin disc visible at cut-away
```

#### Horizontal Separator
```
- Vessel: CylinderGeometry (horizontal, high aspect ratio)
- Heads: 2× EllipsoidGeometry (2:1 ellipsoidal heads)
- Inlet nozzle with deflector baffle
- Liquid outlet: bottom nozzle
- Gas outlet: top nozzle
- Boot: smaller CylinderGeometry at bottom for water
- Level gauge: vertical glass cylinder on side
- Safety relief valve on top
- Support legs: 4× CylinderGeometry
```

#### Storage Tank (Vertical)
```
- Shell: CylinderGeometry
- Conical roof: ConeGeometry
- Bottom: flat disc or cone
- Floating roof option: inner disc that moves up/down
- Shell nozzles: multiple CylinderGeometry at correct elevations
- Staircase: ExtrudeGeometry spiral path with step geometry
- Handrail: TubeGeometry following staircase
- Vent nozzle at roof
- Drain at base
```

#### Valves
```
Gate valve:
- Body: BoxGeometry (bonnet + body)
- Handwheel: TorusGeometry with spokes (LatheGeometry)
- Stem: CylinderGeometry

Control Valve:
- Body: BoxGeometry
- Actuator: CylinderGeometry on top
- Positioner box: small BoxGeometry on side
- Air supply tubing: TubeGeometry
```

#### Distillation Column
```
- Shell: CylinderGeometry (tall, vertical)
- Trays: multiple thin disc geometries at regular intervals
- Condenser at top: small HX model
- Reboiler at bottom: small HX model
- Reflux drum: horizontal vessel
- Multiple nozzles at correct tray levels
- Skirt support: CylinderGeometry at base
- Platform at 3 elevations: RingGeometry with BoxGeometry handrail
- Ladder: ExtrudeGeometry
```

#### Piping
```
- Straight runs: TubeGeometry along waypoints
- Elbows: TubeGeometry along arc path (R = 1.5D standard)
- Reducers: LatheGeometry (cone transition)
- Flanges: TorusGeometry at each end
- Insulation layer: TubeGeometry with larger radius, semi-transparent white
- Support shoes: BoxGeometry at every 5m interval
- Pipe rack: BoxGeometry columns + beams
```

### Materials
```javascript
// Oil lines: MeshStandardMaterial { color: 0x1a1a1a, metalness: 0.7, roughness: 0.3 }
// Gas lines: MeshStandardMaterial { color: 0xffd600, metalness: 0.5, roughness: 0.4 }
// Water lines: MeshStandardMaterial { color: 0x0288d1, metalness: 0.4, roughness: 0.5 }
// Steam lines: MeshStandardMaterial { color: 0xbdbdbd, metalness: 0.2, roughness: 0.7 }
// Equipment: MeshStandardMaterial { color: 0xb0bec5, metalness: 0.6, roughness: 0.4 }
// Selected: MeshStandardMaterial { color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 0.3 }
// Highlighted (from P&ID): emissive: 0xff6d00, emissiveIntensity: 0.4
```

### Lighting Setup
```javascript
// AmbientLight: intensity 0.4, color 0xffffff
// DirectionalLight main: position (10,20,10), intensity 1.2, castShadow: true
// DirectionalLight fill: position (-10,5,-10), intensity 0.4
// PointLight at each flare: color 0xff6600, intensity 2, distance 15
// HemisphereLight: sky 0x1a3a5c, ground 0x0a0a0a, intensity 0.3
```

### Flow Animation System
```javascript
// For each pipe with active flow:
// - Create a custom ShaderMaterial with:
//   - Animated texture UV offset along tube axis
//   - Speed proportional to flow rate value
//   - Color based on fluid type
//   - Intensity based on pressure
// - Shader uniforms: uTime, uSpeed, uFluidColor, uOpacity
// - Animate in requestAnimationFrame loop
```

### Camera System
```javascript
// Default camera: PerspectiveCamera(45, aspect, 0.1, 2000)
// Initial position: (80, 60, 80) looking at (0, 10, 0)
// OrbitControls:
//   enableDamping: true, dampingFactor: 0.05
//   minDistance: 5, maxDistance: 500
//   maxPolarAngle: Math.PI * 0.85
// Preset views (keyboard shortcuts):
//   [1] Top view, [2] Front view, [3] Side view
//   [4] Isometric view, [F] Frame selected object
// Click to focus: tween camera to selected object in 800ms
```

### CSS2DRenderer Labels
```javascript
// Each equipment: floating HTML label showing tag + status dot
// Hover label: shows all metadata in tooltip card
// Labels scale with camera distance (min 0.5x, max 1.5x)
// Labels hide when behind other geometry (raycast check)
```

### Selection & Interaction
```javascript
// Raycaster on mouse click → identify clicked mesh
// Traverse to find root equipment group
// Apply selection material to all meshes in group
// Fire "equipment:selected" event to sync P&ID
// Show info panel with all metadata
// Right-click: context menu (properties, isolate, focus camera)
// Double-click: enter isolated view of single equipment
// Escape: exit isolated view
```

### Ground & Environment
```javascript
// Ground plane: GridHelper (200, 40) with custom material
// Sky: custom shader gradient (dark blue → black)
// Ambient particles: small dust/haze effect (optional)
// Shadows: PCFSoftShadowMap, shadow map size 2048×2048
```

---

## 🔗 PART 5 — SYNCHRONIZATION ENGINE

Implement a **bi-directional selection sync** between P&ID and 3D:

```javascript
// In global store (Zustand):
selectedEquipmentId: string | null
hoveredEquipmentId: string | null

// P&ID → 3D sync:
// When P&ID node is clicked:
//   1. Set selectedEquipmentId
//   2. 3D engine subscribes → applies highlight material
//   3. Camera tweens to focus on that 3D object
//   4. Info panel updates

// 3D → P&ID sync:
// When 3D mesh is clicked:
//   1. Set selectedEquipmentId
//   2. P&ID subscribes → scrolls SVG viewport to node
//   3. Node gets "selected" CSS class + glow effect
//   4. All connected pipes pulse animation

// Hover sync (real-time, no delay):
//   mouseenter on P&ID node → highlight 3D object outline
//   mousemove on 3D canvas → highlight P&ID node
```

---

## 🖼️ PART 6 — UI / DASHBOARD LAYOUT

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER: Logo | Mode Toggle | Save | Load | Export | Author │
├─────────┬───────────────────────────┬───────────────────────┤
│         │                           │                       │
│ SIDEBAR │      P&ID CANVAS          │    3D VIEWPORT        │
│         │    (SVG, zoomable)        │   (Three.js WebGL)    │
│ Palette │                           │                       │
│         │  ← resize handle →       │                       │
│ Props   │                           │                       │
│ Panel   │                           │                       │
│         │                           │                       │
├─────────┴───────────────────────────┴───────────────────────┤
│  STATUS BAR: Selection Info | Cursor XY | Zoom | FPS | Mode │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar — Component Palette
- Searchable list of all equipment types
- Drag-and-drop onto P&ID canvas to place
- Grouped by category: Vessels, Rotating, Heat Transfer, Valves, Instruments
- Each item: ISA icon + label + subtype selector

### Sidebar — Properties Panel
When an equipment is selected, show:
```
┌─ EQUIPMENT PROPERTIES ───────────────────┐
│ Tag: [P-101A        ]  Type: Centrifugal  │
│ Label: [Crude Oil Feed Pump              ]│
│ Description: [multiline text             ]│
│ Status: ● Active ○ Standby ○ Maintenance  │
│ Process Fluid: ● Oil ○ Gas ○ Water        │
├─ OPERATING CONDITIONS ───────────────────┤
│ Pressure:   [12.5 ] [bar ▼]              │
│ Temperature:[65.0 ] [°C  ▼]              │
│ Flow Rate:  [450  ] [m³/h▼]              │
├─ DIMENSIONS ─────────────────────────────┤
│ Width: [2.0] Height: [1.5] Depth: [1.2] m│
├─ METADATA ───────────────────────────────┤
│ Manufacturer: [Flowserve                 ]│
│ Model: [PVXM 150-315                    ]│
│ Install Date: [2018-03-15               ]│
└──────────────────────────────────────────┘
[Apply Changes] [Delete] [Duplicate]
```

### Toolbar
```
[New Project] [Open] [Save] [Save As]
[Undo ⌘Z] [Redo ⌘Y]
[Auto Layout] [Validate]
[Export SVG] [Export JSON] [Export Report]
[Simulate: ▶ Start | ■ Stop]
```

### Keyboard Shortcuts (ALL must work)
```
⌘/Ctrl+Z → Undo
⌘/Ctrl+Y → Redo
⌘/Ctrl+S → Save
⌘/Ctrl+A → Select all
Delete    → Delete selected
Escape    → Deselect
Space     → Pan mode (P&ID)
+/-       → Zoom in/out
1/2/3/4   → 3D camera presets
F         → Focus selected in 3D
G         → Toggle grid
L         → Toggle labels
P         → Toggle P&ID / 3D / Split
```

---

## 🎮 PART 7 — SIMULATION MODE

Implement a real-time process simulation:

```javascript
// SimulationEngine class:
class SimulationEngine {
  // Runs at 10 Hz (100ms interval)
  // For each instrument loop:
  //   - Generate realistic value = setpoint + (random noise × 0.02 × range)
  //   - Apply first-order lag: value = prevValue + (target - prevValue) × 0.1
  //   - Check alarms: if value > alarmHigh → fire "alarm:high" event
  //   - Check alarms: if value < alarmLow  → fire "alarm:low"  event
  //   - Broadcast via WebSocket to all connected clients
  //
  // Flow animation speed = f(flowRate) → update shader uniform uSpeed
  // Valve position changes → animate stem position in 3D
}
```

### Alarm System
- Alarm panel in bottom-right corner
- New alarms flash red, acknowledged alarms turn gray
- Audio cue (Web Audio API beep) on new high-priority alarm
- Alarm log with timestamp, tag, description, value

---

## 🎨 PART 8 — VISUAL DESIGN SYSTEM

### Color Palette
```css
--bg-primary:    #070c14;   /* deep navy black */
--bg-secondary:  #0b1220;   /* panel background */
--bg-tertiary:   #0f1929;   /* nested panel */
--border-dark:   #1a2e4a;   /* subtle border */
--border-light:  #2a4a6a;   /* visible border */
--accent-cyan:   #00e5ff;   /* primary accent */
--accent-orange: #ff6d00;   /* secondary accent */
--accent-green:  #00e676;   /* status/active */
--accent-yellow: #ffd600;   /* gas / warning */
--accent-red:    #ff1744;   /* alarm / error */
--text-primary:  #c8dff5;   /* main text */
--text-secondary:#7ba3c8;   /* muted text */
--text-mono:     #4dbbff;   /* code / tags */
```

### Typography
```css
/* Headers / Logo / Tags */
font-family: 'Orbitron', monospace;

/* Data values / Codes / Equipment tags */
font-family: 'Share Tech Mono', monospace;

/* UI labels / Descriptions / Body */
font-family: 'Rajdhani', sans-serif;
```

### Component Styles — define CSS for:
- `.panel` — dark glass card with cyan border glow
- `.btn-primary` — cyan border, glow on hover, active press effect
- `.btn-danger` — red border, red glow
- `.input-field` — dark background, cyan focus border, monospace font
- `.tag-badge` — small pill with equipment tag (monospace, colored by type)
- `.status-dot` — pulsing circle (green=active, yellow=standby, red=alarm)
- `.alarm-card` — red flashing border, slide-in animation
- `.tooltip` — frosted glass, sharp corners, cyan border
- `.context-menu` — dark dropdown, hover highlight

---

## 📦 PART 9 — SAMPLE PROJECT DATA

Provide a complete `sample-project.json` representing a **crude oil processing train**:

```
INLET → 3-Phase Separator (V-101)
           ├── Gas outlet → Gas Compressor (C-101) → Gas Export
           ├── Oil outlet → Crude Oil Pump (P-101A/B) →
           │                 Heat Exchanger (E-101) →
           │                   Atmospheric Distillation Column (T-101)
           │                     ├── Overhead → Condenser (E-102) → Reflux Drum (V-102)
           │                     │               → Distillate Pump (P-102A/B)
           │                     ├── Side draws (3 products)
           │                     └── Bottoms → Bottoms Pump (P-103A/B) → Storage Tank (TK-101)
           └── Water outlet → Produced Water Tank (TK-102)
```

Include:
- 20+ equipment items with full metadata
- 30+ pipe connections with line numbers
- 15+ instrument loops (PT, TT, FT, LT, FIC, PIC, LIC)
- Positions for both P&ID and 3D model
- Realistic operating conditions

---

## ✅ PART 10 — QUALITY REQUIREMENTS

### Performance
- 3D viewport must maintain **≥ 50 FPS** with full plant model
- P&ID must handle **200+ nodes** without lag
- WebSocket latency **< 50ms** for simulation updates
- Initial load time **< 3 seconds** on localhost

### Code Quality
- TypeScript strict mode enabled (no `any` types)
- All components < 300 lines (split if larger)
- Custom hooks for all stateful logic
- Zero console errors in production build
- ESLint + Prettier configured

### Browser Support
- Chrome 110+, Firefox 110+, Edge 110+
- WebGL 2.0 required (check at startup, show error if unsupported)
- Minimum 1280×720 screen resolution

### Error Handling
- All API calls wrapped in try/catch with user-visible error toast
- WebSocket reconnect with exponential backoff (1s, 2s, 4s, max 30s)
- Invalid project file: show validation errors with field-level detail
- WebGL context lost: auto-recover and reinitialize

---

## 🚀 PART 11 — STEP-BY-STEP GENERATION ORDER

Generate code in this EXACT sequence:

```
STEP 1: package.json (both frontend and backend)
         → All dependencies with exact versions

STEP 2: Backend server (index.js)
         → Express setup, CORS, WebSocket, routes

STEP 3: Backend routes (all endpoints)
         → /projects, /equipment, /connections, /instruments

STEP 4: Backend simulation service
         → SimulationEngine class, WebSocket broadcast

STEP 5: sample-project.json
         → Full crude oil train dataset

STEP 6: Frontend: Zustand store (store.ts)
         → All state slices, actions, selectors

STEP 7: Frontend: P&ID Symbol Library (symbols.ts)
         → All ISA SVG symbols as React components

STEP 8: Frontend: P&ID Layout Engine (layoutEngine.ts)
         → Sugiyama algorithm, edge routing

STEP 9: Frontend: P&ID Canvas (PIDCanvas.tsx)
         → SVG rendering, pan/zoom, interaction

STEP 10: Frontend: 3D Equipment Models (models3d.ts)
          → All parametric Three.js geometry builders

STEP 11: Frontend: 3D Scene (Scene3D.tsx)
          → Three.js scene, lighting, controls, animation loop

STEP 12: Frontend: Sync Engine (syncEngine.ts)
          → Bi-directional P&ID ↔ 3D selection sync

STEP 13: Frontend: Sidebar components
          → ComponentPalette.tsx, PropertiesPanel.tsx

STEP 14: Frontend: Toolbar + Header
          → All action buttons, keyboard shortcuts

STEP 15: Frontend: Main layout (App.tsx)
          → Split-screen layout, resize handle, status bar

STEP 16: Frontend: Styles
          → Global CSS, Tailwind config, design tokens

STEP 17: README.md
          → Setup instructions (npm install + npm run dev)
```

---

## 📌 FINAL CONSTRAINTS

- **Every step** must include complete, copy-paste-ready code
- **No step** may reference code from future steps without defining it
- **All imports** must be from packages listed in package.json
- **All types** must be defined before use
- **No external APIs** required (fully offline-capable)
- The app must run with: `npm install && npm run dev` (frontend) and `node index.js` (backend)
- **Branding**: The text `ENG_ALAA MOHAMMED` and `AXIOM Engineering Suite` must appear in the header and exported files

---

*AXIOM Engineering Suite — Master Prompt v2.0*
*ENG_ALAA MOHAMMED | Basra, Iraq*
