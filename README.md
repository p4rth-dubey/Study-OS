<div align="center">

<img src="./app/icon.svg" width="120" height="120" alt="PrepTrack logo" />

# StudyOS

### StudyOS — the best, offline-first evolution of the CBSE study tracker.

*Know exactly what to study next.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-22c55e?style=for-the-badge&logo=google-chrome&logoColor=white)](https://study-os-p4rth1.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwind-css&logoColor=black)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-offline_first-6a4cf5?style=flat-square)](https://web.dev/progressive-web-apps/)

[**✨ Try the live demo**](https://github.com/p4rth-dubey/Study-OS) ·

[Features](#features) · [Setup](#setup) · [Tests](#tests) · [Contributors](#contributors)


</div>

## What is this

StudyOS plans **backwards from your exam datesheet** and scopes every number
to your **real exam syllabus**. For CBSE **Class 9 & 10 — Science, Maths, and
Social Science** — each chapter breaks into finishable stages, and the tracker
tells you the one honest number that matters: **stages per day**.

<p align="center">
<b>📴 Offline-first</b> · install it, lose signal, keep studying<br/>
<b>🔒 No accounts</b> · progress lives on the student's own device<br/>
<b>💸 Free forever</b> · one-file backup moves everything to a new phone
</p>

## Features

| Area | What you get |
| --- | --- |
| 🏠 Dashboard | Greeting band, live stats, per-subject pace cards, Today's to-do, multi-exam quick launch, Class 10 CBSE news |
| ⚡ AI Practice Lab | Timed CBT Mock Tests, PYQ drills, question palette, autosave recovery, detailed scoring & explanations |
| 🏛 Multi-Exam Hub | 12 supported exams across School (CBSE 9-12), Engineering (JEE/GATE), Medical (NEET), Govt (UPSC/SSC/Bank), Entrance (CUET) |
| 📢 Exam Updates | Verified official exam circulars, admit cards, datesheets, application windows & countdowns |
| 🎓 Scholarship Finder | Verified Central & State merit scholarships (NMMSS, INSPIRE, AICTE Pragati, PM-YASASVI) with direct portal links |
| 📰 Current Affairs | Daily exam-tailored news digests, 5-question daily drills with instant feedback, and revision flashcards |
| 📖 Chapters & Stages | Full NCERT lists — 5 stages/chapter (Class 10), 3 (Class 9); tap dots Not started → In progress → Done |
| 📊 Insights & Analysis | 7-day activity, completion rings, pace-vs-target, weakest-stage callout, finish forecast, heatmap |
| 🔁 Revision queue | Stale stages resurface automatically for spaced repetition |
| 🎯 Goals & ✅ To-Do | Weekly goal stepper with fanfare, per-profile task lists |
| 📄 Resources Library | 8 Competency (CBQ) PDF volumes on-device + official syllabi, NCERT digital books, and PYQ portals |
| ⚙️ Settings | Syllabus editor, datesheet, backup/restore, profiles, sounds, diagnostics |

## Setup

<details>
<summary><b>Run it locally</b></summary>

```bash
npm install

# Development — http://localhost:3000
npm run dev

# Unit & Engine Verification Tests
npm run test:unit

# Production Build
npm run build
npm run start -- --port 3111
```

</details>

## Tests

<details>
<summary><b>How we verify</b></summary>

```bash
# Unit verification: exam registry, marking schemes, negative scoring, question validation
npm run test:unit

# Playwright E2E verification across mobile, tablet, and desktop viewports
node tests/e2e.mjs
```

Every push is type-checked (`tsc`), unit tested, production-built, and Playwright-tested with zero console errors before it ships.

</details>

## Project layout

- `app/` — routes (`/` landing, `/app/*` tracker, practice, exams, updates, scholarships, current-affairs), API route handlers (`/api/practice/*`)
- `components/` — landing, tracker UI atoms, hero scene/video, PWA registration, profile switcher
- `lib/` — `storage` (`cbse_tracker_v1`), `exams` registry, `practice` engine & question bank, `updates`, `scholarships`, `current-affairs`, chapters, stages, planner, insights
- `public/pdfs/` — CBQ volumes (never precached, keeps installs light), `sw.js`
- `tests/` — Unit suites (`unit-exams-practice.mjs`) & Playwright E2E suites (`e2e.mjs`)


## Contributors

Thanks to everyone who makes StudyOS better:

<table>
<tr>
<td align="center" width="200">
<a href="https://github.com/p4rth-dubey"><img src="https://avatars.githubusercontent.com/u/342480038?s=60&v=4" width="100" height="100" alt="Parth" loading="lazy" style="border-radius:50%" /><br/><b>Parth Veer Dubey</b></a><br/>Owner & Maintainer
</td>
<td align="center" width="200">
<a href="https://github.com/Tanmay-WebDev"><img src="https://avatars.githubusercontent.com/u/186921813?v=4" width="100" height="100" alt="Tanmay" loading="lazy" style="border-radius:50%" /><br/><b>Tanmay SIngh</b></a><br/>Contributor
</td>
</tr>
</table>

---

<div align="center">

© StudyOS by Parth Veer Dubey · Study data never leaves your device.

</div>
