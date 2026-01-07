export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Employee Check-In System</h1>
        <p className="text-lg text-gray-600 mb-8">
          Multi-modal employee check-in system with face recognition, fingerprint, RFID, and manual check-in.
        </p>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-700">
            The system is running. API is available at{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
        </div>
      </div>
    </main>
  )
}

