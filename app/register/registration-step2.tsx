"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Heart, AlertCircle, ArrowLeft, Zap } from "lucide-react";

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

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          स्वास्थ्य जानकारी |Health Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            द्रुत भर्ने | Quick Fill
          </span>
          <Badge variant="secondary" className="ml-auto">
            Step 2/3
          </Badge>
        </div>
        {/* Health Conditions */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            हालको स्वास्थ्य अवस्था | Current Health Conditions
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonHealthConditions.map((condition) => (
              <div key={condition.id} className="flex items-center space-x-2">
                <Checkbox
                  id={condition.id}
                  checked={
                    data.healthConditions?.includes(condition.id) || false
                  }
                  onCheckedChange={(checked) =>
                    handleHealthConditionChange(
                      condition.id,
                      checked as boolean
                    )
                  }
                />
                <Label
                  htmlFor={condition.id}
                  className="cursor-pointer text-sm"
                >
                  {condition.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.healthConditions && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.healthConditions}
            </p>
          )}
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
        {/* Allergies */}
        <div className="space-y-2">
          <Label htmlFor="allergies">एलर्जी (यदि छ भने)</Label>
          <Textarea
            id="allergies"
            value={data.allergies || ""}
            onChange={(e) => onUpdate({ ...data, allergies: e.target.value })}
            placeholder="कुनै एलर्जी छ भने लेख्नुहोस्..."
            rows={2}
          />
        </div>
        {/* Medical History */}
        <div className="space-y-2">
          <Label htmlFor="previousMedications">
            If Medical History (यदि छ भने)
          </Label>
          <Textarea
            id="previousMedications"
            value={data.previousMedications || ""}
            onChange={(e) =>
              onUpdate({ ...data, previousMedications: e.target.value })
            }
            placeholder="कुनै एलर्जी छ भने लेख्नुहोस्..."
            rows={2}
          />
        </div>
        {/* Vaccination Status */}
        <div className="space-y-2">
          <Label htmlFor="vaccinationStatus">खोप स्थिति</Label>
          <Select
            value={data.vaccinationStatus || ""}
            onValueChange={(value) =>
              onUpdate({ ...data, vaccinationStatus: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="खोप स्थिति छान्नुहोस्" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complete">पूर्ण</SelectItem>
              <SelectItem value="partial">आंशिक</SelectItem>
              <SelectItem value="none">छैन</SelectItem>
              <SelectItem value="unknown">थाहा छैन</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-6">
          {/* Anthropometric Measurements */}
          <Card className="p-4 border border-gray-200 bg-gray-50 shadow-sm">
            <CardTitle className="text-sm font-medium mb-3">
              शारीरिक मापन | Anthropometry
            </CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <Label htmlFor="weight">तौल (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={data.weight || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, weight: e.target.value })
                  }
                  placeholder="किलोमा लेख्नुहोस्"
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="height">उचाइ (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={data.height || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, height: e.target.value })
                  }
                  placeholder="से.मी. मा लेख्नुहोस्"
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="muac">MUAC (cm)</Label>
                <Input
                  id="muac"
                  type="number"
                  value={data.muac || ""}
                  onChange={(e) => onUpdate({ ...data, muac: e.target.value })}
                  placeholder="MUAC से.मी. मा"
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="headCircumference">माथि घेरा (cm)</Label>
                <Input
                  id="headCircumference"
                  type="number"
                  value={data.headCircumference || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, headCircumference: e.target.value })
                  }
                  placeholder="से.मी. मा लेख्नुहोस्"
                />
              </div>

              <div className="flex flex-col">
                <Label htmlFor="chestCircumference">छाती घेरा (cm)</Label>
                <Input
                  id="chestCircumference"
                  type="number"
                  value={data.chestCircumference || ""}
                  onChange={(e) =>
                    onUpdate({ ...data, chestCircumference: e.target.value })
                  }
                  placeholder="से.मी. मा लेख्नुहोस्"
                />
              </div>
            </div>
          </Card>
        </div>
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            पछाडि
          </Button>
          <Button onClick={handleNext} disabled={hasContraindications}>
            अर्को चरण | Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
