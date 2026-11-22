# MelodyForge Music LMS — Production Deployment Guide

This guide provides comprehensive instructions for deploying the unified **MelodyForge + PianoVerse** application into production environments across web, cloud, and mobile platforms.

---

## 1. System Architecture Overview

MelodyForge operates on an enterprise single-backend architecture:

```
[ Client Layer ]
  - Web SPA: React 19 + TypeScript + Tailwind CSS v4 + Web Audio API
  - Android APK: Capacitor 8 Android runtime + Web Audio hardware unlock
  - iOS App: PWA standalone mode / Capacitor iOS Xcode build
          │
          ▼ (HTTPS / REST API + JWT Bearer Auth)
[ Backend Layer ]
  - Spring Boot 3.x (Java 17 LTS)
  - Spring Security 6 (Stateless JWT, CORS, Role-based guards)
  - Pedagogical Assessment Engine & SHA-256 Cryptographic Verifier
  - Analytics & Institutional Intelligence Aggregator
          │
          ▼ (JDBC / Hibernate JPA)
[ Persistence Layer ]
  - Production: PostgreSQL 15+ / 16+ / 18+ (Supabase, Neon, AWS RDS, Render Postgres)
  - Development / Demo: In-memory H2 Database with automatic schema and seed data
```

---

## 2. Environment Variables Matrix

### Backend Environment Variables (`backend/`)

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `PORT` | Optional | `8080` | HTTP listening port for Spring Boot |
| `SPRING_PROFILES_ACTIVE` | Optional | `prod` (or `dev`) | Profile: `prod` uses PostgreSQL; `dev` uses in-memory H2 with seed data |
| `DATABASE_URL` / `SPRING_DATASOURCE_URL` | In `prod` | `jdbc:postgresql://host:5432/musiclms` | PostgreSQL JDBC connection URL |
| `DATABASE_USERNAME` / `SPRING_DATASOURCE_USERNAME` | In `prod` | `musiclms_user` | PostgreSQL database username |
| `DATABASE_PASSWORD` / `SPRING_DATASOURCE_PASSWORD` | In `prod` | `strong_db_password` | PostgreSQL database password |
| `JWT_SECRET` | Required | `Strong256BitBase64OrHexSecretKeyForTokenSigning` | HMAC-SHA256 secret key for signing user authentication tokens |
| `JWT_EXPIRATION_MS` | Optional | `86400000` (24 hours) | Token expiration window in milliseconds |
| `CORS_ALLOWED_ORIGINS` | Optional | `*` (or specific origins) | Comma-separated allowed frontend domains (e.g. `https://sundarasekaran.github.io,https://melodyforge.com`) |

### Frontend Environment Variables (`frontend/`)

| Variable Name | Required | Default / Example | Purpose |
|---|---|---|---|
| `VITE_API_URL` | Optional | `/api/v1` (proxied in dev) | Base URL for backend API (e.g. `https://api.melodyforge.com/api/v1`) |
| `VITE_APP_NAME` | Optional | `MelodyForge LMS` | Client application display title |

---

## 3. Production Build Instructions

### Building the Frontend

```powershell
cd frontend
npm install --frozen-lockfile
npm run build
```
- Outputs static assets to `frontend/dist/`.
- Ready for zero-config hosting on Vercel, Netlify, Cloudflare Pages, GitHub Pages, or AWS S3 + CloudFront.

### Building the Backend Executable JAR

```powershell
cd backend
mvn clean package -DskipTests
```
- Outputs standalone executable JAR: `backend/target/music-lms-backend-1.0.0.jar`.

---

## 4. Docker Deployment

MelodyForge includes a multi-stage `backend/Dockerfile` optimized for minimal attack surface and memory footprint:

```dockerfile
# Build Stage
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/music-lms-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
```

### Running with Docker Compose

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: melodyforge-db
    restart: always
    environment:
      POSTGRES_DB: musiclms
      POSTGRES_USER: musiclms_user
      POSTGRES_PASSWORD: production_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: melodyforge-backend
    restart: always
    depends_on:
      - postgres
    environment:
      SPRING_PROFILES_ACTIVE: prod
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/musiclms
      SPRING_DATASOURCE_USERNAME: musiclms_user
      SPRING_DATASOURCE_PASSWORD: production_password
      JWT_SECRET: ProductionSecretKeyWithAtLeast256BitsLengthHere
      CORS_ALLOWED_ORIGINS: "*"
    ports:
      - "8080:8080"

volumes:
  pgdata:
```

Launch with:
```powershell
docker compose up -d
```

---

## 5. Cloud Platform Deployment

### Deploying the Backend on Render
1. Navigate to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\rightarrow$ **Web Service** $\rightarrow$ Connect `sundarasekaran/melodyforge-music-lms`.
3. Set root directory to `backend`.
4. Runtime: **Docker** (or Java with Build Command: `mvn clean package -DskipTests` and Start Command: `java -jar target/music-lms-backend-1.0.0.jar`).
5. Configure Environment Variables:
   - `SPRING_PROFILES_ACTIVE`: `prod`
   - `SPRING_DATASOURCE_URL`: PostgreSQL internal connection URL from Render Postgres
   - `SPRING_DATASOURCE_USERNAME`: Render database username
   - `SPRING_DATASOURCE_PASSWORD`: Render database password
   - `JWT_SECRET`: Generate a secure 64-character secret
   - `CORS_ALLOWED_ORIGINS`: `https://sundarasekaran.github.io,https://your-custom-domain.com`
6. Deploy and record the service URL (e.g. `https://melodyforge-backend.onrender.com`).

### Deploying the Frontend on Vercel
1. Open the [Vercel Dashboard](https://vercel.com/new).
2. Import repository `sundarasekaran/melodyforge-music-lms`.
3. Set **Root Directory** to `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://melodyforge-backend.onrender.com/api/v1`
5. Click **Deploy**. Vercel will build the SPA using `vercel.json` rewrite routing.

### Deploying the Frontend on GitHub Pages
1. Ensure `.github/workflows/deploy-pages.yml` is active.
2. Under Repository **Settings** $\rightarrow$ **Pages**, set source to **GitHub Actions**.
3. Pushes to `main` trigger automatic build and publish to `https://sundarasekaran.github.io/melodyforge-music-lms/`.

---

## 6. Android Mobile App Deployment (Capacitor)

MelodyForge includes full **Capacitor 8** native tooling for Android release:

### 1. Build and Sync Mobile Assets
```powershell
cd frontend
npm run build
npx cap sync android
```

### 2. Open in Android Studio
```powershell
npx cap open android
```

### 3. Generate Signed Android APK / AAB
1. In Android Studio, select **Build** $\rightarrow$ **Generate Signed Bundle / APK**.
2. Select **Android App Bundle (AAB)** for Google Play Store, or **APK** for direct sideloading.
3. Select your production release Keystore and key alias.
4. Set build variant to **release** and enable **V1 (Jar Signature)** and **V2 (Full APK Signature)**.
5. Click **Create**. The signed package will be generated at:
   `frontend/android/app/release/app-release.apk`.

---

## 7. Health Checks & Verification

After deployment, verify that the services are operational:

1. **Backend Health Check:**
   ```bash
   curl -i https://your-backend-domain.com/api/v1/health
   ```
   *Expected response:* HTTP 200 with status `UP`.

2. **Public Certificate Verification:**
   ```bash
   curl -i https://your-backend-domain.com/api/v1/assessments/verify/MF-PIA-2026-0001
   ```
   *Expected response:* HTTP 200 with valid certificate JSON payload and `isVerified: true`.

3. **Admin Platform Analytics (Guarded):**
   ```bash
   curl -i https://your-backend-domain.com/api/v1/analytics/admin
   ```
   *Expected response:* HTTP 401 Unauthorized or HTTP 403 Forbidden without `ROLE_ADMIN` JWT token.

---

## 8. Security Hardening Checklist

- [x] **HTTPS Only:** Enforce TLS 1.3 encryption across all client and API traffic.
- [x] **JWT Secret Strength:** Use a cryptographically secure 256-bit or 512-bit signing secret.
- [x] **CORS Whitelist:** Restrict `CORS_ALLOWED_ORIGINS` to trusted client domains.
- [x] **Sanitized Payloads:** Ensure public endpoints strip email addresses, user IDs, and password hashes.
- [x] **Tamper-Evident Signatures:** Verify that graduation certificates compute SHA-256 signatures server-side.
- [x] **Background Voice Cleanup:** Ensure Web Audio notes are terminated on page unload/visibility change.
