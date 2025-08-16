"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
// import { QRScanner } from "@/components/qr-scanner"
import { OfflineStorage } from "@/lib/offline-storage";
// import { DatabaseService } from "@/lib/supabase"
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
  localId?: string;
}

export default function ScreeningPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadPatients();

    const handleOnline = () => {
      setIsOnline(true);
      loadPatients();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    filterPatients();
  }, [patients, searchTerm]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      let allPatients: Patient[] = [];

      // Load offline data first
      const offlineRegistrations = OfflineStorage.getAllLocalRegistrations();
      const offlinePatients = offlineRegistrations.map((reg) => ({
        id: reg.localId || reg.id,
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
        date: reg.date || reg.created_at,
        localId: reg.localId || reg.id,
      }));

      allPatients = [...offlinePatients];

      // Try to load from Supabase if online
      // if (isOnline) {
      //   try {
      //     const { data: onlineData, error } = await DatabaseService.getRegistrations()
      //     if (onlineData && !error) {
      //       const onlinePatients = onlineData.map((reg: any) => ({
      //         id: reg.id,
      //         serial_no: reg.serial_no || "",
      //         child_name: reg.child_name || "",
      //         birth_date: reg.birth_date || "",
      //         age: reg.age || "",
      //         gender: reg.gender || "",
      //         guardian_name: reg.guardian_name || "",
      //         father_name: reg.father_name || "",
      //         mother_name: reg.mother_name || "",
      //         contact_number: reg.contact_number || "",
      //         district: reg.district || "",
      //         palika: reg.palika || "",
      //         ward: reg.ward || "",
      //         date: reg.date || reg.created_at,
      //       }))

      //       // Merge online and offline data, avoiding duplicates
      //       const mergedPatients = [...allPatients]
      //       onlinePatients.forEach((onlinePatient) => {
      //         const existsOffline = allPatients.some(
      //           (offlinePatient) =>
      //             offlinePatient.serial_no === onlinePatient.serial_no ||
      //             (offlinePatient.child_name === onlinePatient.child_name &&
      //               offlinePatient.contact_number === onlinePatient.contact_number),
      //         )
      //         if (!existsOffline) {
      //           mergedPatients.push(onlinePatient)
      //         }
      //       })
      //       allPatients = mergedPatients
      //     }
      //   } catch (error) {
      //     console.error("Error loading online patients:", error)
      //   }
      // }

      setPatients(allPatients);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm) {
      setFilteredPatients([]);
      return;
    }

    const filtered = patients.filter(
      (patient) =>
        patient.child_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contact_number?.includes(searchTerm) ||
        patient.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.guardian_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        patient.father_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.mother_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredPatients(filtered);
  };

  // const handleQRScan = (data: string) => {
  //   try {
  //     const qrData = JSON.parse(data);
  //     if (qrData.serial) {
  //       setSearchTerm(qrData.serial);
  //     } else if (qrData.name) {
  //       setSearchTerm(qrData.name);
  //     }
  //     setShowQRScanner(false);
  //   } catch (error) {
  //     // If not JSON, treat as plain text search
  //     setSearchTerm(data);
  //     setShowQRScanner(false);
  //   }
  // };

  // const formatDate = (dateString: string) => {
  //   if (!dateString) return "";
  //   return new Date(dateString).toLocaleDateString("ne-NP");
  // };

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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading patients...</p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Connection Status */}
      {!isOnline && (
        <Alert>
          <AlertDescription>
            Youre working offline. Showing locally stored patient data.
          </AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>बिरामी खोज्नुहोस् | Find Patient</CardTitle>
          <CardDescription>
            Search for a patient to conduct screening
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="बच्चाको नाम, सम्पर्क नम्बर, वा सिरियल नम्बर खोज्नुहोस्..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowQRScanner(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              QR Scan
            </Button>
          </div>

          {searchTerm && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Found {filteredPatients.length} patient(s) matching
                {searchTerm}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>QR Code Scanner</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQRScanner(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* <QRScanner onScan={handleQRScan} /> */}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results */}
      {searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results ({filteredPatients.length})</CardTitle>
            <CardDescription>
              Select a patient to conduct screening
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPatients.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No patients found matching your search. Try a different search
                  term or check the spelling.
                </AlertDescription>
              </Alert>
            ) : (
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
                                  Serial: {patient.serial_no}
                                </p>
                              </div>
                              <Badge variant="outline">
                                {getGenderDisplay(patient.gender)}
                              </Badge>
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
                              href={`/screening/new?patientId=${
                                patient.id
                              }&patientName=${encodeURIComponent(
                                patient.child_name
                              )}`}
                            >
                              <Button
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="mr-2 h-5 w-5" />
                                स्क्रिनिङ
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!searchTerm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-3">निर्देशनहरू:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • बच्चाको नाम, सम्पर्क नम्बर, वा सिरियल नम्बर प्रयोग गरेर
                खोज्नुहोस्
              </li>
              <li>• QR कोड स्क्यान गरेर छिटो खोज्न सक्नुहुन्छ</li>
              <li>• बिरामी भेटिएपछि स्क्रिनिङ बटन थिच्नुहोस्</li>
              <li>
                • स्क्रिनिङ फारम भरेर बच्चाको स्वास्थ्य अवस्था रेकर्ड गर्नुहोस्
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
