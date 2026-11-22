# MelodyForge: Gamified Multi-Instrument Music Learning Management System (LMS)

[![Deploy Frontend to GitHub Pages](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/deploy-pages.yml)
[![Build Android APK](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/build-apk.yml/badge.svg)](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/build-apk.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat&logo=github)](https://sundarasekaran.github.io/melodyforge-music-lms/)
[![Android APK](https://img.shields.io/badge/Download-Android%20APK-3DDC84?style=flat&logo=android&logoColor=white)](https://github.com/sundarasekaran/melodyforge-music-lms/releases/latest)
[![iOS App](https://img.shields.io/badge/iOS-PWA%20%2F%20Xcode-black?style=flat&logo=apple&logoColor=white)](https://sundarasekaran.github.io/melodyforge-music-lms/)
[![Backend](https://img.shields.io/badge/Backend-Render%20%7C%20Spring%20Boot%203-blue?style=flat&logo=render)](https://render.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel%20%7C%20React%2019-black?style=flat&logo=vercel)](https://vercel.com)
[![Release](https://img.shields.io/badge/Release-v1.0%20Unified%20Integration-gold?style=flat&logo=git)](https://github.com/sundarasekaran/melodyforge-music-lms/releases)

**MelodyForge** is an enterprise-grade, web-based, gamified music education learning management system architected for multi-instrument pedagogy. It combines high-fidelity Web Audio acoustic synthesis, interactive pedagogical science labs, structured practice routines, authoritative graded examinations, tamper-evident cryptographic graduation diplomas, and real-time student/admin analytics.

While **Piano & Keyboard** serves as the flagship conservatory instrument, the platform features a modular relational schema supporting **Acoustic Guitar, Violin, and Drums** across all four tiers of curriculum.

---

## 🏛️ The Five Integrated Phases (MelodyForge + PianoVerse)

MelodyForge integrates the pedagogy, interactive physics simulations, and examinations of **PianoVerse** into a single cohesive architecture across 5 completed engineering phases:

1. **Phase 1: Audio Engine & Virtual Piano**
   - Five-harmonic additive acoustic synthesis with Grand Piano, Electric Piano, and Harpsichord timbres.
   - 88-key concert grand virtual piano with mouse, touch, and dual-row keyboard mapping (`A-S-D-F-G-H-J-K` / `W-E-T-Y-U`).
   - Dynamics compressor, sustain pedal, zero-stuck-note voice tracking, and pure Web Audio `MediaRecorder` capture.
2. **Phase 2: Curriculum & Interactive Pedagogical Labs**
   - 60 FPS interactive Sound Action Physics Lab (acoustic key strike mechanics, hammer let-off, string vibration, dampers).
   - Posture and Hand Positioning Lab (ergonomic bench alignment and 1–5 finger numbering).
   - Treble Clef Notation Theory Lab (interactive stave, ledger lines, and duration values).
   - Keyboard Explorer Game (8 progressive tactile note identification challenges).
3. **Phase 3: Conservatory Metronome & Structured Practice**
   - Professional metronome (40–208 BPM) with sample-accurate Web Audio native scheduling.
   - Interactive tap-tempo calculation engine and historical Italian tempo markings (Largo to Presto).
   - Five pedagogical practice routines: Rhythm & Timing, Finger Independence, Scale Practice, Chord Transitions, and Melody Practice with guided exercise steps and persistent session logging.
4. **Phase 4: Assessments & Graduation Certificates**
   - Three authoritative graded examinations (Level 1: 70%, Level 2: 75%, Level 3: 80% passing thresholds).
   - Anti-farming XP limits, prerequisite level progression, and client payload sanitization to prevent DevTools cheating.
   - Archival Conservatory Graduation Diploma with server-verified SHA-256 cryptographic signatures.
   - Public third-party diploma verification endpoint (`GET /api/v1/assessments/verify/{certNumber}`).
5. **Phase 5: Final Harmonization, Analytics & Mobile Release**
   - Unified dark slate aesthetic (`#020617` / `slate-950` / `slate-900`) across all 4 instruments, reserving gold and serif accents strictly for Piano Conservatory contexts.
   - Learner Analytics Command Center (`MyProgressView.tsx`) with 7-day practice duration bar chart, multi-instrument progress matrix, and exam history.
   - Admin Platform Intelligence (`AdminPortal.tsx`) with platform KPIs, multi-instrument adoption share, top completed lessons, and server-side paginated student roster.
   - Mobile optimization with safe area insets (`env(safe-area-inset-top/bottom)`), `100dvh`, $\ge 44\text{px}$ touch targets, and background pause cleanup.

---

## 📱 Mobile Applications (Android & iOS)

MelodyForge is packaged with **Capacitor 8** and **PWA** to deliver a native app experience on mobile devices:

- **🤖 Android APK**:
  - Download the latest standalone **`MelodyForge.apk`** from [GitHub Releases](https://github.com/sundarasekaran/melodyforge-music-lms/releases/latest).
  - Tap on the downloaded APK on your Android device to install.
  - Or build locally: `npm run build:mobile` and open in Android Studio (`npm run cap:android`).
- **🍎 iOS (iPhone & iPad)**:
  - **Instant 1-Tap Install (PWA)**: Open [https://sundarasekaran.github.io/melodyforge-music-lms/](https://sundarasekaran.github.io/melodyforge-music-lms/) in Safari on iOS $\rightarrow$ tap **Share** $\rightarrow$ select **"Add to Home Screen"**. Installs as a standalone fullscreen app with offline caching and hardware audio unlock.
  - **Native Xcode Project**: Located at `frontend/ios/`. Open via `npm run cap:ios` to compile for TestFlight or App Store.

---

## 🌐 Live Deployments

- **Frontend (GitHub Pages)**: [https://sundarasekaran.github.io/melodyforge-music-lms/](https://sundarasekaran.github.io/melodyforge-music-lms/)
- **Backend (Render API)**: [https://melodyforge-music-lms-backend.onrender.com](https://melodyforge-music-lms-backend.onrender.com)
- **Backend Health Check**: [https://melodyforge-music-lms-backend.onrender.com/api/v1/health](https://melodyforge-music-lms-backend.onrender.com/api/v1/health)
- **Public Certificate Verifier**: [https://melodyforge-music-lms-backend.onrender.com/api/v1/assessments/verify/MF-PIA-2026-0001](https://melodyforge-music-lms-backend.onrender.com/api/v1/assessments/verify/MF-PIA-2026-0001)

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons |
| **Audio Synthesis** | Web Audio API (Native custom 5-harmonic engine), Tone.js |
| **Mobile Runtime** | Capacitor 8 (Android & iOS), Progressive Web App (PWA) manifest |
| **Backend Framework** | Java 17 LTS, Spring Boot 3, Spring Data JPA, Hibernate |
| **Security & Auth** | Spring Security 6, Stateless JWT (HMAC-SHA256), Role-based guards |
| **Database** | Dual profile: PostgreSQL 15+ / 16+ / 18+ (`prod`), In-Memory H2 (`dev`) |
| **Testing** | Node.js native test runner (Frontend: 80 tests), JUnit 5 & Mockito (Backend: 17 tests) |
| **DevOps & Cloud** | Docker multi-stage builds, Render Web Service, Vercel SPA, GitHub Actions |

---

## 🚀 Local Quick Start

### 1. Prerequisites
- **Node.js**: v20+ or v22+
- **Java**: JDK 17+ (Eclipse Temurin or OpenJDK)
- **Maven**: 3.9+

### 2. Run the Backend
```powershell
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`. H2 database console is available at `http://localhost:8080/h2-console`.*

### 3. Run the Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 🧪 Comprehensive Test Suite

### Run Frontend Tests (80 unit tests)
```powershell
cd frontend
npm test
```
*All 80 tests pass across 23 test suites covering audio synthesis, metronome math, practice routines, pedagogical labs, assessment thresholds, and mobile ergonomics.*

### Run Backend Tests (17 unit and integration tests)
```powershell
cd backend
mvn test
```
*All 17 tests pass covering analytics aggregations, server-side pagination, assessment evaluation, and tamper-resistant certificate verification.*

---

## 👤 Pre-Seeded Demo Accounts

The application automatically seeds the database with demo accounts for immediate evaluation:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student` | `student123` | Alex Rivera (Level 2, 250 XP, 4-day streak, Tier 1 learner) |
| **Admin** | `admin` | `admin123` | Platform Administrator with platform intelligence & curriculum controls |

---

## 📚 Documentation Directory

- [DEPLOYMENT_GUIDE.md](file:///c:/Users/sunda/Downloads/LMS/DEPLOYMENT_GUIDE.md): Production deployment manual (Docker, Render, Vercel, PostgreSQL, Android APK)
- [ENVIRONMENT_SETUP.md](file:///c:/Users/sunda/Downloads/LMS/ENVIRONMENT_SETUP.md): Developer onboarding and local configuration
- [PHASE_5_FINAL_REPORT.md](file:///c:/Users/sunda/Downloads/LMS/PHASE_5_FINAL_REPORT.md): Complete Phase 5 final release audit report
- [PHASE_4_IMPLEMENTATION_REPORT.md](file:///c:/Users/sunda/Downloads/LMS/PHASE_4_IMPLEMENTATION_REPORT.md): Phase 4 Graded Assessments & Certificates report
- [PHASE_3_IMPLEMENTATION_REPORT.md](file:///c:/Users/sunda/Downloads/LMS/PHASE_3_IMPLEMENTATION_REPORT.md): Phase 3 Metronome & Practice report
- [PHASE_2_IMPLEMENTATION_REPORT.md](file:///c:/Users/sunda/Downloads/LMS/PHASE_2_IMPLEMENTATION_REPORT.md): Phase 2 Curriculum & Pedagogical Labs report
- [PHASE_1_IMPLEMENTATION_REPORT.md](file:///c:/Users/sunda/Downloads/LMS/PHASE_1_IMPLEMENTATION_REPORT.md): Phase 1 Audio Engine & Virtual Piano report

---

## 📄 License & Attribution

- **MelodyForge LMS**: MIT License & Apache 2.0 Notices preserved.
- **PianoVerse Reference**: Integrated under permitted academic open-source pedagogical collaboration with all original licenses acknowledged.
