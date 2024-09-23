import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendPasswordResetEmail(email, resetToken) {
  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'Password Reset Request',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
           <p>Please click on the following link, or paste this into your browser to complete the process:</p>
           <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
           <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Password reset email sent successfully');
  } catch (error) {
    console.error('Error sending password reset email', error);
    throw new Error('Failed to send password reset email');
  }
}

export async function sendPasswordSetupEmail(email, token) {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/user-management/password-setup?token=${token}`;

  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'Set Your Password',
    html: `
      <p>You have been invited to join our platform. Please click the link below to set your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Password setup email sent successfully');
  } catch (error) {
    console.error('Error sending password setup email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error; // Re-throw the error so it can be handled by the calling function
  }
}