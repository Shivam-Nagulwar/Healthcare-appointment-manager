import { google, calendar_v3 } from 'googleapis';
import prisma from '@/lib/prisma';

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Helper to get a configured calendar instance for a specific doctor.
 * It uses their stored refresh token to get a new access token if necessary.
 */
async function getCalendarForDoctor(doctorId: string) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true }
  });

  if (!doctor || !doctor.googleRefreshToken) {
    throw new Error('Doctor has not connected their Google Calendar.');
  }

  const auth = getGoogleOAuthClient();
  auth.setCredentials({
    access_token: doctor.googleAccessToken,
    refresh_token: doctor.googleRefreshToken,
    expiry_date: doctor.googleTokenExpiry?.getTime()
  });

  // Automatically refresh token if it's expired and save the new one
  auth.on('tokens', async (tokens) => {
    await prisma.doctorProfile.update({
      where: { id: doctorId },
      data: {
        googleAccessToken: tokens.access_token,
        ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
        ...(tokens.expiry_date ? { googleTokenExpiry: new Date(tokens.expiry_date) } : {})
      }
    });
  });

  return google.calendar({ version: 'v3', auth });
}

export async function createCalendarEvent(doctorId: string, patientEmail: string, patientName: string, startTime: Date, endTime: Date, description: string, addAttendee: boolean = true) {
  // If we don't have Google OAuth credentials configured at all, just return early (mock mode)
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    console.log('[MOCK CALENDAR] Creating event for', patientEmail, 'at', startTime);
    return `mock-event-id-${Date.now()}`;
  }

  try {
    const calendar = await getCalendarForDoctor(doctorId);
    
    const event: calendar_v3.Schema$Event = {
      summary: `Appointment: ${patientName}`,
      description,
      start: {
        dateTime: startTime.toISOString(),
      },
      end: {
        dateTime: endTime.toISOString(),
      },
      ...(addAttendee ? {
        attendees: [
          { email: patientEmail } // Automatically sends them a Google Calendar invite
        ]
      } : {}),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all', // Send email to attendees
    });

    return res.data.id;
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    // Don't crash the booking flow if calendar fails, just return null
    return null;
  }
}

export async function deleteCalendarEvent(doctorId: string, eventId: string) {
  // If we don't have Google OAuth credentials configured at all, just return early (mock mode)
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    console.log('[MOCK CALENDAR] Deleting event', eventId);
    return;
  }

  try {
    const calendar = await getCalendarForDoctor(doctorId);
    
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: 'all', // Notify attendees of cancellation
    });
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
  }
}

/**
 * Patient Calendar Support
 */
async function getCalendarForPatient(patientId: string) {
  const patient = await prisma.patientProfile.findUnique({
    where: { id: patientId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiry: true }
  });

  if (!patient || !patient.googleRefreshToken) {
    throw new Error('Patient has not connected their Google Calendar.');
  }

  const auth = getGoogleOAuthClient();
  auth.setCredentials({
    access_token: patient.googleAccessToken,
    refresh_token: patient.googleRefreshToken,
    expiry_date: patient.googleTokenExpiry?.getTime()
  });

  auth.on('tokens', async (tokens) => {
    await prisma.patientProfile.update({
      where: { id: patientId },
      data: {
        googleAccessToken: tokens.access_token,
        ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
        ...(tokens.expiry_date ? { googleTokenExpiry: new Date(tokens.expiry_date) } : {})
      }
    });
  });

  return google.calendar({ version: 'v3', auth });
}

export async function createPatientCalendarEvent(patientId: string, doctorName: string, startTime: Date, endTime: Date, description: string) {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    return null;
  }

  try {
    const calendar = await getCalendarForPatient(patientId);
    
    const event: calendar_v3.Schema$Event = {
      summary: `Doctor Appointment: ${doctorName}`,
      description,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 15 },
        ],
      },
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return res.data.id;
  } catch (error) {
    console.error('Failed to create patient calendar event:', error);
    return null;
  }
}

export async function deletePatientCalendarEvent(patientId: string, eventId: string) {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    return;
  }

  try {
    const calendar = await getCalendarForPatient(patientId);
    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  } catch (error) {
    console.error('Failed to delete patient calendar event:', error);
  }
}
