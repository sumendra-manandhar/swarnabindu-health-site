"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MapPin,
  AlertCircle,
  ArrowLeft,
  Zap,
  Syringe,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useCustomTabNavigation } from "@/hooks/use-custom-tab-navigation";
import { Checkbox } from "@/components/ui/checkbox";
// import { useCustomTabNavigation } from "@/hooks/use-custom-tab-navigation"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegistrationStep2Props {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export function RegistrationStep2({
  data,
  onUpdate,
  onNext,
  onPrev,
}: RegistrationStep2Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  useCustomTabNavigation();

  // Common health conditions
  const commonHealthConditions = [
    { id: "fever", label: "ज्वरो | Fever" },
    { id: "cold", label: "रुघाखोकी | Cold/Cough" },
    { id: "diarrhea", label: "झाडापखाला | Diarrhea" },
    { id: "vomiting", label: "वान्ता | Vomiting" },
    { id: "skin_issues", label: "छालाको समस्या | Skin Issues" },
    { id: "breathing", label: "सास फेर्न समस्या | Breathing Issues" },
    { id: "headache", label: "टाउको दुखाइ | Headache" },
    { id: "stomachache", label: "पेट दुखाइ | Stomachache" },
    { id: "fatigue", label: "थकाइ | Fatigue" },
    { id: "others", label: "अन्य | Others" },
  ];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    // Check for contraindications
    const contraindications = ["fever", "diarrhea", "vomiting"];
    const hasContraindications = data.healthConditions?.some(
      (condition: string) => contraindications.includes(condition)
    );

    if (hasContraindications) {
      newErrors.healthConditions =
        "स्वास्थ्य अवस्थाका कारण अहिले स्वर्णबिन्दु दिन मिल्दैन";
    }
    if (mode === "self" && !data.eligibilityConfirmed) {
      newErrors.eligibilityConfirmed =
        "कृपया पुष्टि गर्नुहोस् कि बालक/बालिका योग्य छ ।";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const handleHealthConditionChange = (
    conditionId: string,
    checked: boolean
  ) => {
    const currentConditions = data.healthConditions || [];
    const newConditions = checked
      ? [...currentConditions, conditionId]
      : currentConditions.filter((id: string) => id !== conditionId);

    onUpdate({
      ...data,
      healthConditions: newConditions,
    });
  };

  const hasContraindications = data.healthConditions?.some(
    (condition: string) => ["fever", "diarrhea", "vomiting"].includes(condition)
  );

  // const mode = localStorage.getItem("registrationMode") || "";

  const [mode, setMode] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("registrationMode") || "";
      setMode(savedMode);
    }
  }, []);

  return (
    <Card className="w-full max-w-6xl mx-auto  bg-white shadow-lg rounded-xl">
      {/* Header */}
      <CardHeader className="mx-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-sm p-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <MapPin className="h-5 w-5" />
          स्वास्थ्य जानकारी | Health Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md shadow-sm text-sm">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="font-medium text-green-800">
            द्रुत दर्ता | Quick Registration
          </span>
          <Badge variant="outline" className="bg-white ml-auto text-sm">
            Step 2/3
          </Badge>
        </div>

        {/* Contraindication Warning */}
        {hasContraindications && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>चेतावनी:</strong> ज्वरो, झाडापखाला वा वान्ता भएको बेलामा
              स्वर्णबिन्दु प्राशन दिनु हुँदैन। पहिले यी समस्याहरू निको पारेर
              मात्र दिनुहोस्।
            </AlertDescription>
          </Alert>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Health Info */}
          <div className="p-6 bg-white border border-green-300   space-y-4">
            {/* Vaccination Status */}
            <div className="space-y-2">
              <Label className="text-sm">विन्दु स्थिति</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={
                    (data.vaccinationStatus ?? "new") === "new"
                      ? "default"
                      : "outline"
                  }
                  className="important flex-1 flex items-center gap-1 text-sm py-1 rounded-2xl shadow-sm"
                  onClick={() =>
                    onUpdate({
                      ...data,
                      vaccinationStatus: "new",
                      oldDoseKnown: undefined,
                      doses: undefined,
                    })
                  }
                >
                  <Sparkles className="h-4 w-4" /> नयाँ
                  {data.vaccinationStatus === "new" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant={
                    data.vaccinationStatus === "old" ? "default" : "outline"
                  }
                  className="important flex-1 flex items-center gap-1 text-sm py-1 rounded-2xl shadow-sm"
                  onClick={() =>
                    onUpdate({
                      ...data,
                      vaccinationStatus: "old",
                      oldDoseKnown: undefined,
                      doses: undefined,
                    })
                  }
                >
                  <Syringe className="h-4 w-4" /> पुरानो
                  {data.vaccinationStatus === "old" && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </Button>
              </div>

              {/* Old dose choice */}
              {/* {data.vaccinationStatus === "old" &&
                data.oldDoseKnown === undefined && (
                  <div className="flex gap-2 mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="important flex-1 rounded-xl bg-transparent"
                      onClick={() => onUpdate({ ...data, oldDoseKnown: false })}
                    >
                      🤷 थाहा छैन
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="important flex-1 rounded-xl bg-transparent"
                      onClick={() =>
                        onUpdate({
                          ...data,
                          oldDoseKnown: true,
                          doses: data.doses || 0,
                        })
                      }
                    >
                      थाहा छ
                    </Button>
                  </div>
                )}
              {data.vaccinationStatus === "old" &&
                data.oldDoseKnown === true && (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded-xl shadow-sm">
                    <Label className="whitespace-nowrap text-sm">
                      डोज संख्या:
                    </Label>
                    <Input
                      className="important w-20 text-center text-sm px-1 py-1"
                      value={data.doses || "0"}
                      min={0}
                      onChange={(e) =>
                        onUpdate({ ...data, doses: Number(e.target.value) })
                      }
                    />
                  </div>
                )} */}
            </div>
            {/* Allergies */}
            <div className="space-y-1">
              <Label htmlFor="allergies" className="text-sm">
                एलर्जी (यदि छ भने)
              </Label>
              <Textarea
                id="allergies"
                value={data.allergies || ""}
                onChange={(e) =>
                  onUpdate({ ...data, allergies: e.target.value })
                }
                rows={2}
                placeholder="कुनै एलर्जी छ भने लेख्नुहोस्..."
                className=" text-sm px-2 py-1"
              />
            </div>

            {/* Medical History */}
            <div className="space-y-1">
              <Label htmlFor="previousMedications" className="text-sm">
                If Medical History (यदि छ भने)
              </Label>
              <Textarea
                id="previousMedications"
                value={data.previousMedications || ""}
                onChange={(e) =>
                  onUpdate({ ...data, previousMedications: e.target.value })
                }
                rows={2}
                placeholder="कुनै इतिहास छ भने लेख्नुहोस्..."
                className="text-sm px-2 py-1"
              />
            </div>
          </div>

          {/* Right Column: Anthropometry */}
          <div className="p-6  border border-green-200 shadow-sm space-y-4">
            <CardTitle className="text-sm font-medium mb-2">
              शारीरिक मापन | Anthropometry
            </CardTitle>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex flex-col">
                <Label htmlFor="weight" className="text-sm">
                  तौल (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, weight: e.target.value })
                  }
                  placeholder="किलोमा"
                  className=" text-sm px-2 py-1 bg-white"
                />
              </div>
              <div className="flex flex-col">
                <Label htmlFor="height" className="text-sm">
                  उचाइ (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={data.height || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, height: e.target.value })
                  }
                  placeholder="से.मी."
                  className=" text-sm px-2 py-1"
                />
              </div>

              {mode !== "self" && (
                <>
                  <div className="flex flex-col">
                    <Label htmlFor="muac" className="text-sm">
                      MUAC (cm)
                    </Label>
                    <Input
                      id="muac"
                      type="number"
                      value={data.muac || ""}
                      onChange={(e) =>
                        onUpdate({ ...data, muac: e.target.value })
                      }
                      placeholder="से.मी."
                      className="text-sm px-2 py-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="headCircumference" className="text-sm">
                      माथि घेरा (cm)
                    </Label>
                    <Input
                      id="headCircumference"
                      type="number"
                      value={data.headCircumference || ""}
                      onChange={(e) =>
                        onUpdate({ ...data, headCircumference: e.target.value })
                      }
                      placeholder="से.मी."
                      className="text-sm px-2 py-1"
                    />
                  </div>
                  <div className="flex flex-col">
                    <Label htmlFor="chestCircumference" className="text-sm">
                      छाती घेरा (cm)
                    </Label>
                    <Input
                      id="chestCircumference"
                      type="number"
                      value={data.chestCircumference || ""}
                      onChange={(e) =>
                        onUpdate({
                          ...data,
                          chestCircumference: e.target.value,
                        })
                      }
                      placeholder="से.मी."
                      className="text-sm px-2 py-1"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {mode === "self" && (
          <div className="space-y-3">
            <div className="flex gap-2 items-start">
              <Checkbox
                onCheckedChange={(checked) =>
                  onUpdate({ eligibilityConfirmed: checked === true })
                }
              />
              <Label>
                म आफ्नो बच्चालाई स्वर्णविन्दु प्राशन खुवाउन अनुमति दिन्छु ।
              </Label>
            </div>
            {errors.eligibilityConfirmed && (
              <p className="text-red-500 text-sm">
                {errors.eligibilityConfirmed}
              </p>
            )}
          </div>
        )}
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" /> पछाडि
          </Button>
          <Button
            onClick={handleNext}
            disabled={hasContraindications}
            variant={"outline"}
            className=" focus:bg-black focus:text-white hover:bg-black hover:text-white  important px-6 py-1 text-sm"
          >
            अर्को चरण | Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
