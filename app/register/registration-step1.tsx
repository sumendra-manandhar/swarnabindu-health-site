"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, AlertCircle, Zap } from "lucide-react";
import { DISTRICTS_WITH_PALIKA } from "@/lib/constants";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegistrationStep1Props {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export function RegistrationStep1({
  data,
  onUpdate,
  onNext,
}: RegistrationStep1Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ageInfo, setAgeInfo] = useState<{
    years: number;
    months: number;
    eligible: boolean;
  } | null>(null);

  //Surname Suggestor
  const [childSurname, setChildSurname] = useState<string>("");

  useEffect(() => {
    if (data.childName.trim()) {
      const parts = data.childName.trim().split(" ");
      const surname = parts[parts.length - 1];
      setChildSurname(surname);
    } else {
      setChildSurname("");
    }
  }, [data.childName]);

  // UI visual for filled content
  const inputClass = (value: string | undefined, error?: string) =>
    `w-full rounded-md px-3 py-2 border ${
      error
        ? "border-red-500"
        : value && value.trim() !== ""
        ? "border-green-500"
        : "border-gray-300"
    } focus:outline-none focus:ring-2 focus:ring-blue-400`;

  // Quick fill suggestions based on common names
  const commonNames = {
    male: ["Ram", "Shyam", "Hari", "Krishna"],
    female: ["Sita ", "Gita", "Radha", "Kamala"],
  };

  // const commonFatherNames = [
  //   "Ram Bahadur",
  //   "Krishna Bahadur",
  //   "Hari Prasad",
  //   "Gopal Shrestha",
  //   "Suresh",
  //   "Rajesh",
  // ];
  // const commonMotherNames = [
  //   "Sita ",
  //   "Gita",
  //   "Radha",
  //   "Kamala",
  //   "Saraswoti",
  //   "Laxmi",
  // ];

  // Preselect first common location on mount
  useEffect(() => {
    if (!data.district) {
      const [firstDistrict, firstPalika] = Object.entries(
        DISTRICTS_WITH_PALIKA
      )[0];
      onUpdate({ district: firstDistrict, palika: firstPalika });
    }
  }, []);

  useEffect(() => {
    if (data.dateOfBirth) {
      calculateAge(data.dateOfBirth);
    }
  }, [data.dateOfBirth]);

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    const eligible = totalMonths >= 6 && totalMonths <= 60; // 6 months to 5 years

    setAgeInfo({ years, months, eligible });

    // Auto-calculate dose amount based on age
    let doseAmount = "";
    if (totalMonths >= 6 && totalMonths <= 12) doseAmount = "1";
    else if (totalMonths > 12 && totalMonths <= 24) doseAmount = "2";
    else if (totalMonths > 24 && totalMonths <= 60) doseAmount = "4";

    onUpdate({ doseAmount });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.childName.trim()) newErrors.childName = "बालकको नाम आवश्यक छ";
    // if (!data.dateOfBirth) newErrors.dateOfBirth = "जन्म मिति आवश्यक छ";
    if (!data.gender) newErrors.gender = "लिङ्ग छान्नुहोस्";
    if (!data.dateOfBirth) newErrors.dateOfBirth = " छान्नुहोस्";
    // if (!data.contactNumber.trim())
    //   newErrors.contactNumber = "सम्पर्क नम्बर आवश्यक छ";
    // if (data.contactNumber && !/^[0-9]{10}$/.test(data.contactNumber)) {
    //   newErrors.contactNumber = "१० अंकको मोबाइल नम्बर चाहिन्छ";
    // }

    // if (ageInfo && !ageInfo.eligible) {
    //   newErrors.dateOfBirth = "६ महिनादेखि ५ वर्षसम्मका बालबालिकाका लागि मात्र";
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const quickFillName = (name: string) => {
    onUpdate({ childName: name });
  };

  const quickFillParent = (name: string, type: "father" | "mother") => {
    if (type === "father") {
      onUpdate({ fatherName: name, guardianName: name });
    } else {
      onUpdate({ motherName: name });
    }
  };

  const quickFillLocation = (district: string, palika: string) => {
    onUpdate({ district, palika });
  };

  return (
    <Card className="w-full max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-4">
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
          <User className="h-5 w-5" />
          बालकको आधारभूत जानकारी | Child & Guardian Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md shadow-sm text-sm">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">
            द्रुत दर्ता | Quick Registration
          </span>
          <Badge variant="secondary" className="ml-auto text-xs">
            Step 1/3
          </Badge>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Child Info */}
          <div className="p-4 bg-white border border-blue-100 space-y-4">
            {/* District / Palika */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                value={data.district}
                readOnly
                placeholder="जिल्ला स्वतः भर्नेछ"
                className="text-sm px-2 py-1 max-w-xs bg-gray-200"
              />
              <Input
                value={data.palika}
                readOnly
                placeholder="पालिका स्वतः भर्नेछ"
                className="text-sm px-2 py-1 max-w-xs  bg-gray-200"
              />
            </div>
            <h3 className="text-blue-700 font-semibold text-sm">
              बालक विवरण | Child Info
            </h3>

            {/* Gender */}
            <div className="space-y-1">
              <Label className="text-sm">लिङ्ग *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={data.gender === "male" ? "default" : "outline"}
                  onClick={() => onUpdate({ gender: "male" })}
                  className="flex-1 text-sm py-1"
                >
                  पुरुष | Male
                </Button>
                <Button
                  type="button"
                  variant={data.gender === "female" ? "default" : "outline"}
                  onClick={() => onUpdate({ gender: "female" })}
                  className="flex-1 text-sm py-1"
                >
                  महिला | Female
                </Button>
              </div>
            </div>
            {/* Child Name */}
            <div className="space-y-1">
              <Label htmlFor="childName" className="text-sm">
                बालकको पूरा नाम *
              </Label>
              <Input
                id="childName"
                value={data.childName}
                onChange={(e) => onUpdate({ childName: e.target.value })}
                placeholder="बालकको नाम लेख्नुहोस्"
                className="text-sm px-2 py-1"
              />
              {data.gender && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {commonNames[data.gender as keyof typeof commonNames]
                    ?.slice(0, 4)
                    .map((name) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs px-1 py-0"
                        onClick={() => quickFillName(name)}
                      >
                        {name}
                      </Button>
                    ))}
                </div>
              )}
              {errors.childName && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.childName}
                </p>
              )}
            </div>

            {/* Date of Birth */}
            {/* <div className="space-y-1">
              <Label htmlFor="dateOfBirth" className="text-sm">
                जन्म मिति *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="text-sm px-2 py-1"
              />

              {ageInfo && (
                <span className="text-xs text-gray-600">
                  उमेर: {ageInfo.years} वर्ष {ageInfo.months} महिना
                </span>
              )}
            </div> */}

            <div className="space-y-1">
              <Label htmlFor="dateOfBirth" className="text-sm">
                जन्म मिति *
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                className="text-sm px-2 py-1"
              />

              {/* ✅ Eligibility Card */}
              {ageInfo && (
                <div
                  className={`p-3 rounded-lg mt-2 ${
                    ageInfo.eligible
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar
                      className={`h-4 w-4 ${
                        ageInfo.eligible ? "text-green-600" : "text-red-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        ageInfo.eligible ? "text-green-800" : "text-red-800"
                      }`}
                    >
                      उमेर: {ageInfo.years} वर्ष {ageInfo.months} महिना
                    </span>
                    <Badge
                      variant={ageInfo.eligible ? "default" : "destructive"}
                      className="ml-auto"
                    >
                      {ageInfo.eligible ? "योग्य" : "अयोग्य"}
                    </Badge>
                  </div>
                  {!ageInfo.eligible && (
                    <p className="text-red-700 text-xs mt-1">
                      स्वर्णबिन्दु प्राशन ६ महिनादेखि ५ वर्षसम्मका बालबालिकाका
                      लागि मात्र हो।
                    </p>
                  )}
                </div>
              )}
              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Guardian Info */}
          <div className="p-4   shadow-sm space-y-4">
            <h3 className="text-blue-700 font-semibold text-sm">
              अभिभावक विवरण | Guardian Info
            </h3>

            {/* Father */}
            <div className="space-y-1">
              <Label className="text-sm">बुबाको नाम</Label>
              <Input
                id="fatherName"
                value={data.fatherName}
                onChange={(e) =>
                  onUpdate({
                    fatherName: e.target.value,
                    guardianName: e.target.value,
                  })
                }
                placeholder={
                  childSurname
                    ? `बुबाको नाम (e.g. ${childSurname})`
                    : "बुबाको नाम"
                }
                className="text-sm px-2 py-1"
              />
              {data.fatherName.trim() && (
                <Input
                  id="fatherOccupation"
                  value={data.fatherOccupation || ""}
                  onChange={(e) =>
                    onUpdate({ fatherOccupation: e.target.value })
                  }
                  placeholder="बुबाको पेशा"
                  className="text-sm px-2 py-1 mt-1"
                />
              )}
            </div>

            {/* Mother */}
            <div className="space-y-1">
              <Label className="text-sm">आमाको नाम</Label>
              <Input
                id="motherName"
                value={data.motherName}
                onChange={(e) => onUpdate({ motherName: e.target.value })}
                placeholder="आमाको नाम"
                className="text-sm px-2 py-1"
              />
              {data.motherName.trim() && (
                <Input
                  id="motherOccupation"
                  value={data.motherOccupation || ""}
                  onChange={(e) =>
                    onUpdate({ motherOccupation: e.target.value })
                  }
                  placeholder="आमाको पेशा"
                  className="text-sm px-2 py-1 mt-1"
                />
              )}
            </div>

            {/* Contact */}
            <div className="space-y-1">
              <Label htmlFor="contactNumber" className="text-sm">
                सम्पर्क नम्बर *
              </Label>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center px-2 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                  +977
                </span>
                <Input
                  id="contactNumber"
                  value={data.contactNumber}
                  onChange={(e) =>
                    onUpdate({
                      contactNumber: e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10),
                    })
                  }
                  placeholder="9800000000"
                  className="text-sm px-2 py-1 rounded-l-none max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Next Step Button */}
        <div className="flex justify-end">
          <Button onClick={handleNext} className="px-6 py-1 text-sm">
            अर्को चरण | Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
