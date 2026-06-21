const prisma = require('../lib/prisma');

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.userId;

    const wishlist = await prisma.wishlist.findMany({
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
    });

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

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId, isDeleted: false }
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Course already in wishlist' });
    }

    const wishlist = await prisma.wishlist.create({
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

    await prisma.wishlist.deleteMany({
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

exports.checkWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userId;

    const wishlist = await prisma.wishlist.findFirst({
      where: {
        userId: userId,
        courseId: courseId
      }
    });

    res.json({ inWishlist: !!wishlist });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({ error: 'Failed to check wishlist' });
  }
};