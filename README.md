<div align="center">

# 🩺 CareSync

**AI-powered healthcare appointment management, built for patients, doctors, and clinics.**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-Server%20Actions-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)

[Features](#-features) • [Quick Start](#-quick-start) • [Configuration](#-environment-variables) • [Schema](#%EF%B8%8F-database-schema) • [API](#-api-reference)

</div>

---

## ✨ Features

| | |
|---|---|
| 🔐 **Role-Based Access** | Dedicated, secure dashboards for **Patients**, **Doctors**, and **Admins**. |
| 🤖 **AI-Powered Insights** | Google Gemini analyzes symptoms to generate pre-visit clinical summaries and post-visit, patient-friendly notes. |
| 🔒 **Double-Booking Prevention** | A 5-minute temporary hold system backed by Prisma `Serializable` transactions guarantees no double bookings. |
| 🏖️ **Leave Management** | Doctor leave automatically triggers conflict resolution — cancelling affected appointments and notifying patients. |
| 📧 **Smart Notifications** | Nodemailer-driven confirmations, cancellations, and medication reminders. |
| 📆 **Google Calendar Sync** | Full OAuth 2.0 integration for real-time, two-way calendar sync for doctors and patients. |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database (Neon, Supabase, or local)
- **Google Cloud Console** account (for Calendar API)
- **Google AI Studio** account (for Gemini API)

### 1. Clone & Install

```bash
git clone https://github.com/Shivam-Nagulwar/Healthcare-appointment-manager.git
cd Healthcare-appointment-manager/app
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Then fill in the required keys — see [Environment Variables](#-environment-variables) below.

### 3. Set Up the Database

```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the App

```bash
npm run dev
```

Then open **[http://localhost:3000](http://localhost:3000)**.

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | API key from Google AI Studio |
| `SMTP_*` | Email provider credentials (e.g. Gmail app password) |
| `GOOGLE_CLIENT_*` | Google OAuth client keys (see setup below) |

---

## 📅 Google Calendar Setup

Enable the **Connect Calendar** feature for doctors and patients:

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Calendar API**.
3. Go to **APIs & Services → OAuth consent screen** → select **External**, fill in the app details, and add yourself as a **Test User** (required while the app is in Testing mode).
4. Go to **Credentials → Create Credentials → OAuth client ID** (Web application).
5. Add the following to **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. Copy the **Client ID** and **Client Secret** into your `.env` file.

---

## 🗄️ Database Schema

Built with **Prisma ORM**. Key models:

| Model | Purpose |
|---|---|
| `User` | Base auth model — stores role (`PATIENT`, `DOCTOR`, `ADMIN`) and contact info |
| `PatientProfile` / `DoctorProfile` | Role-specific data: `specialization`, `workingHours`, `leaveDays`, `googleRefreshToken` |
| `Appointment` | Core transactional model — tracks `slotStart`, `slotEnd`, and `status` (`BOOKED`, `COMPLETED`, `CANCELLED`, `HELD`) |
| `PreVisitSummary` | AI-generated clinical summary, chief complaint, and urgency level |
| `PostVisitNote` | Doctor's clinical notes, prescriptions, and AI-generated patient summary |
| `Notification` | In-app alerts for users |

---

## 🧠 LLM Prompts (Gemini)

CareSync uses carefully crafted prompts to guarantee structured JSON output from Gemini.

<details>
<summary><strong>1. Pre-Visit Summary Prompt</strong></summary>

<br>

Analyzes raw patient symptoms to help the doctor prepare — instructs the model to act as a medical AI assistant and return structured JSON with fields for `chiefComplaint`, `urgencyLevel` (LOW/MEDIUM/HIGH), `differentialDiagnosis`, `suggestedQuestions`, and `redFlags`.

</details>

<details>
<summary><strong>2. Post-Visit Summary Prompt</strong></summary>

<br>

Translates clinical shorthand into plain-language instructions for patients — instructs the model to act as an empathetic medical assistant, avoid jargon, emphasize medication instructions and lifestyle advice, and return structured JSON with a single `patientSummary` field.

</details>

---

## 🌐 API Reference

Most internal mutations run through Next.js Server Actions. Background jobs are exposed as REST endpoints:

### `GET /api/cron/reminders`
Triggers daily appointment and medication reminders.

- **Security** — requires a valid `CRON_SECRET` in the `Authorization` header in production.
- **Actions:**
  1. Scans `Appointment` for visits happening tomorrow.
  2. Scans `PostVisitNote` for active prescriptions based on `durationDays`.
  3. Dispatches emails and in-app notifications.

### `GET /api/auth/google/login`
Initiates the Google OAuth 2.0 flow for calendar integration.

### `GET /api/auth/google/callback`
Handles the OAuth redirect, extracts tokens, and securely saves the `googleRefreshToken` to the user's profile.

---

<div align="center">

Made with ❤️ for better healthcare scheduling

</div>