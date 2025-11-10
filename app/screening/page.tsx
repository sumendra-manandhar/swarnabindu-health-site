"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  ArrowLeft,
  Users,
  Calendar,
  Phone,
  MapPin,
  Plus,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Patient {
  id: string;
  serial_no: string;
  child_name: string;
  birth_date: string;
  age: string;
  gender: string;
  guardian_name?: string;
  father_name?: string;
  mother_name?: string;
  contact_number: string;
  district: string;
  palika: string;
  ward: string;
  date: string;
  reg_id: string;
}

export default function ScreeningPage() {
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (queryInput?: string) => {
    const query = (queryInput || searchTerm).trim();

    if (!query) {
      setErrorMsg("⚠️ Please enter Unique ID or Contact Number");
      setFilteredPatients([]);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setFilteredPatients([]);

    // Step 1: Find patient
    const { data: patient, error: patientError } = await supabase
      .from("registrations")
      .select("*")
      .or(`reg_id.eq.${searchTerm},contact_number.eq.${searchTerm}`)
      .single();

    if (patientError) {
      console.error("❌ Error fetching patient:", patientError);
    } else if (patient) {
      // Step 2: Use patient.id (UUID) to load dose logs
      const { data: doseLogs, error: doseError } = await supabase
        .from("dose_logs")
        .select("*")
        .eq("patient_id", patient.reg_id)
        .order("created_at", { ascending: false });

      if (doseError) {
        console.error("❌ Error fetching dose logs:", doseError);
      } else {
        console.log("✅ Dose logs:", doseLogs);
      }
    }

    try {
      const { data: record, error } = await supabase
        .from("registrations")
        .select("*")
        .or(`reg_id.eq.${query},contact_number.eq.${query}`);

      if (error) throw error;

      if (!record || record.length === 0) {
        setErrorMsg("❌ No record found. Please check the input.");
      } else {
        const patients = record.map((reg: Patient) => ({
          reg_id: reg.reg_id,
          id: reg.id,
          serial_no: reg.serial_no || "",
          child_name: reg.child_name || "",
          birth_date: reg.birth_date || "",
          age: reg.age || "",
          gender: reg.gender || "",
          guardian_name: reg.guardian_name || "",
          father_name: reg.father_name || "",
          mother_name: reg.mother_name || "",
          contact_number: reg.contact_number || "",
          district: reg.district || "",
          palika: reg.palika || "",
          ward: reg.ward || "",
          date: reg.date || "",
        }));

        setFilteredPatients(patients);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("⚠️ Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">स्क्रिनिङ | Patient Screening</h1>
          <p className="text-muted-foreground">
            Find patients and conduct follow-up screenings
          </p>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>बिरामी खोज्नुहोस् | Find Patient</CardTitle>
          <CardDescription>
            Search for a patient using Unique ID or Contact Number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter Unique ID or Contact Number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Tab") {
                    e.preventDefault();

                    let query = searchTerm;

                    if (/^\d+$/.test(searchTerm) && searchTerm.length <= 6) {
                      query = `LDT-${searchTerm.padStart(4, "0")}`;
                      setSearchTerm(query); // update input display
                    }

                    handleSearch(query); // pass the formatted query directly
                  }
                }}
                className="pl-10"
              />
              {/* Hint below the input */}
              <p className="text-xs text-muted-foreground mt-1">
                Tip: You can type only the number and press <kbd>Tab</kbd> to
                auto-fill the full REG ID (LDT-XXXX). You can also search using
                the contact number.
              </p>
            </div>
            <Button onClick={() => handleSearch()} disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </Button>
          </div>

          {errorMsg && (
            <Alert className="mt-4">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {filteredPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({filteredPatients.length})</CardTitle>
            <CardDescription>Select a patient for screening</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="grid gap-4">
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="border-2 hover:border-blue-300 transition-colors"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-blue-600">
                                {patient.child_name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Serial: {patient.reg_id}
                              </p>
                            </div>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded">
                              {getGenderDisplay(patient.gender)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">अभिभावक:</span>
                                <span>
                                  {patient.guardian_name ||
                                    patient.father_name ||
                                    patient.mother_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">सम्पर्क:</span>
                                <span>{patient.contact_number}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">उमेर:</span>
                                <span>{patient.age}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">ठेगाना:</span>
                                <span>
                                  {patient.district}, {patient.palika}-
                                  {patient.ward}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="ml-6">
                          <Link
                            href={`/screening/new?patientId=${patient.reg_id}`}
                          >
                            <p>{patient.reg_id}</p>
                            Add Screening
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
