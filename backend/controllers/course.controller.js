const prisma = require('../lib/prisma');

exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const instructor = req.query.instructor || '';

    // Build where clause
    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(instructor && {
        instructor: { contains: instructor, mode: 'insensitive' }
      })
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { enrolled: true }
          },
          modules: {
            select: {
              id: true,
              title: true,
              order: true
            },
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findFirst({
      where: {
        id,
        isDeleted: false
      },
      include: {
        modules: {
          orderBy: { order: 'asc' }
        },
        assignments: {
          select: {
            id: true,
            title: true,
            description: true,
            submittedAt: true
          }
        },
        _count: {
          select: { enrolled: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);

  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, instructor, thumbnail } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor,
        thumbnail
      },
      include: {
        modules: true
      }
    });

    res.status(201).json(course);

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, instructor, thumbnail } = req.body;

    const existing = await prisma.course.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(instructor && { instructor }),
        ...(thumbnail && { thumbnail })
      }
    });

    res.json(course);

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.update({
      where: { id },
      data: {
        isDeleted: true
      }
    });

    res.json({
      message: 'Course deleted successfully',
      course
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

exports.recoverCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.update({
      where: { id },
      data: {
        isDeleted: false
      }
    });

    res.json({
      message: 'Course recovered successfully',
      course
    });

  } catch (error) {
    console.error('Recover course error:', error);
    res.status(500).json({ error: 'Failed to recover course' });
  }
};