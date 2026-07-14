# CareSync - Healthcare Appointment Manager

CareSync is a state-of-the-art, AI-powered healthcare appointment management system. It provides a seamless booking experience for patients, robust schedule management for doctors, and an administrative dashboard for clinic management.

## Features
- **Role-Based Access**: Secure dashboards for Patients, Doctors, and Admins.
- **AI-Powered Insights**: Uses Google Gemini to analyze patient symptoms and generate pre-visit clinical summaries, as well as post-visit patient-friendly notes.
- **Double-Booking Prevention**: A robust 5-minute temporary hold system using Prisma `Serializable` transactions guarantees no double bookings.
- **Leave Management**: When doctors are marked on leave, the system automatically handles conflicts, cancels appointments, and notifies patients.
- **Smart Notifications**: Integrated Nodemailer for sending booking confirmations, cancellations, and medication reminders.
- **Google Calendar Sync**: Full OAuth 2.0 integration. Doctors and patients can connect their Google Calendars for real-time, automatic event synchronization.

---

## 🚀 Setup Guide

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (e.g., Neon, Supabase, or local)
- Google Cloud Console account (for Calendar API)
- Google AI Studio account (for Gemini API)

### 1. Clone & Install
```bash
git clone https://github.com/Shivam-Nagulwar/Healthcare-appointment-manager.git
cd Healthcare-appointment-manager/app
npm install
```

### 2. Environment Variables
Copy the example environment file and fill in your details:
```bash
cp .env.example .env
```

Required keys:
- `DATABASE_URL`: Your PostgreSQL connection string.
- `GEMINI_API_KEY`: Get this from Google AI Studio.
- `SMTP_*`: Your email provider details (e.g., Gmail app password).
- `GOOGLE_CLIENT_*`: Google OAuth keys (see setup below).

### 3. Database Setup
Push the schema to your database and seed it with mock data:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run the App
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 📅 Google Calendar Setup Steps

To enable the "Connect Calendar" feature for doctors and patients:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project and enable the **Google Calendar API**.
3. Go to **APIs & Services > OAuth consent screen**. Select **External**, fill in the required app details, and add yourself as a **Test User** (required while the app is in Testing mode).
4. Go to **Credentials > Create Credentials > OAuth client ID** (Web application).
5. Add `http://localhost:3000/api/auth/google/callback` to the **Authorized redirect URIs**.
6. Copy the **Client ID** and **Client Secret** into your `.env` file.

---

## 🗄️ Database Schema Overview

The system uses Prisma ORM. Key models include:

- **User**: Base model storing authentication, role (`PATIENT`, `DOCTOR`, `ADMIN`), and contact info.
- **PatientProfile / DoctorProfile**: Extended profiles containing role-specific data like `specialization`, `workingHours`, `leaveDays`, and `googleRefreshToken`.
- **Appointment**: The core transactional model. Tracks `slotStart`, `slotEnd`, and `status` (`BOOKED`, `COMPLETED`, `CANCELLED`, `HELD`).
- **PreVisitSummary**: Stores the AI-generated clinical summary, chief complaint, and urgency level based on patient symptoms.
- **PostVisitNote**: Stores the doctor's clinical notes, prescribed medications, and the AI-generated patient-friendly summary.
- **Notification**: Stores in-app alerts for users.

---

## 🧠 LLM Prompts (Gemini)

CareSync uses carefully crafted prompts to ensure structured JSON output from Gemini.

**1. Pre-Visit Summary Prompt**
Analyzes raw patient symptoms to help the doctor prepare:
> "You are an expert medical AI assistant. Analyze the patient's reported symptoms and generate a structured pre-visit summary for the doctor. Output ONLY valid JSON containing: 'chiefComplaint', 'urgencyLevel' (LOW/MEDIUM/HIGH), 'differentialDiagnosis', 'suggestedQuestions', and 'redFlags'."

**2. Post-Visit Summary Prompt**
Translates complex doctor shorthand into understandable instructions for the patient:
> "You are an empathetic medical assistant. The doctor has provided clinical notes and a list of prescriptions. Translate these into a patient-friendly summary. Use simple, non-jargon language. Emphasize how to take the medications and any lifestyle advice. Output ONLY valid JSON containing: 'patientSummary'."

---

## 🌐 API Docs

While the app primarily uses Next.js Server Actions for internal mutations, background jobs are exposed via standard REST endpoints:

### `GET /api/cron/reminders`
Triggers the daily appointment and medication reminders.
- **Security**: Must pass a valid `CRON_SECRET` in the `Authorization` header if used in production.
- **Actions**: 
  1. Scans `Appointment` table for upcoming visits tomorrow.
  2. Scans `PostVisitNote` for active prescriptions based on `durationDays`.
  3. Dispatches emails and DB notifications.

### `GET /api/auth/google/login`
Initiates the Google OAuth 2.0 flow for calendar integration.

### `GET /api/auth/google/callback`
Handles the OAuth redirect, extracts tokens, and saves the `googleRefreshToken` securely to the respective user profile.
