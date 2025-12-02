"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { apiClient } from "@/lib/api";
import { Card, CardContent, Button } from "@/components/ui";
import { formatDuration } from "@/lib/utils";

interface Enrollment {
  id: string;
  progress: number;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    duration: number;
    totalLessons: number;
    instructor: {
      name: string;
    };
  };
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isInstructor = user?.role === "INSTRUCTOR" || user?.role === "ADMIN";

  useEffect(() => {
    if (isInstructor) {
      setIsLoading(false);
      return;
    }

    // Fetch student enrollments
    apiClient
      .get<{ success: boolean; data: Enrollment[] }>("/enrollments/my-courses")
      .then((res) => {
        if (res.success) {
          setEnrollments(res.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [isInstructor]);

  // Instructor Dashboard
  if (isInstructor) {
    return <InstructorDashboard />;
  }

  // Student Dashboard
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Learning</h1>
        <p className="text-gray-600">Track your progress and continue learning</p>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <CardContent>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900">No courses yet</h3>
            <p className="mt-2 text-gray-600">
              Start your learning journey by enrolling in a course
            </p>
            <Link href="/courses">
              <Button className="mt-4">Browse Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/courses/${enrollment.course.slug}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 relative">
                  {enrollment.course.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                </div>

                <CardContent>
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {enrollment.course.instructor.name}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full transition-all"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-3 flex items-center text-sm text-gray-500 space-x-3">
                    <span>{enrollment.course.totalLessons} lessons</span>
                    <span>•</span>
                    <span>{formatDuration(enrollment.course.duration)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Instructor Dashboard Component
function InstructorDashboard() {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch instructor courses
    apiClient
      .get<{ success: boolean; data: any[] }>("/courses/my-courses")
      .then((res) => {
        if (res.success) {
          setCourses(res.data);
          
          // Calculate stats
          const totalStudents = res.data.reduce(
            (acc: number, course: any) => acc + (course._count?.enrollments || 0),
            0
          );
          setStats({
            totalCourses: res.data.length,
            totalStudents,
            totalRevenue: 0, // TODO: Calculate from payments
          });
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
        <p className="text-gray-600">Manage your courses and track performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalCourses}</div>
            <div className="text-sm text-gray-600">Courses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-primary-600">{stats.totalStudents}</div>
            <div className="text-sm text-gray-600">Students</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <div className="text-3xl font-bold text-primary-600">₹{stats.totalRevenue}</div>
            <div className="text-sm text-gray-600">Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Courses */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Courses</h2>
        <Button size="sm">+ Create Course</Button>
      </div>

      {isLoading ? (
        <Card className="animate-pulse">
          <CardContent>
            <div className="h-20 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">You haven&apos;t created any courses yet</p>
            <Button className="mt-4">Create Your First Course</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">��</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        course.status === "PUBLISHED" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {course.status}
                      </span>
                      <span>{course._count?.enrollments || 0} students</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
