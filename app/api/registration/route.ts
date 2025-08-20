// import { type NextRequest, NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";

// export async function POST(request: NextRequest) {
//   alert("Registration API called");
//   try {
//     const data = await request.json();
//     const supabase = await createClient();

//     // Transform the data to match database schema
//     const dbData = {
//       gender: data.gender,
//       child_name: data.childName,
//       date_of_birth: data.dateOfBirth,
//       guardian_name: data.guardianName,
//       father_name: data.fatherName,
//       mother_name: data.motherName,
//       father_occupation: data.fatherOccupation,
//       mother_occupation: data.motherOccupation,
//       contact_number: data.contactNumber,
//       district: data.district,
//       palika: data.palika,
//       health_conditions: data.healthConditions?.join(","),
//       allergies: data.allergies,
//       previous_medications: data.previousMedications,
//       vaccination_status: data.vaccinationStatus,
//       weight: data.weight,
//       height: data.height,
//       muac: data.muac,
//       head_circumference: data.headCircumference,
//       chest_circumference: data.chestCircumference,
//       // administered_by: data.administeredBy,
//       batch_number: data.batchNumber,
//       consent_given: data.consentGiven,
//       dose_amount: data.doseAmount,
//       notes: data.notes,
//       eligibility_confirmed: data.eligibilityConfirmed,
//       created_at: new Date().toISOString(),
//     };

//     const { data: result, error } = await supabase
//       // .from("registration_data")
//       // .insert([dbData])
//       // .select();
//       .from("registrations")
//       .select("*")
//       .limit(1);

//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ success: true, data: result[0] });
//   } catch (error) {
//     console.error("API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   try {
//     const supabase = await createClient();

//     const { data, error } = await supabase
//       .from("registration_data")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json({ error: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ data });
//   } catch (error) {
//     console.error("API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
