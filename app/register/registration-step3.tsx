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
} from "lucide-react";

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

  // Common administrators for quick fill
  const commonAdministrators = [
    "डा. राम प्रसाद शर्मा",
    "डा. सीता देवी पौडेल",
    "डा. हरि बहादुर थापा",
    "नर्स सुनिता गुरुङ",
    "आयुर्वेद सहायक मोहन राई",
  ];

  useEffect(() => {
    // Auto-generate batch number
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

    if (!data.administeredBy.trim())
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
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setSaving(false);
    }
  };
  console.log(data, "data");

  const doseRecommendation = getDoseRecommendation();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-amber-600 to-orange-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          स्वर्णबिन्दु प्राशन विवरण | Swarnabindu Administration Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
          <Zap className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            अन्तिम चरण | Final Step
          </span>
          <Badge variant="secondary" className="ml-auto">
            Step 3/3
          </Badge>
        </div>

        {/* Patient Summary */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              बिरामीको सारांश | Patient Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">नाम:</span>
                <p className="text-blue-800">{data.childName}</p>
              </div>
              <div>
                <span className="font-medium">उमेर:</span>

                <p className="text-blue-800">{data.dateOfBirth}</p>
                <p className="text-blue-800">
                  {calculateAge(data.dateOfBirth)}
                </p>
              </div>
              <div>
                <span className="font-medium">लिङ्ग:</span>
                <p className="text-blue-800">
                  {data.gender === "male" ? "पुरुष" : "महिला"}
                </p>
              </div>
              <div>
                <span className="font-medium">ठेगाना:</span>
                <p className="text-blue-800">
                  {data.district}, {data.palika}-{data.ward}
                </p>
              </div>

              <div>
                <span className="font-medium">Contact:</span>
                <p className="text-blue-800">
                  Guardian Name - {data.guardianName}
                </p>
                <p className="text-blue-800">{data.contactNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dose Calculation */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Droplets className="h-4 w-4" />
              मात्रा गणना | Dose Calculation
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">
                  उमेर समूह: {doseRecommendation.description}
                </p>
                <p className="text-lg font-bold text-green-900">
                  सिफारिस मात्रा: {doseRecommendation.amount} थोपा
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
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
                <p className="text-xs text-green-600 mt-1">
                  {doseRecommendation.amount} drops
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Administration Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            प्रशासन विवरण | Administration Details
          </h3>

          <div className="space-y-2">
            <Label htmlFor="administeredBy">सेवन गराउने व्यक्ति *</Label>
            <Input
              id="administeredBy"
              value={data.administeredBy}
              onChange={(e) => onUpdate({ administeredBy: e.target.value })}
              placeholder="डाक्टर/नर्सको नाम"
              className={errors.administeredBy ? "border-red-500" : ""}
            />
            <div className="flex flex-wrap gap-1">
              <span className="text-xs text-gray-600">सुझाव:</span>
              {commonAdministrators.slice(0, 3).map((name) => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-transparent"
                  onClick={() => onUpdate({ administeredBy: name })}
                >
                  {name.split(" ")[0]} {name.split(" ")[1]}
                </Button>
              ))}
            </div>
            {errors.administeredBy && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.administeredBy}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">ब्याच नम्बर</Label>
              <Input
                id="batchNumber"
                value={data.batchNumber}
                onChange={(e) => onUpdate({ batchNumber: e.target.value })}
                placeholder="Auto-generated"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doseAmount">मात्रा (थोपा)</Label>
              <Input
                id="doseAmount"
                value={data.doseAmount}
                onChange={(e) => onUpdate({ doseAmount: e.target.value })}
                placeholder={doseRecommendation.amount}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">टिप्पणी</Label>
            <Textarea
              id="notes"
              value={data.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="कुनै विशेष टिप्पणी..."
              rows={3}
            />
          </div>
        </div>

        <Separator />

        {/* Consent and Eligibility */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">
            सहमति र योग्यता | Consent & Eligibility
          </h3>

          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="eligibilityConfirmed"
                checked={data.eligibilityConfirmed}
                onCheckedChange={(checked) =>
                  onUpdate({ eligibilityConfirmed: checked })
                }
                className={errors.eligibilityConfirmed ? "border-red-500" : ""}
              />
              <Label
                htmlFor="eligibilityConfirmed"
                className="text-sm leading-relaxed cursor-pointer"
              >
                म पुष्टि गर्छु कि यो बालक/बालिका स्वर्णबिन्दु प्राशनका लागि
                योग्य छ र कुनै निषेधित अवस्था छैन।
              </Label>
            </div>
            {errors.eligibilityConfirmed && (
              <p className="text-red-500 text-sm flex items-center gap-1 ml-6">
                <AlertCircle className="h-3 w-3" />
                {errors.eligibilityConfirmed}
              </p>
            )}

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consentGiven"
                checked={data.consentGiven}
                onCheckedChange={(checked) =>
                  onUpdate({ consentGiven: checked })
                }
                className={errors.consentGiven ? "border-red-500" : ""}
              />
              <Label
                htmlFor="consentGiven"
                className="text-sm leading-relaxed cursor-pointer"
              >
                अभिभावकको सहमति लिइएको छ र स्वर्णबिन्दु प्राशनका सबै नियम र
                सावधानीहरू बुझाइएको छ।
              </Label>
            </div>
            {errors.consentGiven && (
              <p className="text-red-500 text-sm flex items-center gap-1 ml-6">
                <AlertCircle className="h-3 w-3" />
                {errors.consentGiven}
              </p>
            )}
          </div>
        </div>

        {/* Safety Guidelines */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>सुरक्षा निर्देशनहरू:</strong>
            <ul className="mt-2 text-sm space-y-1">
              <li>• सेवन पछि ३० मिनेटसम्म खाना नदिनुहोस्</li>
              <li>• कुनै प्रतिकूल प्रतिक्रिया देखिएमा तुरुन्त रोक्नुहोस्</li>
              <li>• अर्को मात्रा पुष्य नक्षत्रमा मात्र दिनुहोस्</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            पछाडि
          </Button>
          <Button onClick={handleComplete} disabled={saving} className="px-8">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                दर्ता गर्दै...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                दर्ता पूरा गर्नुहोस्
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
