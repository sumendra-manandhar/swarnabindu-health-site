"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  ArrowLeft,
  User,
  Phone,
  MapPin,
  History,
} from "lucide-react";
import Link from "next/link";
import { OfflineStorage } from "@/lib/offline-storage";
import { ApiService } from "@/lib/api-service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    // <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
    //   <Card className="w-full max-w-2xl">
    //     <CardHeader className="text-center bg-gradient-to-r from-green-600 to-emerald-600 text-white">
    //       <div className="mx-auto mb-4 w-16 h-16 bg-white rounded-full flex items-center justify-center">
    //         <CheckCircle className="h-10 w-10 text-green-600" />
    //       </div>
    //       <CardTitle className="text-2xl">दर्ता सफल भयो!</CardTitle>
    //       <p className="text-green-100">Registration Successful!</p>
    //     </CardHeader>

    //     <CardContent className="p-8">
    //       {/* Success Message */}
    //       <div className="text-center mb-6">
    //         <h2 className="text-xl font-semibold text-gray-900 mb-2">
    //           {registrationData.childName} को दर्ता सम्पन्न भयो
    //         </h2>
    //         <p className="text-gray-600">
    //           स्वर्णबिन्दु प्राशन कार्यक्रममा सफलतापूर्वक दर्ता गरिएको छ।
    //         </p>
    //       </div>

    //       {/* Registration Details */}
    //       <Card className="border-green-200 bg-green-50 mb-6">
    //         <CardContent className="p-4">
    //           <div className="grid grid-cols-2 gap-4 text-sm">
    //             <div>
    //               <span className="font-medium text-green-800">
    //                 दर्ता नम्बर:
    //               </span>
    //               <p className="font-mono text-green-900">#{serialNumber}</p>
    //             </div>
    //             <div>
    //               <span className="font-medium text-green-800">मिति:</span>
    //               <p className="text-green-900">
    //                 {new Date().toLocaleDateString("ne-NP")}
    //               </p>
    //             </div>
    //             <div>
    //               <span className="font-medium text-green-800">उमेर:</span>
    //               <p className="text-green-900">
    //                 {calculateAge(registrationData.dateOfBirth)}
    //               </p>
    //             </div>
    //             <div>
    //               <span className="font-medium text-green-800">मात्रा:</span>
    //               <p className="text-green-900">
    //                 {registrationData.doseAmount} थोपा
    //               </p>
    //             </div>
    //           </div>
    //         </CardContent>
    //       </Card>

    //       {/* Status Badge */}
    //       <div className="flex justify-center mb-6">
    //         <Badge
    //           variant={isOnline ? "default" : "secondary"}
    //           className="px-4 py-2"
    //         >
    //           {isOnline
    //             ? "Online - Database मा सेभ भयो"
    //             : "Offline - स्थानीय रूपमा सेभ भयो"}
    //         </Badge>
    //       </div>

    //       <Separator className="my-6" />

    //       {/* Action Buttons */}
    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
    //         <Button
    //           onClick={generateCertificate}
    //           className="flex items-center gap-2 bg-transparent"
    //           variant="outline"
    //         >
    //           <Download className="h-4 w-4" />
    //           प्रमाणपत्र डाउनलोड
    //         </Button>

    //         <Button
    //           onClick={onNewRegistration}
    //           className="flex items-center gap-2"
    //         >
    //           <UserPlus className="h-4 w-4" />
    //           नयाँ दर्ता
    //         </Button>
    //       </div>

    //       {/* Navigation */}
    //       <div className="flex justify-center gap-4">
    //         <Link href="/">
    //           <Button
    //             variant="outline"
    //             className="flex items-center gap-2 bg-transparent"
    //           >
    //             <Home className="h-4 w-4" />
    //             होम पेज
    //           </Button>
    //         </Link>

    //         <Link href="/screening">
    //           <Button
    //             variant="outline"
    //             className="flex items-center gap-2 bg-transparent"
    //           >
    //             <Calendar className="h-4 w-4" />
    //             स्क्रिनिङ
    //           </Button>
    //         </Link>

    //         <Link href="/reports">
    //           <Button
    //             variant="outline"
    //             className="flex items-center gap-2 bg-transparent"
    //           >
    //             <FileText className="h-4 w-4" />
    //             रिपोर्ट
    //           </Button>
    //         </Link>
    //       </div>

    //       {/* Certificate Status */}
    //       {certificateGenerated && (
    //         <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
    //           <CheckCircle className="h-5 w-5 text-blue-600 mx-auto mb-2" />
    //           <p className="text-blue-800 text-sm">
    //             प्रमाणपत्र सफलतापूर्वक जेनेरेट भयो!
    //           </p>
    //         </div>
    //       )}
    //     </CardContent>
    //   </Card>
    // </div>

    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/screening">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">नयाँ स्क्रिनिङ | New Screening</h1>
          <p className="text-muted-foreground">
            Conduct follow-up screening for patient
          </p>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <Alert>
          <AlertDescription>
            Youre working offline. Screening data will be saved locally and
            synced when online.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information & Dose History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                बिरामीको जानकारी
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {registrationData ? (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      नाम:
                    </Label>
                    <p className="text-lg font-semibold">
                      {registrationData.childName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      सिरियल नम्बर:
                    </Label>
                    <p className="font-mono">{registrationData.serial_no}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        उमेर:
                      </Label>
                      <p>{registrationData.age}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        लिङ्ग:
                      </Label>
                      <Badge variant="outline">
                        {/* {getGenderDisplay(registrationData.gender)} */}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      अभिभावक:
                    </Label>
                    <p>
                      {registrationData.guardianName ||
                        registrationData.fatherName ||
                        registrationData.motherName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{registrationData.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {registrationData.district}, {registrationData.palika}-
                      {registrationData.ward}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {/* <span>दर्ता: {formatDate(registrationData.date)}</span> */}
                  </div>
                </>
              ) : (
                <div>
                  {/* <p className="text-lg font-semibold">{patientName}</p> */}
                  <p className="text-sm text-muted-foreground">
                    Patient details not fully loaded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dose History */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                मात्रा इतिहास | Dose History
              </CardTitle>
              <CardDescription>
                कुल मात्रा: {"doseHistory".length} | Total Doses:{" "}
                {"doseHistory".length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>प्रगति | Progress</span>
                  {/* <span>{Math.round(getDoseProgress())}%</span> */}
                </div>
                {/* <Progress value={getDoseProgress()} className="h-2" /> */}
              </div>

              {/* Dose History List */}
              {/* <div className="space-y-3 max-h-64 overflow-y-auto">
                {doseHistory.length > 0 ? (
                  doseHistory.map((dose, index) => (
                    <div
                      key={dose.id}
                      className="p-3 bg-white rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          मात्रा #{doseHistory.length - index}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {formatDate(dose.date)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">मात्रा:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from(
                              {
                                length: Number.parseInt(dose.dose_amount) || 1,
                              },
                              (_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 bg-blue-500 rounded-full"
                                ></div>
                              )
                            )}
                            <span className="ml-1">
                              {dose.dose_amount} थोपा
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">प्रतिक्रिया:</span>
                          <div className="mt-1">
                            {getReactionBadge(dose.reaction)}
                          </div>
                        </div>
                      </div>
                      {dose.notes && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          {dose.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Droplets className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">कुनै मात्रा इतिहास छैन</p>
                    <p className="text-xs">No dose history found</p>
                  </div>
                )}
              </div> */}

              {/* Stats */}
              {/* {doseHistory.length > 0 && (
                <div className="pt-3 border-t border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                      <p className="font-medium">सामान्य प्रतिक्रिया</p>
                      <p className="text-green-700">
                        {
                          doseHistory.filter((d) => d.reaction === "normal")
                            .length
                        }
                        /{doseHistory.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="font-medium">अन्तिम मात्रा</p>
                      <p className="text-blue-700">
                        {doseHistory.length > 0
                          ? formatDate(doseHistory[0].date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )} */}
            </CardContent>
          </Card>
        </div>

        {/* Screening Form */}
        <div className="lg:col-span-2">
          <form>
            <Card>
              <CardHeader>
                <CardTitle>स्क्रिनिङ फारम | Screening Form</CardTitle>
                <CardDescription>Fill in the screening details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Screening Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* <div>
                    <Label>स्क्रिनिङ मिति *</Label>
                    <Input
                      id="screening_date"
                      type="date"
                      // value={"screeningData".screening_date}
                      onChange={(e) =>
                        // handleInputChange("screening_date", e.target.value)
                      }
                      required
                    />
                  </div> */}
                  <div>
                    <Label htmlFor="screening_type">स्क्रिनिङ प्रकार *</Label>
                    {/* <Select
                      value={screeningData.screening_type}
                      onValueChange={(value) =>
                        handleInputChange("screening_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="routine">Routine Check</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select> */}
                  </div>
                </div>

                <Separator />

                {/* Dose Information */}
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Safety Guidelines */}
      {/* <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            सुरक्षा निर्देशनहरू:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • स्वर्णप्राशन दिनु अघि बच्चाको स्वास्थ्य अवस्था जाँच गर्नुहोस्
            </li>
            <li>• सही मात्रा र समयको पालना गर्नुहोस्</li>
            <li>• कुनै प्रतिकूल प्रतिक्रिया देखिएमा तुरुन्त रोक्नुहोस्</li>
            <li>• सबै जानकारी सही र पूर्ण रूपमा भर्नुहोस्</li>
            <li>• अर्को मात्रा पुष्य नक्षत्रमा मात्र दिनुहोस्</li>
          </ul>
        </CardContent>
      </Card> */}
    </div>
  );
}
