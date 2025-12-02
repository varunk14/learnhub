import { Router } from "express";
import { prisma } from "@learnhub/database";
import { authenticate } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";
import { NotFoundError, ConflictError } from "../types";

const router = Router();

// Enroll in a course
router.post(
  "/:courseId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user!.id;

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course || course.status !== "PUBLISHED") {
      throw new NotFoundError("Course not found");
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existingEnrollment) {
      throw new ConflictError("Already enrolled in this course");
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: "ACTIVE",
        progress: 0,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully enrolled",
      data: enrollment,
    });
  })
);

// Get my enrollments
router.get(
  "/my-courses",
  authenticate,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: {
              select: { id: true, name: true, avatar: true },
            },
            category: {
              select: { id: true, name: true, slug: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    res.json({
      success: true,
      data: enrollments,
    });
  })
);

// Get single enrollment with progress
router.get(
  "/:courseId",
  authenticate,
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user!.id;

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
      include: {
        course: {
          include: {
            sections: {
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundError("Enrollment not found");
    }

    // Get lesson progress
    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        userId,
        lesson: {
          section: {
            courseId,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...enrollment,
        lessonProgress,
      },
    });
  })
);

export default router;
