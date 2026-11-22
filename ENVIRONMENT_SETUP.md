# MelodyForge Music LMS — Developer Environment Setup Guide

This guide walks new developers and contributors through configuring a local development environment for the **MelodyForge Music LMS** and running both frontend and backend services.

---

## 1. Prerequisites & Required Tooling

Ensure the following tools are installed on your machine before setting up the project:

| Tool | Recommended Version | Verification Command | Purpose |
|---|---|---|---|
| **Git** | 2.40+ | `git --version` | Source control management |
| **Node.js** | 20.x or 22.x LTS | `node --version` | Frontend runtime |
| **npm** | 10.x+ | `npm --version` | Frontend package manager |
| **Java JDK** | 17 LTS (Eclipse Temurin / OpenJDK) | `java --version` | Backend Java runtime |
| **Apache Maven** | 3.9+ | `mvn --version` | Backend build tool |
| **Android Studio** | Optional (for mobile) | Iguana / Jellyfish+ | Native Android builds |

---

## 2. Repository Setup

Clone the repository to your local machine:

```powershell
git clone https://github.com/sundarasekaran/melodyforge-music-lms.git
cd melodyforge-music-lms
```

---

## 3. Backend Setup & Execution

MelodyForge backend is powered by **Spring Boot 3** and is pre-configured with a zero-config development profile (`dev`) that runs an in-memory H2 database seeded with complete course curricula, instrument history, test accounts, and practice data.

### 1. Navigate to the backend directory
```powershell
cd backend
```

### 2. Run the test suite
```powershell
mvn test
```
*Expected output: All unit and integration tests pass with `BUILD SUCCESS`.*

### 3. Start the Spring Boot backend
```powershell
mvn spring-boot:run
```
*The backend starts at `http://localhost:8080`.*

### 4. Database Console & Inspection
- **H2 Web Console:** `http://localhost:8080/h2-console`
  - **JDBC URL:** `jdbc:h2:mem:musiclmsdb`
  - **Username:** `sa`
  - **Password:** *(leave blank)*
- **API Health Endpoint:** `http://localhost:8080/api/v1/health`

### 5. Pre-Seeded Accounts
The development profile initializes demo accounts automatically:

- **Learner Account:**
  - Username: `student`
  - Password: `student123`
  - Role: `ROLE_STUDENT`
  - Stats: Level 2, 250 XP, 4-day practice streak
- **Administrator Account:**
  - Username: `admin`
  - Password: `admin123`
  - Role: `ROLE_ADMIN`
  - Stats: Level 5, 1200 XP, 14-day practice streak

---

## 4. Frontend Setup & Execution

The frontend is built with **React 19**, **TypeScript**, and **Tailwind CSS v4** via **Vite**.

### 1. Open a new terminal and navigate to `frontend/`
```powershell
cd frontend
```

### 2. Install dependencies
```powershell
npm install
```

### 3. Run the unit test suite
```powershell
npm test
```
*Runs all 80 unit test cases across all 23 suites using Node's native test runner.*

### 4. Verify production compilation
```powershell
npm run build
```
*Ensures type safety and builds the production bundle in `frontend/dist/`.*

### 5. Launch the local development server
```powershell
npm run dev
```
*Vite will start the client application at `http://localhost:5173` with automatic API proxying to `http://localhost:8080`.*

---

## 5. Mobile Development Setup (Android via Capacitor)

If you are developing or testing the native Android APK:

### 1. Build and sync web assets to the Android platform
```powershell
cd frontend
npm run build
npx cap sync android
```

### 2. Launch Android Studio
```powershell
npx cap open android
```

### 3. Run on an Android Emulator or Physical Device
- In Android Studio, select a target device (e.g. Pixel 8 API 34 emulator or connected USB device).
- Click the green **Run (Shift+F10)** button.
- The app will install and open with native audio hardware unlock and safe area insets enabled.

---

## 6. Common Development Commands Reference

| Action | Location | Command |
|---|---|---|
| **Run all frontend tests** | `frontend/` | `npm test` |
| **Run all backend tests** | `backend/` | `mvn test` |
| **Build frontend production** | `frontend/` | `npm run build` |
| **Package backend JAR** | `backend/` | `mvn clean package -DskipTests` |
| **Sync Capacitor mobile** | `frontend/` | `npm run build:mobile` |
| **Run linter** | `frontend/` | `npm run lint` |

---

## 7. Troubleshooting & FAQ

1. **Port 8080 already in use:**
   - Terminate the conflicting process or change the port via `-Dserver.port=8081` when starting Maven.
2. **Audio context suspended warning in browser console:**
   - Normal browser security behavior. The Web Audio API automatically unlocks upon the first mouse click, tap, or keyboard touch.
3. **CORS issues in standalone frontend testing:**
   - Ensure the backend is running with `CORS_ALLOWED_ORIGINS=*` or that you are accessing the frontend via Vite's proxy at `http://localhost:5173`.
