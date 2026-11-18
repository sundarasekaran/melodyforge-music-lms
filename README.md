# MelodyForge: Gamified Multi-Instrument Music Learning Management System (LMS)

[![Deploy Frontend to GitHub Pages](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/sundarasekaran/melodyforge-music-lms/actions/workflows/deploy-pages.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=flat&logo=github)](https://sundarasekaran.github.io/melodyforge-music-lms/)
[![Backend](https://img.shields.io/badge/Backend-Render%20%7C%20Spring%20Boot%203-blue?style=flat&logo=render)](https://render.com)
[![Frontend](https://img.shields.io/badge/Frontend-Vercel%20%7C%20React%2019-black?style=flat&logo=vercel)](https://vercel.com)

A web-based, gamified music learning platform architected for multi-instrument education, featuring **Piano / Keyboard** as its flagship instrument, with modular support for **Guitar, Violin, and Drums**.

---

## 🌐 Live Deployments

- **Frontend (GitHub Pages)**: [https://sundarasekaran.github.io/melodyforge-music-lms/](https://sundarasekaran.github.io/melodyforge-music-lms/)
- **Backend (Render API)**: [https://melodyforge-music-lms-backend.onrender.com](https://melodyforge-music-lms-backend.onrender.com)
- **Backend Health Check**: [https://melodyforge-music-lms-backend.onrender.com/api/v1/health](https://melodyforge-music-lms-backend.onrender.com/api/v1/health)
- **Frontend (Vercel)**: Connect repository to Vercel (pre-configured via `vercel.json`).

---

## 🎹 System Highlights

- **4 Progressive Pedagogical Tiers**:
  - **Tier 1: BASICS** (Introduction & Familiarization, Fundamental Concepts, Basic Practical Learning)
  - **Tier 2: INTERMEDIATE** (Intermediate Theory, Playing Techniques, Practical Application)
  - **Tier 3: PRO** (Advanced Theory, Velocity & Expression, Repertoire Performance)
  - **Tier 4: EXPERT** (Expert Harmony, Mastery Techniques, Capstone Recital)
- **Integrated Instrument History Curriculum**:
  - Native educational modules built right into each instrument's learning path (e.g. Bartolomeo Cristofori's invention c. 1700, clavichords, harpsichords, cast-iron frame evolution, Classical/Romantic masters, 88-key modern standard, upright vs. grand, and modern MIDI synthesis).
- **Interactive Polyphonic Virtual Piano**:
  - High-fidelity acoustic piano harmonics and envelope powered by Tone.js and Web Audio API.
  - Interactive SVG musical staff (Treble Clef) updating in real-time with note heads and ledger lines.
  - Dual control: Mouse/touch and computer keyboard keys (`A S D F G H J K` / `W E T Y U`).
  - Octave shifting (C1 to C7) and key highlight practice guides.
- **Ear Training Arena**:
  - Single pitch identification, intervals (Major 3rd, Perfect 5th, Octave), and chord quality (Major vs. Minor triads) with instant audio playback and feedback.
- **Practice Studio & Pure Audio Recorder**:
  - Web Audio `MediaRecorder` capture with zero room noise.
  - Practice timer, journal reflection notes, and historical log.
- **Gamification Engine**:
  - XP points, dynamic level progression, daily practice streak flame counter, 7 unlockable badges, and live global leaderboard.
- **Admin Management Portal**:
  - Multi-instrument catalog management, platform metrics, and curriculum publishing.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Tone.js / Web Audio API, Lucide Icons.
- **Backend**: Java 17, Spring Boot 3, Spring Data JPA, Spring Security (JWT), H2 / PostgreSQL 18 dual-profile support.
- **Deployment**: Docker multi-stage build, GitHub Actions, GitHub Pages, Render Blueprint, Vercel SPA.

---

## ☁️ Cloud Deployment Guide

### Deploying the Backend on Render
1. Go to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Blueprint** (or **Web Service** $\rightarrow$ **Build and deploy from a Git repository**).
3. Select `sundarasekaran/melodyforge-music-lms`.
4. Render automatically detects `render.yaml` and `backend/Dockerfile`.
5. Set environment variables:
   - `PORT`: `8080` (managed by Render)
   - `SPRING_PROFILES_ACTIVE`: `dev` (for instant zero-config in-memory H2 with seed data) or `prod` (with PostgreSQL)
   - `CORS_ALLOWED_ORIGINS`: `*` (or your frontend URLs)
6. Once deployed, note your Render backend URL (e.g., `https://melodyforge-music-lms-backend.onrender.com`).

### Deploying the Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import repository `sundarasekaran/melodyforge-music-lms`.
3. Vercel automatically detects `vercel.json` (or set Root Directory to `frontend`).
4. Add Environment Variable:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://melodyforge-music-lms-backend.onrender.com`).
5. Click **Deploy**.

### Deploying the Frontend on GitHub Pages
- GitHub Pages deployment is automated via `.github/workflows/deploy-pages.yml`.
- Pushing to the `main` branch automatically builds the React 19 application and publishes it live to:
  `https://sundarasekaran.github.io/melodyforge-music-lms/`.

---

## 🚀 Local Quick Start

### 1. Prerequisites
- **Node.js**: v20+
- **Java**: JDK 17+
- **Maven**: 3.9+

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
