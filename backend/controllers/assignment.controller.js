const prisma = require('../lib/prisma');
const fs = require('fs').promises;
const path = require('path');
const { sendEmail } = require('../utils/email');

// Get all assignments for a student
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

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const assignment = await prisma.assignment.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            instructor: true,
            description: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
};

// Submit assignment
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
        },
        user: {
          select: {
            name: true,
            email: true
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
          studentName: assignment.user.name,
          assignmentTitle: assignment.title,
          courseName: assignment.course.title,
          submittedAt: new Date().toLocaleString()
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

// Create assignment (for instructors)
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

    // Get all enrolled students
    const enrolled = await prisma.userCourse.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    });

    // Create assignments for each enrolled student
    const assignments = [];
    for (const enrollment of enrolled) {
      const assignment = await prisma.assignment.create({
        data: {
          title,
          description: description || '',
          fileUrl: null,
          fileSize: 0,
          mimeType: '',
          courseId,
          userId: enrollment.user.id
        }
      });
      assignments.push(assignment);

      // Send email notification to each student
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
      message: `Assignment created successfully for ${assignments.length} students`,
      assignments
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

// Grade assignment
exports.gradeAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { grade, feedback } = req.body;
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

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        grade: grade,
        feedback: feedback || ''
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

    res.json({
      message: 'Assignment graded successfully',
      assignment: updated
    });
  } catch (error) {
    console.error('Grade assignment error:', error);
    res.status(500).json({ error: 'Failed to grade assignment' });
  }
};

// Get assignment submissions (for instructors)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const instructorId = req.userId;
    const instructor = await prisma.user.findUnique({
      where: { id: instructorId }
    });

    // Get all assignments with the same title in the same course
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
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
      }
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Get all submissions for this assignment
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