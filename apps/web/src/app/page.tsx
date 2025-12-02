import Link from "next/link";
import { Button } from "@/components/ui";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Unlock Your Potential with{" "}
              <span className="text-primary-200">Online Learning</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-100">
              Discover thousands of courses taught by expert instructors.
              Learn programming, design, business, and more at your own pace.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/courses">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                  Explore Courses →
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Start Learning Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "10K+", label: "Students" },
              { value: "500+", label: "Courses" },
              { value: "100+", label: "Instructors" },
              { value: "95%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-primary-600">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Learn with LearnHub?</h2>
            <p className="mt-4 text-lg text-gray-600">
              We provide the best learning experience with features designed to help you succeed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "📚", title: "Expert-Led Courses", desc: "Learn from industry professionals" },
              { icon: "👥", title: "Active Community", desc: "Join thousands of learners" },
              { icon: "��", title: "Certificates", desc: "Earn recognized credentials" },
              { icon: "▶️", title: "Learn at Your Pace", desc: "Access anytime, anywhere" },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                <p className="mt-2 text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Start Learning?</h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of learners advancing their careers with LearnHub.
          </p>
          <div className="mt-8">
            <Link href="/auth/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-gray-100">
                Get Started for Free →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
