import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "pk2262620@gmail.com", // Your email address
    pass: 'kehm ifpm ozas cxbw', // Your email password or app password
  },
});

// Function to send the password reset email
export const sendResetEmail = async (email: string, userName: string, resetLink: string) => {
  const emailContent = `
    <p>Hi ${userName},</p>
    <p>We received a request to reset the password for your account.</p>
    <p>To reset your password, click the link below:</p>
    <p><a href="${resetLink}">Reset Your Password</a></p>
    <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
    <p>Thanks,<br>The Your Company Team</p>
  `;

  try {
    await transporter.sendMail({
      to: email,
      from: "pk2262620@gmail.com", // Sender's email
      subject: 'Password Reset Request',
      html: emailContent, // HTML content
    });
    console.log('Password reset email sent!');
  } catch (error) {
    if(error instanceof Error)
    console.error('Error sending email: ', error.message);
    throw new Error('Error sending email');
  }
};


export default sendResetEmail;