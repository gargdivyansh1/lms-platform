const prisma = require('../lib/prisma');
const { sendEmail } = require('../utils/email');

// ===== DASHBOARD =====

exports.getDashboardStats = async (req, res) => {
  try {
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Get all courses taught by this instructor
    const courses = await prisma.course.findMany({
      where: {
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        _count: {
          select: {
            enrolled: true,
            modules: true,
            assignments: true
          }
        }
      }
    });

    // Calculate stats
    const totalCourses = courses.length;
    const totalStudents = courses.reduce((acc, c) => acc + c._count.enrolled, 0);
    const totalAssignments = courses.reduce((acc, c) => acc + c._count.assignments, 0);
    
    // Get pending assignments (assignments submitted but not graded)
    const pendingAssignments = await prisma.assignment.count({
      where: {
        course: {
          instructor: instructor.name
        },
        grade: null
      }
    });

    // Calculate average rating (mock data for now)
    const averageRating = 4.5;

    res.json({
      stats: {
        totalCourses,
        totalStudents,
        totalAssignments,
        pendingAssignments,
        averageRating
      },
      courses: courses.map(c => ({
        id: c.id,
        title: c.title,
        students: c._count.enrolled,
        modules: c._count.modules,
        assignments: c._count.assignments
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Get recent enrollments
    const recentEnrollments = await prisma.userCourse.findMany({
      where: {
        course: {
          instructor: instructor.name
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatar: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { enrolledAt: 'desc' },
      take: 10
    });

    // Get recent submissions
    const recentSubmissions = await prisma.assignment.findMany({
      where: {
        course: {
          instructor: instructor.name
        },
        grade: null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' },
      take: 10
    });

    res.json({
      recentEnrollments,
      recentSubmissions
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// ===== COURSE MANAGEMENT =====

exports.getMyCourses = async (req, res) => {
  try {
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const courses = await prisma.course.findMany({
      where: {
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        _count: {
          select: {
            enrolled: true,
            modules: true,
            assignments: true
          }
        },
        enrolled: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(courses);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Failed to fetch your courses' });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: { 
        id,
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        assignments: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        },
        enrolled: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course details error:', error);
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnail } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor: instructor.name,
        thumbnail: thumbnail || null,
        featured: false,
        isDeleted: false
      }
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, thumbnail } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: { 
        id,
        instructor: instructor.name,
        isDeleted: false
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updated = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(thumbnail && { thumbnail })
      }
    });

    res.json({
      message: 'Course updated successfully',
      course: updated
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: { 
        id,
        instructor: instructor.name
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await prisma.course.update({
      where: { id },
      data: { isDeleted: true }
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    // In a real app, you would have a status field
    // For now, just return success
    res.json({ message: 'Course published successfully' });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({ error: 'Failed to publish course' });
  }
};

exports.archiveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    // In a real app, you would have a status field
    // For now, just return success
    res.json({ message: 'Course archived successfully' });
  } catch (error) {
    console.error('Archive course error:', error);
    res.status(500).json({ error: 'Failed to archive course' });
  }
};

// ===== MODULE MANAGEMENT =====

exports.createModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, order, videoUrl } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: { 
        id: courseId,
        instructor: instructor.name,
        isDeleted: false
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get current max order
    const maxOrder = await prisma.module.aggregate({
      where: { courseId },
      _max: { order: true }
    });

    const module = await prisma.module.create({
      data: {
        title,
        content,
        videoUrl: videoUrl || null,
        courseId,
        order: order || (maxOrder._max.order || 0) + 1
      }
    });

    res.status(201).json({
      message: 'Module created successfully',
      module
    });
  } catch (error) {
    console.error('Create module error:', error);
    res.status(500).json({ error: 'Failed to create module' });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, content, order, videoUrl } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructor: instructor.name,
          isDeleted: false
        }
      }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    const updated = await prisma.module.update({
      where: { id: moduleId },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(videoUrl && { videoUrl }),
        ...(order !== undefined && { order })
      }
    });

    res.json({
      message: 'Module updated successfully',
      module: updated
    });
  } catch (error) {
    console.error('Update module error:', error);
    res.status(500).json({ error: 'Failed to update module' });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const module = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          instructor: instructor.name
        }
      }
    });

    if (!module) {
      return res.status(404).json({ error: 'Module not found' });
    }

    await prisma.module.delete({
      where: { id: moduleId }
    });

    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    console.error('Delete module error:', error);
    res.status(500).json({ error: 'Failed to delete module' });
  }
};

// ===== STUDENT MANAGEMENT =====

exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        enrolled: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course.enrolled);
  } catch (error) {
    console.error('Get course students error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Get all courses by this instructor
    const courses = await prisma.course.findMany({
      where: {
        instructor: instructor.name,
        isDeleted: false
      },
      select: {
        id: true,
        title: true
      }
    });

    // Get student's progress in these courses
    const progress = await prisma.userCourse.findMany({
      where: {
        userId: studentId,
        courseId: {
          in: courses.map(c => c.id)
        }
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });

    // Get student details
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      }
    });

    res.json({
      student,
      courses: progress
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ error: 'Failed to fetch student progress' });
  }
};

exports.getStudentAssignments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const assignments = await prisma.assignment.findMany({
      where: {
        userId: studentId,
        course: {
          instructor: instructor.name
        }
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(assignments);
  } catch (error) {
    console.error('Get student assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch student assignments' });
  }
};

// ===== ASSIGNMENT MANAGEMENT =====

exports.createAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, maxScore } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Verify course belongs to instructor
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        instructor: instructor.name,
        isDeleted: false
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        fileUrl: '',
        fileSize: 0,
        mimeType: '',
        courseId,
        userId: instructorId
      }
    });

    // Notify all enrolled students
    const enrolled = await prisma.userCourse.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    for (const enrollment of enrolled) {
      await sendEmail({
        to: enrollment.user.email,
        subject: `New Assignment: ${title}`,
        template: 'new-assignment',
        data: {
          name: enrollment.user.name,
          assignmentTitle: title,
          courseName: course.title,
          dueDate: dueDate || 'No due date'
        }
      });
    }

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        course: {
          instructor: instructor.name
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get all submissions for this assignment
    // Since assignment is linked to a specific user, we need to query differently
    const submissions = await prisma.assignment.findMany({
      where: {
        title: assignment.title,
        courseId: assignment.courseId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    res.json({
      assignment,
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const submission = await prisma.assignment.findFirst({
      where: {
        id: submissionId,
        course: {
          instructor: instructor.name
        }
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const updated = await prisma.assignment.update({
      where: { id: submissionId },
      data: {
        grade: grade,
        feedback: feedback || ''
      }
    });

    // Send email notification
    await sendEmail({
      to: submission.user.email,
      subject: `Assignment Graded: ${submission.title}`,
      template: 'grade',
      data: {
        name: submission.user.name,
        assignmentTitle: submission.title,
        courseName: submission.course.title,
        grade: grade,
        feedback: feedback || 'No feedback provided'
      }
    });

    res.json({
      message: 'Submission graded successfully',
      submission: updated
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ error: 'Failed to grade submission' });
  }
};

// ===== ANALYTICS =====

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Get all courses
    const courses = await prisma.course.findMany({
      where: {
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        _count: {
          select: {
            enrolled: true,
            modules: true,
            assignments: true
          }
        }
      }
    });

    // Calculate overall statistics
    const totalStudents = courses.reduce((acc, c) => acc + c._count.enrolled, 0);
    const totalModules = courses.reduce((acc, c) => acc + c._count.modules, 0);
    const totalAssignments = courses.reduce((acc, c) => acc + c._count.assignments, 0);

    // Get completion rates per course
    const completionData = await Promise.all(
      courses.map(async (course) => {
        const completed = await prisma.userCourse.count({
          where: {
            courseId: course.id,
            completed: true
          }
        });
        return {
          courseId: course.id,
          title: course.title,
          totalStudents: course._count.enrolled,
          completed,
          completionRate: course._count.enrolled > 0 
            ? (completed / course._count.enrolled) * 100 
            : 0
        };
      })
    );

    // Get grade distribution
    const grades = await prisma.assignment.aggregate({
      where: {
        course: {
          instructor: instructor.name
        },
        grade: {
          not: null
        }
      },
      _avg: {
        grade: true
      },
      _count: true
    });

    res.json({
      overview: {
        totalStudents,
        totalCourses: courses.length,
        totalModules,
        totalAssignments,
        averageGrade: grades._avg.grade || 0
      },
      courseCompletion: completionData,
      courses
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

exports.getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        instructor: instructor.name,
        isDeleted: false
      },
      include: {
        enrolled: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        assignments: {
          where: {
            grade: {
              not: null
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Calculate course analytics
    const totalStudents = course.enrolled.length;
    const completedStudents = course.enrolled.filter(e => e.completed).length;
    const averageProgress = course.enrolled.reduce((acc, e) => acc + e.progress, 0) / totalStudents || 0;
    const averageGrade = course.assignments.reduce((acc, a) => acc + (a.grade || 0), 0) / course.assignments.length || 0;

    res.json({
      course: {
        id: course.id,
        title: course.title,
        instructor: course.instructor
      },
      analytics: {
        totalStudents,
        completedStudents,
        completionRate: (completedStudents / totalStudents) * 100 || 0,
        averageProgress,
        averageGrade,
        totalAssignments: course.assignments.length
      },
      students: course.enrolled.map(e => ({
        name: e.user.name,
        email: e.user.email,
        progress: e.progress,
        completed: e.completed
      }))
    });
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
};

// ===== COMMUNICATION =====

exports.sendAnnouncement = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, message } = req.body;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        instructor: instructor.name,
        isDeleted: false
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Get all enrolled students
    const enrolled = await prisma.userCourse.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    // Send emails to all students
    for (const enrollment of enrolled) {
      await sendEmail({
        to: enrollment.user.email,
        subject: `[${course.title}] ${title}`,
        template: 'announcement',
        data: {
          name: enrollment.user.name,
          courseName: course.title,
          announcementTitle: title,
          message: message,
          instructor: instructor.name
        }
      });
    }

    // Create notifications
    await prisma.notification.createMany({
      data: enrolled.map(e => ({
        userId: e.user.id,
        title: `New Announcement: ${title}`,
        message: message,
        type: 'announcement',
        isRead: false
      }))
    });

    res.json({
      message: 'Announcement sent successfully',
      recipients: enrolled.length
    });
  } catch (error) {
    console.error('Send announcement error:', error);
    res.status(500).json({ error: 'Failed to send announcement' });
  }
};