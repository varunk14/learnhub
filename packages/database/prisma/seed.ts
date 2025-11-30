import { PrismaClient, UserRole, CourseStatus, LessonType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ============================================
  // 1. CREATE CATEGORIES
  // ============================================
  console.log('Creating categories...');
  
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'web-development' },
      update: {},
      create: {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learn to build websites and web applications',
        icon: '🌐',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'mobile-development' },
      update: {},
      create: {
        name: 'Mobile Development',
        slug: 'mobile-development',
        description: 'Build iOS and Android applications',
        icon: '📱',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Learn data analysis and machine learning',
        icon: '📊',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'leadership' },
      update: {},
      create: {
        name: 'Leadership',
        slug: 'leadership',
        description: 'Develop leadership and management skills',
        icon: '👑',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // ============================================
  // 2. CREATE USERS
  // ============================================
  console.log('Creating users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnhub.com' },
    update: {},
    create: {
      email: 'admin@learnhub.com',
      passwordHash,
      name: 'Admin User',
      role: UserRole.ADMIN,
      isVerified: true,
      bio: 'Platform administrator',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@learnhub.com' },
    update: {},
    create: {
      email: 'instructor@learnhub.com',
      passwordHash,
      name: 'John Instructor',
      role: UserRole.INSTRUCTOR,
      isVerified: true,
      bio: 'Senior Full Stack Developer with 10+ years of experience',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@learnhub.com' },
    update: {},
    create: {
      email: 'student@learnhub.com',
      passwordHash,
      name: 'Jane Student',
      role: UserRole.STUDENT,
      isVerified: true,
      bio: 'Aspiring developer',
    },
  });

  console.log('✅ Created users: admin, instructor, student');

  // ============================================
  // 3. CREATE SAMPLE COURSE
  // ============================================
  console.log('Creating sample course...');

  const course = await prisma.course.upsert({
    where: { slug: 'complete-web-development-bootcamp' },
    update: {},
    create: {
      title: 'Complete Web Development Bootcamp',
      slug: 'complete-web-development-bootcamp',
      description: `
        Learn web development from scratch! This comprehensive course covers everything 
        you need to become a full-stack web developer.
        
        What you'll learn:
        - HTML5 & CSS3 fundamentals
        - JavaScript ES6+
        - React.js with hooks
        - Node.js & Express
        - PostgreSQL & MongoDB
        - Deployment & DevOps basics
        
        Perfect for beginners with no prior coding experience!
      `,
      shortDesc: 'Become a full-stack web developer from scratch',
      price: 4999,
      discountPrice: 2999,
      status: CourseStatus.PUBLISHED,
      level: 'Beginner',
      language: 'English',
      instructorId: instructor.id,
      categoryId: categories[0].id, // Web Development
      publishedAt: new Date(),
    },
  });

  console.log(`✅ Created course: ${course.title}`);

  // ============================================
  // 4. CREATE SECTIONS & LESSONS
  // ============================================
  console.log('Creating sections and lessons...');

  // Section 1: Introduction
  const section1 = await prisma.section.create({
    data: {
      title: 'Getting Started',
      description: 'Introduction to the course and setup',
      order: 1,
      courseId: course.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Welcome to the Course',
        description: 'Introduction and what you will learn',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video1.mp4',
        videoDuration: 300, // 5 minutes
        order: 1,
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
      {
        title: 'Setting Up Your Development Environment',
        description: 'Install VS Code, Node.js, and essential extensions',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video2.mp4',
        videoDuration: 900, // 15 minutes
        order: 2,
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
      {
        title: 'How to Get the Most Out of This Course',
        description: 'Tips for effective learning',
        type: LessonType.TEXT,
        content: `
          # How to Get the Most Out of This Course
          
          ## 1. Code Along
          Don't just watch - type the code yourself!
          
          ## 2. Take Notes
          Write down key concepts in your own words.
          
          ## 3. Practice Daily
          Consistency beats intensity. 30 minutes daily is better than 5 hours once a week.
          
          ## 4. Ask Questions
          Use the discussion forums. There are no stupid questions!
          
          ## 5. Build Projects
          Apply what you learn by building your own projects.
        `,
        order: 3,
        isPublished: true,
        sectionId: section1.id,
      },
    ],
  });

  // Section 2: HTML Basics
  const section2 = await prisma.section.create({
    data: {
      title: 'HTML Fundamentals',
      description: 'Learn the building blocks of web pages',
      order: 2,
      courseId: course.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'What is HTML?',
        description: 'Understanding the structure of web pages',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video3.mp4',
        videoDuration: 600,
        order: 1,
        isPublished: true,
        sectionId: section2.id,
      },
      {
        title: 'HTML Tags and Elements',
        description: 'Common HTML tags you need to know',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video4.mp4',
        videoDuration: 1200,
        order: 2,
        isPublished: true,
        sectionId: section2.id,
      },
      {
        title: 'HTML Quiz',
        description: 'Test your HTML knowledge',
        type: LessonType.QUIZ,
        order: 3,
        isPublished: true,
        sectionId: section2.id,
      },
    ],
  });

  // Section 3: CSS Basics
  const section3 = await prisma.section.create({
    data: {
      title: 'CSS Fundamentals',
      description: 'Style your web pages',
      order: 3,
      courseId: course.id,
    },
  });

  await prisma.lesson.createMany({
    data: [
      {
        title: 'Introduction to CSS',
        description: 'What is CSS and how it works',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video5.mp4',
        videoDuration: 600,
        order: 1,
        isPublished: true,
        sectionId: section3.id,
      },
      {
        title: 'CSS Selectors',
        description: 'Targeting HTML elements with CSS',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video6.mp4',
        videoDuration: 900,
        order: 2,
        isPublished: true,
        sectionId: section3.id,
      },
      {
        title: 'Flexbox Layout',
        description: 'Modern CSS layout with Flexbox',
        type: LessonType.VIDEO,
        videoUrl: 'https://example.com/video7.mp4',
        videoDuration: 1500,
        order: 3,
        isPublished: true,
        sectionId: section3.id,
      },
    ],
  });

  // Get lesson for quiz
  const quizLesson = await prisma.lesson.findFirst({
    where: { title: 'HTML Quiz' },
  });

  if (quizLesson) {
    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        lessonId: quizLesson.id,
        title: 'HTML Fundamentals Quiz',
        description: 'Test your understanding of HTML basics',
        passingScore: 70,
        timeLimit: 10,
      },
    });

    // Create quiz questions
    await prisma.quizQuestion.createMany({
      data: [
        {
          quizId: quiz.id,
          question: 'What does HTML stand for?',
          type: 'multiple_choice',
          options: JSON.stringify([
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language',
          ]),
          correctAnswer: 'Hyper Text Markup Language',
          explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.',
          points: 1,
          order: 1,
        },
        {
          quizId: quiz.id,
          question: 'Which tag is used for the largest heading?',
          type: 'multiple_choice',
          options: JSON.stringify(['<h6>', '<h1>', '<heading>', '<head>']),
          correctAnswer: '<h1>',
          explanation: '<h1> defines the most important heading. <h6> is the smallest.',
          points: 1,
          order: 2,
        },
        {
          quizId: quiz.id,
          question: 'HTML tags are case-sensitive.',
          type: 'true_false',
          options: JSON.stringify(['True', 'False']),
          correctAnswer: 'False',
          explanation: 'HTML tags are not case-sensitive, but lowercase is recommended.',
          points: 1,
          order: 3,
        },
      ],
    });

    console.log('✅ Created quiz with questions');
  }

  // Update course stats
  const lessonCount = await prisma.lesson.count({
    where: { section: { courseId: course.id } },
  });

  const totalDuration = await prisma.lesson.aggregate({
    where: { section: { courseId: course.id } },
    _sum: { videoDuration: true },
  });

  await prisma.course.update({
    where: { id: course.id },
    data: {
      totalLessons: lessonCount,
      duration: totalDuration._sum.videoDuration || 0,
    },
  });

  console.log(`✅ Created ${lessonCount} lessons across 3 sections`);

  // ============================================
  // 5. CREATE ENROLLMENT
  // ============================================
  console.log('Creating enrollment...');

  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: student.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      courseId: course.id,
      progress: 33,
    },
  });

  console.log('✅ Enrolled student in course');

  // ============================================
  // 6. CREATE SAMPLE REVIEW
  // ============================================
  console.log('Creating review...');

  await prisma.review.upsert({
    where: {
      courseId_userId: {
        courseId: course.id,
        userId: student.id,
      },
    },
    update: {},
    create: {
      courseId: course.id,
      userId: student.id,
      rating: 5,
      comment: 'Excellent course! The instructor explains everything clearly. Highly recommended for beginners!',
    },
  });

  console.log('✅ Created sample review');

  // ============================================
  // DONE
  // ============================================
  console.log('\n🎉 Seed completed successfully!\n');
  console.log('Test credentials:');
  console.log('  Admin:      admin@learnhub.com / password123');
  console.log('  Instructor: instructor@learnhub.com / password123');
  console.log('  Student:    student@learnhub.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });