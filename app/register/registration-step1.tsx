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

interface RegistrationStep1Props {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
}

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
    if (!data.dateOfBirth) newErrors.dateOfBirth = "जन्म मिति आवश्यक छ";
    if (!data.gender) newErrors.gender = "लिङ्ग छान्नुहोस्";
    if (!data.contactNumber.trim())
      newErrors.contactNumber = "सम्पर्क नम्बर आवश्यक छ";
    if (data.contactNumber && !/^[0-9]{10}$/.test(data.contactNumber)) {
      newErrors.contactNumber = "१० अंकको मोबाइल नम्बर चाहिन्छ";
    }

    if (ageInfo && !ageInfo.eligible) {
      newErrors.dateOfBirth = "६ महिनादेखि ५ वर्षसम्मका बालबालिकाका लागि मात्र";
    }

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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          बालकको आधारभूत जानकारी | Child's Basic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Zap className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            द्रुत दर्ता | Quick Registration
          </span>
          <Badge variant="secondary" className="ml-auto">
            Step 1/3
          </Badge>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label>सामान्य स्थानहरू | Common Locations</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(DISTRICTS_WITH_PALIKA).map(([district, palika]) => (
              <Button
                key={district}
                type="button"
                variant={data.district === district ? "default" : "outline"}
                onClick={() => onUpdate({ district, palika })}
                className="flex-1"
              >
                {district}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* District Field */}
          <div className="space-y-2">
            <Label htmlFor="district">जिल्ला *</Label>
            <input
              id="district"
              value={data.district || ""}
              readOnly
              className="w-full rounded-md px-3 py-2 border border-gray-300 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="जिल्ला स्वतः भर्नेछ"
            />
          </div>

          {/* Palika Field */}
          <div className="space-y-2">
            <Label htmlFor="palika">पालिका *</Label>
            <input
              id="palika"
              value={data.palika || ""}
              readOnly
              className="w-full rounded-md px-3 py-2 border border-gray-300 bg-gray-100 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="पालिका स्वतः भर्नेछ"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <Label>लिङ्ग *</Label>
          <div className="flex gap-4">
            <Button
              type="button"
              variant={data.gender === "male" ? "default" : "outline"}
              onClick={() => onUpdate({ gender: "male" })}
              className="flex-1"
            >
              पुरुष | Male
            </Button>
            <Button
              type="button"
              variant={data.gender === "female" ? "default" : "outline"}
              onClick={() => onUpdate({ gender: "female" })}
              className="flex-1"
            >
              महिला | Female
            </Button>
          </div>
          {errors.gender && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.gender}
            </p>
          )}
        </div>

        {/* Child Name with Quick Fill */}
        <div className="space-y-2">
          <Label htmlFor="childName">बालकको पूरा नाम *</Label>
          <Input
            id="childName"
            value={data.childName}
            onChange={(e) => onUpdate({ childName: e.target.value })}
            placeholder="बालकको नाम लेख्नुहोस्"
            className={inputClass(data.childName, errors.childName)}
          />
          {data.gender && (
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-gray-600">सुझाव:</span>
              {commonNames[data.gender as keyof typeof commonNames]
                ?.slice(0, 4)
                .map((name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    className="h-6 text-xs bg-transparent"
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

        {/* Date of Birth with Age Calculation */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">जन्म मिति *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            max={new Date().toISOString().split("T")[0]}
            className={inputClass(data.dateOfBirth, errors.dateofBirth)}
          />
          {ageInfo && (
            <div
              className={`p-3 rounded-lg ${
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
                  स्वर्णबिन्दु प्राशन ६ महिनादेखि ५ वर्षसम्मका बालबालिकाका लागि
                  मात्र हो।
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

        {/* Parents Information with Quick Fill */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Father Info */}
          <div className="space-y-3 p-4 border rounded-lg shadow-sm bg-white">
            <Label htmlFor="fatherName" className="font-medium">
              बुबाको नाम
            </Label>
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
                  ? `बुबाको नाम (e.g.  ${childSurname})`
                  : "बुबाको नाम"
              }
              list="father-suggestions"
              className={inputClass(data.fatherName, errors.fatherName)}
            />

            {/* Surname autocomplete */}
            {childSurname && data.fatherName && (
              <datalist id="father-suggestions">
                {(() => {
                  const words = data.fatherName.trim().split(" ");
                  const lastWord = words[words.length - 1];
                  if (lastWord.toLowerCase() !== childSurname.toLowerCase()) {
                    return (
                      <option
                        value={`${data.fatherName.trim()} ${childSurname}`}
                      />
                    );
                  }
                  return null;
                })()}
              </datalist>
            )}

            {/* Occupation input */}
            {data.fatherName.trim() && (
              <div className="mt-2">
                <Label
                  htmlFor="fatherOccupation"
                  className="text-sm text-gray-600"
                >
                  बुबाको पेशा
                </Label>
                <Input
                  id="fatherOccupation"
                  value={data.fatherOccupation || ""}
                  onChange={(e) =>
                    onUpdate({ fatherOccupation: e.target.value })
                  }
                  placeholder="पेशा लेख्नुहोस्"
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Mother Info */}
          <div className="space-y-3 p-4 border rounded-lg shadow-sm bg-white">
            <Label htmlFor="motherName" className="font-medium">
              आमाको नाम
            </Label>
            <Input
              id="motherName"
              value={data.motherName}
              onChange={(e) => onUpdate({ motherName: e.target.value })}
              placeholder="आमाको नाम"
            />

            {/* Occupation input */}
            {data.motherName.trim() && (
              <div className="mt-2">
                <Label
                  htmlFor="motherOccupation"
                  className="text-sm text-gray-600"
                >
                  आमाको पेशा
                </Label>
                <Input
                  id="motherOccupation"
                  value={data.motherOccupation || ""}
                  onChange={(e) =>
                    onUpdate({ motherOccupation: e.target.value })
                  }
                  placeholder="पेशा लेख्नुहोस्"
                  className="mt-1"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contact Number */}
        <div className="space-y-2">
          <Label htmlFor="contactNumber">सम्पर्क नम्बर *</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
              +977
            </span>
            <Input
              id="contactNumber"
              value={data.contactNumber}
              onChange={(e) =>
                onUpdate({
                  contactNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              placeholder="9800000000"
              className={`rounded-l-none ${
                errors.contactNumber ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.contactNumber && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.contactNumber}
            </p>
          )}
        </div>

        {/* Eligibility Alert */}
        {ageInfo && !ageInfo.eligible && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>अयोग्य:</strong> स्वर्णबिन्दु प्राशन कार्यक्रम ६ महिनादेखि
              ५ वर्षसम्मका बालबालिकाका लागि मात्र हो।
            </AlertDescription>
          </Alert>
        )}

        {/* Next Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleNext}
            disabled={ageInfo && !ageInfo.eligible}
            className="px-8"
          >
            अर्को चरण | Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
