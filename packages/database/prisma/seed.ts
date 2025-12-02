import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.lessonProgress.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.section.deleteMany();
  await prisma.review.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create categories
  const webDev = await prisma.category.create({
    data: { name: "Web Development", slug: "web-development" },
  });

  const mobileDev = await prisma.category.create({
    data: { name: "Mobile Development", slug: "mobile-development" },
  });

  const dataScience = await prisma.category.create({
    data: { name: "Data Science", slug: "data-science" },
  });

  console.log("✅ Categories created");

  // Create users
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@learnhub.com",
      passwordHash: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      isVerified: true,
    },
  });

  const instructor = await prisma.user.create({
    data: {
      email: "instructor@learnhub.com",
      passwordHash: hashedPassword,
      name: "John Instructor",
      role: "INSTRUCTOR",
      isVerified: true,
      bio: "Senior Web Developer with 10+ years of experience",
    },
  });

  const student = await prisma.user.create({
    data: {
      email: "student@learnhub.com",
      passwordHash: hashedPassword,
      name: "Jane Student",
      role: "STUDENT",
      isVerified: true,
    },
  });

  console.log("✅ Users created");

  // Create courses - NOTE: status must be PUBLISHED to show up!
  const course1 = await prisma.course.create({
    data: {
      title: "Complete Web Development Bootcamp",
      slug: "complete-web-development-bootcamp",
      description:
        "Learn web development from scratch. This comprehensive course covers HTML, CSS, JavaScript, React, Node.js, and more. Perfect for beginners who want to become full-stack developers.",
      shortDesc: "Master full-stack web development from zero to hero",
      price: 2999,
      discountPrice: 499,
      status: "PUBLISHED",  // IMPORTANT: Must be PUBLISHED
      level: "Beginner",
      language: "English",
      instructorId: instructor.id,
      categoryId: webDev.id,
      duration: 36000,
      totalLessons: 9,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: "React Native Mobile App Development",
      slug: "react-native-mobile-app-development",
      description:
        "Build cross-platform mobile apps with React Native. Learn to create iOS and Android apps using JavaScript and React.",
      shortDesc: "Create mobile apps for iOS and Android",
      price: 1999,
      discountPrice: 399,
      status: "PUBLISHED",
      level: "Intermediate",
      language: "English",
      instructorId: instructor.id,
      categoryId: mobileDev.id,
      duration: 28800,
      totalLessons: 6,
    },
  });

  const course3 = await prisma.course.create({
    data: {
      title: "Python for Data Science",
      slug: "python-for-data-science",
      description:
        "Master Python for data analysis, visualization, and machine learning. Perfect for aspiring data scientists.",
      shortDesc: "Learn Python for data science and ML",
      price: 0,
      status: "PUBLISHED",
      level: "Beginner",
      language: "English",
      instructorId: instructor.id,
      categoryId: dataScience.id,
      duration: 21600,
      totalLessons: 5,
    },
  });

  console.log("✅ Courses created");

  // Create sections and lessons for course1
  const section1 = await prisma.section.create({
    data: {
      title: "Getting Started",
      order: 1,
      courseId: course1.id,
    },
  });

  const section2 = await prisma.section.create({
    data: {
      title: "HTML Fundamentals",
      order: 2,
      courseId: course1.id,
    },
  });

  const section3 = await prisma.section.create({
    data: {
      title: "CSS Styling",
      order: 3,
      courseId: course1.id,
    },
  });

  // Lessons for section 1
  await prisma.lesson.createMany({
    data: [
      {
        title: "Welcome to the Course",
        type: "VIDEO",
        videoDuration: 300,
        order: 1,
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
      {
        title: "Setting Up Your Development Environment",
        type: "VIDEO",
        videoDuration: 900,
        order: 2,
        isFree: true,
        isPublished: true,
        sectionId: section1.id,
      },
      {
        title: "How the Web Works",
        type: "TEXT",
        content: "Understanding HTTP, servers, and browsers...",
        order: 3,
        isFree: false,
        isPublished: true,
        sectionId: section1.id,
      },
    ],
  });

  // Lessons for section 2
  await prisma.lesson.createMany({
    data: [
      {
        title: "HTML Document Structure",
        type: "VIDEO",
        videoDuration: 1200,
        order: 1,
        isFree: false,
        isPublished: true,
        sectionId: section2.id,
      },
      {
        title: "HTML Elements and Tags",
        type: "VIDEO",
        videoDuration: 1500,
        order: 2,
        isFree: false,
        isPublished: true,
        sectionId: section2.id,
      },
      {
        title: "HTML Quiz",
        type: "QUIZ",
        order: 3,
        isFree: false,
        isPublished: true,
        sectionId: section2.id,
      },
    ],
  });

  // Lessons for section 3
  await prisma.lesson.createMany({
    data: [
      {
        title: "Introduction to CSS",
        type: "VIDEO",
        videoDuration: 1100,
        order: 1,
        isFree: false,
        isPublished: true,
        sectionId: section3.id,
      },
      {
        title: "CSS Selectors",
        type: "VIDEO",
        videoDuration: 1300,
        order: 2,
        isFree: false,
        isPublished: true,
        sectionId: section3.id,
      },
      {
        title: "CSS Project",
        type: "ASSIGNMENT",
        content: "Create a responsive landing page...",
        order: 3,
        isFree: false,
        isPublished: true,
        sectionId: section3.id,
      },
    ],
  });

  console.log("✅ Sections and Lessons created");

  // Create enrollment
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      status: "ACTIVE",
      progress: 33,
    },
  });

  // Create review
  await prisma.review.create({
    data: {
      userId: student.id,
      courseId: course1.id,
      rating: 5,
      comment: "Excellent course! Very well structured and easy to follow.",
      isVisible: true,
    },
  });

  console.log("✅ Enrollment and Review created");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
