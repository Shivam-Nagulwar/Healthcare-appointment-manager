import { getGoogleOAuthClient } from '@/lib/calendar';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Both Doctors and Patients can connect their calendars
    const user = await requireAuth();
    if (user.role !== Role.DOCTOR && user.role !== Role.PATIENT) {
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }

    const oauth2Client = getGoogleOAuthClient();
    
    // Generate a secure url
    const authorizeUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required to get a refresh token
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent' // Force to get refresh token every time they connect
    });

    return NextResponse.redirect(authorizeUrl);
  } catch (error: any) {
    console.error('Google Auth Error:', error);
    return NextResponse.redirect(new URL('/doctor', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
