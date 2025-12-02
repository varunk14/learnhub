import Link from "next/link";
import { Course } from "@/types";
import { Card } from "@/components/ui";
import { formatPrice, formatDuration } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const hasDiscount = course.discountPrice && course.discountPrice < course.price;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-200 relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
              <span className="text-4xl">📚</span>
            </div>
          )}
          {course.level && (
            <span className="absolute top-2 left-2 px-2 py-1 bg-white/90 text-xs font-medium rounded">
              {course.level}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          {course.category && (
            <span className="text-xs text-primary-600 font-medium">
              {course.category.name}
            </span>
          )}

          {/* Title */}
          <h3 className="mt-1 font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h3>

          {/* Instructor */}
          <p className="mt-2 text-sm text-gray-500">
            {course.instructor.name}
          </p>

          {/* Stats */}
          <div className="mt-3 flex items-center text-sm text-gray-500 space-x-3">
            <span>{course.totalLessons} lessons</span>
            <span>•</span>
            <span>{formatDuration(course.duration)}</span>
          </div>

          {/* Price */}
          <div className="mt-3 flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(course.discountPrice!)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(course.price)}
                </span>
              </>
            ) : course.price === 0 ? (
              <span className="text-lg font-bold text-green-600">Free</span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(course.price)}
              </span>
            )}
          </div>

          {/* Enrollment count */}
          {course._count && course._count.enrollments > 0 && (
            <p className="mt-2 text-xs text-gray-400">
              {course._count.enrollments.toLocaleString()} students enrolled
            </p>
          )}
        </div>
      </Card>
    </Link>
  );
}
