export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Matchbook</h1>
        <p className="text-gray-400">Loading your escrow trading experience...</p>
      </div>
    </div>
  );
}
