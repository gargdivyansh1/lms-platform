const prisma = require('../lib/prisma');
const { sendEmail } = require('../utils/email');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ===== DASHBOARD =====

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get enrolled courses
    const enrollments = await prisma.userCourse.findMany({
      where: { userId: userId },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true, assignments: true }
            }
          }
        }
      }
    });

    // Calculate statistics
    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completed).length;
    const inProgressCourses = enrollments.filter(e => !e.completed && e.progress > 0).length;
    const notStartedCourses = enrollments.filter(e => e.progress === 0).length;
    
    const averageProgress = enrollments.length > 0 
      ? enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length 
      : 0;

    // Get recent activity (last 7 days)
    const recentActivity = await prisma.userCourse.findMany({
      where: {
        userId: userId,
        enrolledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: true,
            thumbnail: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 5
    });

    // Get upcoming assignments
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        userId: userId,
        grade: null,
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { submittedAt: 'asc' },
      take: 5
    });

    // Get certificate count
    const certificates = await prisma.certificate?.count({
      where: { userId: userId }
    }) || 0;

    res.json({
      stats: {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        averageProgress: Math.round(averageProgress),
        certificates
      },
      recentActivity,
      upcomingAssignments
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const userId = req.userId;

    const [recentEnrollments, recentSubmissions, notifications] = await Promise.all([
      prisma.userCourse.findMany({
        where: { userId: userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              instructor: true,
              thumbnail: true
            }
          }
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5
      }),
      prisma.assignment.findMany({
        where: { userId: userId },
        include: {
          course: {
            select: { title: true }
          }
        },
        orderBy: { submittedAt: 'desc' },
        take: 5
      }),
      prisma.notification.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    res.json({
      recentEnrollments,
      recentSubmissions,
      notifications
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// ===== COURSE MANAGEMENT =====

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await prisma.userCourse.findMany({
      where: { userId: userId },
      include: {
        course: {
          include: {
            _count: {
              select: {
                modules: true,
                assignments: true
              }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    const courses = enrollments.map(enrollment => ({
      ...enrollment.course,
      progress: enrollment.progress,
      completed: enrollment.completed,
      enrolledAt: enrollment.enrolledAt,
      enrollmentId: enrollment.id
    }));

    res.json(courses);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Failed to fetch your courses' });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.userId;

    // Check enrollment
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      include: {
        course: {
          include: {
            modules: {
              orderBy: { order: 'asc' }
            },
            assignments: {
              where: { userId: userId }
            }
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // Calculate module completion - using progress as proxy
    const totalModules = enrollment.course.modules.length;
    const completedModules = Math.round((enrollment.progress / 100) * totalModules);

    // Get assignments
    const assignments = enrollment.course.assignments.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      grade: a.grade,
      feedback: a.feedback,
      submittedAt: a.submittedAt
    }));

    res.json({
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        instructor: enrollment.course.instructor,
        description: enrollment.course.description
      },
      progress: {
        overall: enrollment.progress,
        completed: enrollment.completed,
        modulesCompleted: completedModules,
        totalModules: totalModules,
        percentage: totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0
      },
      modules: enrollment.course.modules,
      assignments
    });
  } catch (error) {
    console.error('Course progress error:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
};

exports.completeModule = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { moduleId } = req.body;
    const userId = req.userId;

    // Check enrollment
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      include: {
        course: {
          include: {
            modules: true
          }
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // Update progress - increment by 10% per module (simplified)
    const totalModules = enrollment.course.modules.length;
    const currentProgress = enrollment.progress;
    const progressIncrement = Math.round(100 / totalModules);
    const newProgress = Math.min(currentProgress + progressIncrement, 100);
    const isCompleted = newProgress === 100;

    await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      data: {
        progress: newProgress,
        completed: isCompleted
      }
    });

    // If course is completed, generate certificate
    if (isCompleted) {
      await generateCertificate(userId, courseId);
    }

    res.json({
      message: 'Module completed successfully',
      progress: newProgress,
      completed: isCompleted
    });
  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({ error: 'Failed to complete module' });
  }
};

// ===== ASSIGNMENT MANAGEMENT =====

exports.getMyAssignments = async (req, res) => {
  try {
    const userId = req.userId;

    const assignments = await prisma.assignment.findMany({
      where: { userId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const { comment } = req.body;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if assignment exists and belongs to user
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        userId: userId
      },
      include: {
        course: {
          select: {
            title: true,
            instructor: true
          }
        }
      }
    });

    if (!assignment) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Update assignment with submission
    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        fileUrl: `/uploads/assignments/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        submittedAt: new Date()
      }
    });

    // Notify instructor
    const instructor = await prisma.user.findFirst({
      where: { name: assignment.course.instructor }
    });

    if (instructor) {
      await sendEmail({
        to: instructor.email,
        subject: `New Assignment Submission: ${assignment.title}`,
        template: 'assignment-submitted',
        data: {
          instructor: instructor.name,
          assignmentTitle: assignment.title,
          courseName: assignment.course.title
        }
      });
    }

    res.json({
      message: 'Assignment submitted successfully',
      assignment: updated
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

// ===== PROGRESS TRACKING =====

exports.getOverallProgress = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await prisma.userCourse.findMany({
      where: { userId: userId },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true }
            }
          }
        }
      }
    });

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completed).length;
    const averageProgress = totalCourses > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / totalCourses)
      : 0;

    // Time spent (mock data - would need actual tracking)
    const timeSpent = {
      total: totalCourses * 10, // hours
      weekly: 5 // hours
    };

    res.json({
      totalCourses,
      completedCourses,
      completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
      averageProgress,
      timeSpent,
      courses: enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
        progress: e.progress,
        completed: e.completed,
        totalModules: e.course._count.modules
      }))
    });
  } catch (error) {
    console.error('Overall progress error:', error);
    res.status(500).json({ error: 'Failed to fetch overall progress' });
  }
};

exports.getCertificates = async (req, res) => {
  try {
    const userId = req.userId;

    const certificates = await prisma.certificate?.findMany({
      where: { userId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: true
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    }) || [];

    res.json(certificates);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
};

exports.generateCertificate = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const userId = req.userId;

    const certificate = await generateCertificate(userId, courseId);
    res.json({
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
};

// Helper function to generate PDF certificate
async function generateCertificate(userId, courseId) {
  try {
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      include: {
        user: true,
        course: true
      }
    });

    if (!enrollment || !enrollment.completed) {
      throw new Error('Course not completed');
    }

    // Check if certificate already exists
    const existing = await prisma.certificate?.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    if (existing) {
      return existing;
    }

    // Create certificates directory if it doesn't exist
    const certificateDir = path.join(__dirname, '../uploads/certificates');
    if (!fs.existsSync(certificateDir)) {
      fs.mkdirSync(certificateDir, { recursive: true });
    }

    // Generate PDF certificate
    const filename = `certificate-${userId.substring(0, 8)}-${courseId.substring(0, 8)}-${Date.now()}.pdf`;
    const filepath = path.join(certificateDir, filename);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 50
    });

    // Pipe to file
    const writeStream = fs.createWriteStream(filepath);
    doc.pipe(writeStream);

    // Add border
    doc.rect(30, 30, 750, 520).stroke('#2563eb');

    // Add decorative lines
    doc.lineWidth(2)
       .strokeColor('#2563eb')
       .moveTo(50, 50)
       .lineTo(760, 50)
       .stroke();

    // Certificate title
    doc.fontSize(40)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('CERTIFICATE OF COMPLETION', 0, 80, { 
         align: 'center',
         width: 750
       });

    // Decorative line under title
    doc.lineWidth(1)
       .strokeColor('#93c5fd')
       .moveTo(200, 130)
       .lineTo(600, 130)
       .stroke();

    // Awarded to text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#374151')
       .text('This certifies that', 0, 170, { 
         align: 'center',
         width: 750
       });

    // Student name
    doc.fontSize(36)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text(enrollment.user.name, 0, 210, { 
         align: 'center',
         width: 750
       });

    // Course text
    doc.fontSize(18)
       .font('Helvetica')
       .fillColor('#374151')
       .text('has successfully completed the course', 0, 280, { 
         align: 'center',
         width: 750
       });

    // Course name
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text(enrollment.course.title, 0, 320, { 
         align: 'center',
         width: 750
       });

    // Instructor
    doc.fontSize(16)
       .font('Helvetica')
       .fillColor('#4b5563')
       .text(`Instructed by: ${enrollment.course.instructor}`, 0, 390, { 
         align: 'center',
         width: 750
       });

    // Date
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text(`Date: ${new Date().toLocaleDateString('en-US', { 
         year: 'numeric', 
         month: 'long', 
         day: 'numeric' 
       })}`, 0, 440, { 
         align: 'center',
         width: 750
       });

    // Certificate ID
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#9ca3af')
       .text(`Certificate ID: ${userId.substring(0, 8)}-${courseId.substring(0, 8)}`, 0, 500, { 
         align: 'center',
         width: 750
       });

    // Footer
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#9ca3af')
       .text('© 2024 LearnHub - All Rights Reserved', 0, 530, { 
         align: 'center',
         width: 750
       });

    // End the document
    doc.end();

    // Wait for the file to be written
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });

    // Save certificate record
    const certificate = await prisma.certificate?.create({
      data: {
        userId: userId,
        courseId: courseId,
        fileUrl: `/uploads/certificates/${filename}`,
        issuedAt: new Date()
      }
    });

    // Send email with certificate
    await sendEmail({
      to: enrollment.user.email,
      subject: `Certificate of Completion: ${enrollment.course.title}`,
      template: 'certificate-issued',
      data: {
        name: enrollment.user.name,
        courseName: enrollment.course.title,
        certificateUrl: `${process.env.CLIENT_URL}/certificates/${certificate.id}`
      }
    });

    return certificate;
  } catch (error) {
    console.error('Generate certificate helper error:', error);
    throw error;
  }
}

// ===== WISHLIST =====

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const wishlist = await prisma.wishlist?.findMany({
      where: { userId: userId },
      include: {
        course: {
          include: {
            _count: {
              select: { enrolled: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) || [];

    res.json(wishlist);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;

    // Check if already in wishlist
    const existing = await prisma.wishlist?.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Course already in wishlist' });
    }

    const wishlist = await prisma.wishlist?.create({
      data: {
        userId: userId,
        courseId: courseId
      },
      include: {
        course: true
      }
    });

    res.status(201).json({
      message: 'Course added to wishlist',
      wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    await prisma.wishlist?.deleteMany({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    res.json({ message: 'Course removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
};

// ===== REVIEWS =====

exports.addReview = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.userId;

    // Check if enrolled
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled to review this course' });
    }

    // Check if already reviewed
    const existingReview = await prisma.review?.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    if (existingReview) {
      // Update existing review
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: rating,
          comment: comment || ''
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true
            }
          }
        }
      });
      return res.json({
        message: 'Review updated successfully',
        review: updated
      });
    }

    const review = await prisma.review?.create({
      data: {
        userId: userId,
        courseId: courseId,
        rating: rating,
        comment: comment || ''
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

exports.getCourseReviews = async (req, res) => {
  try {
    const { id: courseId } = req.params;

    const reviews = await prisma.review?.findMany({
      where: { courseId: courseId },
      include: {
        user: {
          select: {
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }) || [];

    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// ===== NOTIFICATIONS =====

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const { unreadOnly = false } = req.query;

    const where = {
      userId: userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false
      }
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    await prisma.notification.updateMany({
      where: {
        id: id,
        userId: userId
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.userId;

    await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

// ===== PROFILE =====

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, bio, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      // Remove uploaded file
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(400).json({ error: 'Invalid file type. Please upload a valid image.' });
    }

    // Update user with avatar path
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        avatar: `/uploads/avatars/${req.file.filename}`
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true
      }
    });

    res.json({
      message: 'Avatar updated successfully',
      user
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    // Clean up uploaded file if error occurs
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};

exports.getPersonalStatistics = async (req, res) => {
  try {
    const userId = req.userId;

    const [enrollments, assignments, reviews] = await Promise.all([
      prisma.userCourse.findMany({
        where: { userId: userId },
        include: {
          course: {
            select: { title: true }
          }
        }
      }),
      prisma.assignment.findMany({
        where: { userId: userId }
      }),
      prisma.review?.findMany({
        where: { userId: userId }
      }) || []
    ]);

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(e => e.completed).length;
    const gradedAssignments = assignments.filter(a => a.grade !== null);
    const averageGrade = gradedAssignments.length > 0
      ? gradedAssignments.reduce((acc, a) => acc + (a.grade || 0), 0) / gradedAssignments.length
      : 0;

    res.json({
      totalCourses,
      completedCourses,
      completionRate: totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0,
      totalAssignments: assignments.length,
      gradedAssignments: gradedAssignments.length,
      averageGrade: Math.round(averageGrade * 10) / 10,
      totalReviews: reviews.length,
      averageRating: reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0
    });
  } catch (error) {
    console.error('Personal statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};