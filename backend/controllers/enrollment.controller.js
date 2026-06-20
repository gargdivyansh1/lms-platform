const prisma = require('../lib/prisma');
const { sendEmail } = require('../utils/email');

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.userId;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId, isDeleted: false }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check for duplicate enrollment
    const existing = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = await prisma.userCourse.create({
      data: {
        userId: userId,
        courseId: courseId
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

    // Get user info for email
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Send enrollment email
    await sendEmail({
      to: user.email,
      subject: `Enrolled in ${course.title}`,
      template: 'enrollment',
      data: {
        name: user.name,
        courseName: course.title,
        instructor: course.instructor,
        courseId: courseId
      }
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
};

exports.unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Unenrollment error:', error);
    res.status(500).json({ error: 'Failed to unenroll from course' });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.userId;

    const enrollments = await prisma.userCourse.findMany({
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
      orderBy: { enrolledAt: 'desc' }
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({ error: 'Failed to fetch your courses' });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { courseId, progress } = req.body;
    const userId = req.userId;

    const updated = await prisma.userCourse.update({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      },
      data: {
        progress: progress,
        completed: progress === 100
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
};