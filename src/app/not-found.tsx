import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-black text-[#6366f1]/20 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Page not found
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mb-8">
          This page does not exist or you do not have access to it.
        </p>
        <Link
          href="/users"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold text-sm transition-colors shadow-md"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
