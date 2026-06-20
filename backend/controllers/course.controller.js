const { prisma, redis } = require('../server');

exports.getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const instructor = req.query.instructor || '';

    // Build cache key
    const cacheKey = `courses:${page}:${limit}:${search}:${instructor}`;
    
    // Check cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // Build where clause
    const where = {
      isDeleted: false,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(instructor && { instructor: { contains: instructor, mode: 'insensitive' } })
    };

    // Get courses with count
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

    const response = {
      data: courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id, isDeleted: false },
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

    // Clear cache
    await redis.keys('courses:*').then(keys => {
      if (keys.length > 0) {
        redis.del(keys);
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

    // Check if course exists
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

    // Clear cache
    await redis.keys('courses:*').then(keys => {
      if (keys.length > 0) {
        redis.del(keys);
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

    // Soft delete
    const course = await prisma.course.update({
      where: { id },
      data: { isDeleted: true }
    });

    // Clear cache
    await redis.keys('courses:*').then(keys => {
      if (keys.length > 0) {
        redis.del(keys);
      }
    });

    res.json({ message: 'Course deleted successfully', course });
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
      data: { isDeleted: false }
    });

    // Clear cache
    await redis.keys('courses:*').then(keys => {
      if (keys.length > 0) {
        redis.del(keys);
      }
    });

    res.json({ message: 'Course recovered successfully', course });
  } catch (error) {
    console.error('Recover course error:', error);
    res.status(500).json({ error: 'Failed to recover course' });
  }
};