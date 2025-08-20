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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OfflineStorage } from "@/lib/offline-storage";
import {
  ArrowLeft,
  Database,
  Users,
  FileText,
  Trash2,
  Eye,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  Calendar,
  Phone,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { SyncManager } from "./sync-manager";
import { supabase } from "@/lib/supabase";

/* Field mapping: camelCase → snake_case (matching Supabase schema) */
const snakeCaseMap: Record<string, string> = {
  gender: "gender",
  childName: "child_name",
  dateOfBirth: "date_of_birth",
  guardianName: "guardian_name",
  fatherName: "father_name",
  motherName: "mother_name",
  fatherOccupation: "father_occupation",
  motherOccupation: "mother_occupation",
  contactNumber: "contact_number",
  district: "district",
  palika: "palika",
  healthConditions: "health_conditions",
  allergies: "allergies",
  previousMedications: "previous_medications",
  vaccinationStatus: "vaccination_status",
  weight: "weight",
  height: "height",
  muac: "muac",
  headCircumference: "head_circumference",
  chestCircumference: "chest_circumference",
  administeredBy: "administered_by",
  batchNumber: "batch_number",
  consentGiven: "consent_given",
  doseAmount: "dose_amount",
  notes: "notes",
  eligibilityConfirmed: "eligibility_confirmed",
};

/* Convert camelCase data to snake_case & filter out extra keys */
function sanitizeRegistration(data: Record<string, any>) {
  const sanitized: Record<string, any> = {};
  for (const key in snakeCaseMap) {
    if (data[key] !== undefined) {
      sanitized[snakeCaseMap[key]] = data[key];
    }
  }
  return sanitized;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
interface OfflineRegistration {
  id: string;
  data: any;
  timestamp: string;
  synced: boolean;
  syncedAt?: string;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
interface OfflineScreening {
  id: string;
  data: any;
  timestamp: string;
  synced: boolean;
  syncedAt?: string;
}
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function SyncPage() {
  const [pendingRegistrations, setPendingRegistrations] = useState<
    OfflineRegistration[]
  >([]);
  const [pendingScreenings, setPendingScreenings] = useState<
    OfflineScreening[]
  >([]);
  const [allRegistrations, setAllRegistrations] = useState<
    OfflineRegistration[]
  >([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "synced">(
    "all"
  );

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadPendingData();

    const handleOnline = () => {
      setIsOnline(true);
      loadPendingData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const loadPendingData = () => {
    const unsynced = OfflineStorage.getUnsyncedRegistrations();
    const unsyncedScreenings = OfflineStorage.getUnsyncedScreenings();
    const allRegs = OfflineStorage.getOfflineRegistrations();

    setPendingRegistrations(unsynced);
    setPendingScreenings(unsyncedScreenings);
    setAllRegistrations(allRegs);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      alert("Cannot sync while offline.");
      return;
    }

    setSyncing(true);
    try {
      const pendingRegs = OfflineStorage.getUnsyncedRegistrations();
      const pendingScreens = OfflineStorage.getUnsyncedScreenings();

      if (pendingRegs.length === 0 && pendingScreens.length === 0) {
        alert("No pending items to sync.");
        return;
      }

      const registrationPayload = pendingRegs.map((r) =>
        sanitizeRegistration(r.data)
      );
      const { error: supabaseError } = await supabase
        .from("registrations")
        .insert(registrationPayload);

      if (supabaseError) {
        console.error("❌ Supabase insert error:", supabaseError);
        alert("Sync failed: " + supabaseError.message);
        return;
      }

      // Mark as synced
      pendingRegs.forEach((r) => OfflineStorage.markRegistrationSynced(r.id));
      pendingScreens.forEach((s) => OfflineStorage.markScreeningSynced(s.id));
      loadPendingData();

      alert(
        `✅ Synced ${pendingRegs.length} registrations and ${pendingScreens.length} screenings.`
      );
    } catch (error) {
      console.error("❌ Manual sync error:", error);
      alert("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  };

  const clearAllData = () => {
    if (
      confirm(
        "Are you sure you want to clear all offline data? This cannot be undone."
      )
    ) {
      OfflineStorage.clearAllData();
      loadPendingData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ne-NP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const viewItemDetails = (item: OfflineRegistration | OfflineScreening) => {
    setSelectedItem(item);
  };

  const getFilteredRegistrations = () => {
    switch (activeTab) {
      case "pending":
        return allRegistrations.filter((r) => !r.synced);
      case "synced":
        return allRegistrations.filter((r) => r.synced);
      default:
        return allRegistrations;
    }
  };

  const PatientCard = ({
    registration,
  }: {
    registration: OfflineRegistration;
  }) => (
    <div className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-500" />
            <h3 className="font-semibold text-lg">
              {registration.data.childName || "Unknown Child"}
            </h3>
            <Badge variant={registration.synced ? "default" : "secondary"}>
              {registration.synced ? "Synced" : "Pending"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span className="font-medium">Serial:</span>
              <span>{registration.data.serial_no}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{registration.data.contactNumber}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Guardian:</span>
              <span>{registration.data.guardianName}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{registration.data.dateOfBirth}</span>
            </div>
            <div className="flex items-center gap-1 md:col-span-2">
              <MapPin className="h-3 w-3" />
              <span>
                {registration.data.district} - {registration.data.palika}
              </span>
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Created: {formatDate(registration.timestamp)}
            {registration.syncedAt && (
              <span className="ml-2">
                • Synced: {formatDate(registration.syncedAt)}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => viewItemDetails(registration)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

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
          <h1 className="text-3xl font-bold">Data Synchronization</h1>
          <p className="text-muted-foreground">
            Manage offline data and sync with server
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isOnline ? (
            <Badge variant="default" className="bg-green-500">
              <Wifi className="mr-1 h-3 w-3" />
              Online
            </Badge>
          ) : (
            <Badge variant="destructive">
              <WifiOff className="mr-1 h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sync Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync Controls</CardTitle>
              <CardDescription>Manage data synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleManualSync}
                disabled={!isOnline || syncing}
                className="w-full"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Manual Sync
                  </>
                )}
              </Button>

              <Button
                variant="destructive"
                onClick={clearAllData}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Data
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Manual sync uploads all pending data</p>
                <p>• Auto-sync happens when you go online</p>
                <p>• Clear data removes all local storage</p>
              </div>
            </CardContent>
          </Card>

          <SyncManager />
        </div>

        {/* Data Overview */}
        <div className="lg:col-span-3 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Patients
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {allRegistrations.length}
                </div>
                <p className="text-xs text-muted-foreground">Stored locally</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Sync
                </CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {pendingRegistrations.length}
                </div>
                <p className="text-xs text-muted-foreground">Need to sync</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synced</CardTitle>
                <FileText className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {allRegistrations.filter((r) => r.synced).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Successfully synced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Screenings
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {pendingScreenings.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Pending screenings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Patient Data Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Patient Data ({getFilteredRegistrations().length})
                  </CardTitle>
                  <CardDescription>
                    All patient registrations stored locally
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("all")}
                  >
                    All ({allRegistrations.length})
                  </Button>
                  <Button
                    variant={activeTab === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("pending")}
                  >
                    Pending ({pendingRegistrations.length})
                  </Button>
                  <Button
                    variant={activeTab === "synced" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("synced")}
                  >
                    Synced ({allRegistrations.filter((r) => r.synced).length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFilteredRegistrations().length === 0 ? (
                <Alert>
                  <AlertDescription>
                    {activeTab === "all" &&
                      "No patient data found. Register some patients to see them here."}
                    {activeTab === "pending" &&
                      "No pending patients. All data is synced with the server."}
                    {activeTab === "synced" && "No synced patients yet."}
                  </AlertDescription>
                </Alert>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {getFilteredRegistrations().map((reg) => (
                      <PatientCard key={reg.id} registration={reg} />
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Pending Screenings */}
          {pendingScreenings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Pending Screenings ({pendingScreenings.length})
                </CardTitle>
                <CardDescription>
                  Screening data waiting to be synced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {pendingScreenings.map((screening) => (
                      <div
                        key={screening.id}
                        className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50"
                      >
                        <div>
                          <p className="font-medium">
                            {screening.data.screening_type || "Unknown"}{" "}
                            Screening
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Patient: {screening.data.patient_name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Created: {formatDate(screening.timestamp)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Screening</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewItemDetails(screening)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Details</CardTitle>
                  <CardDescription>
                    {selectedItem.data.child_name || "Unknown Patient"} -
                    {selectedItem.synced ? " Synced" : " Pending Sync"}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {/* Patient Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Patient Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Name:</span>{" "}
                          {selectedItem.data.child_name}
                        </p>
                        <p>
                          <span className="font-medium">Serial:</span>{" "}
                          {selectedItem.data.serial_no}
                        </p>
                        <p>
                          <span className="font-medium">DOB:</span>{" "}
                          {selectedItem.data.date_of_birth}
                        </p>
                        <p>
                          <span className="font-medium">Guardian:</span>{" "}
                          {selectedItem.data.guardian_name}
                        </p>
                        <p>
                          <span className="font-medium">Contact:</span>{" "}
                          {selectedItem.data.contact_number}
                        </p>
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {selectedItem.data.address}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">System Information</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">Local ID:</span>{" "}
                          {selectedItem.id}
                        </p>
                        <p>
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(selectedItem.timestamp)}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          {selectedItem.synced ? "Synced" : "Pending"}
                        </p>
                        {selectedItem.syncedAt && (
                          <p>
                            <span className="font-medium">Synced At:</span>{" "}
                            {formatDate(selectedItem.syncedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Raw Data */}
                  <div>
                    <h4 className="font-semibold mb-2">Raw Data (JSON)</h4>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(selectedItem, null, 2)}
                    </pre>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
