import nodemailer from 'nodemailer';

// A singleton transporter instance
let transporter: nodemailer.Transporter | null = null;

/**
 * Initializes the Ethereal email transporter using environment variables or a fallback test account.
 */
async function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'mrkfoudusspad3hf@ethereal.email',
      pass: process.env.SMTP_PASS || 'vhZmh2nF5wrxvEbUhK',
    },
  });

  console.log(`Email initialized using: ${process.env.SMTP_USER || 'Ethereal Test Account'}`);
  return transporter;
}

/**
 * Beautiful HTML wrapper for all our emails
 */
function wrapEmailHTML(title: string, content: string, ctaLink?: string, ctaText?: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td align="center" style="background-color: #0ea5e9; padding: 30px 0;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">MedCare Clinic</h1>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin-top: 0; color: #0f172a; font-size: 20px;">${title}</h2>
                  <div style="color: #475569; font-size: 16px; line-height: 1.6;">
                    ${content}
                  </div>
                  ${ctaLink && ctaText ? `
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${ctaLink}" style="background-color: #0ea5e9; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">${ctaText}</a>
                    </div>
                  ` : ''}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; color: #64748b; font-size: 14px;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} MedCare Clinic. All rights reserved.</p>
                  <p style="margin: 5px 0 0 0;">This is an automated message, please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Helper to send the email and log the Ethereal preview URL
 */
async function sendMailWrapper(mailOptions: nodemailer.SendMailOptions) {
  try {
    const t = await getTransporter();
    
    if (!mailOptions.from) {
      mailOptions.from = process.env.SMTP_FROM || '"MedCare Clinic" <noreply@medcare.com>';
    }

    const info = await t.sendMail(mailOptions);
    
    console.log('----------------------------------------------------');
    console.log('Message sent: %s', info.messageId);
    if (info.messageId.includes('ethereal')) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    console.log('----------------------------------------------------');
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

// ==========================================
// Specific Email Templates
// ==========================================

export async function sendBookingConfirmation(patientEmail: string, doctorName: string, date: Date, doctorEmail: string) {
  const formattedDate = new Date(date).toLocaleString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  // To Patient
  await sendMailWrapper({
    to: patientEmail,
    subject: 'Appointment Confirmed',
    html: wrapEmailHTML(
      'Your Appointment is Confirmed!',
      `<p>Hello,</p>
       <p>Great news! Your appointment with <strong>Dr. ${doctorName}</strong> has been successfully booked.</p>
       <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 16px; margin: 20px 0;">
         <p style="margin: 0; color: #0f172a; font-weight: 600;">Date & Time</p>
         <p style="margin: 4px 0 0 0; color: #475569;">${formattedDate}</p>
       </div>
       <p>Please try to arrive 10 minutes early for your appointment. We look forward to seeing you!</p>`,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments` : '#',
      'View Appointments'
    )
  });

  // To Doctor
  await sendMailWrapper({
    to: doctorEmail,
    subject: 'New Appointment Booked',
    html: wrapEmailHTML(
      'New Appointment Scheduled',
      `<p>Hello Dr. ${doctorName},</p>
       <p>A new patient has booked an appointment with you.</p>
       <div style="background-color: #f8fafc; border-left: 4px solid #0ea5e9; padding: 16px; margin: 20px 0;">
         <p style="margin: 0; color: #0f172a; font-weight: 600;">Date & Time</p>
         <p style="margin: 4px 0 0 0; color: #475569;">${formattedDate}</p>
       </div>
       <p>You can review their pre-visit triage summary in your dashboard.</p>`,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/doctor/appointments` : '#',
      'View Schedule'
    )
  });
}

export async function sendBookingCancellation(patientEmail: string, doctorEmail: string, doctorName: string, date: Date, cancelledBy: 'patient' | 'doctor') {
  const formattedDate = new Date(date).toLocaleString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  // To Patient
  await sendMailWrapper({
    to: patientEmail,
    subject: 'Appointment Cancelled',
    html: wrapEmailHTML(
      'Appointment Cancellation',
      `<p>Hello,</p>
       <p>Your appointment with <strong>Dr. ${doctorName}</strong> scheduled for <strong>${formattedDate}</strong> has been cancelled by the ${cancelledBy}.</p>
       <p>If this was a mistake, or if you need to reschedule, please visit our portal to book a new slot.</p>`,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/patient/doctors` : '#',
      'Book New Appointment'
    )
  });

  // To Doctor
  await sendMailWrapper({
    to: doctorEmail,
    subject: 'Appointment Cancelled',
    html: wrapEmailHTML(
      'Appointment Cancellation Notice',
      `<p>Hello Dr. ${doctorName},</p>
       <p>The appointment scheduled for <strong>${formattedDate}</strong> has been cancelled by the ${cancelledBy}.</p>
       <p>This slot is now open for other patients to book in your schedule.</p>`
    )
  });
}

export async function sendDoctorLeaveNotification(patientEmail: string, doctorName: string, date: Date) {
  const formattedDate = new Date(date).toLocaleString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  await sendMailWrapper({
    to: patientEmail,
    subject: 'Important: Appointment Rescheduling Required',
    html: wrapEmailHTML(
      'Appointment Cancelled due to Doctor Leave',
      `<p>Hello,</p>
       <p>We sincerely apologize for the inconvenience, but your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${formattedDate}</strong> has been cancelled because the doctor will be on leave.</p>
       <p>Please visit our portal to book a new appointment at your earliest convenience.</p>`,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/patient/doctors` : '#',
      'Reschedule Appointment'
    )
  });
}

export async function sendAppointmentReminder(patientEmail: string, doctorName: string, date: Date) {
  const formattedDate = new Date(date).toLocaleString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });

  await sendMailWrapper({
    to: patientEmail,
    subject: 'Reminder: Upcoming Appointment',
    html: wrapEmailHTML(
      'Upcoming Appointment Reminder',
      `<p>Hello,</p>
       <p>This is a friendly reminder that you have an upcoming appointment with <strong>Dr. ${doctorName}</strong>.</p>
       <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
         <p style="margin: 0; color: #0f172a; font-weight: 600;">Date & Time</p>
         <p style="margin: 4px 0 0 0; color: #475569;">${formattedDate}</p>
       </div>
       <p>Please remember to arrive 10 minutes early. If you need to reschedule, please visit our portal as soon as possible.</p>`,
      process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments` : '#',
      'Manage Appointment'
    )
  });
}
