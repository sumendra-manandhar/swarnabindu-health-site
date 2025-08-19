"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
// import { RegistrationStep1 } from "@/components/registration-step1"
// import { RegistrationStep2 } from "@/components/registration-step2"
// import { RegistrationStep3 } from "@/components/registration-step3"
// import { RegistrationSuccess } from "@/components/registration-success"
import { OfflineStorage } from "@/lib/offline-storage";
import { RegistrationStep1 } from "./registration-step1";
import { RegistrationStep2 } from "./registration-step2";
import { RegistrationStep3 } from "./registration-step3";
import { RegistrationSuccess } from "./registration-success";

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

  // Step 3 - Swarnabindu Details
  administeredBy: string;
  batchNumber: string;
  consentGiven: boolean;
  doseAmount: string;
  notes: string;
  eligibilityConfirmed: boolean;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isOnline, setIsOnline] = useState(true);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    // Step 1 - Child Info
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

    // Step 2 - Health condition
    healthConditions: [],
    allergies: "",
    previousMedications: "",
    vaccinationStatus: "",
    weight: "",
    height: "",
    muac: "",
    headCircumference: "",
    chestCircumference: "",

    // Step 3 - Swarnabindu Details
    administeredBy: "",
    batchNumber: "",
    consentGiven: false,
    doseAmount: "",
    notes: "",
    eligibilityConfirmed: false,
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [todayStats, setTodayStats] = useState({
    registered: 0,
    pending: 0,
    target: 100,
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadTodayStats();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const allRegistrations = OfflineStorage.getAllLocalRegistrations();
    const todayRegistrations = allRegistrations.filter(
      (reg) => reg.date?.startsWith(today) || reg.created_at?.startsWith(today)
    );

    setTodayStats({
      registered: todayRegistrations.length,
      pending: OfflineStorage.getPendingCount(),
      target: 100,
    });
  };

  const updateRegistrationData = (stepData: Partial<RegistrationData>) => {
    setRegistrationData((prev) => ({ ...prev, ...stepData }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeRegistration = () => {
    setRegistrationComplete(true);
    loadTodayStats(); // Refresh stats
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "बालकको जानकारी";
      case 2:
        return "ठेगाना र स्वास्थ्य";
      case 3:
        return "स्वर्णबिन्दु विवरण";
      default:
        return "";
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep)
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (step === currentStep)
      return (
        <div className="h-5 w-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
          {step}
        </div>
      );
    return (
      <div className="h-5 w-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
        {step}
      </div>
    );
  };

  if (registrationComplete) {
    return (
      <RegistrationSuccess
        registrationData={registrationData}
        onNewRegistration={() => {
          setRegistrationComplete(false);
          setCurrentStep(1);
          setRegistrationData({
            // Step 1 - Child Info
            childName: "",
            dateOfBirth: "",
            gender: "",
            fatherName: "",
            motherName: "",
            guardianName: "",
            fatherOccupation: "",
            motherOccupation: "",
            contactNumber: "",
            district: registrationData.district, // Keep location data
            palika: registrationData.palika,

            // Step 2 - Health condition
            healthConditions: [],
            allergies: "",
            previousMedications: "",
            vaccinationStatus: "",
            weight: "",
            height: "",
            muac: "",
            headCircumference: "",
            chestCircumference: "",

            // Step 3 - Swarnabindu Details
            administeredBy: registrationData.administeredBy, // Keep admin name
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                फिर्ता
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                नयाँ दर्ता | New Registration
              </h1>
              <p className="text-gray-600">स्वर्णबिन्दु प्राशन कार्यक्रम</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
        </div>

        {/* Today's Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    आजको दर्ता
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {todayStats.registered}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    सिंक पेन्डिङ
                  </p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {todayStats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    लक्ष्य प्रगति
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {todayStats.registered}/{todayStats.target}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Progress Bar */}
        {/* <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    {getStepIcon(step)}
                    <span className="text-xs mt-2 font-medium text-center max-w-20">
                      {getStepTitle(step)}
                    </span>
                  </div>
                  {step < 3 && (
                    <div
                      className={`h-1 w-24 mx-4 rounded-full ${
                        step < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 3) * 100} className="h-2" />
          </CardContent>
        </Card> */}

        {/* Offline Warning */}
        {!isOnline && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              तपाईं अफलाइन काम गर्दै हुनुहुन्छ। डाटा स्थानीय रूपमा सेभ हुनेछ र
              इन्टरनेट जडान भएपछि सिंक हुनेछ।
            </AlertDescription>
          </Alert>
        )}

        {/* Step Content */}
        <div className="mx-auto">
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
          {currentStep === 3 && (
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
