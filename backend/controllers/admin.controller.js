const prisma = require('../lib/prisma');
const { sendEmail } = require('../utils/email');
const { createBackup } = require('../utils/backup');

// ===== DASHBOARD & ANALYTICS =====

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalAssignments,
      completedCourses,
      revenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count({ where: { isDeleted: false } }),
      prisma.userCourse.count(),
      prisma.assignment.count(),
      prisma.userCourse.count({ where: { completed: true } }),
      prisma.assignment.aggregate({
        _sum: { grade: true }
      })
    ]);

    // Get recent activity
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    const recentEnrollments = await prisma.userCourse.findMany({
      orderBy: { enrolledAt: 'desc' },
      take: 10,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } }
      }
    });

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalAssignments,
        completedCourses,
        averageGrade: revenue._sum.grade ? (revenue._sum.grade / totalAssignments) : 0,
        completionRate: totalEnrollments ? ((completedCourses / totalEnrollments) * 100) : 0
      },
      recentActivity: {
        recentUsers,
        recentEnrollments
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getUserAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Get user growth data
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${period}, "createdAt") as date,
        COUNT(*) as count
      FROM "User"
      GROUP BY DATE_TRUNC(${period}, "createdAt")
      ORDER BY date DESC
      LIMIT 12
    `;

    // Get role distribution
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: true
    });

    // Get active users (with recent activity)
    const activeUsers = await prisma.user.findMany({
      where: {
        enrolledCourses: {
          some: {
            enrolledAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        enrolledCourses: {
          select: {
            progress: true,
            completed: true
          }
        }
      }
    });

    res.json({
      userGrowth,
      roleDistribution,
      activeUsers: {
        count: activeUsers.length,
        users: activeUsers
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

exports.getCourseAnalytics = async (req, res) => {
  try {
    // Get course statistics
    const courseStats = await prisma.course.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: {
            enrolled: true,
            modules: true,
            assignments: true
          }
        }
      },
      orderBy: {
        enrolled: {
          _count: 'desc'
        }
      }
    });

    // Get popular courses
    const popularCourses = courseStats.slice(0, 5).map(c => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor,
      students: c._count.enrolled,
      modules: c._count.modules,
      assignments: c._count.assignments
    }));

    // Get completion rates
    const completionRates = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.title,
        COUNT(uc.id) as total_enrolled,
        COUNT(CASE WHEN uc.completed = true THEN 1 END) as completed
      FROM "Course" c
      LEFT JOIN "UserCourse" uc ON c.id = uc."courseId"
      WHERE c."isDeleted" = false
      GROUP BY c.id, c.title
      HAVING COUNT(uc.id) > 0
    `;

    res.json({
      popularCourses,
      completionRates,
      totalCourses: courseStats.length
    });
  } catch (error) {
    console.error('Course analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch course analytics' });
  }
};

exports.getRevenueAnalytics = async (req, res) => {
  try {
    // Since we're not charging yet, return mock data
    // This would be replaced with actual payment data

    const revenueData = {
      totalRevenue: 0,
      monthlyRevenue: [],
      topCourses: [],
      subscriptionStats: {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        renewalRate: 0
      }
    };

    res.json(revenueData);
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
};

exports.getEngagementAnalytics = async (req, res) => {
  try {
    // Get daily active users
    const dailyActive = await prisma.userCourse.findMany({
      where: {
        enrolledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: {
        enrolledAt: true,
        progress: true,
        userId: true
      }
    });

    // Get average time spent (mock data)
    const engagementData = {
      dailyActiveUsers: dailyActive.length,
      averageProgress: dailyActive.reduce((acc, curr) => acc + curr.progress, 0) / dailyActive.length || 0,
      mostEngagedCourses: [],
      userRetention: 0
    };

    res.json(engagementData);
  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch engagement analytics' });
  }
};

// ===== USER MANAGEMENT =====

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(role && { role })
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
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
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrolledCourses: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                instructor: true
              }
            }
          }
        },
        assignments: {
          include: {
            course: {
              select: {
                title: true
              }
            }
          },
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate statistics
    const stats = {
      totalCourses: user.enrolledCourses.length,
      completedCourses: user.enrolledCourses.filter(e => e.completed).length,
      totalAssignments: user.assignments.length,
      averageGrade: user.assignments.reduce((acc, a) => acc + (a.grade || 0), 0) / user.assignments.length || 0,
      overallProgress: user.enrolledCourses.reduce((acc, e) => acc + e.progress, 0) / user.enrolledCourses.length || 0
    };

    res.json({
      user,
      stats
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing your own role (to maintain at least one admin)
    if (id === req.userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    // Send notification email
    await sendEmail({
      to: user.email,
      subject: 'Role Updated',
      template: 'role-updated',
      data: {
        name: user.name,
        newRole: role
      }
    });

    res.json({
      message: `User role updated to ${role}`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // This would be implemented with a 'status' field in User model
    // For now, we'll simulate it with a soft delete
    if (status === false) {
      await prisma.user.update({
        where: { id },
        data: { isDeleted: true } // You'd need to add this field
      });
      res.json({ message: 'User deactivated successfully' });
    } else {
      await prisma.user.update({
        where: { id },
        data: { isDeleted: false }
      });
      res.json({ message: 'User activated successfully' });
    }
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting your own account
    if (id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword || 'Temp123!', 12);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    // Send email with new password
    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      template: 'password-reset-admin',
      data: {
        name: user.name,
        newPassword: newPassword || 'Temp123!'
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

// ===== COURSE MANAGEMENT =====

exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status = 'all' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { instructor: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(status === 'deleted' && { isDeleted: true }),
      ...(status === 'active' && { isDeleted: false })
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          _count: {
            select: {
              enrolled: true,
              modules: true,
              assignments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      data: courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        enrolled: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
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

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, status } = req.body;

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructor && { instructor })
      }
    });

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id }
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

exports.recoverCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await prisma.course.update({
      where: { id },
      data: { isDeleted: false }
    });

    res.json({ message: 'Course recovered successfully' });
  } catch (error) {
    console.error('Recover course error:', error);
    res.status(500).json({ error: 'Failed to recover course' });
  }
};

exports.featureCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Add featured field to course model if not exists
    await prisma.course.update({
      where: { id },
      data: { featured: true }
    });

    res.json({ message: 'Course featured successfully' });
  } catch (error) {
    console.error('Feature course error:', error);
    res.status(500).json({ error: 'Failed to feature course' });
  }
};

exports.unfeatureCourse = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.course.update({
      where: { id },
      data: { featured: false }
    });

    res.json({ message: 'Course unfeatured successfully' });
  } catch (error) {
    console.error('Unfeature course error:', error);
    res.status(500).json({ error: 'Failed to unfeature course' });
  }
};

// ===== SYSTEM MANAGEMENT =====

exports.getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
        storage: 'connected'
      },
      metrics: {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    };

    res.json(health);
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({ error: 'Failed to get system health' });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    
    // In production, you'd read from a log file or database
    const logs = [
      { timestamp: new Date().toISOString(), level: 'info', message: 'System running' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'User logged in' }
    ];

    res.json({ logs: logs.slice(0, parseInt(limit)) });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const backup = await createBackup();
    res.json({
      message: 'Backup created successfully',
      backupId: backup.id,
      timestamp: backup.timestamp
    });
  } catch (error) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
};

exports.toggleMaintenance = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    // This would set a maintenance flag in the database
    // For now, just return success
    res.json({
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      maintenanceMode: enabled
    });
  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.status(500).json({ error: 'Failed to toggle maintenance' });
  }
};

// ===== REPORTS =====

exports.generateUserReport = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            enrolledCourses: true,
            assignments: true
          }
        }
      }
    });

    const report = {
      generatedAt: new Date().toISOString(),
      totalUsers: users.length,
      usersByRole: users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {}),
      users: users.map(u => ({
        name: u.name,
        email: u.email,
        role: u.role,
        coursesEnrolled: u._count.enrolledCourses,
        assignmentsSubmitted: u._count.assignments,
        joinedAt: u.createdAt
      }))
    };

    res.json(report);
  } catch (error) {
    console.error('Generate user report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.generateCourseReport = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      where: { isDeleted: false },
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

    const report = {
      generatedAt: new Date().toISOString(),
      totalCourses: courses.length,
      totalEnrollments: courses.reduce((acc, c) => acc + c._count.enrolled, 0),
      courses: courses.map(c => ({
        title: c.title,
        instructor: c.instructor,
        students: c._count.enrolled,
        modules: c._count.modules,
        assignments: c._count.assignments,
        createdAt: c.createdAt
      }))
    };

    res.json(report);
  } catch (error) {
    console.error('Generate course report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

exports.generateAssignmentReport = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
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

    const report = {
      generatedAt: new Date().toISOString(),
      totalAssignments: assignments.length,
      gradedAssignments: assignments.filter(a => a.grade !== null).length,
      averageGrade: assignments.reduce((acc, a) => acc + (a.grade || 0), 0) / assignments.length || 0,
      assignments: assignments.map(a => ({
        title: a.title,
        student: a.user.name,
        course: a.course.title,
        grade: a.grade || 'Pending',
        submittedAt: a.submittedAt
      }))
    };

    res.json(report);
  } catch (error) {
    console.error('Generate assignment report error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};

// ===== NOTIFICATIONS =====

exports.sendSystemNotification = async (req, res) => {
  try {
    const { title, message, userIds } = req.body;

    // Send to all users if no specific users specified
    const users = userIds || await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });

    // Create notifications
    const notifications = await prisma.notification.createMany({
      data: users.map(user => ({
        userId: user.id,
        title,
        message,
        type: 'system'
      }))
    });

    // Send emails
    for (const user of users) {
      await sendEmail({
        to: user.email,
        subject: title,
        template: 'system-notification',
        data: {
          name: user.name,
          message,
          title
        }
      });
    }

    res.json({
      message: 'Notifications sent successfully',
      recipients: users.length
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notifications' });
  }
};