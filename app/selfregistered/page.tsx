"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, QrCode, Search } from "lucide-react";

// ✅ Dynamically import Scanner
const Scanner = dynamic(
  () => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner),
  { ssr: false }
);

interface SelfRegistration {
  unique_id: string;
  gender: string;
  child_name: string;
  date_of_birth: string;
  age: string;
  guardian_name: string;
  father_name: string;
  mother_name: string;
  contact_number: string;
  district: string;
  palika: string;
  health_conditions: string[];
  allergies: string;
  previous_medications: string;
  vaccination_status: string;
  weight: string;
  height: string;
  muac: string;
  head_circumference: string;
  chest_circumference: string;
  created_at: string;
}

export default function Registration3Page() {
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<SelfRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanOpen, setScanOpen] = useState(false);

  const handleSearch = async (value?: string) => {
    const query = value || searchValue;

    if (!query.trim()) {
      setErrorMsg("⚠️ Please enter Unique ID or Contact Number");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setData(null);

    const { data: record, error } = await supabase
      .from("self_registrations")
      .select("*")
      .or(`unique_id.eq.${query},contact_number.eq.${query}`)
      .single();

    setLoading(false);

    if (error || !record) {
      console.error(error);
      setErrorMsg("❌ No record found. Please check the input.");
    } else {
      setData(record);
    }
  };

  const handleProceed = (record: SelfRegistration) => {
    localStorage.setItem("prefillData", JSON.stringify(record));
    window.location.href = "/register?step=3";
  };

  
type QrScannerResult = {
  rawValue: string;
  format: string;
};

  // ✅ QR Scan Handler
 const handleScan = (results: QrScannerResult[] | null) => {
  if (results && results[0]?.rawValue) {
    try {
      const parsed = JSON.parse(results[0].rawValue);
      if (parsed.uniqueId) {
        setSearchValue(parsed.uniqueId);
        handleSearch(parsed.uniqueId);
        setScanOpen(false);
      } else if (parsed.contactNumber) {
        setSearchValue(parsed.contactNumber);
        handleSearch(parsed.contactNumber);
        setScanOpen(false);
      }
    } catch (err) {
      console.error("Invalid QR code:", err);
      setErrorMsg("⚠️ Invalid QR code format");
    }
  }
};


  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🔍 Search Registration
      </h1>

      {/* Search Bar */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Enter Unique ID or Contact Number"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => handleSearch()} disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search />}
        </Button>
        <Button variant="outline" onClick={() => setScanOpen(true)}>
          <QrCode className="h-5 w-5 mr-1" /> Scan
        </Button>
      </div>

      {/* Error */}
      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

      {/* Result Card */}
      {data && (
        <Card
          className="cursor-pointer hover:shadow-xl transition-all border-blue-200"
          onClick={() => handleProceed(data)}
        >
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-semibold text-blue-700">
              ✅ Registration Found
            </h2>
            <p><strong>Unique ID:</strong> {data.unique_id}</p>
            <p><strong>Child Name:</strong> {data.child_name}</p>
            <p><strong>Guardian:</strong> {data.guardian_name}</p>
            <p><strong>Contact:</strong> {data.contact_number}</p>
            <p><strong>District:</strong> {data.district}</p>
            <p><strong>Palika:</strong> {data.palika}</p>

            <p className="mt-4 text-blue-600 text-sm">
              👉 Click this card to continue to Step 3
            </p>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Modal */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>📷 Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center">
            <Scanner
              onScan={handleScan}
              // components={{ audio: false }}
              styles={{ container: { width: "100%" } }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Hold the QR code inside the frame
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
