"use client";

import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { useRef } from "react";
import { AyurvedicCertificate } from "@/components/certificate";
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

  const hasSaved = useRef(false);
  useEffect(() => {
    if (!hasSaved.current) {
      setIsOnline(navigator.onLine);

      // Only save once
      saveRegistration();
      hasSaved.current = true;
    }

    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Optional: keep track of online/offline status
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
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
  //       const { data, error } = await ApiService.createRegistration(
  //         registrationRecord
  //       );
  //       if (!error) {
  //         console.log("✅ Registration saved to API");
  //         return;
  //       }
  //     }

  //     // Save to offline storage as fallback
  //     OfflineStorage.saveRegistration(registrationRecord);
  //     console.log("⚡ Registration saved offline");
  //   } catch (error) {
  //     console.error("Error saving registration:", error);
  //   }
  // };

  // const saveRegistration = async () => {
  //   try {
  //     const registrationRecord = {
  //       ...registrationData,
  //       dateOfBirth: registrationData.dateOfBirth, // make sure key matches API
  //       createdAt: new Date().toISOString(),
  //       serial_no: generateSerialNumber(),
  //       age: calculateAge(registrationData.dateOfBirth),
  //     };

  //     setSerialNumber(registrationRecord.serial_no);

  //     if (isOnline) {
  //       debugger;
  //       alert("Saving registration to API...");
  //       const response = await fetch("/api/registration", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ data: registrationRecord }), // wrap in { data: ... }
  //       });

  //       const result = await response.json();
  //       if (response.ok && result.success) {
  //         console.log("✅ Registration saved to API");
  //         return;
  //       } else {
  //         console.error("❌ API error:", result);
  //       }
  //     }

  //     // Save to offline storage as fallback
  //     OfflineStorage.saveRegistration(registrationRecord);
  //     console.log("⚡ Registration saved offline");
  //   } catch (error) {
  //     console.error("Error saving registration:", error);
  //   }
  // };

  let saveInProgress = false;

  const saveRegistration = async () => {
    if (saveInProgress) return;
    saveInProgress = true;

    try {
      const registrationRecord = {
        gender: registrationData.gender,
        child_name: registrationData.childName,
        date_of_birth: registrationData.dateOfBirth,
        age: registrationData.age,
        guardian_name: registrationData.guardianName,
        father_name: registrationData.fatherName,
        mother_name: registrationData.motherName,
        // father_occupation: registrationData.fatherOccupation,
        // mother_occupation: registrationData.motherOccupation,
        contact_number: registrationData.contactNumber,
        district: registrationData.district,
        palika: registrationData.palika,
        health_conditions: registrationData.healthConditions || [],
        allergies: registrationData.allergies,
        previous_medications: registrationData.previousMedications,
        vaccination_status: registrationData.vaccinationStatus,
        weight: registrationData.weight,
        height: registrationData.height,
        muac: registrationData.muac,
        head_circumference: registrationData.headCircumference,
        chest_circumference: registrationData.chestCircumference,
        administered_by: registrationData.administeredBy,
        batch_number: registrationData.batchNumber,
        consent_given: registrationData.consentGiven,
        dose_amount: registrationData.doseAmount,
        notes: registrationData.notes,
        eligibility_confirmed: registrationData.eligibilityConfirmed,
        created_at: new Date().toISOString(),
      };

      // Determine table based on district
      const targetTable =
        registrationRecord.district === "चितवन"
          ? "chitwan_registrations"
          : "registrations";

      console.log(`🌐 Saving to Supabase table: ${targetTable}`);
      console.log(registrationRecord);

      const { data, error } = await supabase
        .from(targetTable)
        .insert([registrationRecord]);

      if (error) {
        console.error("❌ Supabase insert error:", error);
        throw error; // fallback to offline
      }

      console.log("✅ Registration saved to Supabase:", data);
      return;
    } catch (error) {
      console.error(
        "⚠️ Error saving registration, saving offline instead:",
        error
      );
      await OfflineStorage.saveRegistration(registrationData);
    } finally {
      saveInProgress = false;
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
    // setCertificateGenerated(true);
    setShowCertificate(true);

    // const certificateContent = `
    //   <!DOCTYPE html>
    //   <html>
    //     <head>
    //       <title>स्वर्णबिन्दु प्राशन प्रमाणपत्र</title>
    //       <meta charset="UTF-8">
    //       <style>
    //         body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
    //         .certificate { max-width: 800px; margin: 0 auto; background: white; border: 3px solid #d4af37; border-radius: 15px; overflow: hidden; }
    //         .header { background: linear-gradient(135deg, #d4af37, #f4e4bc); padding: 30px; text-align: center; color: #8b4513; }
    //         .logo { width: 80px; height: 80px; margin: 0 auto 20px; background: #d4af37; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; }
    //         .title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    //         .subtitle { font-size: 18px; opacity: 0.8; }
    //         .content { padding: 40px; }
    //         .patient-info { background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0; }
    //         .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    //         .info-item { padding: 10px; background: white; border-radius: 5px; border-left: 4px solid #d4af37; }
    //         .label { font-weight: bold; color: #666; font-size: 14px; }
    //         .value { font-size: 16px; color: #333; margin-top: 5px; }
    //         .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; }
    //         .serial { position: absolute; top: 20px; right: 20px; background: #d4af37; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
    //       </style>
    //     </head>
    //     <body>
    //       <div class="certificate">
    //         <div class="serial">#${serialNumber}</div>
    //         <div class="header">
    //           <div class="logo">स्व</div>
    //           <div class="title">स्वर्णबिन्दु प्राशन प्रमाणपत्र</div>
    //           <div class="subtitle">Swarnabindu Prashana Certificate</div>
    //         </div>
    //         <div class="content">
    //           <div class="patient-info">
    //             <h3 style="margin-top: 0; color: #d4af37;">बिरामीको विवरण | Patient Details</h3>
    //             <div class="info-grid">
    //               <div class="info-item">
    //                 <div class="label">नाम | Name</div>
    //                 <div class="value">${registrationData.childName}</div>
    //               </div>
    //               <div class="info-item">
    //                 <div class="label">उमेर | Age</div>
    //                 <div class="value">${calculateAge(
    //                   registrationData.dateOfBirth
    //                 )}</div>
    //               </div>
    //               <div class="info-item">
    //                 <div class="label">लिङ्ग | Gender</div>
    //                 <div class="value">${
    //                   registrationData.gender === "male"
    //                     ? "पुरुष | Male"
    //                     : "महिला | Female"
    //                 }</div>
    //               </div>
    //               <div class="info-item">
    //                 <div class="label">दर्ता मिति | Registration Date</div>
    //                 <div class="value">${new Date().toLocaleDateString(
    //                   "ne-NP"
    //                 )}</div>
    //               </div>
    //               <div class="info-item">
    //                 <div class="label">अभिभावक | Guardian</div>
    //                 <div class="value">${
    //                   registrationData.guardianName ||
    //                   registrationData.fatherName
    //                 }</div>
    //               </div>
    //               <div class="info-item">
    //                 <div class="label">ठेगाना | Address</div>
    //                 <div class="value">${registrationData.district}, ${
    //   registrationData.palika
    // }-${registrationData.ward}</div>
    //               </div>
    //             </div>
    //           </div>

    //           <div style="text-align: center; margin: 30px 0;">
    //             <p style="font-size: 18px; color: #333;">
    //               यो प्रमाणित गरिन्छ कि माथि उल्लेखित बालक/बालिकालाई स्वर्णबिन्दु प्राशन कार्यक्रम अन्तर्गत
    //               सफलतापूर्वक दर्ता गरिएको छ।
    //             </p>
    //             <p style="font-size: 16px; color: #666; margin-top: 20px;">
    //               This certifies that the above mentioned child has been successfully registered
    //               under the Swarnabindu Prashana Program.
    //             </p>
    //           </div>

    //           <div style="display: flex; justify-content: space-between; margin-top: 40px;">
    //             <div style="text-align: center;">
    //               <div style="border-top: 2px solid #333; width: 200px; margin: 20px 0 10px 0;"></div>
    //               <div style="font-weight: bold;">प्राधिकृत हस्ताक्षर</div>
    //               <div style="font-size: 12px; color: #666;">Authorized Signature</div>
    //             </div>
    //             <div style="text-align: center;">
    //               <div style="border-top: 2px solid #333; width: 200px; margin: 20px 0 10px 0;"></div>
    //               <div style="font-weight: bold;">मिति</div>
    //               <div style="font-size: 12px; color: #666;">Date</div>
    //             </div>
    //           </div>
    //         </div>
    //         <div class="footer">
    //           <p>स्वर्णबिन्दु प्राशन कार्यक्रम व्यवस्थापन प्रणाली | Swarnabindu Prashana Program Management System</p>
    //           <p>नेपाल सरकार, स्वास्थ्य तथा जनसंख्या मन्त्रालय | Government of Nepal, Ministry of Health and Population</p>
    //         </div>
    //       </div>
    //     </body>
    //   </html>
    // `;

    // const printWindow = window.open("", "_blank");
    // if (printWindow) {
    //   printWindow.document.write(certificateContent);
    //   printWindow.document.close();
    //   printWindow.print();
    // }
  };

  const [showCertificate, setShowCertificate] = useState(false);
  const printCertificate = () => {
    setCertificateGenerated(true);

    // Generate patient data for QR code
    const qrPatientData = {
      name: registrationData.childName,
      age: calculateAge(registrationData.dateOfBirth),
      gender: registrationData.gender,
      guardian: registrationData.guardianName,
      contact: registrationData.contactNumber,
      district: registrationData.district,
      palika: registrationData.palika,
      date: new Date().toLocaleDateString("ne-NP"),
      serialNo: generateSerialNumber(),
    };

    const qrData = encodeURIComponent(JSON.stringify(qrPatientData));

    const certificateContent = `
    <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>स्वर्णबिन्दु प्रमाणपत्र</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <style>
      @page {
        size: A4 landscape;
        margin: 0;
      }

      body {
        font-family: "Noto Sans Devanagari", Arial, sans-serif;
        background: #f0f4f8;
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
      }

      /* Each certificate takes exactly half of A4 landscape → A5 portrait */
      .certificate {
        width: 140mm;
        height: 200mm;
        background: white;
        border: 1px solid #ccc;
        box-sizing: border-box;
        page-break-inside: avoid;
        display: flex;
        margin-left: 10px;
        flex-direction: column;
        margin: 0;
      }

      /* HEADER */
      .header {
        background: linear-gradient(90deg, #1d4ed8, #1e3a8a);
        color: white;
        padding: 10px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .logo {
        width: 50px;
        height: 50px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .logo img {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }
      .header-text {
        text-align: center;
      }
      .header-text h1 {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 2px;
      }
      .header-text h2 {
        font-size: 12px;
        margin-bottom: 2px;
      }
      .header-text p {
        font-size: 10px;
      }
      .qr-code img {
        width: 60px;
        height: 60px;
      }

      /* CONTENT */
      .content {
        flex: 1;
        padding: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      /* Herbal grid simplified for smaller paper */
      .herbal-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 10px;
      }
      .herbal-item {
        text-align: center;
      }
      .herbal-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        margin: 0 auto 5px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .herbal-inner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
      }
      .herbal-item h3 {
        font-size: 10px;
        font-weight: bold;
      }
      .herbal-item p {
        font-size: 9px;
      }

      .center-content img {
        width: 70px;
        height: 70px;
        border-radius: 6px;
        object-fit: cover;
        margin-bottom: 5px;
      }
      .yellow-pill {
        background: #facc15;
        color: #1e3a8a;
        padding: 3px 8px;
        border-radius: 999px;
        display: inline-block;
        font-size: 10px;
      }

      /* Banners */
      .banner {
        background: #1d4ed8;
        color: white;
        text-align: center;
        padding: 5px;
        border-radius: 999px;
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 5px;
      }
      .banner.big {
        background: #1e3a8a;
        font-size: 12px;
        margin-bottom: 10px;
      }

      /* Patient Info */
      .patient-info {
        background: white;
        border-radius: 6px;
        padding: 10px;
        font-size: 10px;
        border: 1px solid #ddd;
        margin-bottom: 10px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 5px;
      }
      .info-row {
        display: flex;
        align-items: center;
      }
      .info-row span:first-child {
        font-weight: bold;
        margin-right: 5px;
      }
      .info-value {
        border-bottom: 1px dotted #999;
        flex: 1;
      }
      .info-full {
        grid-column: span 2;
      }

      /* Footer */
      .footer-text {
        text-align: center;
        font-size: 9px;
        color: #1e3a8a;
        margin-bottom: 5px;
      }
      .footer-text p {
        margin-bottom: 2px;
      }
      .contact {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 9px;
        font-weight: bold;
        color: #1e3a8a;
      }
    </style>
  </head>
  <body>
    <!-- Certificate 1 -->
    <div class="certificate">
      <div class="header">
        <div class="header-left">
          <div class="logo">
            <img src="/images/nepal-emblem.png" alt="Nepal Emblem" />
          </div>
          <div class="header-text">
            <h1>प्रादेशिक आयुर्वेद चिकित्सालय</h1>
            <h2>स्वर्णबिन्दु प्राशन कार्यक्रम</h2>
            <p>बीजौरी, दाङ</p>
          </div>
        </div>
        <div class="qr-code">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=12345" />
        </div>
      </div>

      <div class="content">
        <div>
          <!-- Herbs -->
          <div class="herbal-grid">
            <div class="herbal-item">
              <div class="herbal-circle" style="background:#16a34a">
                <div class="herbal-inner" style="background:#22c55e"></div>
              </div>
              <h3>शंखपुष्पी</h3>
              <p>स्मरण निद्रा सहयोगी</p>
            </div>
            <div class="herbal-item">
              <div class="herbal-circle" style="background:#facc15">
                <div class="herbal-inner" style="background:#fde047"></div>
              </div>
              <h3>मह</h3>
              <p>बालविकास सहयोगी</p>
            </div>
            <div class="herbal-item">
              <div class="herbal-circle" style="background:#166534">
                <div class="herbal-inner" style="background:#22c55e"></div>
              </div>
              <h3>वचा</h3>
              <p>पाचन सहयोगी</p>
            </div>
          </div>

          <!-- Center Baby -->
          <div style="text-align:center;margin:10px 0">
            <img src="/happy-baby-face.jpg" alt="Baby" />
            <div class="yellow-pill">सुवर्ण भस्म – रोग प्रतिरोधात्मक</div>
          </div>

          <div class="banner">सम्पूर्ण स्वास्थ्य विकासका लागि जडीबुटीहरू</div>
          <div class="banner big">जन्म देखि ५ वर्षसम्मका बालबालिकाका लागि</div>

          <!-- Patient Info -->
          <div class="patient-info">
            <div class="info-grid">
              <div class="info-row">
                <span>मूल दर्ता नं:</span><span class="info-value">123</span>
              </div>
              <div class="info-row">
                <span>लिङ्ग:</span><span class="info-value">पुरुष</span>
              </div>
              <div class="info-row">
                <span>नाम:</span><span class="info-value">रामु</span>
              </div>
              <div class="info-row">
                <span>उमेर:</span><span class="info-value">३ वर्ष</span>
              </div>
              <div class="info-row">
                <span>पालिका:</span><span class="info-value">घोराही</span>
              </div>
              <div class="info-row">
                <span>वडा:</span><span class="info-value">४</span>
              </div>
              <div class="info-row info-full">
                <span>मोबाइल नं:</span><span class="info-value">९८xxxxxxxx</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div>
          <div class="footer-text">
            <p>यो कार्ड हरेक पटक आफ्ना बालबालिकालाई ल्याउनुहोस्।</p>
            <p>(यो कार्ड सुरक्षित राख्नुहोस्।)</p>
          </div>
          <div class="contact">
            <span>Provincial Ayurveda Hospital Bijauri</span>
            <span>०८२-४११०४०</span>
          </div>
        </div>
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

  if (showCertificate) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex gap-4 print:hidden">
            <Button onClick={() => setShowCertificate(false)} variant="outline">
              Back to Form
            </Button>
            <Button onClick={printCertificate}>Print Certificate</Button>
          </div>
          <AyurvedicCertificate patientData={registrationData} />
        </div>
      </div>
    );
  }

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
                  <span className="font-medium text-green-800">दर्ता :</span>
                  <p className="font-mono text-green-900">
                    #{registrationData.childName}
                  </p>
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
            <Link href="/selfregistered">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Home className="h-4 w-4" />
                होम पेज | Pre Registered Entry
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
