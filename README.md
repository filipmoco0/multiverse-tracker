# 💥 Multiverse Tracker (MCU & DCU Watchlist)

> A modern, responsive Neo-Brutalist comic-styled web application to track release & chronological watch orders across the **Marvel Multiverse** and **DC Universe**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwindcss)
![Zustand](https://img.shields.io/badge/State-Zustand-orange?style=flat)
![Deployment](https://img.shields.io/badge/Hosting-Vercel%20Free-green?style=flat&logo=vercel)

---

## ✨ Features

- **🌌 Marvel Multiverse Timeline (150 Titles):**
  - **MCU Sacred Timeline:** Phases 1 to 6 (Iron Man $\rightarrow$ Avengers: Secret Wars)
  - **Sony's Spider-Man Universe (SSU):** Venom, Morbius, Madame Web, Kraven
  - **Sony Animated Spider-Verse:** Into the Spider-Verse, Across the Spider-Verse, Beyond the Spider-Verse
  - **Sony Legacy Live-Action:** Sam Raimi Trilogy & Marc Webb Amazing Spider-Man duology
  - **20th Century Fox X-Men Universe:** 15 films & series including Deadpool, Logan, Legion, The Gifted
  - **Fox Fantastic Four & Daredevil:** 2000s classics & 2015 reboot
  - **Marvel Television & Defenders Saga:** 32 individual chronological seasons (Daredevil, Agents of S.H.I.E.L.D., Punisher, Jessica Jones, Luke Cage, Iron Fist, Defenders, Runaways, Cloak & Dagger, Helstrom, M.O.D.O.K., Hit-Monkey)
  - **Marvel Standalone Legacy:** Wesley Snipes Blade Trilogy, 2003 Ang Lee Hulk, 2004 Punisher, Ghost Rider

- **⚡ DC Universe & Elseworlds (27 Titles):**
  - **DCU Chapter 1: Gods & Monsters:** Creature Commandos, Superman (2025), Peacemaker S2, Supergirl, Lanterns
  - **DCEU / Snyderverse:** Man of Steel through Aquaman and the Lost Kingdom
  - **DC Elseworlds:** The Batman Crime Saga & Joker series

- **🎨 Neo-Brutalist Modern Comic Design:**
  - High-contrast retro borders, halftone dot backgrounds, bold comic typography (Bebas Neue / Bangers), and confetti milestone celebrations.

- **🔑 BYOK (Bring Your Own Key) System:**
  - 100% private client-side API key management in `localStorage`.
  - Validate and use your personal free TMDB API key for zero rate-limiting.

- **🔄 Trakt.tv & Offline Support:**
  - OAuth 2.0 and instant username scrobbling with Trakt.tv.
  - Full local storage guest caching with JSON backup/restore.

- **🛡️ Curator Admin Dashboard (`/admin`):**
  - Live TMDB visual poster gallery grid selection.
  - Direct exact TMDB ID lookup.
  - Manual poster image URL overrides and live previews.

---

## 🚀 Instant 1-Click Deployment to Vercel (Free)

### Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. Push this project to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release"
   git remote add origin https://github.com/YOUR_USERNAME/multiverse-tracker.git
   git branch -M main
   git push -u origin main
   ```
2. Go to **[vercel.com](https://vercel.com)** and sign in with GitHub.
3. Click **"Add New..." $\rightarrow$ "Project"** and import your repository.
4. Click **"Deploy"** (no environment variables required to start!).

### Method 2: Deploy via Vercel CLI

```bash
npx vercel
```
Follow the interactive prompts to link and deploy in seconds.

---

## 🛠️ Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Open browser at http://localhost:3000
```

---

## 📜 License
MIT License. Built for comic & superhero movie fans worldwide.
