import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center animate-fadeIn">
          AttendHub
        </h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 text-center animate-fadeIn">
          Modern employee attendance management with face recognition, fingerprint, RFID, and manual check-in.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 mb-6 animate-scaleIn">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-sm md:text-base text-gray-700 mb-6">
            The system is running. API is available at{' '}
            <code className="bg-gray-100 px-2 py-1 rounded text-xs md:text-sm">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
            <Link
              href="/checkin"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-smooth hover-lift text-base md:text-lg font-semibold text-center focus-ring"
            >
              Go to Check-In →
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-smooth hover-lift text-base md:text-lg font-semibold text-center focus-ring"
            >
              View Dashboard →
            </Link>
            <Link
              href="/admin"
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-smooth hover-lift text-base md:text-lg font-semibold text-center focus-ring"
            >
              Admin Panel →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover-lift transition-smooth animate-scaleIn">
            <div className="text-3xl md:text-4xl mb-3">👤</div>
            <h3 className="font-semibold mb-2 text-sm md:text-base">Face Recognition</h3>
            <p className="text-xs md:text-sm text-gray-600">Check in using your face</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover-lift transition-smooth animate-scaleIn" style={{ animationDelay: '0.1s' }}>
            <div className="text-3xl md:text-4xl mb-3">📱</div>
            <h3 className="font-semibold mb-2 text-sm md:text-base">RFID/NFC</h3>
            <p className="text-xs md:text-sm text-gray-600">Tap your card to check in</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 hover-lift transition-smooth animate-scaleIn" style={{ animationDelay: '0.2s' }}>
            <div className="text-3xl md:text-4xl mb-3">🔍</div>
            <h3 className="font-semibold mb-2 text-sm md:text-base">Manual Search</h3>
            <p className="text-xs md:text-sm text-gray-600">Search by name or ID</p>
          </div>
        </div>
      </div>
    </main>
  )
}

