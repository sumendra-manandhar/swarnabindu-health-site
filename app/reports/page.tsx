"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  Search,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Droplets,
} from "lucide-react";
import Link from "next/link";
// import { OfflineStorage } from "@/lib/offline-storage"; // Assuming these are unused or globally defined
import { supabase } from "@/lib/supabase"; // Make sure this path is correct

// --- INTERFACE DEFINITIONS ---

interface RegistrationRecord {
  id: string;
  childName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  guardianName: string;
  contactNumber: string;
  dose_amount: string;
  dose_time: string;
  administered_by: string;
  child_reaction: string;
  weight: number;
  vaccination_status: string;
  date: string;
  serial_no: string;
  district: string;
  palika: string;
  ward: string;
}

interface ScreeningRecord {
  id: string;
  patient_id: string;
  screening_date: string;
  dose_amount: string;
  child_reaction: string;
  administered_by: string;
  batch_number: string;
  notes: string;
  screening_type?: string;
}

interface SelfRegistration {
  created_at: string;
  gender: string;
  child_name: string;
  date_of_birth: string;
  guardian_name: string;
  father_name: string;
  mother_name: string;
  contact_number: string;
  district: string;
  palika: string;
  allergies: string;
  previous_medications: string;
  vaccination_status: string;
  weight: string;
  height: string;
  age: string;
  unique_id: string;
}

// --- UTILITIES & MAPPING ---

const districtTableMap = {
  चितवन: "chitwan_registrations",
  बुटवल: "butwal_registrations",
  काठमांडौ: "kathmandu_registrations",
  देवदह: "devdaha_registrations",
  सैनीमाइना: "sainamaina_registrations",
  कञ्चन: "kanchan_registrations",
  गैदहवा: "gaidahawa_registrations",
  सिद्धोधान: "suddhodhan_registrations",
  सियारी: "siyari_registrations",
  तिलोत्तमा: "tilottama_registrations",
} as const;

const getUserDistrict = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const storedUser = localStorage.getItem("auth_user");
  if (!storedUser) return undefined;

  try {
    const user = JSON.parse(storedUser) as { district?: string };
    return user.district;
  } catch {
    return undefined;
  }
};

// --- MAIN COMPONENT ---

export default function ReportsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [totalScreeningsCount, setTotalScreeningCount] = useState<
    ScreeningRecord[]
  >([]);
  const [filteredData, setFilteredData] = useState<RegistrationRecord[]>([]);
  const [selfRegistrations, setSelfRegistrations] = useState<
    SelfRegistration[]
  >([]);

  // Filters and UI State
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [reactionFilter, setReactionFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  // Pagination numbers
  const totalRecords = filteredData.length;

  const [currentPage, setCurrentPage] = useState(1);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalDoseCount, setTotalDoseCount] = useState(0);
  const limit = 100; // rows per page

  const userDistrict = getUserDistrict() || "दाङ";
  const registrationTable =
    districtTableMap[userDistrict as keyof typeof districtTableMap] ||
    "registrations";

  // --- DATA FETCHING & LIFECYCLE ---

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setRole(parsedUser.role);
    }
  }, []);

  // Fetch Total Count
  const fetchTotalCount = async () => {
    const { count, error } = await supabase
      .from(registrationTable)
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching count:", error);
      return;
    }
    setTotalCount(count || 0);
  };

  // Fetch Paginated Registrations
  const fetchRegistrations = async (pageNum: number) => {
    setLoading(true);
    try {
      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from(registrationTable)
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (count !== null) setTotalCount(count);

      const mappedServerData = (data || []).map((record: any) => ({
        id: record.id,
        childName: record.childName || record.child_name || record.name || "",
        dateOfBirth: record.dateOfBirth || record.date_of_birth || "",
        age: record.age || "",
        gender: record.gender || "",
        guardianName:
          record.guardianName ||
          record.guardian_name ||
          record.father_name ||
          record.mother_name ||
          "",
        contactNumber: record.contactNumber || record.contact_number || "",
        dose_amount: record.dose_amount || record.doseAmount || "2",
        dose_time: record.dose_time || new Date().toLocaleTimeString("ne-NP"),
        administered_by: record.administered_by || "स्वास्थ्यकर्मी",
        child_reaction: record.child_reaction || "normal",
        weight: record.weight || 0,
        vaccination_status: record.vaccination_status || "completed",
        date:
          record.date ||
          record.created_at ||
          new Date().toLocaleDateString("ne-NP"),
        serial_no: record.serial_no || record.serialNo || `SB${record.id}`,
        district: record.district || userDistrict,
        palika: record.palika || "",
        ward: record.ward || "",
      }));

      setRegistrations(mappedServerData);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalDose = async (pageNum: number) => {
    setLoading(true);
    try {
      const from = (pageNum - 1) * limit;
      const to = from + limit - 1;

      const { data, error, count } = await supabase
        .from("dose_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      if (count !== null) setTotalDoseCount(count);

      const mappedServerData = data;

      setScreenings(mappedServerData);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Self Registrations and Screenings
  useEffect(() => {
    const fetchSelfRegs = async () => {
      const { data, error } = await supabase
        .from("self_registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) console.error("Error fetching self regs:", error);
      else setSelfRegistrations(data || []);
    };

    const fetchTodayScreeningRegs = async () => {
      const { count, data, error } = await supabase
        .from("dose_logs")

        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) console.error("Error fetching screening logs:", error);
      else setScreenings(data || []);
    };

    // Fetch Total Count

    fetchSelfRegs();
    fetchTodayScreeningRegs();
  }, []);

  // Initial load and page change effects
  useEffect(() => {
    // 1. Fetch total count once
    fetchTotalCount();
    // 2. Fetch the first page (or current page) of data
    fetchRegistrations(page);
  }, [registrationTable]); // Refetch when district/table changes

  useEffect(() => {
    // Fetch new data when page changes
    fetchRegistrations(page);
  }, [page]); // Refetch when page changes
  useEffect(() => {
    // Fetch new data when page changes
    fetchTotalDose(page);
  }, [page]); // Refetch when page changes

  // Filtering effect
  useEffect(() => {
    // Filter the *current page's* data
    filterData();
  }, [registrations, searchTerm, genderFilter, reactionFilter, districtFilter]);

  // --- DATA PROCESSING & FILTERS ---

  const filterData = () => {
    let filtered = registrations;

    // Apply all filters to the currently loaded 100 records
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.guardianName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.serial_no.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genderFilter !== "all") {
      filtered = filtered.filter((record) => record.gender === genderFilter);
    }

    if (districtFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.district === districtFilter
      );
    }

    if (reactionFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.child_reaction === reactionFilter
      );
    }

    setFilteredData(filtered);
  };

  // --- EXPORT FUNCTION ---

  // const exportToCSV = () => {
  //   const headers = [
  //     "सिरियल नम्बर",
  //     "बालकको नाम",
  //     "जन्म मिति",
  //     "उमेर",
  //     "लिङ्ग",
  //     "अभिभावक",
  //     "सम्पर्क",
  //     "जिल्ला",
  //     "पालिका",
  //     "वडा",
  //     "मात्रा",
  //     "समय",
  //     "सेवन गराउने",
  //     "प्रतिक्रिया",
  //     "तौल",
  //     "खोप स्थिति",
  //     "दर्ता मिति",
  //   ];

  //   debugger;

  //   const csvContent = [
  //     headers.join(","),
  //     ...filteredData.map((record) =>
  //       [
  //         record.serial_no,
  //         record.childName,
  //         record.dateOfBirth,
  //         record.age,
  //         record.gender === "male" ? "पुरुष" : "महिला",
  //         record.guardianName,
  //         record.contactNumber,
  //         record.district,
  //         record.palika,
  //         record.ward,
  //         `${record.dose_amount} थोपा`,
  //         record.dose_time,
  //         record.administered_by,
  //         record.child_reaction === "normal" ? "सामान्य" : "प्रतिक्रिया",
  //         `${record.weight} कि.ग्रा.`,
  //         record.vaccination_status,
  //         record.date,
  //       ].join(",")
  //     ),
  //   ].join("\n");

  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute("href", url);
  //   link.setAttribute(
  //     "download",
  //     `swarnabindu-report-${new Date().toISOString().split("T")[0]}.csv`
  //   );
  //   link.style.visibility = "hidden";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  // Utility function to map raw server data (copied from previous solution)
  // const mapServerData = (data: any[]): RegistrationRecord[] => {
  //   // ... (map logic remains the same)
  //   return (data || []).map((record: any) => ({
  //     id: record.id,
  //     childName: record.childName || record.child_name || record.name || "",
  //     dateOfBirth: record.dateOfBirth || record.date_of_birth || "",
  //     age: record.age || "",
  //     gender: record.gender || "",
  //     guardianName:
  //       record.guardianName ||
  //       record.guardian_name ||
  //       record.father_name ||
  //       record.mother_name ||
  //       "",
  //     contactNumber: record.contactNumber || record.contact_number || "",
  //     dose_amount: record.dose_amount || record.doseAmount || "2",
  //     dose_time: record.dose_time || new Date().toLocaleTimeString("ne-NP"),
  //     administered_by: record.administered_by || "स्वास्थ्यकर्मी",
  //     child_reaction: record.child_reaction || "normal",
  //     weight: record.weight || 0,
  //     vaccination_status: record.vaccination_status || "completed",
  //     date:
  //       record.date ||
  //       record.created_at ||
  //       new Date().toLocaleDateString("ne-NP"),
  //     serial_no: record.serial_no || record.serialNo || `SB${record.id}`,
  //     district: record.district || userDistrict,
  //     palika: record.palika || "",
  //     ward: record.ward || "",
  //   }));
  // };
  const mapServerData = (data: any[]): any[] => {
    return (data || []).map((record: any) => ({
      // your existing mapping stays exactly the same
      id: record.id,
      childName: record.childName || record.child_name || record.name || "",
      dateOfBirth: record.dateOfBirth || record.date_of_birth || "",
      age: record.age || "",
      gender: record.gender || "",
      guardianName:
        record.guardianName ||
        record.guardian_name ||
        record.father_name ||
        record.mother_name ||
        "",
      contactNumber: record.contactNumber || record.contact_number || "",
      dose_amount: record.dose_amount || record.doseAmount || "2",
      dose_time: record.dose_time || new Date().toLocaleTimeString("ne-NP"),
      administered_by: record.administered_by || "स्वास्थ्यकर्मी",
      child_reaction: record.child_reaction || "normal",
      weight: record.weight || 0,
      vaccination_status: record.vaccination_status || "completed",
      date:
        record.date ||
        record.created_at ||
        new Date().toLocaleDateString("ne-NP"),
      serial_no: record.serial_no || record.serialNo || `SB${record.id}`,
      district: record.district || userDistrict,
      palika: record.palika || "",
      ward: record.ward || "",
    }));
  };

  // Add this line to your useState declarations in ReportsPage()
  const [exporting, setExporting] = useState(false);

  // **This is the core fix for exporting all data**

  const fetchAllRows = async () => {
    const pageSize = 1000; // Supabase max limit
    let allRows: any[] = [];
    let from = 0;
    let to = pageSize - 1;

    while (true) {
      const { data, error } = await supabase
        .from(registrationTable)
        .select("*")
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      allRows = allRows.concat(data);

      if (data.length < pageSize) break; // last page reached

      from += pageSize;
      to += pageSize;
    }

    return allRows;
  };

  // **This is the core fix for exporting all data**
  const exportAllData = async () => {
    registrations.length;
    setExporting(true);
    try {
      // 1. Fetch ALL data (without range limit)
      const data = await fetchAllRows();

      // 2. Map the entire dataset to the expected format
      let dataToExport = mapServerData(data);

      // 3. Re-apply current filters to the full dataset
      if (searchTerm) {
        dataToExport = dataToExport.filter(
          (record) =>
            record.childName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.guardianName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            record.serial_no.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      if (genderFilter !== "all") {
        dataToExport = dataToExport.filter(
          (record) => record.gender === genderFilter
        );
      }
      if (districtFilter !== "all") {
        dataToExport = dataToExport.filter(
          (record) => record.district === districtFilter
        );
      }
      if (reactionFilter !== "all") {
        dataToExport = dataToExport.filter(
          (record) => record.child_reaction === reactionFilter
        );
      }

      // 4. Generate CSV content
      const headers = [
        "क्रम संख्या", // NEW HEADER ADDED HERE
        "सिरियल नम्बर",
        "बालकको नाम",
        "जन्म मिति",
        "उमेर",
        "लिङ्ग",
        "अभिभावक",
        "सम्पर्क",
        "जिल्ला",
        "पालिका",
        "वडा",
        "मात्रा",
        "समय",
        "सेवन गराउने",
        "प्रतिक्रिया",
        "तौल",
        "खोप स्थिति",
        "दर्ता मिति",
      ];

      debugger;

      const csvContent = [
        headers.join(","),
        // Use map with index to generate the sequential ID
        ...dataToExport.map((record, index) =>
          [
            // ----------------------------------------------------
            index + 1, // <--- THE NEW SEQUENTIAL ID (starts at 1)
            // ----------------------------------------------------
            record.serial_no,
            record.childName,
            record.dateOfBirth,
            record.age,
            record.gender === "male" ? "पुरुष" : "महिला",
            record.guardianName,
            record.contactNumber,
            record.district,
            record.palika,
            record.ward,
            `${record.dose_amount} थोपा`,
            record.dose_time,
            record.administered_by,
            record.child_reaction === "normal" ? "सामान्य" : "प्रतिक्रिया",
            `${record.weight} कि.ग्रा.`,
            record.vaccination_status,
            record.date,
          ]
            .map(
              (value) =>
                // Wrap values in double quotes and escape internal quotes for CSV safety
                `"${String(value).replace(/"/g, '""')}"`
            )
            .join(",")
        ),
      ].join("\n");

      // 5. Trigger Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `swarnabindu-report-FULL-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting all data:", err);
      alert("Error exporting data. Please check your network or console.");
    } finally {
      setExporting(false);
    }
  };

  // **This is the core fix for exporting all data**

  const fetchAllDoseRows = async () => {
    const pageSize = 1000; // Supabase max limit
    let allRows: any[] = [];
    let from = 0;
    let to = pageSize - 1;
    debugger;

    while (true) {
      const { data, error } = await supabase
        .from("dose_logs")
        .select("*")
        .range(from, to)
        .order("created_at", { ascending: false });

      if (error) throw error;

      allRows = allRows.concat(data);

      if (data.length < pageSize) break; // last page reached

      from += pageSize;
      to += pageSize;
    }

    return allRows;
  };

  const exportAllDoseData = async () => {
    setExporting(true);
    try {
      // 1. Fetch ALL data (without range limit)
      const data = await fetchAllDoseRows();

      // 2. Map the entire dataset to the expected format
      const dataToExport = mapServerData(data);

      // 4. Generate CSV content
      const headers = [
        "क्रम संख्या",
        "रजिस्ट्रेशन आइडी",
        "बालकको आइडी",
        "स्क्रिनिङ्ग प्रकार",
        "स्क्रिनिङ मिति",
        "अर्को मात्रा मिति",
        "सेवन गराउने",
        "ब्याच नम्बर",
        "मात्रा (थोपा)",
        "प्रतिक्रिया",
        "तौल (कि.ग्रा.)",
        "उचाइ (से.मि.)",
        "MUAC (से.मि.)",
        "तापक्रम",
        "टिप्पणी",
        "दर्ता मिति",
      ];

      const csvContent = [
        headers.join(","),
        // Use map with index to generate the sequential ID
        ...dataToExport.map((record, index) =>
          [
            index + 1, // क्रम संख्या (1,2,3,...)
            record.reg_id ?? "", // रजिस्ट्रेशन आइडी
            record.patient_id ?? "", // बालकको आइडी
            record.screening_type === "follow_up"
              ? "पुनः अनुगमन"
              : "प्रारम्भिक", // स्क्रिनिङ प्रकार
            record.screening_date ?? "", // स्क्रिनिङ मिति
            record.next_dose_date ?? "", // अर्को मात्रा मिति
            record.administered_by ?? "", // सेवन गराउने
            record.batch_number ?? "", // ब्याच नम्बर
            record.dose_amount ? `${record.dose_amount} थोपा` : "", // मात्रा
            record.child_reaction === "normal" ? "सामान्य" : "प्रतिक्रिया", // प्रतिक्रिया
            record.weight ? `${record.weight} कि.ग्रा.` : "", // तौल
            record.height ? `${record.height} से.मि.` : "", // उचाइ
            record.muac ? `${record.muac} से.मि.` : "", // MUAC
            record.temperature ? `${record.temperature} °C` : "", // तापक्रम
            record.notes ?? "", // टिप्पणी
            record.created_at ?? "", // दर्ता मिति
          ]
            .map(
              (value) =>
                // Wrap values in double quotes and escape internal quotes for CSV safety
                `"${String(value).replace(/"/g, '""')}"`
            )
            .join(",")
        ),
      ].join("\n");

      // 5. Trigger Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `swarnabindu-report-FULL-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error exporting all data:", err);
      alert("Error exporting data. Please check your network or console.");
    } finally {
      setExporting(false);
    }
  };

  // --- STATISTICS AND CHART DATA GENERATION ---

  const getStatistics = () => {
    const total = registrations.length;

    const totalScreenings = screenings.length;
    const maleCount = registrations.filter((r) => r.gender === "male").length;
    const femaleCount = registrations.filter(
      (r) => r.gender === "female"
    ).length;
    const normalReactions = screenings.filter(
      (s) => s.child_reaction === "normal"
    ).length;
    const adverseReactions = screenings.filter(
      (s) => s.child_reaction === "adverse"
    ).length;

    // Age groups based on dose amounts
    const ageGroups = {
      "6-12 महिना": registrations.filter(
        (r) => r.dose_amount === "1" || r.dose_amount === "2"
      ).length,
      "1-2 वर्ष": registrations.filter(
        (r) => r.dose_amount === "3" || r.dose_amount === "4"
      ).length,
      "2-5 वर्ष": registrations.filter(
        (r) => Number.parseInt(r.dose_amount) >= 4
      ).length,
    };

    // Registrations by district (using palika for better granularity in local view)
    const districtStats = registrations.reduce((acc, reg) => {
      acc[reg.palika] = (acc[reg.palika] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend (Note: This is only based on the currently loaded page's data)
    const monthlyData = registrations.reduce((acc, reg) => {
      // Assuming 'date' is a parsable date string
      try {
        const month = new Date(reg.date).toLocaleDateString("ne-NP", {
          year: "numeric",
          month: "short",
        });
        acc[month] = (acc[month] || 0) + 1;
      } catch (e) {
        // Ignore records with invalid dates
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      totalScreenings,
      maleCount,
      femaleCount,
      normalReactions,
      adverseReactions,
      ageGroups,
      districtStats,
      monthlyData,
    };
  };

  const stats = getStatistics();

  const genderData = [
    { name: "पुरुष", value: stats.maleCount, color: "#3B82F6" },
    { name: "महिला", value: stats.femaleCount, color: "#EC4899" },
  ];

  const ageGroupData = Object.entries(stats.ageGroups).map(([name, value]) => ({
    name,
    value,
  }));

  const reactionData = [
    { name: "सामान्य", value: stats.normalReactions, color: "#10B981" },
    { name: "प्रतिक्रिया", value: stats.adverseReactions, color: "#EF4444" },
  ];

  const districtData = Object.entries(stats.districtStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const monthlyTrendData = Object.entries(stats.monthlyData).map(
    ([name, value]) => ({
      name,
      registrations: value,
    })
  );

  const uniqueDistricts = [
    ...new Set(registrations.map((r) => r.district)),
  ].filter(Boolean);

  const totalPages = Math.ceil(totalCount / limit);

  const [activeTab, setActiveTab] = useState("registrations");

  // --- LOADING STATE ---

  if (loading && totalCount === 0) {
    // Show loading only on initial fetch
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">डाटा लोड गर्दै...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- RENDER ---

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, totalCount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                रिपोर्ट र विश्लेषण
              </h1>
              <p className="text-gray-600">
                स्वर्णबिन्दु प्राशन कार्यक्रम डाटा विश्लेषण
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">फिर्ता</Button>
            </Link>
          </div>

          {/* Enhanced Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">
                      कुल दर्ता
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {totalCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Droplets className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">
                      कुल स्क्रिनिङ
                    </p>
                    <p className="text-2xl font-bold text-purple-900">
                      {totalDoseCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">
                      सामान्य प्रतिक्रिया
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.normalReactions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-red-600">
                      प्रतिकूल प्रतिक्रिया
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {stats.adverseReactions}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-amber-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-amber-600">
                      सफलता दर
                    </p>
                    <p className="text-2xl font-bold text-amber-900">
                      {stats.totalScreenings > 0
                        ? Math.round(
                            (stats.normalReactions / stats.totalScreenings) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(tab) => {
            setActiveTab(tab);
            setLoading(true);

            if (tab === "registrations") {
              fetchRegistrations(page); // Only fetch when tab is clicked
            }

            if (tab === "screenings") {
              fetchTotalDose(page); // Only fetch when tab is clicked
            }
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="registrations">दर्ता सूची</TabsTrigger>
            <TabsTrigger value="overview">सिंहावलोकन</TabsTrigger>
            <TabsTrigger value="screenings"> स्वर्णप्राशन लग</TabsTrigger>

            {/* Tabs only visible for admin */}
            {role === "premium" && (
              <>
                <TabsTrigger value="selfRegistrations">SELF</TabsTrigger>
                <TabsTrigger value="analytics">विश्लेषण</TabsTrigger>
                <TabsTrigger value="trends">प्रवृत्ति</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* OVERVIEW CONTENT */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>लिङ्ग वितरण</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Age Group Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>उमेर समूह वितरण</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* District Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>पालिका अनुसार वितरण</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={districtData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REGISTRATIONS CONTENT (with Pagination) */}
          <TabsContent value="registrations" className="space-y-6">
            {/* Enhanced Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="नाम, अभिभावक वा सिरियल नम्बरले खोज्नुहोस्..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={genderFilter} onValueChange={setGenderFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="लिङ्ग छान्नुहोस्" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">सबै लिङ्ग</SelectItem>
                      <SelectItem value="male">पुरुष</SelectItem>
                      <SelectItem value="female">महिला</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={districtFilter}
                    onValueChange={setDistrictFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="जिल्ला छान्नुहोस्" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">सबै जिल्ला</SelectItem>
                      {uniqueDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={reactionFilter}
                    onValueChange={setReactionFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="प्रतिक्रिया छान्नुहोस्" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">सबै प्रतिक्रिया</SelectItem>
                      <SelectItem value="normal">सामान्य</SelectItem>
                      <SelectItem value="adverse">प्रतिकूल</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={exportAllData}
                    className="w-full"
                    disabled={exporting} // Use the new state here
                  >
                    <Download
                      className={`h-4 w-4 mr-2 ${
                        exporting ? "animate-spin" : ""
                      }`}
                    />
                    {exporting ? " CSV निर्यात" : " CSV निर्यात"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registrations Table */}
            <Card>
              {/* PAGINATION CONTROLS */}

              <CardHeader>
                <CardTitle>
                  <div className="flex gap-2 items-center mt-4">
                    दर्ता सूची ({end} / {totalCount})
                    <Button
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        fetchRegistrations(currentPage - 1);
                      }}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    {/* <p className="text-sm text-gray-700">
                  Page **{page}** of **{totalPages}** (showing {end} /{" "}
                  {totalCount} total entries)
                </p> */}
                    <Button
                      disabled={end >= totalCount}
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        fetchRegistrations(currentPage + 1);
                      }}
                    >
                      Next
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>बालकको नाम</TableHead>
                        <TableHead>उमेर</TableHead>
                        <TableHead>लिङ्ग</TableHead>
                        <TableHead>अभिभावक</TableHead>
                        <TableHead>जिल्ला</TableHead>
                        <TableHead>Palika</TableHead>
                        <TableHead>सम्पर्क</TableHead>
                        <TableHead>Dose</TableHead>
                        <TableHead>दर्ता मिति</TableHead>
                        <TableHead>स्वास्थ्यकर्मी</TableHead>
                        <TableHead>स्थिति</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.childName}</TableCell>
                          <TableCell>{record.age}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {record.gender === "male" ? "पुरुष" : "महिला"}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.guardianName}</TableCell>
                          <TableCell>{record.district}</TableCell>
                          <TableCell>{record.palika}</TableCell>
                          <TableCell>{record.contactNumber}</TableCell>
                          <TableCell>{record.dose_amount} थोपा</TableCell>
                          <TableCell>{record.date}</TableCell>

                          <TableCell>{record.administered_by}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                record.child_reaction === "normal"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {record.child_reaction === "normal"
                                ? "सामान्य"
                                : "प्रतिक्रिया"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SELF REGISTRATION CONTENT */}
          {role === "premium" && (
            <TabsContent value="selfRegistrations">
              <Card>
                <CardHeader>
                  <CardTitle>Self Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>बालकको नाम</TableHead>
                          <TableHead>उमेर</TableHead>
                          <TableHead>लिङ्ग</TableHead>
                          <TableHead>अभिभावक</TableHead>
                          <TableHead>बुवाको नाम</TableHead>
                          <TableHead>आमाको नाम</TableHead>
                          <TableHead>जिल्ला</TableHead>
                          <TableHead>Palika</TableHead>
                          <TableHead>सम्पर्क</TableHead>
                          <TableHead>उचाइ</TableHead>
                          <TableHead>तौल</TableHead>
                          <TableHead>अलर्जी</TableHead>
                          <TableHead>औषधि इतिहास</TableHead>
                          <TableHead>दर्ता मिति</TableHead>
                          <TableHead>स्थिति</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selfRegistrations.map((record) => (
                          <TableRow key={record.unique_id}>
                            <TableCell>{record.unique_id}</TableCell>
                            <TableCell>{record.child_name}</TableCell>
                            <TableCell>{record.age}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {record.gender === "male" ? "पुरुष" : "महिला"}
                              </Badge>
                            </TableCell>
                            <TableCell>{record.guardian_name}</TableCell>
                            <TableCell>{record.father_name}</TableCell>
                            <TableCell>{record.mother_name}</TableCell>
                            <TableCell>{record.district}</TableCell>
                            <TableCell>{record.palika}</TableCell>
                            <TableCell>{record.contact_number}</TableCell>
                            <TableCell>{record.height || "-"}</TableCell>
                            <TableCell>{record.weight} kg</TableCell>
                            <TableCell>{record.allergies}</TableCell>
                            <TableCell>{record.previous_medications}</TableCell>
                            <TableCell>
                              {new Date(record.created_at).toLocaleDateString(
                                "ne-NP"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {record.vaccination_status || "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {/* END SELF REGISTRATION CONTENT */}

          {/* SCREENING LOG CONTENT */}
          <TabsContent value="screenings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex gap-2 items-center mt-4">
                    स्वर्णप्राशन लग (कुल: {end} / {totalDoseCount})
                    <Button
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                        fetchTotalDose(currentPage - 1);
                      }}
                      disabled={currentPage === 1 || loading}
                    >
                      Previous
                    </Button>
                    {/* <p className="text-sm text-gray-700">
                  Page **{page}** of **{totalPages}** (showing {end} /{" "}
                  {totalCount} total entries)
                </p> */}
                    <Button
                      disabled={end >= totalDoseCount}
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                        fetchTotalDose(currentPage + 1);
                      }}
                    >
                      Next
                    </Button>
                    <Button
                      onClick={exportAllDoseData}
                      disabled={exporting} // Use the new state here
                    >
                      <Download
                        className={`h-4 w-4 mr-2 ${
                          exporting ? "animate-spin" : ""
                        }`}
                      />
                      {exporting ? " CSV निर्यात" : " CSV निर्यात"}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient ID</TableHead>
                        <TableHead>Dose Amount</TableHead>
                        <TableHead>Administered By</TableHead>
                        <TableHead>Batch No.</TableHead>
                        <TableHead>प्रतिक्रिया</TableHead>
                        <TableHead>मिति</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screenings.map((screen) => (
                        <TableRow key={screen.id}>
                          <TableCell>{screen.patient_id}</TableCell>
                          <TableCell>{screen.dose_amount} थोपा</TableCell>
                          <TableCell>{screen.administered_by}</TableCell>
                          <TableCell>{screen.batch_number}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                screen.child_reaction === "normal"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {screen.child_reaction === "normal"
                                ? "सामान्य"
                                : "प्रतिकूल"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(screen.screening_date).toLocaleDateString(
                              "ne-NP"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* END SCREENING LOG CONTENT */}

          {/* ANALYTICS TAB (Admin Only) */}
          {role === "premium" && (
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>प्रतिक्रिया विश्लेषण (Screenings)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reactionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reactionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>उमेर समूह (Bar Chart)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ageGroupData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#EC4899" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* TRENDS TAB (Admin Only) */}
          {role === "premium" && (
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>मासिक दर्ता प्रवृत्ति</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="registrations"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
