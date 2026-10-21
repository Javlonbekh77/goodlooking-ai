# GoodLooking — AI Hairstyle Try-On MVP

**GoodLooking** is an AI-powered hairstyle preview platform built for barbershops and clients. It allows barbers and customers to preview realistic haircuts, fades, and styles directly on a portrait photo **BEFORE** cutting hair, powered by Google Gemini image generation and editing.

The design faithfully reproduces the mobile-first luxury aesthetic from the reference (`img1 phone.jpeg`): obsidian black backgrounds, vibrant warm gold/yellow accents (`#F5C518`), rounded dark cards, sleek typography, interactive before-and-after comparisons, and a mobile status bar.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Google Gemini API key:
```env
# Get your API key at https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Configurable Gemini image-generation / editing model:
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Features & App Architecture

### 1. Mobile-First Luxury UI (Matching Reference `img1 phone.jpeg`)
- **Mobile Viewport Frame**: Centered 430px iPhone shell on desktop with status bar (`9:30 PM`, battery, wifi), dynamic island, and desktop toggle for full-window mode.
- **Color Palette**: Deep obsidian (`#08080a`), dark cards (`#141419`), yellow primary accents (`#F5C518`), subtle borders (`rgba(255, 255, 255, 0.08)`).
- **Floating Bottom Navigation**: Smooth pill dock supporting **Home**, **Explore**, **AI Try-On**, **History**, and **Profile**.

### 2. Required Views
- **Page A: Home**:
  - Greeting header: "Welcome Hay, Kelly 👋" with avatar and notification bell.
  - Hairstyle search bar.
  - "Best Category" horizontal scrollable filter pills.
  - Featured "Special Offers" card matching reference with barbershop photography, ⭐ 5.0 rating, location badge ("Star Quality Cutz"), and primary yellow action button.
- **Page B: AI Hairstyle Studio**:
  - **Step 1 — Upload a Photo**: Drag & drop, device photo library, mobile camera capture, or 1-click "Use Sample" portrait button.
  - **Step 2 — Select Hairstyle**: 8+ curated haircut templates with thumbnails, names, descriptions, and gold-ring selected states:
    - *Classic Fade*
    - *Textured Crop*
    - *Modern Undercut*
    - *Curly Top Fade*
    - *Clean Buzz Cut*
    - *Executive Side Part*
    - *Textured Quiff*
    - *Slick Back Taper*
    - Optional barber custom notes (e.g., low skin taper, keep beard).
  - **Step 3 — Generate**: Large yellow action button with animated progress bar and dynamic multi-phase status messages ("Analyzing facial geometry & hairline...", "Gemini AI generating cut...", "Polishing textures...").
- **Page C: Results View**:
  - **Interactive Before & After Split Slider**: Draggable handle to wipe between Original portrait and AI Hairstyle Preview.
  - Toggle between split comparison slider and side-by-side mode.
  - Download generated image (`.png`).
  - "Try Another Style" (retains same uploaded portrait).
  - Disclaimer notice.
- **Page D: Explore Cuts**:
  - Full catalog of hairstyle templates with category and face-shape filters (Oval, Square, Round, Oblong, Heart).
  - 1-click "Try on my photo" button that preselects the hairstyle into the Studio.
- **Page E: History**:
  - Locally stored generation history (`localStorage`).
  - Before/After dual thumbnail cards with timestamp, re-view, download, and delete actions.
- **Page F: Profile & Settings**:
  - Demo profile for Kelly.
  - Backend Gemini API key configuration status indicator.
  - Hair texture and face shape preferences.
  - Privacy and photo retention policy.

---

## 🤖 Backend API & Gemini Integration

### Endpoint: `POST /api/generate-hairstyle`
- Accepts `multipart/form-data` or JSON with base64 image data and `hairstyleId`.
- Validates file MIME types (`image/jpeg`, `image/png`, `image/webp`) and enforces a 10MB limit.
- Constructs high-fidelity barbershop editing instructions:
  > *"Edit the provided portrait photo to show the same person with a realistic [Hairstyle Name] haircut ([Description]). Preserve the person's identity, face shape, eyes, nose, mouth, skin tone, facial hair/beard, expression, head angle, lighting, and background as closely as possible. Change only the hairstyle and the necessary surrounding hair details..."*
- Calls the official Google Gen AI SDK (`@google/genai`) on the server.
- **API Key Security**: The `GEMINI_API_KEY` is exclusively read on the server side and is never exposed to client-side code.
- If the key is not configured, the endpoint returns a clear structured response (`MISSING_API_KEY`) without crashing the application.

### Endpoint: `GET /api/status`
- Reports backend model status and whether the Gemini API key is configured.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS tokens
- **AI SDK**: `@google/genai` (Official Google Gen AI SDK)
- **Icons**: `lucide-react`
- **Effects**: `canvas-confetti`
