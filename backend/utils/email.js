const nodemailer = require('nodemailer');

// Create transporter with optimized settings for production
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Email sending will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    // Use explicit host/port instead of `service: 'gmail'`.
    // Port 465 (implicit TLS) is blocked on many PaaS providers (Render, Railway, etc.).
    // Port 587 (STARTTLS) is more commonly allowed for outbound SMTP.
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // false for port 587 (STARTTLS), true for port 465
    family: 4, // force IPv4 — avoids ENETUNREACH when outbound IPv6 has no route (common on Render)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    // Optimized connection settings
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: true,
    rateDelta: 1000, // 1 second window
    maxRate: 5, // max 5 messages per rateDelta window
    // Timeout settings
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000,
    socketTimeout: 20000, // 20 seconds
    // TLS settings
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    // Debug mode (set to true for debugging)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  });
};

// Initialize transporter
let transporter = createTransporter();

// Verify transporter connection on startup
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter verification failed:', error.message);
      console.warn('⚠️ Email notifications will be disabled. Please check your Gmail settings.');
    } else {
      console.log('✅ Email transporter is ready to send messages');
    }
  });
}

// Email templates
const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to LearnHub!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .button:hover { background: #1d4ed8; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Welcome to LearnHub!</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Hello <strong>${data.name}</strong>,</p>
              <p>Thank you for joining LearnHub! We're excited to have you on board.</p>
              <p>With LearnHub, you can:</p>
              <ul>
                <li>📚 Access hundreds of expert-led courses</li>
                <li>🎯 Track your learning progress</li>
                <li>🏆 Earn certificates upon completion</li>
                <li>🤝 Connect with a community of learners</li>
              </ul>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="button">Start Learning</a>
              </p>
              <p style="color: #64748b; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
              <p style="margin-top: 5px; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  enrollment: (data) => ({
    subject: `🎓 Enrolled in ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .button:hover { background: #047857; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Enrollment Confirmation</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>You have successfully enrolled in <strong>${data.courseName}</strong>.</p>
              <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>📚 Course:</strong> ${data.courseName}</p>
                <p style="margin: 5px 0;"><strong>👨‍🏫 Instructor:</strong> ${data.instructor}</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/courses/${data.courseId}" class="button">Access Course</a>
              </p>
              <p style="color: #64748b; font-size: 14px;">We wish you an amazing learning journey! 🚀</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'password-reset': (data) => ({
    subject: '🔐 Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .button:hover { background: #b91c1c; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Reset</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Hello <strong>${data.name}</strong>,</p>
              <p>We received a request to reset your password. Click the button below to create a new password.</p>
              <div style="background: #fee2e2; padding: 10px 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">⏰ This link will expire in 1 hour.</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${data.resetLink}" class="button">Reset Password</a>
              </p>
              <p style="color: #64748b; font-size: 14px;">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'password-reset-admin': (data) => ({
    subject: '🔑 Password Reset by Admin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Password Reset</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>Your password has been reset by an administrator.</p>
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb;">
                <p style="margin: 5px 0;"><strong>🔑 New Password:</strong> <span style="font-size: 18px; font-weight: 700; color: #1e40af;">${data.newPassword}</span></p>
              </div>
              <div style="background: #fef3c7; padding: 10px 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">⚠️ Please login and change your password immediately for security.</p>
              </div>
              <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact your system administrator.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  grade: (data) => ({
    subject: `📝 Assignment Graded: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669, #047857); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .grade { font-size: 28px; font-weight: bold; color: #059669; }
            .feedback-box { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #059669; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Assignment Graded</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>Your assignment <strong>${data.assignmentTitle}</strong> for <strong>${data.courseName}</strong> has been graded.</p>
              <div style="text-align: center; padding: 20px; background: #ecfdf5; border-radius: 12px; margin: 20px 0;">
                <p style="margin: 0; color: #64748b; font-size: 14px;">Your Grade</p>
                <p class="grade">${data.grade}%</p>
              </div>
              ${data.feedback ? `
                <div class="feedback-box">
                  <p style="margin: 0;"><strong>📝 Feedback:</strong></p>
                  <p style="margin: 5px 0 0 0; color: #475569;">${data.feedback}</p>
                </div>
              ` : ''}
              <p style="color: #64748b; font-size: 14px;">Keep up the great work! 🎉</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'assignment-submitted': (data) => ({
    subject: `📄 New Assignment: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #d97706, #b45309); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #d97706; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .button:hover { background: #b45309; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Assignment Submitted</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.instructor}</strong>,</p>
              <p>A new assignment has been submitted for <strong>${data.courseName}</strong>.</p>
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>📝 Assignment:</strong> ${data.assignmentTitle}</p>
                <p style="margin: 5px 0;"><strong>👨‍🎓 Student:</strong> ${data.studentName || 'Student'}</p>
                <p style="margin: 5px 0;"><strong>📅 Submitted:</strong> ${data.submittedAt || new Date().toLocaleString()}</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/instructor/assignments" class="button">Review Assignment</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'role-updated': (data) => ({
    subject: '🔄 Role Updated',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .role-badge { display: inline-block; padding: 5px 15px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Role Updated</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>Your role has been updated to:</p>
              <div style="text-align: center; padding: 20px; margin: 20px 0;">
                <span class="role-badge" style="font-size: 18px; padding: 10px 30px;">${data.newRole}</span>
              </div>
              <p style="color: #64748b; font-size: 14px;">Please refresh your session to see the changes.</p>
              <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact your system administrator.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'system-notification': (data) => ({
    subject: data.title,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">${data.title}</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>${data.message}</p>
              <p style="color: #64748b; font-size: 14px;">For more information, please visit the LearnHub platform.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'new-assignment': (data) => ({
    subject: `📝 New Assignment: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
            .button:hover { background: #1d4ed8; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">New Assignment Available</h1>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>A new assignment has been created for <strong>${data.courseName}</strong>.</p>
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>📝 Assignment:</strong> ${data.assignmentTitle}</p>
                ${data.dueDate ? `<p style="margin: 5px 0;"><strong>📅 Due Date:</strong> ${data.dueDate}</p>` : ''}
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/student/assignments" class="button">View Assignment</a>
              </p>
              <p style="color: #64748b; font-size: 14px;">Good luck with your submission! 🍀</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  'certificate-generated': (data) => ({
    subject: `🎓 Certificate of Completion: ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); }
            .button:hover { transform: translateY(-2px); box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4); }
            .certificate-preview { background: white; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎓 Certificate of Completion</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Congratulations on your achievement!</p>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">Dear <strong>${data.name}</strong>,</p>
              <p>Congratulations on successfully completing the course:</p>
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af;">${data.courseName}</span>
              </div>
              <p>Your certificate has been generated and is ready for download.</p>
              <div class="certificate-preview">
                <span style="font-size: 40px;">📜</span>
                <p style="margin: 10px 0 5px; font-weight: 600; color: #1e293b;">Your certificate is ready</p>
                <span class="badge">Verified Achievement</span>
              </div>
              <p style="text-align: center; margin: 25px 0;">
                <a href="${data.downloadUrl}" class="button" target="_blank">📥 Download Certificate</a>
              </p>
              <p style="font-size: 14px; color: #64748b; text-align: center;">This certificate is digitally verified and can be authenticated by sharing the PDF.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
              <p style="margin-top: 5px; font-size: 11px;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

// Send email with retry logic
const sendEmailWithRetry = async (mailOptions, retries = 3) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      if (!transporter) {
        throw new Error('Email transporter not configured');
      }
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (error) {
      lastError = error;
      console.log(`Email attempt ${i + 1} failed, retrying... (${error.message})`);
      // Wait before retry (exponential backoff)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError;
};

// Main send email function
exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    // Skip if email credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️ Email credentials not configured. Skipping email send to:', to);
      return;
    }

    // Skip if no recipient
    if (!to) {
      console.warn('⚠️ No recipient email provided. Skipping email send.');
      return;
    }

    const templateFn = emailTemplates[template];
    let emailContent;

    if (!templateFn) {
      console.warn(`⚠️ Email template "${template}" not found, using default`);
      emailContent = {
        subject: subject || 'Notification from LearnHub',
        html: `
          <h1>${subject || 'Notification'}</h1>
          <p>${data?.message || 'You have a new notification from LearnHub.'}</p>
          <p>Visit <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">LearnHub</a> for more details.</p>
        `
      };
    } else {
      emailContent = templateFn(data);
    }

    const mailOptions = {
      from: `"LearnHub" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: emailContent.subject || subject || 'Notification from LearnHub',
      html: emailContent.html,
      priority: 'normal',
      // Add headers for better deliverability
      headers: {
        'X-Priority': '3',
        'X-Mailer': 'LearnHub Email System',
        'X-Originating-IP': process.env.SERVER_IP || '127.0.0.1'
      }
    };

    // Send with retry logic
    const result = await sendEmailWithRetry(mailOptions);
    console.log(`✅ Email sent to ${to} (${emailContent.subject})`);
    return result;

  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    // Don't throw - email failures shouldn't break the application
    return null;
  }
};

// Test email function for debugging
exports.testEmail = async (email) => {
  try {
    const result = await exports.sendEmail({
      to: email || process.env.EMAIL_USER,
      subject: 'Test Email from LearnHub',
      template: 'welcome',
      data: { name: 'Test User' }
    });
    console.log('✅ Test email sent successfully');
    return result;
  } catch (error) {
    console.error('❌ Test email failed:', error.message);
    throw error;
  }
};

// Email verification function
exports.verifyEmailConfig = async () => {
  try {
    if (!transporter) {
      return { success: false, message: 'Email transporter not configured' };
    }
    await transporter.verify();
    return { success: true, message: 'Email configuration is valid' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};
