const nodemailer = require('nodemailer');
const logger = require('./logger.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.earndrip.com', // SmarterASP.NET mail server
      port: parseInt(process.env.SMTP_PORT) || 25, // Use port 587 for TLS
      secure: false, // Use TLS
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      
    });

    // Verify connection configuration
    this.transporter.verify((error, success) => {
      if (error) {
        logger.error('SMTP connection error:', error);
      } else {
        logger.info('SMTP server is ready to send emails');
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: {
        name: 'Earn Drip',
        address: process.env.SMTP_USER || 'noreply@earndrip.com'
      },
      to: email,
      subject: 'Reset Your Password - EARN DRIP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Password Reset Request</h1>
          <p>You requested to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          </div>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from Earn Drip. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email, verificationToken) {
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const mailOptions = {
      from: {
        name: 'Earn Drip',
        address: process.env.SMTP_USER || 'noreply@earndrip.com'
      },
      to: email,
      subject: 'Verify Your Email - EARN DRIP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Email Verification</h1>
          <p>Thank you for registering! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyLink}" style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          </div>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This is an automated message from Earn Drip. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Verification email sent to ${email}`);
      return true;
    } catch (error) {
      logger.error('Error sending verification email:', error);
      return false;
    }
  }



  async sendContactFormSubmission(name, email, message) {
    let recipientEmail;
    try {
      const adminConfig = await prisma.adminConfig.findFirst();
      recipientEmail = adminConfig?.supportEmail;
      
    } catch (configError) {
      logger.error('Error fetching admin config for contact email:', configError);
    }

    if (!recipientEmail) {
      recipientEmail = process.env.CONTACT_EMAIL_RECIPIENT || process.env.SMTP_USER;
      logger.warn(`Support email not found in AdminConfig. Falling back to ${recipientEmail}`);
    }

    const mailOptions = {
      from: {
        name: 'Website Contact Form',
        address: process.env.SMTP_FROM || process.env.SMTP_USER
      },
      to: recipientEmail,
      replyTo: email,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #333; text-align: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f9f9f9; border: 1px solid #eee; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${message}</p>
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This email was sent from the contact form on ${process.env.FRONTEND_URL || 'your website'}.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      logger.info(`Contact form submission from ${email} sent successfully to ${recipientEmail}`);
      return true;
    } catch (error) {
      logger.error('Error sending contact form submission email:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
