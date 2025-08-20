"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  User,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Zap,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RegistrationStep3Props {
  data: any;
  onUpdate: (data: any) => void;
  onComplete: () => void;
  onPrev: () => void;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export function RegistrationStep3({
  data,
  onUpdate,
  onComplete,
  onPrev,
}: RegistrationStep3Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const commonAdministrators = [
    "डा. सन्जु भुसाल ",
    "डा. प्रथिभा सेन ",
    "डा. सागर पोखरेल",
    "डा. प्रतिक्षा के.सी ",
  ];

  useEffect(() => {
    if (!data.batchNumber) {
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      const batchNumber = `SB${year}${month}${day}${random}`;
      onUpdate({ batchNumber });
    }
  }, []);

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

  const getDoseRecommendation = () => {
    const birth = new Date(data.dateOfBirth);
    const today = new Date();
    const ageInMonths =
      (today.getFullYear() - birth.getFullYear()) * 12 +
      (today.getMonth() - birth.getMonth());

    if (ageInMonths >= 6 && ageInMonths <= 12)
      return { amount: "1", description: "६-१२ महिना" };
    if (ageInMonths > 12 && ageInMonths <= 24)
      return { amount: "2", description: "१-२ वर्ष" };
    if (ageInMonths > 24 && ageInMonths <= 60)
      return { amount: "4", description: "२-५ वर्ष" };
    return { amount: "1", description: "सामान्य" };
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (!data.administeredBy?.trim())
      newErrors.administeredBy = "सेवन गराउने व्यक्तिको नाम आवश्यक छ";
    if (!data.eligibilityConfirmed)
      newErrors.eligibilityConfirmed = "योग्यता पुष्टि गर्नुहोस्";
    if (!data.consentGiven) newErrors.consentGiven = "सहमति आवश्यक छ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = async () => {
    if (!validateStep()) return;
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const doseRecommendation = getDoseRecommendation();
  const doses = [
    {
      value: 1,
      label: "१ थोपा",
      age: "६ महिना - १ वर्ष",
    },
    {
      value: 2,
      label: "२ थोपा",
      age: "१ वर्ष - २ वर्ष",
    },
    {
      value: 4,
      label: "४ थोपा",
      age: "३ वर्ष माथि",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT COLUMN */}
      <div className="lg:col-span-1 space-y-6">
        {/* Patient Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              बिरामीको जानकारी
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div>
              <Label className="text-gray-600">नाम:</Label>
              <p className="font-semibold">{data.childName}</p>
            </div>
            <div>
              <Label className="text-gray-600">उमेर:</Label>
              <p>{calculateAge(data.dateOfBirth)}</p>
            </div>
            <div>
              <Label className="text-gray-600">लिङ्ग:</Label>
              <Badge variant="outline">
                {data.gender === "male" ? "पुरुष" : "महिला"}
              </Badge>
            </div>
            <Separator />
            <div>
              <Label className="text-gray-600">अभिभावक:</Label>
              <p>{data.guardianName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{data.contactNumber}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>
                {data.district}, {data.palika}-{data.ward}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>जन्म: {data.dateOfBirth}</span>
            </div>
          </CardContent>
        </Card>

        {/* Dose Recommendation */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              सिफारिस मात्रा
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">
                उमेर समूह: {doseRecommendation.description}
              </p>
              <p className="text-lg font-bold text-green-900">
                {doseRecommendation.amount} थोपा
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from(
                { length: Number.parseInt(doseRecommendation.amount) },
                (_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-amber-400 rounded-full"
                  ></div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN (Form) */}
      <div className="lg:col-span-2">
        <Card className="w-full max-w-6xl mx-auto p-6 bg-white shadow-lg rounded-xl">
          <CardHeader className="bg-gradient-to-r  from-amber-600 to-orange-600 text-white rounded-xl p-4">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Zap className="h-5 w-5" />
              स्वर्णबिन्दु प्राशन विवरण | Administration Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 ">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md shadow-sm text-sm">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">
                द्रुत भर्ने | Quick Fill
              </span>
              <Badge variant="secondary" className="ml-auto text-xs">
                Step 3/3
              </Badge>
            </div>
            {/* Administered By */}
            {/* <div>
              <Label htmlFor="administeredBy">सेवन गराउने व्यक्ति *</Label>
              <Input
                id="administeredBy"
                value={data.administeredBy}
                onChange={(e) => onUpdate({ administeredBy: e.target.value })}
                className={errors.administeredBy ? "border-red-500" : ""}
                placeholder="डाक्टर/नर्सको नाम"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {commonAdministrators.slice().map((name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdate({ administeredBy: name })}
                  >
                    {name}
                  </Button>
                ))}
              </div>
              {errors.administeredBy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.administeredBy}
                </p>
              )}
            </div> */}
            {/* Administered By */}

            <div>
              <Label>सेवन गराउने व्यक्ति *</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {commonAdministrators.map((name) => (
                  <Button
                    key={name}
                    variant={
                      data.administeredBy === name ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onUpdate({ administeredBy: name })}
                    className={
                      data.administeredBy === name ? "border-blue-600" : ""
                    }
                  >
                    {name}
                  </Button>
                ))}
              </div>
              {errors.administeredBy && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.administeredBy}
                </p>
              )}
            </div>

            {/* Batch & Dose */}

            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batchNumber">ब्याच नम्बर</Label>
                <Input
                  id="batchNumber"
                  value={data.batchNumber}
                  onChange={(e) => onUpdate({ batchNumber: e.target.value })}
                  placeholder="Auto-generated"
                />
              </div>
              <div>
                <Label htmlFor="doseAmount">मात्रा (थोपा)</Label>
                <Input
                  id="doseAmount"
                  value={data.doseAmount}
                  onChange={(e) => onUpdate({ doseAmount: e.target.value })}
                  placeholder={doseRecommendation.amount}
                />
              </div>
            </div> */}

            {/* Batch & Dose Card */}
            <Card className="w-full shadow-md rounded-2xl border border-gray-200">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-2xl">
                <CardTitle className="text-lg font-semibold">
                  ब्याच नम्बर र मात्रा (थोपा)
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Batch number */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="batchNumber"
                      className="text-sm font-medium text-gray-700"
                    >
                      ब्याच नम्बर
                    </Label>
                    <Input
                      id="batchNumber"
                      value={data.batchNumber}
                      onChange={(e) =>
                        onUpdate({ batchNumber: e.target.value })
                      }
                      placeholder="Auto-generated"
                      className="rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>

                  {/* Dose dropdown */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="doseAmount"
                      className="text-sm font-medium text-gray-700"
                    >
                      मात्रा (थोपा)
                    </Label>

                    <Select
                      onValueChange={(val) => onUpdate({ doseAmount: val })}
                      value={data.doseAmount}
                    >
                      <SelectTrigger className="w-full rounded-lg border-gray-300 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder={doseRecommendation.amount} />
                      </SelectTrigger>

                      <SelectContent className="rounded-lg shadow-lg">
                        {doses.map((dose) => (
                          <SelectItem
                            key={dose.value}
                            value={String(dose.value)}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{dose.label}</span>
                              <span className="text-xs text-gray-500">
                                {dose.age}
                              </span>
                            </div>
                          </SelectItem>
                        ))}

                        {/* Divider */}
                        <div className="border-t my-2" />

                        {/* Custom dose input */}
                        <div className="px-3 py-2 space-y-1">
                          <Label
                            htmlFor="customDose"
                            className="text-xs text-gray-600"
                          >
                            Custom मात्रा
                          </Label>
                          <Input
                            id="customDose"
                            type="number"
                            min={0}
                            placeholder="Enter drops"
                            value={
                              !doses.some(
                                (d) => String(d.value) === data.doseAmount
                              )
                                ? data.doseAmount
                                : ""
                            }
                            onChange={(e) =>
                              onUpdate({ doseAmount: e.target.value })
                            }
                            className="h-9 w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                          />
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">टिप्पणी</Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => onUpdate({ notes: e.target.value })}
                placeholder="कुनै विशेष टिप्पणी..."
              />
            </div>

            <Separator />

            {/* Consent & Eligibility */}
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <Checkbox
                  checked={data.eligibilityConfirmed}
                  onCheckedChange={(checked) =>
                    onUpdate({ eligibilityConfirmed: checked })
                  }
                />
                <Label>
                  म पुष्टि गर्छु कि यो बालक/बालिका योग्य छ र कुनै निषेधित अवस्था
                  छैन।
                </Label>
              </div>
              {errors.eligibilityConfirmed && (
                <p className="text-red-500 text-sm">
                  {errors.eligibilityConfirmed}
                </p>
              )}

              <div className="flex gap-2 items-start">
                <Checkbox
                  checked={data.consentGiven}
                  onCheckedChange={(checked) =>
                    onUpdate({ consentGiven: checked })
                  }
                />
                <Label>
                  अभिभावकको सहमति लिइएको छ र सबै सावधानीहरू बुझाइएको छ।
                </Label>
              </div>
              {errors.consentGiven && (
                <p className="text-red-500 text-sm">{errors.consentGiven}</p>
              )}
            </div>

            {/* Safety Alert */}
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>सुरक्षा निर्देशनहरू:</strong>
                <ul className="mt-2 text-sm space-y-1">
                  <li>• सेवन पछि ३० मिनेटसम्म खाना नदिनुहोस्</li>
                  <li>
                    • कुनै प्रतिकूल प्रतिक्रिया देखिएमा तुरुन्त रोक्नुहोस्
                  </li>
                  <li>• अर्को मात्रा पुष्य नक्षत्रमा मात्र दिनुहोस्</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onPrev}>
                <ArrowLeft className="mr-2 h-4 w-4" /> पछाडि
              </Button>
              <Button onClick={handleComplete} disabled={saving}>
                {saving ? "Saving..." : "दर्ता पूरा गर्नुहोस्"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
