"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface SelfRegistration {
  unique_id: string;
  gender: string;
  child_name: string;
  date_of_birth: string;
  age: string;
  guardian_name: string;
  father_name: string;
  mother_name: string;
  father_occupation: string;
  mother_occupation: string;
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

interface RegistrationData {
  gender: string;
  childName: string;
  dateOfBirth: string;
  age: string;
  guardianName: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  contactNumber: string;
  district: string;
  palika: string;
  healthConditions: string[];
  allergies: string;
  previousMedications: string;
  vaccinationStatus: string;
  weight: string;
  height: string;
  muac: string;
  headCircumference: string;
  chestCircumference: string;
  uniqueId?: string;
}

// ✅ Mapper function
const mapToRegistrationData = (record: SelfRegistration): RegistrationData => ({
  gender: record.gender,
  childName: record.child_name,
  dateOfBirth: record.date_of_birth,
  age: record.age,
  guardianName: record.guardian_name,
  fatherName: record.father_name,
  motherName: record.mother_name,
  fatherOccupation: record.father_occupation,
  motherOccupation: record.mother_occupation,
  contactNumber: record.contact_number,
  district: record.district,
  palika: record.palika,
  healthConditions: record.health_conditions || [],
  allergies: record.allergies,
  previousMedications: record.previous_medications,
  vaccinationStatus: record.vaccination_status,
  weight: record.weight,
  height: record.height,
  muac: record.muac,
  headCircumference: record.head_circumference,
  chestCircumference: record.chest_circumference,
  uniqueId: record.unique_id,
});

export default function Registration3Page() {
  const [searchValue, setSearchValue] = useState("");
  const [data, setData] = useState<SelfRegistration | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setErrorMsg("Please enter Unique ID or Contact Number");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setData(null);

    const { data: record, error } = await supabase
      .from("self_registrations")
      .select("*")
      .or(`unique_id.eq.${searchValue},contact_number.eq.${searchValue}`)
      .single();

    setLoading(false);

    if (error || !record) {
      console.error(error);
      setErrorMsg("No record found. Please check the input.");
    } else {
      setData(record); // ✅ Show result in card
    }
  };

  const handleProceed = (record: SelfRegistration) => {
    const mapped = mapToRegistrationData(record);
    localStorage.setItem("prefillData", JSON.stringify(mapped));

    // ✅ Redirect volunteer to Step 3
    window.location.href = "/register?step=3";
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Search Registration</h1>

      {/* Search Form */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter Unique ID or Contact Number"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {errorMsg && <p className="text-red-600">{errorMsg}</p>}

      {/* Display Result in Card */}
      {data && (
        <div
          className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
          onClick={() => handleProceed(data)}
        >
          <h2 className="text-xl font-semibold mb-4">Registration Found ✅</h2>
          <p>
            <strong>Unique ID:</strong> {data.unique_id}
          </p>
          <p>
            <strong>Child Name:</strong> {data.child_name}
          </p>
          <p>
            <strong>Guardian:</strong> {data.guardian_name}
          </p>
          <p>
            <strong>Contact:</strong> {data.contact_number}
          </p>
          <p>
            <strong>District:</strong> {data.district}
          </p>
          <p>
            <strong>Palika:</strong> {data.palika}
          </p>

          <p className="mt-4 text-blue-600 text-sm">
            👉 Click this card to continue to Step 3
          </p>
        </div>
      )}
    </div>
  );
}
