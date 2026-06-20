// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - be careful in production)
  console.log('🧹 Clearing existing data...');
  await prisma.assignment.deleteMany({});
  await prisma.userCourse.deleteMany({});
  await prisma.module.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👤 Creating users...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lms.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=100'
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
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=8b5cf6&color=fff&size=100'
    }
  });

  const instructor2 = await prisma.user.create({
    data: {
      name: 'Prof. Michael Chen',
      email: 'michael@lms.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=06b6d4&color=fff&size=100'
    }
  });

  const instructor3 = await prisma.user.create({
    data: {
      name: 'Dr. Emily Rodriguez',
      email: 'emily@lms.com',
      password: instructorPassword,
      role: 'INSTRUCTOR',
      avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=ec4899&color=fff&size=100'
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
        avatar: 'https://ui-avatars.com/api/?name=Alice+Smith&background=3b82f6&color=fff&size=100'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Bob+Johnson&background=10b981&color=fff&size=100'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carol Davis',
        email: 'carol@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Carol+Davis&background=f59e0b&color=fff&size=100'
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=David+Wilson&background=ef4444&color=fff&size=100'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emma Thompson',
        email: 'emma@example.com',
        password: studentPassword,
        role: 'STUDENT',
        avatar: 'https://ui-avatars.com/api/?name=Emma+Thompson&background=8b5cf6&color=fff&size=100'
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

  // Course 6: Python Programming
  const course6 = await prisma.course.create({
    data: {
      title: 'Python Programming Masterclass',
      description: 'Comprehensive Python programming course from beginner to advanced. Includes web development with Django and Flask.',
      instructor: instructor3.name,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=500&h=300&fit=crop',
      modules: {
        create: [
          {
            title: 'Python Basics',
            content: 'Learn Python syntax, variables, data types, and control flow.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_19'
          },
          {
            title: 'Object-Oriented Python',
            content: 'Master OOP concepts in Python including classes, inheritance, and polymorphism.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_20'
          },
          {
            title: 'Web Development with Django',
            content: 'Build full-stack web applications using Django framework.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_21'
          }
        ]
      }
    }
  });

  // Course 7: Database Management
  const course7 = await prisma.course.create({
    data: {
      title: 'Database Management Systems',
      description: 'Learn database design, SQL, NoSQL, and database administration.',
      instructor: instructor1.name,
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&h=300&fit=crop',
      modules: {
        create: [
          {
            title: 'SQL Fundamentals',
            content: 'Master SQL queries including SELECT, JOIN, GROUP BY, and subqueries.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_22'
          },
          {
            title: 'Database Design',
            content: 'Learn normalization, ER diagrams, and database schema design.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_23'
          },
          {
            title: 'NoSQL Databases',
            content: 'Work with MongoDB, Cassandra, and Redis. Understand when to use NoSQL.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_24'
          }
        ]
      }
    }
  });

  // Course 8: DevOps Engineering
  const course8 = await prisma.course.create({
    data: {
      title: 'DevOps Engineering',
      description: 'Learn CI/CD, containerization with Docker, orchestration with Kubernetes, and infrastructure as code.',
      instructor: instructor2.name,
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=500&h=300&fit=crop',
      modules: {
        create: [
          {
            title: 'Docker & Containerization',
            content: 'Master Docker including images, containers, docker-compose, and best practices.',
            order: 1,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_25'
          },
          {
            title: 'Kubernetes Orchestration',
            content: 'Deploy and manage containerized applications using Kubernetes.',
            order: 2,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_26'
          },
          {
            title: 'CI/CD Pipelines',
            content: 'Build CI/CD pipelines with Jenkins, GitHub Actions, and GitLab CI.',
            order: 3,
            videoUrl: 'https://www.youtube.com/embed/VIDEO_ID_27'
          }
        ]
      }
    }
  });

  console.log('🎓 Enrolling students in courses...');

  // Enroll students in courses
  const enrollments = [];

  // Alice enrolls in Web Dev, Data Science, UI/UX
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[0].id,
        courseId: course1.id,
        progress: 45,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[0].id,
        courseId: course2.id,
        progress: 20,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[0].id,
        courseId: course3.id,
        progress: 0,
        completed: false
      }
    })
  );

  // Bob enrolls in Web Dev, Python, Mobile
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[1].id,
        courseId: course1.id,
        progress: 80,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[1].id,
        courseId: course6.id,
        progress: 35,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[1].id,
        courseId: course5.id,
        progress: 10,
        completed: false
      }
    })
  );

  // Carol enrolls in UI/UX, Python, Cloud
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[2].id,
        courseId: course3.id,
        progress: 60,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[2].id,
        courseId: course6.id,
        progress: 25,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[2].id,
        courseId: course4.id,
        progress: 0,
        completed: false
      }
    })
  );

  // David enrolls in Database, DevOps, Web Dev
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[3].id,
        courseId: course7.id,
        progress: 70,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[3].id,
        courseId: course8.id,
        progress: 15,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[3].id,
        courseId: course1.id,
        progress: 95,
        completed: false
      }
    })
  );

  // Emma enrolls in Data Science, Python, Cloud
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[4].id,
        courseId: course2.id,
        progress: 50,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[4].id,
        courseId: course6.id,
        progress: 40,
        completed: false
      }
    })
  );
  enrollments.push(
    await prisma.userCourse.create({
      data: {
        userId: students[4].id,
        courseId: course4.id,
        progress: 5,
        completed: false
      }
    })
  );

  console.log('📝 Creating sample assignments...');

  // Create assignments for Course 1 (Web Development)
  await prisma.assignment.createMany({
    data: [
      {
        title: 'HTML/CSS Project',
        description: 'Build a personal portfolio website using HTML and CSS. Include responsive design and animations.',
        fileUrl: '/uploads/assignments/sample-html-project.pdf',
        fileSize: 2500000,
        mimeType: 'application/pdf',
        courseId: course1.id,
        userId: students[0].id,
        grade: 85,
        feedback: 'Great work! Good use of flexbox and animations. Consider adding more accessibility features.'
      },
      {
        title: 'React Todo App',
        description: 'Create a task management application using React with hooks and local storage.',
        fileUrl: '/uploads/assignments/sample-react-app.zip',
        fileSize: 4500000,
        mimeType: 'application/zip',
        courseId: course1.id,
        userId: students[1].id,
        grade: 92,
        feedback: 'Excellent implementation! Clean code and good state management.'
      },
      {
        title: 'Node.js REST API',
        description: 'Build a RESTful API with Express.js and MongoDB. Include authentication and validation.',
        fileUrl: '/uploads/assignments/sample-node-api.zip',
        fileSize: 3500000,
        mimeType: 'application/zip',
        courseId: course1.id,
        userId: students[3].id,
        grade: 88,
        feedback: 'Well-structured API. Good error handling and validation. Consider adding rate limiting.'
      }
    ]
  });

  // Create assignments for Course 2 (Data Science)
  await prisma.assignment.createMany({
    data: [
      {
        title: 'Data Analysis Project',
        description: 'Analyze a dataset of your choice using Pandas and create visualizations with Matplotlib.',
        fileUrl: '/uploads/assignments/sample-data-analysis.ipynb',
        fileSize: 5000000,
        mimeType: 'application/zip',
        courseId: course2.id,
        userId: students[0].id,
        grade: 78,
        feedback: 'Good analysis but could include more statistical insights and better visualizations.'
      },
      {
        title: 'Machine Learning Model',
        description: 'Build a machine learning model to predict housing prices using scikit-learn.',
        fileUrl: '/uploads/assignments/sample-ml-model.ipynb',
        fileSize: 6000000,
        mimeType: 'application/zip',
        courseId: course2.id,
        userId: students[4].id,
        grade: null,
        feedback: null
      }
    ]
  });

  // Create assignments for Course 3 (UI/UX)
  await prisma.assignment.createMany({
    data: [
      {
        title: 'Figma Design Project',
        description: 'Design a mobile app UI for a food delivery service in Figma. Include user flows and prototypes.',
        fileUrl: '/uploads/assignments/sample-figma-design.fig',
        fileSize: 8000000,
        mimeType: 'application/octet-stream',
        courseId: course3.id,
        userId: students[2].id,
        grade: 94,
        feedback: 'Outstanding design! Great use of typography and color. Excellent user flow.'
      }
    ]
  });

  console.log('🔔 Creating notifications...');

  // Create notifications for students
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
        userId: students[1].id,
        title: 'Assignment Graded',
        message: 'Your React Todo App has been graded. Score: 92%',
        type: 'grade',
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
        userId: students[3].id,
        title: 'Assignment Graded',
        message: 'Your Node.js REST API has been graded. Score: 88%',
        type: 'grade',
        isRead: false
      },
      {
        userId: students[0].id,
        title: 'New Course Available',
        message: 'Cloud Computing with AWS is now available for enrollment.',
        type: 'enrollment',
        isRead: false
      },
      {
        userId: students[4].id,
        title: 'Assignment Submitted',
        message: 'Your Machine Learning Model assignment has been submitted successfully.',
        type: 'assignment',
        isRead: false
      }
    ]
  });

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${await prisma.user.count()} users created`);
  console.log(`   - ${await prisma.course.count()} courses created`);
  console.log(`   - ${await prisma.module.count()} modules created`);
  console.log(`   - ${await prisma.userCourse.count()} enrollments created`);
  console.log(`   - ${await prisma.assignment.count()} assignments created`);
  console.log(`   - ${await prisma.notification.count()} notifications created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });