const prisma = require('../lib/prisma');
const fs = require('fs').promises;

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            enrolledCourses: true,
            assignments: true
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        enrolledCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                instructor: true,
                thumbnail: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email } = req.body;

    // Check if email is taken
    if (email) {
      const existing = await prisma.user.findUnique({
        where: { email }
      });

      if (existing && existing.id !== userId) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email })
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

    res.json(user);
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

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        avatar: `/uploads/avatars/${req.file.filename}`
      }
    });

    res.json({ avatar: user.avatar });
  } catch (error) {
    console.error('Update avatar error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ error: 'Failed to update avatar' });
  }
};

exports.getUserEnrollments = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollments = await prisma.userCourse.findMany({
      where: { userId: id },
      include: {
        course: {
          include: {
            _count: {
              select: { enrolled: true }
            }
          }
        }
      }
    });

    res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};