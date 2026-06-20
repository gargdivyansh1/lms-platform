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
      <h1>Welcome ${data.name}!</h1>
      <p>Thank you for joining our Learning Management System.</p>
      <p>You can now browse courses, enroll, and start learning.</p>
      <a href="${process.env.CLIENT_URL}">Start Learning</a>
    `
  }),
  enrollment: (data) => ({
    subject: `Enrolled in ${data.courseName}`,
    html: `
      <h1>Enrollment Confirmation</h1>
      <p>Dear ${data.name},</p>
      <p>You have successfully enrolled in <strong>${data.courseName}</strong>.</p>
      <p>Instructor: ${data.instructor}</p>
      <a href="${process.env.CLIENT_URL}/courses/${data.courseId}">Access Course</a>
    `
  }),
  'password-reset': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>Hi ${data.name},</p>
      <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
      <a href="${data.resetLink}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),
  grade: (data) => ({
    subject: `Assignment Graded: ${data.assignmentTitle}`,
    html: `
      <h1>Assignment Graded</h1>
      <p>Dear ${data.name},</p>
      <p>Your assignment <strong>${data.assignmentTitle}</strong> for ${data.courseName} has been graded.</p>
      <p><strong>Grade:</strong> ${data.grade}%</p>
      <p><strong>Feedback:</strong> ${data.feedback}</p>
    `
  }),
  'assignment-submitted': (data) => ({
    subject: `New Assignment: ${data.assignmentTitle}`,
    html: `
      <h1>New Assignment Submitted</h1>
      <p>Dear ${data.instructor},</p>
      <p>A new assignment has been submitted for ${data.courseName}.</p>
      <p><strong>Title:</strong> ${data.assignmentTitle}</p>
      <a href="${process.env.CLIENT_URL}/assignments">Review Assignments</a>
    `
  })
};

exports.sendEmail = async ({ to, subject, template, data }) => {
  try {
    const templateFn = emailTemplates[template];
    if (!templateFn) {
      throw new Error(`Email template "${template}" not found`);
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