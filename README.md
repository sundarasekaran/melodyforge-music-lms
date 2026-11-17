# MelodyForge: Gamified Multi-Instrument Music Learning Management System (LMS)

A web-based, gamified music learning platform architected for multi-instrument education, featuring **Piano / Keyboard** as its flagship instrument, with modular support for **Guitar, Violin, and Drums**.

---

## 🎹 System Highlights

- **4 Progressive Pedagogical Tiers**:
  - **Tier 1: BASICS** (Introduction & Familiarization, Fundamental Concepts, Basic Practical Learning)
  - **Tier 2: INTERMEDIATE** (Intermediate Theory, Playing Techniques, Practical Application)
  - **Tier 3: PRO** (Advanced Theory, Velocity & Expression, Repertoire Performance)
  - **Tier 4: EXPERT** (Expert Harmony, Mastery Techniques, Capstone Recital)
- **10 Piano Historical Chapters**:
  - Full educational modules covering Bartolomeo Cristofori's invention (c. 1700), clavichords, harpsichords, cast-iron frame evolution, Classical/Romantic masters, 88-key modern standard, upright vs. grand, and modern MIDI/DAW digital synthesis.
- **Interactive Polyphonic Virtual Piano**:
  - High-fidelity acoustic piano harmonics and envelope powered by Tone.js and Web Audio API.
  - Interactive SVG musical staff (Treble Clef) updating in real-time with note heads and ledger lines.
  - Dual control: Mouse/touch and computer keyboard keys (`A S D F G H J K` / `W E T Y U`).
  - Octave shifting (C1 to C7) and key highlight practice guides.
- **Ear Training Arena**:
  - Single pitch identification, intervals (Major 3rd, Perfect 5th, Octave), and chord quality (Major vs. Minor triads) with instant audio playback and feedback.
- **Practice Studio & Pure Audio Recorder**:
  - Web Audio `MediaRecorder` capture with zero room noise.
  - Practice timer, journal reflection notes, and historical log stored in PostgreSQL/H2.
- **Gamification Engine**:
  - XP points, dynamic level progression (Level 1, 2, 3...), daily practice streak flame counter, 7 unlockable badges, and live global leaderboard.
- **Admin Management Portal**:
  - Multi-instrument catalog management, platform metrics, and curriculum publishing.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Tone.js / Web Audio API, Lucide Icons.
- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security (JWT), H2 / PostgreSQL 18 dual-profile support.
- **Architecture**: Modular, pluggable instrument schema with reusable tiers, levels, courses, lessons, and interactive exercises.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **Java**: JDK 17+
- **Maven**: 3.9+
- *(Optional)* PostgreSQL 18 (default runs instantly with zero-config embedded H2)

### 2. Run the Backend
```powershell
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8080`. H2 database console is accessible at `http://localhost:8080/h2-console`.*

### 3. Run the Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 👤 Pre-Seeded Demo Accounts

The application automatically seeds the database with demo accounts for immediate evaluation:

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Student** | `student` | `student123` | Alex Rivera (Level 2, 250 XP, 4-day streak, Tier 1 learner) |
| **Admin** | `admin` | `admin123` | Platform Administrator with instrument and curriculum control |

*(You can also seamlessly switch between Student and Admin directly from the top-right user menu in the UI).*
