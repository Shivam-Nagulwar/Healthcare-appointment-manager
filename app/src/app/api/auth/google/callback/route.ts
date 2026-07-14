import { getGoogleOAuthClient } from '@/lib/calendar';
import { requireAuth } from '@/lib/session';
import { Role } from '@prisma/client';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== Role.DOCTOR && user.role !== Role.PATIENT) {
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
    }
    
    const rolePath = user.role === Role.DOCTOR ? '/doctor' : '/patient';
    // Get authorization code from query params
    const code = req.nextUrl.searchParams.get('code');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (!code) {
      return NextResponse.redirect(new URL(`${rolePath}?error=google_auth_failed`, baseUrl));
    }

    const oauth2Client = getGoogleOAuthClient();
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens based on role
    if (user.role === Role.DOCTOR) {
      await prisma.doctorProfile.update({
        where: { userId: user.id },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        }
      });
    } else {
      await prisma.patientProfile.update({
        where: { userId: user.id },
        data: {
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null
        }
      });
    }

    return NextResponse.redirect(new URL(`${rolePath}?success=google_connected`, baseUrl));
  } catch (error: any) {
    console.error('Google Callback Error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/login?error=google_auth_failed', baseUrl));
  }
}
