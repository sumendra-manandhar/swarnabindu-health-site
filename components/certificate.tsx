"use client";

import { QRCodeSVG } from "qrcode.react";

interface PatientData {
  registrationNumber: string;
  name: string;
  age: string;
  gender: string;
  guardian: string;
  mobile: string;
}

interface AyurvedicCertificateProps {
  patientData: PatientData;
}

export function AyurvedicCertificate({
  patientData,
}: AyurvedicCertificateProps) {
  // Generate QR code data with patient information
  const qrData = JSON.stringify({
    registration: patientData.registrationNumber,
    name: patientData.name,
    age: patientData.age,
    gender: patientData.gender,
    guardian: patientData.guardian,
    mobile: patientData.mobile,
    date: new Date().toISOString().split("T")[0],
  });

  return (
    <div className="bg-white w-full max-w-4xl mx-auto shadow-lg print:shadow-none print:max-w-none">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white p-6 relative">
        <div className="flex items-center justify-between">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <img
              src="/images/nepal-emblem.png"
              alt="Nepal Emblem"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold mb-1">
              प्रादेशिक आयुर्वेद चिकित्सालय
            </h1>
            <h2 className="text-lg mb-1">स्वर्णबिन्दु प्राशन कार्यक्रम</h2>
            <p className="text-sm">बीजौरी, दाङ</p>
          </div>

          <div className="bg-white p-2 rounded">
            <QRCodeSVG
              value={qrData}
              size={80}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-200 p-8">
        {/* Ayurvedic Elements Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-green-600 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full"></div>
              </div>
              <h3 className="font-bold text-red-600">शंखपुष्पी</h3>
              <p className="text-sm">स्मरण निद्रा लागी सहयोगी</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-yellow-600 flex items-center justify-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full"></div>
              </div>
              <h3 className="font-bold text-blue-600">मह</h3>
              <p className="text-sm">बच्चाको सम्पूर्ण विकासमा मद्दत गर्छ</p>
            </div>
          </div>

          {/* Center Column */}
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 rounded-lg overflow-hidden bg-pink-200">
              <img
                src="/happy-baby-face.jpg"
                alt="Baby"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-yellow-400 text-blue-800 px-4 py-2 rounded-full inline-block">
              <h3 className="font-bold">सुवर्ण भस्म</h3>
              <p className="text-sm">
                शारीरिक बल र रोग प्रतिरोधात्मक क्षमता बढाउँछ
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-green-700 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-600 rounded-full"></div>
              </div>
              <h3 className="font-bold text-green-700">वचा</h3>
              <p className="text-sm">पाचनक्रियामा मद्दत गर्छ</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-green-500 flex items-center justify-center">
                <div className="w-16 h-16 bg-green-400 rounded-full"></div>
              </div>
              <h3 className="font-bold text-green-700">ब्राह्मी</h3>
              <p className="text-sm">
                एकाग्रता तथा बौद्धिक क्षमता बढाउँछ मद्दत गर्छ
              </p>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="bg-blue-700 text-white text-center py-3 rounded-full mb-4">
          <p className="text-lg font-bold">
            स्वर्णबिन्दुमा बच्चाहरूको सम्पूर्ण स्वास्थ्य विकासलाई वृद्धि गर्ने
            जडीबुटीहरू समावेश छ।
          </p>
        </div>

        <div className="bg-blue-800 text-white text-center py-3 rounded-full mb-8">
          <p className="text-xl font-bold">
            जन्म देखि ५ वर्ष सम्मका बालबालिकाहरूलाई खुवाउने व्यवस्था छ।
          </p>
        </div>

        {/* Patient Information Form */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="grid grid-cols-2 gap-6 text-lg">
            <div className="flex items-center">
              <span className="font-bold mr-4">मूल दर्ता नं:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.registrationNumber}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-4">लिङ्ग:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.gender}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-4">नाम:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.name}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-4">उमेर:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.age}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-4">पालिका:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.guardian}
              </span>
            </div>
            <div className="flex items-center">
              <span className="font-bold mr-4">वडा:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1"></span>
            </div>
            <div className="flex items-center col-span-2">
              <span className="font-bold mr-4">मोबाइल नं:</span>
              <span className="border-b-2 border-dotted border-gray-400 flex-1 pb-1">
                {patientData.mobile}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="text-center text-blue-800 mb-4">
          <p className="text-lg font-bold mb-2">
            यो कार्ड हरेक पटक आफ्ना बालबालिकाहरूलाई स्वर्णप्राशन सेवन गराउन
            आउँदा
          </p>
          <p className="text-lg font-bold mb-4">
            अनिवार्य रूपमा लिएर आउनुपर्छ।
          </p>
          <p className="text-base font-bold text-gray-700">
            (यो कार्ड सुरक्षित राख्नुहोस्।)
          </p>
        </div>

        {/* Contact Information */}
        <div className="flex justify-between items-center text-blue-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded"></div>
            <span className="font-bold">
              Provincial Ayurveda Hospital Bijauri
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            <span className="font-bold">०८२-४११०४०</span>
          </div>
        </div>
      </div>
    </div>
  );
}
