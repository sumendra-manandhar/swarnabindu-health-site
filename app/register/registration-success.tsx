"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Download,
  UserPlus,
  Home,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { OfflineStorage } from "@/lib/offline-storage";
import { ApiService } from "@/lib/api-service";
// import { DatabaseService } from "@/lib/supabase";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegistrationSuccessProps {
  registrationData: any;
  onNewRegistration: () => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export function RegistrationSuccess({
  registrationData,
  onNewRegistration,
}: RegistrationSuccessProps) {
  const [serialNumber, setSerialNumber] = useState("");
  const [isOnline, setIsOnline] = useState(true);
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  // useEffect(() => {
  //   setIsOnline(navigator.onLine);
  //   saveRegistration();
  // }, []);

  const hasSaved = useRef(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    if (!hasSaved.current) {
      saveRegistration();
      hasSaved.current = true;
    }
  }, []);

  // const saveRegistration = async () => {
  //   try {
  //     const registrationRecord = {
  //       ...registrationData,
  //       date: new Date().toISOString().split("T")[0],
  //       created_at: new Date().toISOString(),
  //       serial_no: generateSerialNumber(),
  //       age: calculateAge(registrationData.dateOfBirth),
  //     };

  //     setSerialNumber(registrationRecord.serial_no);

  //     if (isOnline) {
  //       try {
  //         const { data, error } = await DatabaseService.createRegistration(registrationRecord)
  //         if (!error) {
  //           console.log("Registration saved to database")
  //           return
  //         }
  //       } catch (error) {
  //         console.error("Error saving to database:", error)
  //       }
  //     }

  //     // Save to offline storage as fallback
  //     OfflineStorage.saveRegistration(registrationRecord);
  //     console.log("Registration saved offline");
  //   } catch (error) {
  //     console.error("Error saving registration:", error);
  //   }
  // };

  // const saveRegistration = async () => {
  //   try {
  //     const registrationRecord = {
  //       ...registrationData,
  //       date: new Date().toISOString().split("T")[0],
  //       created_at: new Date().toISOString(),
  //       serial_no: generateSerialNumber(),
  //       age: calculateAge(registrationData.dateOfBirth),
  //     };

  //     setSerialNumber(registrationRecord.serial_no);

  //     // Save offline as fallback
  //     OfflineStorage.saveRegistration(registrationRecord);
  //     console.log("Registration saved offline", registrationRecord);

  //     if (isOnline) {
  //       try {
  //         const response = await fetch(
  //           "https://health-service.gyanbazzar.com/registrations",
  //           {
  //             method: "POST",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify(registrationRecord),
  //           }
  //         );

  //         if (!response.ok) {
  //           console.error(
  //             "Failed to send registration to API:",
  //             response.statusText
  //           );
  //         } else {
  //           console.log("Registration sent to API successfully");
  //         }
  //       } catch (error) {
  //         console.error("Error sending registration to API:", error);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving registration:", error);
  //   }
  // };

  // const generateSerialNumber = () => {
  //   const today = new Date();
  //   const year = today.getFullYear().toString().slice(-2);
  //   const month = (today.getMonth() + 1).toString().padStart(2, "0");
  //   const day = today.getDate().toString().padStart(2, "0");
  //   const random = Math.floor(Math.random() * 10000)
  //     .toString()
  //     .padStart(4, "0");
  //   return `SB${year}${month}${day}${random}`;
  // };

  const saveRegistration = async () => {
    try {
      const registrationRecord = {
        ...registrationData,
        date: new Date().toISOString().split("T")[0],
        created_at: new Date().toISOString(),
        serial_no: generateSerialNumber(),
        age: calculateAge(registrationData.dateOfBirth),
      };

      setSerialNumber(registrationRecord.serial_no);

      if (isOnline) {
        const { data, error } = await ApiService.createRegistration(
          registrationRecord
        );
        if (!error) {
          console.log("✅ Registration saved to API");
          return;
        }
      }

      // Save to offline storage as fallback
      OfflineStorage.saveRegistration(registrationRecord);
      console.log("⚡ Registration saved offline");
    } catch (error) {
      console.error("Error saving registration:", error);
    }
  };

  const generateSerialNumber = () => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `SB${year}${month}${day}${random}`;
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    if (ageInMonths < 12) {
      return `${ageInMonths} महिना`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      return months > 0 ? `${years} वर्ष ${months} महिना` : `${years} वर्ष`;
    }
  };

  // const calculateAge = (birthDate: string) => {
  //   const birth = new Date(birthDate);
  //   const today = new Date();
  //   const ageInMonths =
  //     (today.getFullYear() - birth.getFullYear()) * 12 +
  //     (today.getMonth() - birth.getMonth());

  //   if (ageInMonths < 12) {
  //     return `${ageInMonths} महिना

  //   if (ageInMonths < 12) {
  //     return \`${ageInMonths} महिना`;
  //   } else {
  //     const years = Math.floor(ageInMonths / 12);
  //     const months = ageInMonths % 12;
  //     return months > 0 ? `${years} वर्ष ${months} महिना` : `${years} वर्ष`;
  //   }
  // };

  const generateCertificate = () => {
    setCertificateGenerated(true);

    const certificateContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>स्वर्णबिन्दु प्राशन प्रमाणपत्र</title>
  <style>
    @page {
      size: A5 landscape;
      margin: 15mm;
    }
    body {
      font-family: 'Noto Sans Devanagari', Arial, sans-serif;
      background: #fdfdfd;
      margin: 0;
      padding: 0;
    }
    .certificate {
      width: 100%;
      height: 100%;
      border: 4px solid #d4af37;
      border-radius: 15px;
      background: white;
      padding: 25px 35px;
      box-sizing: border-box;
      position: relative;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #d4af37;
      padding-bottom: 10px;
      margin-bottom: 15px;
    }
    .header .title {
      font-size: 26px;
      font-weight: bold;
      color: #8b4513;
    }
    .header .subtitle {
      font-size: 15px;
      color: #555;
    }
    .serial {
      position: absolute;
      top: 15px;
      right: 25px;
      background: #d4af37;
      color: white;
      padding: 4px 12px;
      border-radius: 15px;
      font-size: 12px;
      font-weight: bold;
    }
    .qr {
      position: absolute;
      top: 20px;
      left: 25px;
    }
    .qr img {
      width: 70px;
      height: 70px;
    }
    .info {
      margin: 20px 0;
    }
    .info h3 {
      color: #d4af37;
      font-size: 18px;
      margin-bottom: 10px;
      border-left: 4px solid #d4af37;
      padding-left: 8px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 25px;
    }
    .info-item {
      font-size: 14px;
      line-height: 1.4;
    }
    .label {
      font-weight: bold;
      color: #666;
    }
    .value {
      color: #222;
      font-size: 15px;
      margin-top: 2px;
    }
    .statement {
      text-align: center;
      margin: 20px 0;
      font-size: 16px;
      color: #333;
      line-height: 1.6;
    }
    .signatures {
      display: flex;
      justify-content: space-between;
      margin-top: 30px;
      padding: 0 20px;
    }
    .sign-box {
      text-align: center;
      width: 40%;
    }
    .sign-line {
      border-top: 2px solid #333;
      margin: 40px auto 8px auto;
      width: 100%;
    }
    .footer {
      text-align: center;
      font-size: 11px;
      color: #777;
      margin-top: 25px;
      border-top: 1px solid #eee;
      padding-top: 5px;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="serial">#${serialNumber}</div>
    <div class="qr">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${
        registrationData.id
      }" />
    </div>
    <div class="header">
      <div class="title">स्वर्णबिन्दु प्राशन प्रमाणपत्र</div>
      <div class="subtitle">Swarnabindu Prashana Certificate</div>
    </div>

    <div class="info">
      <h3>बिरामीको विवरण | Patient Details</h3>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">नाम | Name</div>
          <div class="value">${registrationData.childName}</div>
        </div>
        <div class="info-item">
          <div class="label">उमेर | Age</div>
          <div class="value">${calculateAge(registrationData.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <div class="label">लिङ्ग | Gender</div>
          <div class="value">${
            registrationData.gender === "male"
              ? "पुरुष | Male"
              : "महिला | Female"
          }</div>
        </div>
        <div class="info-item">
          <div class="label">दर्ता मिति | Registration Date</div>
          <div class="value">${new Date().toLocaleDateString("ne-NP")}</div>
        </div>
        <div class="info-item">
          <div class="label">अभिभावक | Guardian</div>
          <div class="value">${
            registrationData.guardianName || registrationData.fatherName
          }</div>
        </div>
        <div class="info-item">
          <div class="label">ठेगाना | Address</div>
          <div class="value">${registrationData.district}, ${
      registrationData.palika
    }-${registrationData.ward}</div>
        </div>
      </div>
    </div>

    <div class="statement">
      यो प्रमाणित गरिन्छ कि माथि उल्लेखित बालक/बालिकालाई <br/>
      <strong>स्वर्णबिन्दु प्राशन कार्यक्रम</strong> अन्तर्गत सफलतापूर्वक दर्ता गरिएको छ।<br/>
      <small>This certifies that the above mentioned child has been successfully registered under the Swarnabindu Prashana Program.</small>
    </div>

    <div class="signatures">
      <div class="sign-box">
        <div class="sign-line"></div>
        <div>प्राधिकृत हस्ताक्षर</div>
        <div style="font-size: 11px; color: #666;">Authorized Signature</div>
      </div>
      <div class="sign-box">
        <div class="sign-line"></div>
        <div>मिति</div>
        <div style="font-size: 11px; color: #666;">Date</div>
      </div>
    </div>

    <div class="footer">
      स्वर्णबिन्दु प्राशन कार्यक्रम व्यवस्थापन प्रणाली | Swarnabindu Prashana Program Management System <br/>
      नेपाल सरकार, स्वास्थ्य तथा जनसंख्या मन्त्रालय | Government of Nepal, Ministry of Health and Population
    </div>
  </div>
</body>
</html>
`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(certificateContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">दर्ता सफल भयो!</CardTitle>
          <p className="text-green-100">Registration Successful!</p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Success Message */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {registrationData.childName} को दर्ता सम्पन्न भयो
            </h2>
            <p className="text-gray-600">
              स्वर्णबिन्दु प्राशन कार्यक्रममा सफलतापूर्वक दर्ता गरिएको छ।
            </p>
          </div>

          {/* Registration Details */}
          <Card className="border-green-200 bg-green-50 mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-800">
                    दर्ता नम्बर:
                  </span>
                  <p className="font-mono text-green-900">#{serialNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-green-800">मिति:</span>
                  <p className="text-green-900">
                    {new Date().toLocaleDateString("ne-NP")}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-800">उमेर:</span>
                  <p className="text-green-900">
                    {calculateAge(registrationData.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-800">मात्रा:</span>
                  <p className="text-green-900">
                    {registrationData.doseAmount} थोपा
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <Badge
              variant={isOnline ? "default" : "secondary"}
              className="px-4 py-2"
            >
              {isOnline
                ? "Online - Database मा सेभ भयो"
                : "Offline - स्थानीय रूपमा सेभ भयो"}
            </Badge>
          </div>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Button
              onClick={generateCertificate}
              className="flex items-center gap-2 bg-transparent"
              variant="outline"
            >
              <Download className="h-4 w-4" />
              प्रमाणपत्र डाउनलोड
            </Button>

            <Button
              onClick={onNewRegistration}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              नयाँ दर्ता
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Home className="h-4 w-4" />
                होम पेज
              </Button>
            </Link>

            <Link href="/screening">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Calendar className="h-4 w-4" />
                स्क्रिनिङ
              </Button>
            </Link>

            <Link href="/reports">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <FileText className="h-4 w-4" />
                रिपोर्ट
              </Button>
            </Link>
          </div>

          {/* Certificate Status */}
          {certificateGenerated && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 text-sm">
                प्रमाणपत्र सफलतापूर्वक जेनेरेट भयो!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
