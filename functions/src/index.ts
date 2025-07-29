import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// Configure nodemailer with Gmail (you'll need to set up app passwords)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER,
    pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
  },
});

// Send notification to HOA admins when a violation is created
export const sendViolationNotification = functions.https.onCall(async (data, context) => {
  try {
    const { violation, hoa } = data;
    
    // Build recipient list (primary admin + additional emails)
    const recipients = [hoa.adminEmail, ...(hoa.additionalEmails || [])];
    
    const mailOptions = {
      from: functions.config().email?.user || process.env.EMAIL_USER,
      to: recipients.join(', '),
      subject: `New Violation Report - ${violation.type}`,
      html: `
        <h2>New Violation Report</h2>
        <p><strong>Type:</strong> ${violation.type}</p>
        <p><strong>Address:</strong> ${violation.address}</p>
        <p><strong>Description:</strong> ${violation.description}</p>
        <p><strong>Status:</strong> ${violation.status}</p>
        <p><strong>Reported:</strong> ${new Date(violation.createdAt).toLocaleString()}</p>
        
        ${violation.reporterEmail ? `<p><strong>Reporter Email:</strong> ${violation.reporterEmail}</p>` : ''}
        ${violation.reporterPhone ? `<p><strong>Reporter Phone:</strong> ${violation.reporterPhone}</p>` : ''}
        
        ${violation.photos.length > 0 ? `
          <p><strong>Photos:</strong></p>
          ${violation.photos.map((photo: string, index: number) => 
            `<p><a href="${photo}" target="_blank">Photo ${index + 1}</a></p>`
          ).join('')}
        ` : ''}
        
        <p>Please log in to your admin panel to manage this violation.</p>
        <p><a href="${process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/${hoa.id}/admin">Admin Dashboard</a></p>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error sending violation notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email notification');
  }
});

// Send custom email to residents from admin panel
export const sendResidentNotification = functions.https.onCall(async (data, context) => {
  try {
    // Verify that the user is authenticated and has admin role
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { violation, recipientEmail, subject, message } = data;
    
    const mailOptions = {
      from: functions.config().email?.user || process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Violation Notice</h2>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Violation Type:</strong> ${violation.type}</p>
            <p><strong>Address:</strong> ${violation.address}</p>
            <p><strong>Date Reported:</strong> ${new Date(violation.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          
          ${violation.photos.length > 0 ? `
            <div style="margin: 20px 0;">
              <p><strong>Reference Photos:</strong></p>
              ${violation.photos.map((photo: string, index: number) => 
                `<p><a href="${photo}" target="_blank" style="color: #0066cc;">View Photo ${index + 1}</a></p>`
              ).join('')}
            </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc; color: #666; font-size: 12px;">
            <p>This email was sent from your HOA management system.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Email sent successfully to resident' };
  } catch (error) {
    console.error('Error sending resident notification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send email to resident');
  }
});

// Send subscription-related emails
export const sendSubscriptionEmail = functions.https.onCall(async (data, context) => {
  try {
    const { hoaEmail, type, hoaName } = data;
    
    let subject = '';
    let html = '';
    
    switch (type) {
      case 'welcome':
        subject = 'Welcome to HOA Violation Tracker';
        html = `
          <h2>Welcome to HOA Violation Tracker!</h2>
          <p>Thank you for subscribing to our HOA violation management system.</p>
          <p><strong>HOA:</strong> ${hoaName}</p>
          <p>You can now manage violations and notifications for your community.</p>
          <p><a href="${process.env.REACT_APP_BASE_URL || 'http://localhost:3000'}/${data.hoaId}/admin">Access Admin Panel</a></p>
        `;
        break;
        
      case 'payment_failed':
        subject = 'Payment Failed - HOA Violation Tracker';
        html = `
          <h2>Payment Failed</h2>
          <p>We were unable to process your monthly payment for HOA Violation Tracker.</p>
          <p>Please update your payment information to continue using our service.</p>
        `;
        break;
        
      case 'subscription_cancelled':
        subject = 'Subscription Cancelled - HOA Violation Tracker';
        html = `
          <h2>Subscription Cancelled</h2>
          <p>Your subscription to HOA Violation Tracker has been cancelled.</p>
          <p>You can reactivate your subscription at any time.</p>
        `;
        break;
    }
    
    const mailOptions = {
      from: functions.config().email?.user || process.env.EMAIL_USER,
      to: hoaEmail,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
    
    return { success: true, message: 'Subscription email sent successfully' };
  } catch (error) {
    console.error('Error sending subscription email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send subscription email');
  }
});