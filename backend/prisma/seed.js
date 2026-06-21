// backend/prisma/seed.js - Updated with fixed assignments

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.assignment.deleteMany({});
  await prisma.userCourse.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.certificate.deleteMany({});

  console.log('👤 Creating users...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lms.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=100',
      bio: 'Platform administrator'
    }
  });

  // Create instructors
  const instructorPassword = await bcrypt.hash('instructor123', 12);
  
  const instructor1 = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Johnson',
      email: 'sarah@lms.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8b5cf6&color=fff&size=100',
      bio: 'PhD in Computer Science with 15 years of teaching experience'
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Prof. Michael Chen',
      email: 'michael@lms.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=06b6d4&color=fff&size=100',
      bio: 'Data Science expert and AI researcher'
    }
  });

  const instructor3 = await prisma.user.create({
    data: {
      name: 'Dr. Emily Rodriguez',
      email: 'emily@lms.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff&size=100',
      bio: 'UX/UI Design specialist and former Google designer'
    }
  });

  // Create students
  const studentPassword = await bcrypt.hash('student123', 12);
  
  const students = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Smith',
        email: 'alice@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=3b82f6&color=fff&size=100',
        bio: 'Computer Science student passionate about web development'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=10b981&color=fff&size=100',
        bio: 'Aspiring data scientist and ML enthusiast'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Carol+Davis&background=f59e0b&color=fff&size=100',
        bio: 'UI/UX design student with a passion for user research'
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=ef4444&color=fff&size=100',
        bio: 'Database enthusiast and backend developer'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emma Thompson',
        email: 'emma@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Thompson&background=8b5cf6&color=fff&size=100',
        bio: 'Cloud computing and DevOps engineer in training'
      }
    })
  ]);

  console.log('📚 Creating courses...');

  // Course 1: Web Development Bootcamp
  const course1 = await prisma.course.create({
    data: {
      title: 'Full Stack Web Development Bootcamp',
      description: 'Master modern web development with React, Node.js, and MongoDB. Build real-world applications from scratch.',
      instructor: instructor1.name,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&h=300&fit=crop',
      category: 'web-development',
      featured: true,
      modules: {
        create: [
          {
            title: 'Introduction to Web Development',
            content: 'Learn the fundamentals of HTML, CSS, and JavaScript. Understand how the web works and build your first webpage.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_1'
          },
          {
            title: 'Frontend Development with React',
            content: 'Deep dive into React.js including hooks, state management, routing, and building component-based applications.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_2'
          },
          {
            title: 'Backend Development with Node.js',
            content: 'Build RESTful APIs with Express.js, work with databases using MongoDB, and implement authentication.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_3'
          },
          {
            title: 'Database Design and Management',
            content: 'Learn database design principles, SQL vs NoSQL, data modeling, and optimization techniques.',
            order: 4,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_4'
          },
          {
            title: 'Deployment and DevOps',
            content: 'Deploy your applications to cloud platforms like AWS, Vercel, and Heroku. Learn CI/CD pipelines.',
            order: 5,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_5'
          }
        ]
      }
    }
  });

  // Course 2: Data Science & Machine Learning
  const course2 = await prisma.course.create({
    data: {
      title: 'Data Science & Machine Learning Mastery',
      description: 'Learn data analysis, visualization, and machine learning with Python. Build predictive models and make data-driven decisions.',
      instructor: instructor2.name,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop',
      category: 'data-science',
      featured: true,
      modules: {
        create: [
          {
            title: 'Python for Data Science',
            content: 'Master Python programming with a focus on data analysis libraries including NumPy, Pandas, and Matplotlib.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_6'
          },
          {
            title: 'Data Visualization',
            content: 'Create compelling visualizations with Matplotlib, Seaborn, and Plotly. Tell stories with your data.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_7'
          },
          {
            title: 'Machine Learning Fundamentals',
            content: 'Understand supervised and unsupervised learning. Implement regression, classification, and clustering algorithms.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_8'
          },
          {
            title: 'Deep Learning with TensorFlow',
            content: 'Build neural networks and deep learning models using TensorFlow and Keras.',
            order: 4,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_9'
          }
        ]
      }
    }
  });

  // Course 3: UI/UX Design
  const course3 = await prisma.course.create({
    data: {
      title: 'UI/UX Design Professional',
      description: 'Learn user interface and user experience design principles. Master Figma, prototyping, and user research.',
      instructor: instructor3.name,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
      category: 'design',
      modules: {
        create: [
          {
            title: 'Design Thinking Fundamentals',
            content: 'Understand design thinking methodology and how to approach design problems systematically.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_10'
          },
          {
            title: 'Figma Mastery',
            content: 'Learn Figma from scratch including components, auto-layout, variants, and team collaboration.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_11'
          },
          {
            title: 'User Research and Testing',
            content: 'Conduct user research, create personas, and perform usability testing to validate your designs.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_12'
          }
        ]
      }
    }
  });

  // Course 4: Cloud Computing
  const course4 = await prisma.course.create({
    data: {
      title: 'Cloud Computing with AWS',
      description: 'Master Amazon Web Services including EC2, S3, Lambda, and more. Learn cloud architecture and best practices.',
      instructor: instructor1.name,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&h=300&fit=crop',
      category: 'cloud-computing',
      modules: {
        create: [
          {
            title: 'AWS Fundamentals',
            content: 'Introduction to AWS services and cloud computing concepts. Set up your AWS account and understand the pricing model.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_13'
          },
          {
            title: 'Compute Services (EC2 & Lambda)',
            content: 'Learn about EC2 instances, auto-scaling, and serverless computing with Lambda functions.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_14'
          },
          {
            title: 'Storage Services (S3 & EBS)',
            content: 'Master S3 buckets, EBS volumes, and understand storage best practices.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_15'
          }
        ]
      }
    }
  });

  // Course 5: Mobile App Development
  const course5 = await prisma.course.create({
    data: {
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile apps using React Native. Learn to deploy to both iOS and Android stores.',
      instructor: instructor2.name,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=500&h=300&fit=crop',
      category: 'mobile-development',
      modules: {
        create: [
          {
            title: 'React Native Fundamentals',
            content: 'Get started with React Native including components, styling, and navigation.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_16'
          },
          {
            title: 'State Management',
            content: 'Learn Redux and Context API for state management in React Native applications.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_17'
          },
          {
            title: 'Native Features & APIs',
            content: 'Access native device features including camera, location, and push notifications.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_18'
          }
        ]
      }
    }
  });

  console.log('🎓 Enrolling students in courses...');

  // Enroll students in courses
  await prisma.userCourse.createMany({
    data: [
      // Alice's enrollments
      { userId: students[0].id, courseId: course1.id, progress: 45, completed: false },
      { userId: students[0].id, courseId: course2.id, progress: 20, completed: false },
      { userId: students[0].id, courseId: course3.id, progress: 0, completed: false },
      
      // Bob's enrollments
      { userId: students[1].id, courseId: course1.id, progress: 80, completed: false },
      { userId: students[1].id, courseId: course2.id, progress: 35, completed: false },
      { userId: students[1].id, courseId: course5.id, progress: 10, completed: false },
      
      // Carol's enrollments
      { userId: students[2].id, courseId: course3.id, progress: 60, completed: false },
      { userId: students[2].id, courseId: course4.id, progress: 0, completed: false },
      
      // David's enrollments
      { userId: students[3].id, courseId: course1.id, progress: 95, completed: false },
      
      // Emma's enrollments
      { userId: students[4].id, courseId: course2.id, progress: 50, completed: false },
      { userId: students[4].id, courseId: course4.id, progress: 5, completed: false }
    ]
  });

  console.log('📝 Creating assignments with different statuses...');

  // Course 1 Assignments (Web Development)
  
  // Alice's assignments for Course 1
  // 1. Graded
  await prisma.assignment.create({
    data: {
      title: 'HTML/CSS Project',
      description: 'Build a personal portfolio website using HTML and CSS. Include responsive design and animations.',
      fileUrl: '/uploads/assignments/sample-html-project.pdf',
      fileSize: 2500000,
      mimeType: 'application/pdf',
      courseId: course1.id,
      userId: students[0].id,
      grade: 85,
      feedback: 'Great work! Good use of flexbox and animations. Consider adding more accessibility features.',
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Pending Review
  await prisma.assignment.create({
    data: {
      title: 'React Todo App',
      description: 'Create a task management application using React with hooks and local storage.',
      fileUrl: '/uploads/assignments/sample-react-app.zip',
      fileSize: 4500000,
      mimeType: 'application/zip',
      courseId: course1.id,
      userId: students[0].id,
      grade: null,
      feedback: null,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  // 3. Not Submitted (submittedAt: null)
  await prisma.assignment.create({
    data: {
      title: 'Node.js REST API',
      description: 'Build a RESTful API with Express.js and MongoDB. Include authentication and validation.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course1.id,
      userId: students[0].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  // Bob's assignments for Course 1
  // 1. Graded
  await prisma.assignment.create({
    data: {
      title: 'HTML/CSS Project',
      description: 'Build a personal portfolio website using HTML and CSS. Include responsive design and animations.',
      fileUrl: '/uploads/assignments/sample-html-project-bob.pdf',
      fileSize: 3200000,
      mimeType: 'application/pdf',
      courseId: course1.id,
      userId: students[1].id,
      grade: 92,
      feedback: 'Excellent work! Great design and responsive layout. Perfect use of CSS grid.',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Pending Review
  await prisma.assignment.create({
    data: {
      title: 'React Todo App',
      description: 'Create a task management application using React with hooks and local storage.',
      fileUrl: '/uploads/assignments/sample-react-app-bob.zip',
      fileSize: 3800000,
      mimeType: 'application/zip',
      courseId: course1.id,
      userId: students[1].id,
      grade: null,
      feedback: null,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // 3. Not Submitted
  await prisma.assignment.create({
    data: {
      title: 'Node.js REST API',
      description: 'Build a RESTful API with Express.js and MongoDB. Include authentication and validation.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course1.id,
      userId: students[1].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  // David's assignments for Course 1
  // 1. Graded
  await prisma.assignment.create({
    data: {
      title: 'HTML/CSS Project',
      description: 'Build a personal portfolio website using HTML and CSS. Include responsive design and animations.',
      fileUrl: '/uploads/assignments/sample-html-project-david.pdf',
      fileSize: 2800000,
      mimeType: 'application/pdf',
      courseId: course1.id,
      userId: students[3].id,
      grade: 95,
      feedback: 'Outstanding work! Professional design and excellent code quality.',
      submittedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Pending Review
  await prisma.assignment.create({
    data: {
      title: 'React Todo App',
      description: 'Create a task management application using React with hooks and local storage.',
      fileUrl: '/uploads/assignments/sample-react-app-david.zip',
      fileSize: 4200000,
      mimeType: 'application/zip',
      courseId: course1.id,
      userId: students[3].id,
      grade: null,
      feedback: null,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  // 3. Not Submitted
  await prisma.assignment.create({
    data: {
      title: 'Node.js REST API',
      description: 'Build a RESTful API with Express.js and MongoDB. Include authentication and validation.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course1.id,
      userId: students[3].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  // Course 2 Assignments (Data Science)
  
  // Emma's assignments for Course 2
  // 1. Graded
  await prisma.assignment.create({
    data: {
      title: 'Data Analysis Project',
      description: 'Analyze a dataset of your choice using Pandas and create visualizations with Matplotlib.',
      fileUrl: '/uploads/assignments/sample-data-analysis-emma.zip',
      fileSize: 5000000,
      mimeType: 'application/zip',
      courseId: course2.id,
      userId: students[4].id,
      grade: 78,
      feedback: 'Good analysis but could include more statistical insights and better visualizations.',
      submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Pending Review
  await prisma.assignment.create({
    data: {
      title: 'Machine Learning Model',
      description: 'Build a machine learning model to predict housing prices using scikit-learn.',
      fileUrl: '/uploads/assignments/sample-ml-model-emma.zip',
      fileSize: 6000000,
      mimeType: 'application/zip',
      courseId: course2.id,
      userId: students[4].id,
      grade: null,
      feedback: null,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  // Alice's assignment for Course 2 - Pending Review
  await prisma.assignment.create({
    data: {
      title: 'Data Analysis Project',
      description: 'Analyze a dataset of your choice using Pandas and create visualizations with Matplotlib.',
      fileUrl: '/uploads/assignments/sample-data-analysis-alice.zip',
      fileSize: 4800000,
      mimeType: 'application/zip',
      courseId: course2.id,
      userId: students[0].id,
      grade: null,
      feedback: null,
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
  });

  // Bob's assignment for Course 2 - Not Submitted
  await prisma.assignment.create({
    data: {
      title: 'Data Analysis Project',
      description: 'Analyze a dataset of your choice using Pandas and create visualizations with Matplotlib.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course2.id,
      userId: students[1].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  // Course 3 Assignments (UI/UX)
  
  // Carol's assignments for Course 3
  // 1. Graded
  await prisma.assignment.create({
    data: {
      title: 'Figma Design Project',
      description: 'Design a mobile app UI for a food delivery service in Figma. Include user flows and prototypes.',
      fileUrl: '/uploads/assignments/sample-figma-design-carol.fig',
      fileSize: 8000000,
      mimeType: 'application/octet-stream',
      courseId: course3.id,
      userId: students[2].id,
      grade: 94,
      feedback: 'Outstanding design! Great use of typography and color. Excellent user flow.',
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  // 2. Not Submitted
  await prisma.assignment.create({
    data: {
      title: 'User Research Project',
      description: 'Conduct user research and create personas for a mobile app of your choice.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course3.id,
      userId: students[2].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  // Alice's assignment for Course 3 - Not Submitted
  await prisma.assignment.create({
    data: {
      title: 'Figma Design Project',
      description: 'Design a mobile app UI for a food delivery service in Figma. Include user flows and prototypes.',
      fileUrl: null,
      fileSize: 0,
      mimeType: '',
      courseId: course3.id,
      userId: students[0].id,
      grade: null,
      feedback: null,
      submittedAt: null
    }
  });

  console.log('🔔 Creating notifications...');

  await prisma.notification.createMany({
    data: [
      {
        userId: students[0].id,
        title: 'Assignment Graded',
        message: 'Your HTML/CSS Project has been graded. Score: 85%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[0].id,
        title: 'New Assignment',
        message: 'New assignment "Node.js REST API" has been created for Web Development Bootcamp.',
        type: 'assignment',
        isRead: false
      },
      {
        userId: students[1].id,
        title: 'Assignment Graded',
        message: 'Your HTML/CSS Project has been graded. Score: 92%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[1].id,
        title: 'New Assignment',
        message: 'New assignment "Node.js REST API" has been created for Web Development Bootcamp.',
        type: 'assignment',
        isRead: false
      },
      {
        userId: students[2].id,
        title: 'Assignment Graded',
        message: 'Your Figma Design Project has been graded. Score: 94%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[2].id,
        title: 'New Assignment',
        message: 'New assignment "User Research Project" has been created for UI/UX Design Professional.',
        type: 'assignment',
        isRead: false
      },
      {
        userId: students[3].id,
        title: 'Assignment Graded',
        message: 'Your HTML/CSS Project has been graded. Score: 95%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[3].id,
        title: 'New Assignment',
        message: 'New assignment "Node.js REST API" has been created for Web Development Bootcamp.',
        type: 'assignment',
        isRead: false
      },
      {
        userId: students[4].id,
        title: 'Assignment Graded',
        message: 'Your Data Analysis Project has been graded. Score: 78%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[4].id,
        title: 'New Assignment',
        message: 'Your Machine Learning Model assignment is pending review.',
        type: 'assignment',
        isRead: false
      }
    ]
  });

  console.log('❤️ Creating wishlist entries...');
  await prisma.wishlist.createMany({
    data: [
      { userId: students[0].id, courseId: course4.id },
      { userId: students[1].id, courseId: course3.id },
      { userId: students[2].id, courseId: course1.id },
      { userId: students[3].id, courseId: course2.id },
      { userId: students[4].id, courseId: course5.id }
    ]
  });

  console.log('⭐ Creating reviews...');
  await prisma.review.createMany({
    data: [
      {
        userId: students[0].id,
        courseId: course1.id,
        rating: 5,
        comment: 'Excellent course! The instructor explains concepts very clearly. Highly recommended for beginners.'
      },
      {
        userId: students[1].id,
        courseId: course1.id,
        rating: 4,
        comment: 'Great content but could use more practical examples. Overall very helpful.'
      },
      {
        userId: students[3].id,
        courseId: course1.id,
        rating: 5,
        comment: 'Best web development course I have taken. The projects are challenging and rewarding.'
      },
      {
        userId: students[4].id,
        courseId: course2.id,
        rating: 4,
        comment: 'Very comprehensive data science course. The ML section is particularly good.'
      },
      {
        userId: students[2].id,
        courseId: course3.id,
        rating: 5,
        comment: 'Amazing UI/UX course! Learned so much about design thinking and Figma.'
      }
    ]
  });

  console.log('✅ Seeding completed successfully!');
  console.log('📊 Summary:');
  console.log(`   - ${await prisma.user.count()} users created`);
  console.log(`   - ${await prisma.course.count()} courses created`);
  console.log(`   - ${await prisma.module.count()} modules created`);
  console.log(`   - ${await prisma.userCourse.count()} enrollments created`);
  console.log(`   - ${await prisma.assignment.count()} assignments created`);
  console.log(`   - ${await prisma.notification.count()} notifications created`);
  console.log(`   - ${await prisma.wishlist.count()} wishlist entries created`);
  console.log(`   - ${await prisma.review.count()} reviews created`);

  const allAssignments = await prisma.assignment.findMany({
    include: {
      user: {
        select: { name: true }
      },
      course: {
        select: { title: true }
      }
    }
  });

  const graded = allAssignments.filter(a => a.grade !== null);
  const pending = allAssignments.filter(a => a.grade === null && a.submittedAt !== null);
  const notSubmitted = allAssignments.filter(a => a.submittedAt === null);

  console.log('\n📝 Assignment Status Summary:');
  console.log(`   - Graded: ${graded.length}`);
  console.log(`   - Pending Review: ${pending.length}`);
  console.log(`   - Not Submitted: ${notSubmitted.length}`);

  console.log('\n🎓 Test Credentials:');
  console.log('   Admin: admin@lms.com / admin123');
  console.log('   Instructor: sarah@lms.com / instructor123');
  console.log('   Student: alice@example.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });