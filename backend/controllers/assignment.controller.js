const prisma = require('../lib/prisma');
const fs = require('fs').promises;
const { sendEmail } = require('../utils/email');

exports.uploadAssignment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    const userId = req.userId;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify enrollment
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId
        }
      }
    });

    if (!enrollment) {
      await fs.unlink(req.file.path).catch(() => {});
      return res.status(403).json({ error: 'You are not enrolled in this course' });
    }

    // Create assignment record
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || '',
        fileUrl: `/uploads/assignments/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        courseId: courseId,
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

    // Notify instructor
    const instructor = await prisma.user.findFirst({
      where: { name: assignment.course.instructor }
    });

    if (instructor) {
      await sendEmail({
        to: instructor.email,
        subject: `New Assignment Submitted: ${title}`,
        template: 'assignment-submitted',
        data: {
          instructor: instructor.name,
          assignmentTitle: title,
          courseName: assignment.course.title
        }
      });
    }

    res.status(201).json({
      message: 'Assignment uploaded successfully',
      assignment
    });
  } catch (error) {
    console.error('Upload assignment error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to upload assignment' });
  }
};

exports.getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const assignments = await prisma.assignment.findMany({
      where: { courseId: courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    // Check if user is instructor
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // If student, only show their assignments
    if (course && course.instructor !== user.name) {
      const filtered = assignments.filter(a => a.userId === userId);
      return res.json(filtered);
    }

    res.json(assignments);
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

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
    console.error('Get my assignments error:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { grade, feedback } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        grade: grade,
        feedback: feedback || ''
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

    // Send grade notification
    await sendEmail({
      to: assignment.user.email,
      subject: `Assignment Graded: ${assignment.title}`,
      template: 'grade',
      data: {
        name: assignment.user.name,
        assignmentTitle: assignment.title,
        courseName: assignment.course.title,
        grade: grade,
        feedback: feedback || 'No feedback provided'
      }
    });

    res.json(assignment);
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
};