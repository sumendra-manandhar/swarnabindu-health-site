"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, AlertTriangle, Search } from "lucide-react";

import { RegistrationStep1 } from "./registration-step1";
import { RegistrationStep2 } from "./registration-step2";
import { RegistrationStep3 } from "./registration-step3"; // volunteer only
import { RegistrationSuccess } from "./registration-success";
import { supabase } from "@/lib/supabase";

interface RegistrationData {
  // Step 1 - Child Info
  gender: string;
  childName: string;
  dateOfBirth: string;
  guardianName: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  contactNumber: string;
  district: string;
  palika: string;
  age: string;

  // Step 2 - Health condition
  healthConditions: string[];
  allergies: string;
  previousMedications: string;
  vaccinationStatus: string;
  weight: string;
  height: string;
  muac: string;
  headCircumference: string;
  chestCircumference: string;

  // Volunteer Step 3
  batchNumber?: string;
  consentGiven?: boolean;
  doseAmount?: string;
  notes?: string;
  eligibilityConfirmed?: boolean;

  // Auto-generated
  uniqueId?: string;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  // const mode = searchParams.get("mode") || "volunteer"; // default to volunteer

  const pathname = usePathname();
  const mode = pathname.includes("/selfregister") ? "self" : "volunteer";

  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(true);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    gender: "",
    childName: "",
    dateOfBirth: "",
    guardianName: "",
    fatherName: "",
    motherName: "",
    fatherOccupation: "",
    motherOccupation: "",
    contactNumber: "",
    district: "",
    palika: "",
    age: "",

    healthConditions: [],
    allergies: "",
    previousMedications: "",
    vaccinationStatus: "new",
    weight: "",
    height: "",
    muac: "",
    headCircumference: "",
    chestCircumference: "",
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const updateRegistrationData = (stepData: Partial<RegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...stepData }));
  };

  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "3") {
      const stored = localStorage.getItem("prefillData");
      if (stored) {
        const parsed: RegistrationData = JSON.parse(stored);
        setRegistrationData(parsed);
        setCurrentStep(3);
      }
    }
  }, [searchParams]);
  // alert(mode);

  useEffect(() => {
    const step = searchParams.get("step");
    if (step === "3") {
      const stored = localStorage.getItem("prefillData");
      if (stored) {
        const parsed: RegistrationData = JSON.parse(stored);
        setRegistrationData(parsed);
        setCurrentStep(3);
      }
    }
  }, [searchParams]);

  const nextStep = () => {
    if (mode === "self") {
      // ✅ Self registration (only 2 steps)
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1);
      } else {
        completeRegistration();
      }
    } else {
      // ✅ Volunteer registration (3 steps)
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        completeRegistration();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const completeRegistration = () => {
    if (mode === "self") {
      // Generate unique ID for self-registrants
      const id = "REG-" + Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem("registrationId", id);
      const finalData = { ...registrationData, uniqueId: id };
      setRegistrationData(finalData);

      // Auto-download ID
      const blob = new Blob([`Your Registration ID: ${id}`], {
        type: "text/plain",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "registration_id.txt";
      link.click();

      // alert("thisss");

      setRegistrationComplete(true);

      saveSelfRegistration();
      // TODO: send `finalData` to self-registration table (API call)
    } else {
      // Volunteer registration complete
      setRegistrationComplete(true);

      // TODO: send `registrationData` to main registration table (API call)
    }
  };

  const saveSelfRegistration = async () => {
    try {
      // Generate unique ID for self-registrant
      const uniqueId = localStorage.getItem("registrationId") || "";

      const registrationRecord = {
        unique_id: uniqueId, // new field for self registration
        gender: registrationData.gender,
        child_name: registrationData.childName,
        date_of_birth: registrationData.dateOfBirth,
        age: registrationData.age,
        guardian_name: registrationData.guardianName,
        father_name: registrationData.fatherName,
        mother_name: registrationData.motherName,
        father_occupation: registrationData.fatherOccupation,
        mother_occupation: registrationData.motherOccupation,
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
        created_at: new Date().toISOString(),
      };
      // alert("yaha");

      console.log("🌐 Attempting to save self-registration to Supabase...");
      console.log(registrationRecord);

      const { data, error } = await supabase
        .from("self_registrations") // separate table
        .insert([registrationRecord]);

      if (error) {
        console.error("❌ Supabase insert error:", error);
        throw error; // fallback to offline
      }

      console.log("✅ Self-registration saved to Supabase:", data);
      return uniqueId; // return ID for download or display
    } catch (error) {
      console.error(
        "⚠️ Error saving self-registration, saving offline instead:",
        error
      );
    }
  };

  if (registrationComplete) {
    if (mode === "self") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
          <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-lg text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">
              Registration Successful 🎉
            </h1>
            <p className="text-gray-700">
              Your Registration ID is:
              <br />
              <span className="text-2xl font-bold text-blue-700">
                {registrationData.uniqueId}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              This ID has been downloaded on your device. Please show it to a
              volunteer for final verification.
            </p>

            <Button
              onClick={() => {
                setRegistrationComplete(false);
                setCurrentStep(1);
                // Reset registrationData except district/palika if needed
              }}
            >
              New Registration
            </Button>
          </div>
        </div>
      );
    }

    // Volunteer success
    return (
      <RegistrationSuccess
        registrationData={registrationData}
        onNewRegistration={() => {
          setRegistrationComplete(false);
          setCurrentStep(1);
          setRegistrationData({
            gender: "",
            childName: "",
            dateOfBirth: "",
            fatherName: "",
            motherName: "",
            guardianName: "",
            fatherOccupation: "",
            motherOccupation: "",
            contactNumber: "",
            district: registrationData.district,
            palika: registrationData.palika,
            age: "",
            healthConditions: [],
            allergies: "",
            previousMedications: "",
            vaccinationStatus: "",
            weight: "",
            height: "",
            muac: "",
            headCircumference: "",
            chestCircumference: "",
            batchNumber: "",
            consentGiven: false,
            doseAmount: "",
            notes: "",
            eligibilityConfirmed: false,
          });
        }}
      />
    );
  }

  return (
    // <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

    <div>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <div className="flex gap-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === "self" ? "Self Registration" : "New Registration"}
                </h1>
                <Link href="/selfregistered">
                  <Button className="bg-blue-600 hover:bg-blue-700 rounded-full p-2">
                    <Search className="h-5 w-5 text-white" />
                  </Button>
                </Link>
              </div>

              <p className="text-gray-600">Swarnabindu Program</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are offline. Data will be saved locally and synced later.
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="mx-auto ">
          {currentStep === 1 && (
            <RegistrationStep1
              data={registrationData}
              onUpdate={updateRegistrationData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <RegistrationStep2
              data={registrationData}
              onUpdate={updateRegistrationData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {mode === "volunteer" && currentStep === 3 && (
            <RegistrationStep3
              data={registrationData}
              onUpdate={updateRegistrationData}
              onComplete={completeRegistration}
              onPrev={prevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}
