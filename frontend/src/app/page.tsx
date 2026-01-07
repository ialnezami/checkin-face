import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center">Employee Check-In System</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Multi-modal employee check-in system with face recognition, fingerprint, RFID, and manual check-in.
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-700 mb-6">
            The system is running. API is available at{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
          
          <div className="flex justify-center">
            <Link
              href="/checkin"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-semibold"
            >
              Go to Check-In →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Face Recognition</h3>
            <p className="text-sm text-gray-600">Check in using your face</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">RFID/NFC</h3>
            <p className="text-sm text-gray-600">Tap your card to check in</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-2">Manual Search</h3>
            <p className="text-sm text-gray-600">Search by name or ID</p>
          </div>
        </div>
      </div>
    </main>
  )
}

