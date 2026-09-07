# NYC Subway Real-Time Arrivals & Rotating Platform Sign 🚇

A high-fidelity real-time NYC Subway arrival tracking website built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, powered directly by official **MTA General Transit Feed Specification (GTFS)** and **GTFS-Realtime Protocol Buffers**.

Includes an authentic **rotating overhead LED countdown sign** replicating the physical countdown clocks installed in NYC subway stations.

![NYC Subway Arrivals Banner](https://raw.githubusercontent.com/nikhilgrover/mta-feed/main/public/preview.png)

---

## ✨ Features

- 🕒 **Authentic NYC Subway Rotating Overhead Sign**:
  - Industrial dark-steel enclosure with ceiling mounts, cooling louvers, and corner rivets.
  - Realistic Amber LED dot-matrix raster overlay (`radial-gradient` matrix grid) with amber bloom.
  - Automatic page rotation (3 trains per page, cycling every 6.5 seconds).
  - Flashing **&ldquo;ARR&rdquo;** indicator when trains are approaching ($\le 60$ seconds away).
  - Continuous scrolling bottom LED marquee ticker displaying live line advisories and MTA safety notices.
  - Interactive controls: direction filter (All / Uptown / Downtown), pause/resume rotation, previous/next page, LED vs OLED mode, and fullscreen kiosk mode.
- 🔊 **Synthesized NYC Subway Chime**:
  - Authentic dual-tone chime ($D_5 \to A_4$) generated in-browser via the Web Audio API without heavy external audio files.
- 🔍 **Comprehensive Station Search & Filter Graph**:
  - Covers all **496 station platforms** across Manhattan, Brooklyn, Queens, Bronx, and Staten Island.
  - Instant auto-complete search by station name, line, or stop ID.
  - Filter chips for all 5 boroughs and all 24 subway lines.
  - Persistent favorite stations saved to `localStorage`.
  - Quick-access shortcuts to major hubs (Times Sq, Grand Central, Union Sq, Bedford Av, Penn Station, Barclays Ctr).
- 📊 **Detailed Platform Schedule Dashboard**:
  - Split-direction platform view (Uptown/Northbound vs. Downtown/Southbound).
  - Accurate countdown in minutes and scheduled arrival clock time.
  - Delay badges ($+X\text{m}$ delay) and train sequence indicators.
  - Auto-refreshing every 30 seconds with a live countdown timer ring and manual refresh button.
- ⚠️ **Live MTA Service Advisories**:
  - Ingests real-time service alerts (`camsys/subway-alerts.json`) filtered to the specific lines serving the selected station.
- 📐 **Interactive System Architecture Blueprint**:
  - In-app staff-level System Design Interview (SDI) modal breaking down Protobuf vs. JSON, Push vs. Pull transit models, and edge caching.

---

## 🏗️ Architecture & GTFS Telemetry

```
[MTA Wayside ATS Relays] 
       │ (15-30s cycle)
       ▼
[MTA Central Telemetry Server]
       │
       ▼ Protobuf serialization (12 - 18 KB shards)
[AWS CloudFront Edge CDN] (HTTP/2, CORS *)
       │
       ├────────────────────────────────────────┐
       ▼                                        ▼
[Browser Client: gtfs-realtime-bindings]   [Firebase Hosting Edge CDN]
- Selective Line Shard Fetching           - SPA rewrites (/** -> index.html)
- In-Memory 12s Feed Cache                - Immutable asset caching
- Real-Time Rotational Paging Engine      - Global SSD delivery
- Web Audio Synthesizer
```

- **GTFS Documentation**: [https://gtfs.org/documentation/overview/](https://gtfs.org/documentation/overview/)
- **MTA Developer Portal**: [https://new.mta.info/developers](https://new.mta.info/developers)

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on v26.8.1)
- **npm**: v9+

### 2. Installation
```bash
git clone https://github.com/nikhilgrover/mta-feed.git
cd mta-feed
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🌐 Deploy to Firebase Hosting

This project is pre-configured with `firebase.json` for zero-configuration static deployment to Firebase Hosting.

### 1. Authenticate with Firebase
```bash
npx firebase login
```

### 2. Connect Your Firebase Project (Optional if already configured)
```bash
npx firebase use --add
```
Or edit `.firebaserc` with your Firebase project ID.

### 3. Build & Deploy
```bash
npm run build
npx firebase deploy --only hosting
```

Your site will be live at:
`https://<your-project-id>.web.app`

---

## 📁 Project Structure

```
mta-feed/
├── firebase.json               # Firebase Hosting configuration & SPA rewrites
├── .firebaserc                 # Firebase project mapping
├── index.html                  # HTML entry point with dark theme
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite config with Tailwind & MTA dev proxy
├── tsconfig.json               # TypeScript configuration
├── scripts/
│   └── generate_stations.py    # Generates typed station & stop mapping datasets
└── src/
    ├── main.tsx                # React root mount
    ├── App.tsx                 # Main layout & polling coordinator
    ├── index.css               # Dot matrix raster, scanlines, marquee keyframes
    ├── constants/
    │   └── routes.ts           # Route colors, bullet shapes, and feed URLs
    ├── data/
    │   ├── stations.ts         # 496 official MTA subway stations dataset
    │   └── stopNames.ts        # 1,497 stop ID to station name dictionary
    ├── services/
    │   └── mtaApi.ts           # GTFS-RT Protobuf ingestion & alerts parser
    ├── utils/
    │   └── audioChime.ts       # Web Audio API dual-tone subway chime
    └── components/
        ├── SubwaySign.tsx      # Rotating LED platform sign with marquee
        ├── StationSelector.tsx # Search, borough filter, line filter, favorites
        ├── ArrivalsBoard.tsx   # Split platform arrival schedule
        ├── AlertsDrawer.tsx    # Live MTA service alerts drawer
        ├── RouteBullet.tsx     # Official circular/diamond route bullets
        └── SystemDesignModal.tsx # Interactive SDI architecture blueprint
```

---

## 📜 License

MIT License. Designed with Google Antigravity. Transit data provided by the Metropolitan Transportation Authority (MTA).
