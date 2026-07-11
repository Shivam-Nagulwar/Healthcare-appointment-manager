# Healthcare Appointment & Follow-up Manager — Project Specification

## 1. Objective

A clinic platform with three role-based portals — **patient**, **doctor**, **admin** — that lets patients book appointments, submit symptoms in advance, and receive AI-generated pre-visit and post-visit summaries, with automated email notifications and Google Calendar sync for both patient and doctor.

## 2. Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | Single codebase for frontend + backend API routes |
| Database | PostgreSQL | Relational data (users, slots, appointments) needs referential integrity and unique constraints for double-booking prevention |
| ORM | Prisma | Type-safe queries, easy migrations, good Next.js integration |
| Auth | NextAuth.js (Auth.js), credentials provider, JWT session with `role` claim | Handles password hashing and session logic; middleware gates routes by role (patient / doctor / admin) |
| LLM | Google Gemini API | Pre-visit and post-visit summaries |
| Email | Nodemailer (Gmail SMTP) or Resend free tier | Booking confirmation, reminder, cancellation emails |
| Calendar | Google Calendar API, OAuth 2.0 | Per-user event creation/update/deletion |
| Background jobs | Standalone Node worker (`node-cron`), deployed as a separate service | Medication reminders, email retries, expired slot-hold cleanup |
| Hosting | Render (Web Service for the app + Cron Job/worker) | Free tier supports persistent background jobs, unlike serverless-only Vercel |
| Hosted Postgres | Neon or Supabase | Permanent free tier (Render's free Postgres expires after 30 days) |

## 3. High-level architecture

```
Users (patient / doctor / admin browser)
        │
        ▼
┌─────────────────────────────────────────┐
│           Next.js application            │
│  ┌───────────────┐   ┌─────────────────┐ │
│  │ Frontend pages │──▶│   API routes    │ │
│  │ (role-based UI)│   │ (auth, bookings,│ │
│  │                │   │  LLM calls)     │ │
│  └───────────────┘   └────────┬────────┘ │
└────────────────────────────────┼──────────┘
                                  ▼
        ┌─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌────────────────────────┐
│ Background worker │◀────────────▶│  PostgreSQL database   │
│ (cron: reminders, │              │ users, appointments,   │
│  retries, cleanup) │              │ logs                   │
└─────────┬─────────┘              └───────────┬────────────┘
          │                                     │
          ▼                                     ▼
┌───────────────────────────────────────────────────────────┐
│                     External services                      │
│  ┌───────────┐   ┌────────────────┐   ┌─────────────────┐  │
│  │ Gemini AI │   │  Email (SMTP)  │   │ Google Calendar │  │
│  │ symptom   │   │ booking emails │   │  event sync     │  │
│  │ summaries │   │                │   │                 │  │
│  └───────────┘   └────────────────┘   └─────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

**Why a separate background worker:** Next.js API routes only run on request; they can't sit and poll for due medication reminders. A standalone cron process, deployed alongside the app on Render, handles anything that needs to run on a schedule regardless of user traffic.

## 4. Repository structure

```
/app
  /(auth)/login, /register        → shared login, registration picks role
  /patient/...                    → dashboard, search doctors, book, symptom form
  /doctor/...                     → today's appointments, pre-visit summaries, post-visit notes
  /admin/...                      → manage doctors, leave calendar
  /api/...                        → route handlers (backend, REST-style)
/lib
  db.ts          → Prisma client
  auth.ts        → NextAuth config, role checks
  gemini.ts      → Gemini API wrapper + prompt templates
  email.ts       → Nodemailer wrapper
  calendar.ts    → Google Calendar OAuth + event CRUD
/prisma
  schema.prisma
/worker
  index.ts       → standalone cron entry point, deployed as its own Render service
/components      → shared UI (forms, tables, calendar picker)
.env.example
README.md
```

The `/worker` folder is a separate deployable service with its own start command, but shares `/lib` and the Prisma schema with the main app via relative imports within the same repo.

## 5. Database schema

### USER
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| email | string, unique | |
| password_hash | string | |
| role | enum: PATIENT / DOCTOR / ADMIN | |
| created_at | timestamp | |

### PATIENT_PROFILE
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → USER, unique | |
| phone | string | |

### DOCTOR_PROFILE
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| user_id | uuid, FK → USER, unique | |
| specialization | string | |
| working_hours | jsonb | e.g. `{ "mon": ["09:00","17:00"], ... }` |
| slot_duration_min | int | |

### DOCTOR_LEAVE
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| doctor_id | uuid, FK → DOCTOR_PROFILE | |
| leave_date | date | |
| reason | string, nullable | |

### APPOINTMENT
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| doctor_id | uuid, FK → DOCTOR_PROFILE | |
| patient_id | uuid, FK → PATIENT_PROFILE | |
| slot_start | timestamp | |
| slot_end | timestamp | |
| status | enum: HELD / BOOKED / CANCELLED / COMPLETED | |
| held_until | timestamp, nullable | expiry for temporary holds |
| created_at | timestamp | |

**Unique constraint:** `(doctor_id, slot_start)` — this is the actual double-booking prevention mechanism (see §6).

### PRE_VISIT_SUMMARY
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| appointment_id | uuid, FK → APPOINTMENT, unique | |
| raw_symptoms | text | |
| urgency_level | enum: LOW / MEDIUM / HIGH, nullable | null if LLM call failed |
| chief_complaint | text, nullable | |
| suggested_questions | jsonb, nullable | array of 3 strings |
| llm_status | enum: OK / FAILED | |

### POST_VISIT_NOTE
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| appointment_id | uuid, FK → APPOINTMENT, unique | |
| clinical_notes | text | doctor's raw input |
| prescription | jsonb | array of `{ medication, dosage, frequency, duration_days }` |
| patient_summary | text, nullable | LLM output |
| llm_status | enum: OK / FAILED | |

### MEDICATION_REMINDER
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| post_visit_note_id | uuid, FK → POST_VISIT_NOTE | |
| remind_at | timestamp | |
| status | enum: PENDING / SENT / FAILED | |

### CALENDAR_EVENT
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| appointment_id | uuid, FK → APPOINTMENT | |
| owner_role | enum: PATIENT / DOCTOR | one appointment → two rows, one per calendar |
| google_event_id | string | |

### NOTIFICATION_LOG
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| appointment_id | uuid, FK → APPOINTMENT | |
| channel | enum: EMAIL | |
| type | enum: BOOKING_CONFIRMATION / REMINDER / CANCELLATION | |
| status | enum: PENDING / SENT / FAILED | |
| retry_count | int, default 0 | |
| last_attempt_at | timestamp, nullable | |

## 6. Core problems and how to solve them

*(This section doubles as the outline for the required 800-word system design write-up.)*

### Double-booking prevention
A unique constraint on `APPOINTMENT (doctor_id, slot_start)` is the real safety net — not application-level checks. Two simultaneous booking requests can both pass an "is this slot free?" read in app code (a race condition), but Postgres will only let one `INSERT` succeed. Catch the unique-violation error and return "slot just got taken" to the second requester.

### Slot hold mechanism
When a patient opens the symptom form before confirming, insert the appointment row immediately with `status = 'HELD'` and `held_until = now() + 10 minutes`, instead of waiting until final submission. The unique constraint still blocks anyone else from taking that slot. The background worker periodically deletes expired `HELD` rows that were never confirmed, freeing the slot.

### Doctor leave conflict handling
When admin marks a doctor on leave for a date, in a single transaction:
1. Query `APPOINTMENT WHERE doctor_id = ? AND slot_start::date = ? AND status = 'BOOKED'`
2. Set each match's status to `CANCELLED`
3. Insert a `NOTIFICATION_LOG` row (type `CANCELLATION`) for each affected patient
4. Delete the corresponding `CALENDAR_EVENT` rows (and call the Calendar API to remove the events)

Doing this in one transaction avoids a state where leave is saved but patients are never notified.

### Notification reliability
Never call the email API directly from the booking route and hope it succeeds. Write a `NOTIFICATION_LOG` row with `status = 'PENDING'` inside the same transaction as the booking/cancellation. The background worker polls for `PENDING` rows, attempts delivery, and marks `SENT` or increments `retry_count` (cap at 5 attempts, exponential backoff) before marking `FAILED`. This decouples "the booking succeeded" from "the email succeeded."

## 7. LLM integration (Gemini)

**Pre-visit summary prompt:**
> "Analyse these symptoms and return: urgency level (Low / Medium / High), chief complaint, and three suggested questions for the doctor. Symptoms: `<symptoms>`"

**Post-visit summary prompt:**
> "Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps: `<notes>`"

Both should request strict JSON output, parsed on the server. Every call is wrapped in try/catch:
- On success: store the parsed fields, `llm_status = 'OK'`
- On failure/timeout: store `llm_status = 'FAILED'`, leave dependent fields null, and let the booking/note submission proceed regardless — the doctor sees "AI summary unavailable, review manually" instead of the flow breaking.

## 8. Email + Google Calendar integration

- **Email:** Nodemailer via Gmail SMTP (or Resend free tier). Triggered by the background worker reading `NOTIFICATION_LOG`, not called synchronously from booking routes.
- **Calendar:** Each patient and doctor authorizes the app once via Google OAuth consent. The resulting refresh token is stored per user. On booking, create two calendar events (one per side) and store their IDs in `CALENDAR_EVENT`; on reschedule/cancellation, use those stored IDs to update or delete the events via the Calendar API.

## 9. API design (route sketch)

```
POST   /api/auth/register
POST   /api/auth/login                (handled by NextAuth)

GET    /api/doctors?specialization=   (search)
GET    /api/doctors/:id/slots?date=

POST   /api/appointments              (create HELD row)
POST   /api/appointments/:id/confirm  (attach symptoms, trigger pre-visit LLM call, mark BOOKED)
POST   /api/appointments/:id/cancel
POST   /api/appointments/:id/notes    (doctor submits post-visit notes + prescription, triggers LLM call)

GET    /api/patient/appointments
GET    /api/doctor/appointments

POST   /api/admin/doctors
PATCH  /api/admin/doctors/:id
POST   /api/admin/doctors/:id/leave

GET    /api/oauth/google/callback     (Calendar OAuth)
```

## 10. Background worker responsibilities

- Every few minutes: delete expired `HELD` appointment rows
- Every few minutes: scan `NOTIFICATION_LOG` for `PENDING`/retriable `FAILED` rows, attempt send
- Daily (or hourly): scan `MEDICATION_REMINDER` for rows due, send reminder email, mark `SENT`

## 11. Environment variables (`.env.example`)

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GEMINI_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## 12. Submission checklist

- [ ] GitHub repo public, default branch `main`
- [ ] `.gitignore` excludes `node_modules/`, `.env`, `.next/`, `.vscode/`
- [ ] `.env.example` with placeholder keys only — no real secrets committed
- [ ] README covers: setup guide, `.env.example`, API docs, DB schema, LLM prompts, Google Calendar setup steps
- [ ] Hosted app URL (Render)
- [ ] System design write-up (≤800 words) covering: double-booking prevention, doctor leave conflict handling, slot hold mechanism, notification failure handling (§6 above is the outline)

## 13. Deliverables recap

1. Zip file with complete source code
2. README (setup, `.env.example`, API docs, DB schema, LLM prompts, Calendar setup)
3. Hosted application URL
4. System design write-up (≤800 words)
