export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">
            🎓 LearnHub
          </h1>
          <p className="text-xl text-primary-100 mb-8">
            Unlock Your Potential with Online Learning
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/courses" className="btn-primary">
              Explore Courses
            </a>
            <a href="/auth/login" className="btn bg-white text-primary-700 hover:bg-gray-100">
              Sign In
            </a>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-2">📚</div>
            <h3 className="font-semibold mb-2">500+ Courses</h3>
            <p className="text-sm text-primary-100">Learn from expert instructors</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">10K+ Students</h3>
            <p className="text-sm text-primary-100">Join our learning community</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold mb-2">Certificates</h3>
            <p className="text-sm text-primary-100">Earn recognized credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
