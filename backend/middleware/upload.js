// backend/middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Create upload directories
const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Create all necessary directories
const uploadDirs = [
  'uploads/assignments',
  'uploads/avatars',
  'uploads/thumbnails',
  'uploads/certificates'
];

uploadDirs.forEach(dir => createDir(dir));

// Assignment storage
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `assignment-${uniqueId}-${Date.now()}${ext}`);
  }
});

// Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.userId || req.body.userId || 'unknown';
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  }
});

// File filter for assignments
const assignmentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, ZIP'), false);
  }
};

// File filter for images (avatars, thumbnails)
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed. Allowed: JPEG, PNG, GIF, WEBP, SVG'), false);
  }
};

// Assignment upload middleware
const uploadAssignment = multer({
  storage: assignmentStorage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  },
  fileFilter: assignmentFileFilter
});

// Avatar upload middleware
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: imageFileFilter
});

// Export middleware functions
module.exports = {
  // For assignments
  single: uploadAssignment.single.bind(uploadAssignment),
  array: uploadAssignment.array.bind(uploadAssignment),
  fields: uploadAssignment.fields.bind(uploadAssignment),
  
  // For avatars
  avatar: uploadAvatar.single.bind(uploadAvatar),
  
  // Direct access to multer instances if needed
  assignmentUpload: uploadAssignment,
  avatarUpload: uploadAvatar
};