/**
 * TripBi Cloud Functions
 *
 * Functions for handling server-side operations like sending invite emails.
 * Pattern aligned with SplitBi for consistency.
 */

import * as functions from 'firebase-functions';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
// Set in functions/.env file as RESEND_API_KEY=your_key
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error('Resend API key is not configured. Set RESEND_API_KEY in functions/.env file.');
}

const resend = apiKey ? new Resend(apiKey) : null;

interface SendInviteEmailData {
  invitationId: string;
  recipientEmail: string;
  tripName: string;
  inviterName: string;
  inviteLink: string;
}

/**
 * Send an invitation email using Resend
 */
export const sendInviteEmail = functions.https.onCall(async (data: SendInviteEmailData, context) => {
  // Verify the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be signed in to send invitations.'
    );
  }

  // Check if Resend is configured
  if (!resend) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Email service is not configured. Please contact support.'
    );
  }

  // Validate required fields
  if (!data.recipientEmail || !data.tripName || !data.inviteLink) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required fields: recipientEmail, tripName, inviteLink'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.recipientEmail)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'TripBi <invite@mail.tripbi.app>',
      to: [data.recipientEmail],
      subject: `You're invited to join "${data.tripName}" on TripBi`,
      html: generateInviteEmailHTML(data),
      text: generateInviteEmailText(data),
    });

    if (error) {
      console.error('Resend error:', error);
      throw new functions.https.HttpsError('internal', `Failed to send email: ${error.message}`);
    }

    console.log('Invite email sent successfully:', emailData);
    return { success: true, messageId: emailData?.id };
  } catch (error: unknown) {
    console.error('Email sending error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send invitation email';
    throw new functions.https.HttpsError('internal', message);
  }
});

/**
 * Generate HTML email template for trip invites
 */
function generateInviteEmailHTML(data: SendInviteEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TripBi Invitation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F5F0E8; margin: 0; padding: 40px 20px;">
    <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <div style="background: #2D5A4A; padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Trip<span style="color: #4A9B7F;">Bi</span></h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Plan trips together</p>
        </div>
        <div style="padding: 32px;">
            <h2 style="color: #2D5A4A; margin: 0 0 16px 0; font-size: 22px;">You're Invited! 🎉</h2>
            <p style="color: #5C5C5C; line-height: 1.6; margin: 0 0 24px 0;">
                <strong>${escapeHtml(data.inviterName)}</strong> has invited you to join their trip <strong>"${escapeHtml(data.tripName)}"</strong> on TripBi.
            </p>
            <p style="color: #5C5C5C; line-height: 1.6; margin: 0 0 32px 0;">
                TripBi helps groups plan trips together - vote on activities, track bookings, and build your itinerary collaboratively.
            </p>
            <div style="text-align: center;">
                <a href="${data.inviteLink}" style="display: inline-block; background: #2D5A4A; color: white; text-decoration: none; padding: 16px 32px; border-radius: 100px; font-weight: 600; font-size: 16px;">
                    Join This Trip
                </a>
            </div>
            <p style="color: #8C8C8C; font-size: 13px; margin: 24px 0 0 0; text-align: center;">
                This invitation link expires in 7 days.
            </p>
        </div>
        <div style="background: #F5F0E8; padding: 20px; text-align: center;">
            <p style="color: #8C8C8C; font-size: 12px; margin: 0;">
                &copy; ${new Date().getFullYear()} TripBi. Part of the Bi Suite.
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Generate plain text email for trip invites
 */
function generateInviteEmailText(data: SendInviteEmailData): string {
  return `
TripBi - Plan Trips Together

You're Invited! 🎉

${data.inviterName} has invited you to join their trip "${data.tripName}" on TripBi.

TripBi helps groups plan trips together - vote on activities, track bookings, and build your itinerary collaboratively.

Join now: ${data.inviteLink}

This invitation will expire in 7 days.

---
This email was sent by TripBi (https://tripbi.app)
If you didn't expect this invitation, you can safely ignore this email.
  `.trim();
}

/**
 * Escape HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
