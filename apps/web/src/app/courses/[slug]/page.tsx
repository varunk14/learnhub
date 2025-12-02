"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Course } from "@/types";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button, Card, CardContent } from "@/components/ui";
import { formatPrice, formatDuration, getInitials } from "@/lib/utils";

interface Section {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoDuration: number;
  isFree: boolean;
  order: number;
}

interface CourseDetail extends Course {
  sections: Section[];
  _count: {
    enrollments: number;
    reviews: number;
  };
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const slug = params.slug as string;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiClient.get<{ success: boolean; data: CourseDetail }>(`/courses/${slug}`);
        setCourse(res.data);
        if (res.data.sections.length > 0) {
          setExpandedSections(new Set([res.data.sections[0].id]));
        }

        // Check if already enrolled
        if (isAuthenticated) {
          try {
            await apiClient.get(`/enrollments/${res.data.id}`);
            setIsEnrolled(true);
          } catch {
            setIsEnrolled(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Course not found");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [slug, isAuthenticated]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!course) return;

    setIsEnrolling(true);
    try {
      await apiClient.post(`/enrollments/${course.id}`);
      setIsEnrolled(true);
      router.push("/dashboard");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Enrollment failed");
    } finally {
      setIsEnrolling(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO": return "▶️";
      case "TEXT": return "📄";
      case "QUIZ": return "❓";
      case "ASSIGNMENT": return "📝";
      default: return "📚";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <Link href="/courses">
            <Button className="mt-4">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount = course.discountPrice && course.discountPrice < course.price;
  const totalLessons = course.sections.reduce((acc, s) => acc + s.lessons.length, 0);
  const totalDuration = course.sections.reduce(
    (acc, s) => acc + s.lessons.reduce((a, l) => a + (l.videoDuration || 0), 0),
    0
  );

  const isOwnCourse = user?.id === course.instructor.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
                <Link href="/courses" className="hover:text-white">Courses</Link>
                <span>/</span>
                {course.category && (
                  <>
                    <span>{course.category.name}</span>
                    <span>/</span>
                  </>
                )}
                <span className="text-gray-300">{course.title}</span>
              </nav>

              <h1 className="text-3xl md:text-4xl font-bold">{course.title}</h1>
              <p className="mt-4 text-lg text-gray-300">{course.description}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                {course.level && (
                  <span className="px-3 py-1 bg-primary-600 rounded-full">{course.level}</span>
                )}
                <span className="flex items-center">
                  <span className="mr-1">👥</span>
                  {course._count.enrollments.toLocaleString()} students
                </span>
                <span className="flex items-center">
                  <span className="mr-1">📚</span>
                  {totalLessons} lessons
                </span>
                <span className="flex items-center">
                  <span className="mr-1">⏱️</span>
                  {formatDuration(totalDuration)}
                </span>
              </div>

              <div className="mt-6 flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {getInitials(course.instructor.name)}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="font-medium">{course.instructor.name}</p>
                </div>
              </div>
            </div>

            {/* Price Card */}
            <div className="hidden lg:block">
              <Card className="sticky top-24">
                <div className="aspect-video bg-gray-200">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                      <span className="text-6xl">📚</span>
                    </div>
                  )}
                </div>

                <CardContent>
                  <div className="mb-4">
                    {hasDiscount ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-3xl font-bold text-gray-900">{formatPrice(course.discountPrice!)}</span>
                        <span className="text-lg text-gray-400 line-through">{formatPrice(course.price)}</span>
                      </div>
                    ) : course.price === 0 ? (
                      <span className="text-3xl font-bold text-green-600">Free</span>
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
                    )}
                  </div>

                  {isOwnCourse ? (
                    <Button className="w-full" size="lg" variant="outline">
                      Edit Course
                    </Button>
                  ) : isEnrolled ? (
                    <Link href="/dashboard">
                      <Button className="w-full" size="lg">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleEnroll}
                      isLoading={isEnrolling}
                    >
                      {course.price === 0 ? "Enroll for Free" : "Enroll Now"}
                    </Button>
                  )}

                  <ul className="mt-6 space-y-3 text-sm text-gray-600">
                    <li className="flex items-center"><span className="mr-2">✓</span>Full lifetime access</li>
                    <li className="flex items-center"><span className="mr-2">✓</span>Access on mobile and desktop</li>
                    <li className="flex items-center"><span className="mr-2">✓</span>Certificate of completion</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:w-2/3">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Course Content</h2>
          <div className="text-sm text-gray-500 mb-4">
            {course.sections.length} sections • {totalLessons} lessons • {formatDuration(totalDuration)} total
          </div>

          <div className="space-y-3">
            {course.sections.map((section) => (
              <Card key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{expandedSections.has(section.id) ? "▼" : "▶"}</span>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{section.lessons.length} lessons</span>
                </button>

                {expandedSections.has(section.id) && (
                  <div className="border-t">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id} className="px-4 py-3 flex items-center justify-between border-b last:border-b-0 hover:bg-gray-50">
                        <div className="flex items-center">
                          <span className="mr-3">{getLessonIcon(lesson.type)}</span>
                          <span className="text-sm">{lesson.title}</span>
                          {lesson.isFree && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">Preview</span>
                          )}
                        </div>
                        {lesson.videoDuration > 0 && (
                          <span className="text-sm text-gray-500">{formatDuration(lesson.videoDuration)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Price Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            {hasDiscount ? (
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold">{formatPrice(course.discountPrice!)}</span>
                <span className="text-sm text-gray-400 line-through">{formatPrice(course.price)}</span>
              </div>
            ) : course.price === 0 ? (
              <span className="text-xl font-bold text-green-600">Free</span>
            ) : (
              <span className="text-xl font-bold">{formatPrice(course.price)}</span>
            )}
          </div>
          {isEnrolled ? (
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          ) : (
            <Button onClick={handleEnroll} isLoading={isEnrolling}>
              {course.price === 0 ? "Enroll Free" : "Enroll Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
