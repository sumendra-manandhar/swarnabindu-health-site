"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Calendar, AlertCircle, Zap } from "lucide-react";
import {
  DANG_PALIKAS,
  CHITWAN_PALIKAS,
  DISTRICTS_WITH_PALIKA,
} from "@/lib/constants";
import { NepaliDatePicker } from "@/components/nepali-date-picker";
import { useCustomTabNavigation } from "@/hooks/use-custom-tab-navigation";

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

  useCustomTabNavigation();

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
  const commonJobs = {
    male: [
      "व्यापार", // Small local trade
      "गोठालो ",
      "खेतमा काम गर्ने", // Rice farming
      "पशुपालन", // Herding / Animal husbandry
      "काठ काट्ने / बनजंगलको काम", // Forestry / Woodcutting
    ],
    female: [
      "घरधन्दा ", // Household work / Cooking
      "खेतीमा सहयोग", // Helping in farming
      "सुईधागो काम", // Handicraft / Sewing
      "पशुपालन",
    ],
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
  // useEffect(() => {
  //   if (!data.district) {
  //     const [firstDistrict, firstPalika] = Object.entries(DISTRICT_PALIKAS)[0];
  //     onUpdate({ district: firstDistrict, palika: firstPalika });
  //   }
  // }, []);

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

    // ✅ Build formatted age string
    const ageString = `${years} वर्ष ${months} महिना`;

    // Auto-calculate dose amount based on age
    let doseAmount = "";
    if (totalMonths >= 6 && totalMonths <= 12) doseAmount = "1";
    else if (totalMonths > 12 && totalMonths <= 24) doseAmount = "2";
    else if (totalMonths > 24 && totalMonths <= 60) doseAmount = "4";

    // ✅ Send to parent
    onUpdate({
      doseAmount,
      age: ageString, // <-- send age string to payload
    });
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (!data.childName.trim()) newErrors.childName = "बालकको नाम आवश्यक छ";
    if (!data.contactNumber) newErrors.contactNumber = "आवश्यक छ";
    if (!data.gender) newErrors.gender = "लिङ्ग छान्नुहोस्";
    if (!data.dateOfBirth) newErrors.dateOfBirth = " छान्नुहोस्";
    if (!data.palika) newErrors.palika = " छान्नुहोस्";

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

  // inside RegistrationStep1 component

  // New local state for age input mode
  const [manualAge, setManualAge] = useState<{ years: string; months: string }>(
    {
      years: "",
      months: "",
    }
  );

  // Back-calc DOB when user enters age manually
  useEffect(() => {
    if (manualAge.years || manualAge.months) {
      const years = parseInt(manualAge.years || "0", 10);
      const months = parseInt(manualAge.months || "0", 10);

      if (!isNaN(years) || !isNaN(months)) {
        const today = new Date();
        const birthDate = new Date(
          today.getFullYear() - years,
          today.getMonth() - months,
          today.getDate()
        );

        onUpdate({
          dateOfBirth: birthDate.toISOString().split("T")[0],
        });
      }
    }
  }, [manualAge]);

  // Reset manualAge when dateOfBirth is chosen directly
  useEffect(() => {
    if (data.dateOfBirth) {
      const birth = new Date(data.dateOfBirth);
      const today = new Date();

      let years = today.getFullYear() - birth.getFullYear();
      let months = today.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }

      setManualAge({ years: years.toString(), months: months.toString() });
    }
  }, [data.dateOfBirth]);

  const getCurrentUserDistrict = (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) return undefined;

    try {
      const user = JSON.parse(storedUser) as { district?: string };
      return user.district;
    } catch {
      return undefined;
    }
  };

  const getUserDistrict = (): string | undefined => {
    if (typeof window === "undefined") return undefined;
    const storedUser = localStorage.getItem("auth_user");
    if (!storedUser) return undefined;

    try {
      const user = JSON.parse(storedUser) as { district?: string };
      return user.district;
    } catch {
      return undefined;
    }
  };

  useEffect(() => {
    if (!data.district) {
      const userDistrict = getUserDistrict() || "दाङ";
      if (userDistrict) {
        // Auto-set district from logged-in user
        onUpdate({ district: userDistrict });

        // Also prefill the first palika for that district
        const palikas =
          userDistrict === "दाङ"
            ? DANG_PALIKAS
            : userDistrict === "चितवन"
            ? CHITWAN_PALIKAS
            : [];

        onUpdate({ palika: palikas[0] || "" });
      }
    }
  }, []);

  const getPalikasForDistrict = (): string[] => {
    debugger;
    const district = getCurrentUserDistrict() || "दाङ";

    switch (district) {
      case "दाङ":
        return DANG_PALIKAS;
      case "चितवन":
        return CHITWAN_PALIKAS;
      default:
        return [];
    }
  };
  const palikaOptions = getPalikasForDistrict();

  return (
    <Card className="w-full max-w-6xl mx-auto  bg-white shadow-lg rounded-xl">
      {/* Header */}
      <CardHeader className=" mx-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-sm p-4">
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
          <Badge variant="outline" className="bg-white ml-auto text-sm">
            Step 1/3
          </Badge>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Child Info */}
          <div className="p-6 bg-white border border-blue-100  shadow-sm space-y-4">
            <div className="grid grid-cols-2 gap-2 items-center">
              <Input
                value={data.district}
                readOnly
                // placeholder="पालिका स्वतः भर्नेछ"
                className="text-sm px-2 py-1 max-w-xs bg-gray-200"
              />
              {/* Dropdown for quick location selection */}
              <select
                className="important text-sm px-2 py-1 max-w-xs border rounded bg-white"
                value={data.palika}
                onChange={(e) => {
                  onUpdate({
                    palika: e.target.value,
                  });
                }}
              >
                <option value="">छान्नुहोस् | Select Palika</option>
                {palikaOptions.map((palika, idx) => (
                  <option key={palika} value={palika}>
                    {idx + 1}. {palika}
                  </option>
                ))}
                {errors.palika && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.palika}
                  </p>
                )}
              </select>
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
                  className=" important flex-1 text-sm py-1"
                >
                  पुरुष | Male
                </Button>
                <Button
                  type="button"
                  variant={data.gender === "female" ? "default" : "outline"}
                  onClick={() => onUpdate({ gender: "female" })}
                  className="important flex-1 text-sm py-1"
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
                className="  important text-sm px-2 py-1"
              />
              {/* {data.gender && !data.childName && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {commonNames[data.gender as keyof typeof commonNames]
                    ?.slice(0, 4)
                    .map((name) => (
                      <Button
                        key={name}
                        variant="outline"
                        size="sm"
                        className="h-6 bg-gray-300 text-xs px-1 py-0"
                        onClick={() => quickFillName(name)}
                      >
                        {name}
                      </Button>
                    ))}
                </div>
              )} */}
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

            {/* Date of Birth */}
            <div className="space-y-1">
              <Label htmlFor="dateOfBirth" className="text-sm">
                बालकको उमेर *
              </Label>

              <div
                className={`p-3 rounded-lg mt-2 ${
                  ageInfo?.eligible
                    ? "bg-green-50 border border-green-200"
                    : "bg-amber-50 border border-amber-100 "
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* <Calendar
                    className={`h-4 w-4 ${
                      ageInfo?.eligible ? "text-green-600" : "text-red-600"
                    }`}
                  /> */}
                  {/* <span className="text-sm font-medium">
                    जन्म मिति:{" "}
                    {data.dateOfBirth
                      ? new Date(data.dateOfBirth).toLocaleDateString("ne-NP")
                      : "N/A"}
                  </span> */}
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Input
                      min="0"
                      value={manualAge.years}
                      onChange={(e) =>
                        setManualAge({ ...manualAge, years: e.target.value })
                      }
                      className="bg-white text-center w-12 h-8px-1 text-xs"
                    />
                    वर्ष
                    <Input
                      min="0"
                      max="11"
                      value={manualAge.months}
                      onChange={(e) =>
                        setManualAge({ ...manualAge, months: e.target.value })
                      }
                      className="important bg-white text-center w-12 h-8 px-1 text-xs"
                    />
                    महिना
                  </span>

                  <Badge
                    variant={ageInfo?.eligible ? "default" : "destructive"}
                    className="ml-auto"
                  >
                    {ageInfo?.eligible ? "योग्य" : ""}
                  </Badge>
                </div>

                {!ageInfo?.eligible && (
                  <p className="text-red-700 text-xs mt-1">
                    स्वर्णबिन्दु प्राशन ६ महिनादेखि ५ वर्षसम्मका बालबालिकाका
                    लागि मात्र हो।
                  </p>
                )}
              </div>

              {errors.dateOfBirth && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Guardian Info */}
          <div className="p-6  bg-white border border-blue-100 space-y-4">
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
                className="important text-sm px-2 py-1"
              />
            </div>

            {/* Mother */}
            <div className="space-y-1">
              <Label className="text-sm">आमाको नाम</Label>
              <Input
                id="motherName"
                value={data.motherName}
                onChange={(e) => onUpdate({ motherName: e.target.value })}
                placeholder="आमाको नाम"
                className="important text-sm px-2 py-1"
              />
            </div>

            {/* Contact */}
            <div className="space-y-1">
              <Label htmlFor="contactNumber" className="text-sm">
                सम्पर्क नम्बर *
              </Label>
              <div className="flex items-center gap-1">
                <span className="h-8 inline-flex items-center px-2 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
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
                  className="important text-sm px-2 py-1 rounded-l-none max-w-xs"
                />
              </div>
            </div>
            {errors.contactNumber && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.contactNumber}
              </p>
            )}
          </div>
        </div>

        {/* Next Step Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            variant={"outline"}
            className=" focus:bg-black focus:text-white hover:bg-black hover:text-white important px-6 py-1 text-sm"
          >
            अर्को चरण | Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
