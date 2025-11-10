"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { OfflineStorage } from "@/lib/offline-storage";
// import { DatabaseService, supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  Phone,
  MapPin,
  Activity,
  AlertTriangle,
  Droplets,
  History,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string;
  serial_no: string;
  child_name: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  guardianName?: string;
  fatherName?: string;
  motherName?: string;
  contactNumber: string;
  district: string;
  palika: string;
  ward: string;
  date: string;
  reg_id: string;
}

interface DoseHistory {
  id: string;
  date: string;
  dose_amount: string;
  administered_by: string;
  reaction: string;
  batch_number: string;
  notes?: string;
}

interface ScreeningData {
  patient_id: string;
  screening_date: string;
  screening_type: string;
  dose_amount: string;
  administered_by: string;
  child_reaction: string;
  weight: string;
  height: string;
  muac: string;
  temperature: string;
  notes: string;
  batch_number: string;
  next_dose_date: string;
}

export default function NewScreeningPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get("patientId");

  const patientName = searchParams.get("patientName");

  const [patient, setPatient] = useState<Patient | null>(null);
  const [doseHistory, setDoseHistory] = useState<DoseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [screeningData, setScreeningData] = useState<ScreeningData>({
    patient_id: patientId || "",
    screening_date: new Date().toISOString().split("T")[0],
    screening_type: "follow_up",
    dose_amount: "",
    administered_by: "",
    child_reaction: "normal",
    weight: "",
    height: "",
    muac: "",
    temperature: "",
    notes: "",
    batch_number: "",
    next_dose_date: "",
  });

  const commonAdministrators = [
    "डा. सुष्मा केसी",
    "डा. प्रथिभा सेन ",
    "डा. सन्जु भुसाल ",
    "डा. सागर पोखरेल",
    "डा. प्रतिक्षा के.सी ",
  ];

  useEffect(() => {
    setIsOnline(navigator.onLine);
    if (patientId) {
      loadPatient();
      loadDoseHistory();
    } else {
      setLoading(false);
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [patientId]);

  const loadPatient = async () => {
    setLoading(true);
    try {
      // First try to find in offline storage
      const offlineRegistrations = OfflineStorage.getAllLocalRegistrations();
      const offlinePatient =
        offlineRegistrations.find(
          (p) => p.id === patientId || p.reg_id === patientId
        ) || null;

      if (offlinePatient) {
        setPatient({
          id: offlinePatient.localId || offlinePatient.id,
          serial_no: offlinePatient.serial_no || "",
          child_name: offlinePatient.child_name || "",
          reg_id: offlinePatient.reg_id || "",
          dateOfBirth: offlinePatient.dateOfBirth || "",
          age: offlinePatient.age || "",
          gender: offlinePatient.gender || "",
          guardianName: offlinePatient.guardianName || "",
          fatherName: offlinePatient.fatherName || "",
          motherName: offlinePatient.motherName || "",
          contactNumber: offlinePatient.contactNumber || "",
          district: offlinePatient.district || "",
          palika: offlinePatient.palika || "",
          ward: offlinePatient.ward || "",
          date: offlinePatient.date || offlinePatient.created_at,
        });
      } else if (isOnline) {
        // Try to load from Supabase

        try {
          const { data, error } = await supabase
            .from("registrations")
            .select("*")
            .or(`reg_id.eq.${patientId},contact_number.eq.${patientId}`)
            .limit(1)
            .single();

          if (error) {
            console.error("Error loading patient from Supabase:", error);
          } else if (data) {
            setPatient({
              id: data.id,
              serial_no: data.serial_no || "",
              child_name: data.child_name || "",
              reg_id: data.reg_id || "",
              dateOfBirth: data.birth_date || "",
              age: data.age || "",
              gender: data.gender || "",
              guardianName: data.guardian_name || "",
              fatherName: data.father_name || "",
              motherName: data.mother_name || "",
              contactNumber: data.contact_number || "",
              district: data.district || "",
              palika: data.palika || "",
              ward: data.ward || "",
              date: data.date || data.created_at,
            });

            const birth = new Date(data.date_of_birth);
            const today = new Date();
            const ageInMonths =
              (today.getFullYear() - birth.getFullYear()) * 12 +
              (today.getMonth() - birth.getMonth());

            let recommendation = { amount: "1", description: "सामान्य" };
            if (ageInMonths >= 6 && ageInMonths <= 12)
              recommendation = { amount: "1", description: "६-१२ महिना" };
            else if (ageInMonths > 12 && ageInMonths <= 24)
              recommendation = { amount: "2", description: "१-२ वर्ष" };
            else if (ageInMonths > 24 && ageInMonths <= 60)
              recommendation = { amount: "4", description: "२-५ वर्ष" };

            setDoseRecommendation(recommendation);

            // also update screeningData with recommended dose
            setScreeningData((prev) => ({
              ...prev,
              dose_amount: recommendation.amount,
              batch_number: generateBatchNumber(),
              next_dose_date: calculateNextDoseDate(),
            }));
          } else {
            console.warn("No matching patient found in Supabase.");
          }
        } catch (error) {
          console.error("Error fetching patient:", error);
        }
      }
    } catch (error) {
      console.error("Error loading patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoseHistory = async () => {
    try {
      // Load offline screenings
      const offlineScreenings = OfflineStorage.getOfflineScreenings();
      const patientScreenings = offlineScreenings
        .filter((screening) => screening.data.patient_id === patientId)
        .map((screening) => ({
          id: screening.id,
          date: screening.data.screening_date,
          dose_amount: screening.data.dose_amount,
          administered_by: screening.data.administered_by,
          reaction: screening.data.child_reaction,
          batch_number: screening.data.batch_number,
          notes: screening.data.notes,
        }));

      let mergedHistory = [...patientScreenings];

      if (isOnline) {
        try {
          // const { data: doseLogs, error: doseError } = await supabase
          //   .from("dose_logs")
          //   .select("*")
          //   .eq("patient_id", patient.reg_id)
          //   .order("created_at", { ascending: false });

          const { data, error } = await supabase
            .from("dose_logs")
            .select("*")
            .eq("patient_id", patientId)
            .order("created_at", { ascending: false });

          debugger;

          if (error) {
            console.error(
              "❌ Error loading dose history from Supabase:",
              error
            );
          } else if (data && data.length > 0) {
            const onlineHistory = data.map((dose: DoseHistory) => ({
              id: dose.id,
              date: dose.date,
              dose_amount: dose.dose_amount || "", // use appropriate field
              administered_by: dose.administered_by || "",
              reaction: dose.reaction || "normal",
              batch_number: dose.batch_number || "",
              notes: dose.notes || "",
            }));

            mergedHistory = [...mergedHistory, ...onlineHistory];
          }
        } catch (err) {
          console.error("⚠️ Error fetching dose history:", err);
        }
      }

      // Set merged data once
      setDoseHistory(mergedHistory);
    } catch (error) {
      console.error("Error loading dose history:", error);
    }
  };

  console.log(doseHistory);

  const calculateAgeInMonths = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 30);
  };

  const calculateDoseAmount = (ageInMonths: number): string => {
    if (ageInMonths <= 6) return "2";
    if (ageInMonths <= 12) return "3";
    if (ageInMonths <= 24) return "4";
    if (ageInMonths <= 60) return "5";
    return "6";
  };

  const [doseRecommendation, setDoseRecommendation] = useState<{
    amount: string;
    description: string;
  }>({
    amount: "1",
    description: "सामान्य",
  });

  //  correct code

  const generateBatchNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `SB${year}${month}${day}${random}`;
  };

  const calculateNextDoseDate = (): string => {
    // Next dose should be on the next Pushya Nakshatra (approximately every 27 days)
    const today = new Date();
    const nextDose = new Date(today.getTime() + 27 * 24 * 60 * 60 * 1000);
    return nextDose.toISOString().split("T")[0];
  };

  const handleInputChange = (field: keyof ScreeningData, value: string) => {
    setScreeningData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const screeningRecord = {
      ...screeningData,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from("dose_logs")
        .insert([screeningRecord]);

      if (error) throw error;

      alert("✅ Screening saved successfully!");
      router.push("/screening");
      console.log("Saved:", data);
    } catch (error) {
      console.error("Error saving screening:", error);
      alert("स्क्रिनिङ सेभ गर्न समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ne-NP");
  };

  const getGenderDisplay = (gender: string) => {
    switch (gender) {
      case "male":
        return "पुरुष";
      case "female":
        return "महिला";
      default:
        return gender;
    }
  };

  const getReactionBadge = (reaction: string) => {
    switch (reaction) {
      case "normal":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            सामान्य
          </Badge>
        );
      case "mild_reaction":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            हल्का
          </Badge>
        );
      case "adverse":
        return <Badge variant="destructive">प्रतिकूल</Badge>;
      default:
        return <Badge variant="outline">{reaction}</Badge>;
    }
  };

  const getDoseProgress = () => {
    const totalDoses = doseHistory.length;
    const maxRecommendedDoses = 12; // Assuming monthly doses for a year
    return Math.min((totalDoses / maxRecommendedDoses) * 100, 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading patient information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient && !patientName) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Patient not found. Please go back and select a patient for
            screening.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/screening">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Patient Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/screening">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">नयाँ स्क्रिनिङ | New Screening</h1>
          <p className="text-muted-foreground">
            Conduct follow-up screening for patient
          </p>
        </div>
      </div>

      {/* Connection Status */}
      {!isOnline && (
        <Alert>
          <AlertDescription>
            Youre working offline. Screening data will be saved locally and
            synced when online.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Information & Dose History */}
        <div className="lg:col-span-1 space-y-6">
          {/* Patient Info */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                बिरामीको जानकारी
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient ? (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      नाम:
                    </Label>
                    <p className="text-lg font-semibold">
                      {patient.child_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      सिरियल नम्बर:
                    </Label>
                    <p className="font-mono">{patient.reg_id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        उमेर:
                      </Label>
                      <p>{patient.age}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">
                        लिङ्ग:
                      </Label>
                      <Badge variant="outline">
                        {getGenderDisplay(patient.gender)}
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      अभिभावक:
                    </Label>
                    <p>
                      {patient.guardianName ||
                        patient.fatherName ||
                        patient.motherName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {patient.district}, {patient.palika}-{patient.ward}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>दर्ता: {formatDate(patient.date)}</span>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-lg font-semibold">{patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    Patient details not fully loaded
                  </p>
                </div>
              )}
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

          {/* Dose History */}

          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                मात्रा इतिहास | Dose History
              </CardTitle>
              <CardDescription>
                कुल मात्रा: {doseHistory.length} | Total Doses:{" "}
                {doseHistory.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>प्रगति | Progress</span>
                  <span>{Math.round(getDoseProgress())}%</span>
                </div>
                <Progress value={getDoseProgress()} className="h-2" />
              </div>

              {/* Dose History List */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {doseHistory.length > 0 ? (
                  doseHistory.map((dose, index) => (
                    <div
                      key={dose.id}
                      className="p-3 bg-white rounded-lg border border-green-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          मात्रा #{doseHistory.length - index}
                        </Badge>
                        <span className="text-xs text-gray-600">
                          {formatDate(dose.date)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="font-medium">मात्रा:</span>
                          <div className="flex items-center gap-1 mt-1">
                            {Array.from(
                              {
                                length: Number.parseInt(dose.dose_amount) || 1,
                              },
                              (_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 bg-blue-500 rounded-full"
                                ></div>
                              )
                            )}
                            <span className="ml-1">
                              {dose.dose_amount} थोपा
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">प्रतिक्रिया:</span>
                          <div className="mt-1">
                            {getReactionBadge(dose.reaction)}
                          </div>
                        </div>
                      </div>
                      {dose.notes && (
                        <p className="text-xs text-gray-600 mt-2 italic">
                          {dose.notes}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Droplets className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">कुनै मात्रा इतिहास छैन</p>
                    <p className="text-xs">No dose history found</p>
                  </div>
                )}
              </div>

              {/* Stats */}
              {doseHistory.length > 0 && (
                <div className="pt-3 border-t border-green-200">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-center">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                      <p className="font-medium">सामान्य प्रतिक्रिया</p>
                      <p className="text-green-700">
                        {
                          doseHistory.filter((d) => d.reaction === "normal")
                            .length
                        }
                        /{doseHistory.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <Calendar className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                      <p className="font-medium">अन्तिम मात्रा</p>
                      <p className="text-blue-700">
                        {doseHistory.length > 0
                          ? formatDate(doseHistory[0].date)
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Screening Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>स्क्रिनिङ फारम | Screening Form</CardTitle>
                <CardDescription>Fill in the screening details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Screening Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="screening_date">स्क्रिनिङ मिति *</Label>
                    <Input
                      id="screening_date"
                      type="date"
                      value={screeningData.screening_date}
                      onChange={(e) =>
                        handleInputChange("screening_date", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="screening_type">स्क्रिनिङ प्रकार *</Label>
                    <Select
                      value={screeningData.screening_type}
                      onValueChange={(value) =>
                        handleInputChange("screening_type", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                        <SelectItem value="routine">Routine Check</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Dose Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    स्वर्णप्राशन विवरण
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="dose_amount">मात्रा (थोपा) *</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="dose_amount"
                          value={screeningData.dose_amount}
                          onChange={(e) =>
                            handleInputChange("dose_amount", e.target.value)
                          }
                          placeholder="2-6 थोपा"
                          required
                        />
                        <div className="flex items-center gap-1">
                          {Array.from(
                            {
                              length:
                                Number.parseInt(screeningData.dose_amount) || 1,
                            },
                            (_, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 bg-amber-400 rounded-full"
                              ></div>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="administered_by">
                        सेवन गराउने व्यक्ति *
                      </Label>
                      <select
                        id="administered_by"
                        value={
                          screeningData.administered_by ||
                          commonAdministrators[0]
                        }
                        onChange={(e) =>
                          handleInputChange("administered_by", e.target.value)
                        }
                        className="w-full border rounded-md p-2"
                        required
                      >
                        {commonAdministrators.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>

                      {/* <Label htmlFor="administered_by">
                        सेवन गराउने व्यक्ति *
                      </Label>
                      <Input
                        id="administered_by"
                        value={screeningData.administered_by}
                        onChange={(e) =>
                          handleInputChange("administered_by", e.target.value)
                        }
                        placeholder="डाक्टर/नर्सको नाम"
                        required
                      /> */}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="batch_number">ब्याच नम्बर</Label>
                      <Input
                        id="batch_number"
                        value={screeningData.batch_number}
                        onChange={(e) =>
                          handleInputChange("batch_number", e.target.value)
                        }
                        placeholder="Auto-generated"
                      />
                    </div>
                    <div>
                      <Label htmlFor="next_dose_date">अर्को मात्रा मिति</Label>
                      <Input
                        id="next_dose_date"
                        type="date"
                        value={screeningData.next_dose_date}
                        onChange={(e) =>
                          handleInputChange("next_dose_date", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Physical Measurements */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    शारीरिक मापदण्ड
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="weight">तौल (कि.ग्रा.)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={screeningData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height">उचाई (से.मि.)</Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.1"
                        value={screeningData.height}
                        onChange={(e) =>
                          handleInputChange("height", e.target.value)
                        }
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="muac">MUAC (से.मि.)</Label>
                      <Input
                        id="muac"
                        type="number"
                        step="0.1"
                        value={screeningData.muac}
                        onChange={(e) =>
                          handleInputChange("muac", e.target.value)
                        }
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temperature">तापक्रम (°F)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        value={screeningData.temperature}
                        onChange={(e) =>
                          handleInputChange("temperature", e.target.value)
                        }
                        placeholder="98.6"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Reaction and Notes */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="child_reaction">
                      बच्चाको प्रतिक्रिया *
                    </Label>
                    <Select
                      value={screeningData.child_reaction}
                      onValueChange={(value) =>
                        handleInputChange("child_reaction", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">सामान्य (Normal)</SelectItem>
                        <SelectItem value="mild_reaction">
                          हल्का प्रतिक्रिया (Mild Reaction)
                        </SelectItem>
                        <SelectItem value="adverse">
                          प्रतिकूल प्रतिक्रिया (Adverse Reaction)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">टिप्पणी</Label>
                    <Textarea
                      id="notes"
                      value={screeningData.notes}
                      onChange={(e) =>
                        handleInputChange("notes", e.target.value)
                      }
                      placeholder="कुनै विशेष टिप्पणी वा अवलोकन..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        स्क्रिनिङ सेभ गर्नुहोस्
                      </>
                    )}
                  </Button>
                  <Link href="/screening">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      {/* Safety Guidelines */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            सुरक्षा निर्देशनहरू:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • स्वर्णप्राशन दिनु अघि बच्चाको स्वास्थ्य अवस्था जाँच गर्नुहोस्
            </li>
            <li>• सही मात्रा र समयको पालना गर्नुहोस्</li>
            <li>• कुनै प्रतिकूल प्रतिक्रिया देखिएमा तुरुन्त रोक्नुहोस्</li>
            <li>• सबै जानकारी सही र पूर्ण रूपमा भर्नुहोस्</li>
            <li>• अर्को मात्रा पुष्य नक्षत्रमा मात्र दिनुहोस्</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
