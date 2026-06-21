const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const emailTemplates = {
  welcome: (data) => ({
    subject: 'Welcome to LMS Platform!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome ${data.name}!</h1>
            </div>
            <div class="content">
              <p>Thank you for joining our Learning Management System.</p>
              <p>You can now browse courses, enroll, and start learning.</p>
              <p>
                <a href="${process.env.CLIENT_URL}" class="button">Start Learning</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  enrollment: (data) => ({
    subject: `Enrolled in ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Enrollment Confirmation</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>You have successfully enrolled in <strong>${data.courseName}</strong>.</p>
              <p><strong>Instructor:</strong> ${data.instructor}</p>
              <p>
                <a href="${process.env.CLIENT_URL}/courses/${data.courseId}" class="button">Access Course</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  'password-reset': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>Hi ${data.name},</p>
              <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
              <p>
                <a href="${data.resetLink}" class="button">Reset Password</a>
              </p>
              <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  'password-reset-admin': (data) => ({
    subject: 'Password Reset by Admin',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Your password has been reset by an administrator.</p>
              <p><strong>New Password:</strong> ${data.newPassword}</p>
              <p>Please login and change your password immediately.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  grade: (data) => ({
    subject: `Assignment Graded: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .grade { font-size: 24px; font-weight: bold; color: #059669; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Assignment Graded</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Your assignment <strong>${data.assignmentTitle}</strong> for ${data.courseName} has been graded.</p>
              <p><strong>Grade:</strong> <span class="grade">${data.grade}%</span></p>
              <p><strong>Feedback:</strong> ${data.feedback}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  'assignment-submitted': (data) => ({
    subject: `New Assignment: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d97706; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #d97706; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Assignment Submitted</h1>
            </div>
            <div class="content">
              <p>Dear ${data.instructor},</p>
              <p>A new assignment has been submitted for ${data.courseName}.</p>
              <p><strong>Title:</strong> ${data.assignmentTitle}</p>
              <p>
                <a href="${process.env.CLIENT_URL}/assignments" class="button">Review Assignments</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  'role-updated': (data) => ({
    subject: 'Role Updated',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Role Updated</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Your role has been updated to <strong>${data.newRole}</strong>.</p>
              <p>Please refresh your session to see the changes.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
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
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${data.title}</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>${data.message}</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LMS Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }),
  'certificate-issued': (data) => ({
    subject: `Certificate of Completion: ${data.courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Certificate of Completion</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>Congratulations on completing <strong>${data.courseName}</strong>!</p>
              <p>Your certificate has been generated and is ready to download.</p>
              <p>
                <a href="${data.certificateUrl}" class="button">View Certificate</a>
              </p>
              <p>Keep up the great work and continue your learning journey!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} LearnHub. All rights reserved.</p>
            </div>
          </div>
        </html>
      `
  }),
  'new-assignment': (data) => ({
    subject: `New Assignment: ${data.assignmentTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Assignment Available</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>A new assignment has been created for <strong>${data.courseName}</strong>.</p>
              <p><strong>Assignment:</strong> ${data.assignmentTitle}</p>
              ${data.dueDate ? `<p><strong>Due Date:</strong> ${data.dueDate}</p>` : ''}
              <p>
                <a href="${process.env.CLIENT_URL}/student/assignments" class="button">View Assignment</a>
              </p>
              <p>Good luck with your submission!</p>
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
            .header { 
              background: linear-gradient(135deg, #1e293b, #3b82f6); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 12px 12px 0 0;
            }
            .content { 
              padding: 30px; 
              background: #f8fafc; 
              border-radius: 0 0 12px 12px;
              border: 1px solid #e2e8f0;
              border-top: none;
            }
            .button { 
              display: inline-block; 
              padding: 12px 30px; 
              background: linear-gradient(135deg, #3b82f6, #2563eb); 
              color: white; 
              text-decoration: none; 
              border-radius: 8px;
              font-weight: 600;
              box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
            }
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4);
            }
            .certificate-preview {
              background: white;
              border: 2px dashed #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #94a3b8; 
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              margin-top: 20px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              background: #dbeafe;
              color: #1e40af;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">🎓 Certificate of Completion</h1>
              <p style="margin: 10px 0 0; opacity: 0.9;">Congratulations on your achievement!</p>
            </div>
            <div class="content">
              <p style="font-size: 18px; color: #1e293b;">
                Dear <strong>${data.name}</strong>,
              </p>
              <p>
                Congratulations on successfully completing the course:
              </p>
              <div style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
                <span style="font-size: 20px; font-weight: 700; color: #1e40af;">
                  ${data.courseName}
                </span>
              </div>
              <p>
                Your certificate has been generated and is ready for download.
                This certificate validates your achievement and can be shared with employers,
                added to your LinkedIn profile, or included in your portfolio.
              </p>
              
              <div class="certificate-preview">
                <span style="font-size: 40px;">📜</span>
                <p style="margin: 10px 0 5px; font-weight: 600; color: #1e293b;">
                  Your certificate is ready
                </p>
                <span class="badge">Verified Achievement</span>
              </div>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="${data.downloadUrl}" class="button" target="_blank">
                  📥 Download Certificate
                </a>
              </div>
              
              <p style="font-size: 14px; color: #64748b; text-align: center;">
                This certificate is digitally verified and can be authenticated by sharing the PDF.
              </p>
            </div>
            <div class="footer">
              <p>© 2024 LearnHub. All rights reserved.</p>
              <p style="margin-top: 5px; font-size: 11px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      console.warn(`Email template "${template}" not found, using default`);
      // Send a simple email as fallback
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject || 'Notification from LMS Platform',
        html: `
          <h1>${subject || 'Notification'}</h1>
          <p>${data?.message || 'You have a new notification from LMS Platform.'}</p>
        `
      });
      return;
    }

    const emailContent = templateFn(data);
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: emailContent.subject || subject,
      html: emailContent.html
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw - email failures shouldn't break the application
  }
};