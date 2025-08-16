export default function ScreeningLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-700">स्क्रिनिङ पेज लोड गर्दै... | Loading Screening Page...</h2>
            <p className="text-gray-500">कृपया प्रतीक्षा गर्नुहोस् | Please wait</p>
          </div>
        </div>
      </div>
    </div>
  )
}
