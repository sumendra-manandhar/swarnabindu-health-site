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
import { OfflineStorage } from "@/lib/offline-storage";

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
}

export default function ReportsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [filteredData, setFilteredData] = useState<RegistrationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [reactionFilter, setReactionFilter] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterData();
  }, [registrations, searchTerm, genderFilter, reactionFilter, districtFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load registrations from local storage
      const localRegistrations = OfflineStorage.getAllLocalRegistrations();

      // Load screenings from local storage
      const localScreenings = OfflineStorage.getOfflineScreenings().map(
        (s) => s.data
      );

      // Try to load from server if online
      const isOnline =
        typeof navigator !== "undefined" ? navigator.onLine : false;

      if (isOnline) {
        try {
          const [regResponse, screenResponse] = await Promise.all([
            fetch("/api/registrations"),
            fetch("/api/screenings"),
          ]);

          if (regResponse.ok && screenResponse.ok) {
            const serverRegistrations = await regResponse.json();
            const serverScreenings = await screenResponse.json();

            setRegistrations([...localRegistrations, ...serverRegistrations]);
            setScreenings([...localScreenings, ...serverScreenings]);
          } else {
            setRegistrations(localRegistrations);
            setScreenings(localScreenings);
          }
        } catch (error) {
          console.log("Using offline data");
          setRegistrations(localRegistrations);
          setScreenings(localScreenings);
        }
      } else {
        setRegistrations(localRegistrations);
        setScreenings(localScreenings);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setRegistrations([]);
      setScreenings([]);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = registrations;

    // Search filter
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

    // Gender filter
    if (genderFilter !== "all") {
      filtered = filtered.filter((record) => record.gender === genderFilter);
    }

    // District filter
    if (districtFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.district === districtFilter
      );
    }

    // Reaction filter
    if (reactionFilter !== "all") {
      filtered = filtered.filter(
        (record) => record.child_reaction === reactionFilter
      );
    }

    setFilteredData(filtered);
  };

  const exportToCSV = () => {
    const headers = [
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

    const csvContent = [
      headers.join(","),
      ...filteredData.map((record) =>
        [
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
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `swarnabindu-report-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

    // District wise distribution
    const districtStats = registrations.reduce((acc, reg) => {
      acc[reg.district] = (acc[reg.district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend
    const monthlyData = registrations.reduce((acc, reg) => {
      const month = new Date(reg.date).toLocaleDateString("ne-NP", {
        year: "numeric",
        month: "short",
      });
      acc[month] = (acc[month] || 0) + 1;
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

  if (loading) {
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
                      {stats.total}
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
                      {stats.totalScreenings}
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">सिंहावलोकन</TabsTrigger>
            <TabsTrigger value="registrations">दर्ता सूची</TabsTrigger>
            <TabsTrigger value="screenings">स्क्रिनिङ लग</TabsTrigger>
            <TabsTrigger value="analytics">विश्लेषण</TabsTrigger>
            <TabsTrigger value="trends">प्रवृत्ति</TabsTrigger>
          </TabsList>

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
                          `${name} ${(percent * 100).toFixed(0)}%`
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
                  <CardTitle>जिल्ला अनुसार वितरण</CardTitle>
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

              {/* Reaction Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>प्रतिक्रिया विश्लेषण</CardTitle>
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
                          `${name} ${(percent * 100).toFixed(0)}%`
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
            </div>
          </TabsContent>

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
                  <Button onClick={exportToCSV} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    CSV निर्यात
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Registrations Table */}
            <Card>
              <CardHeader>
                <CardTitle>दर्ता सूची ({filteredData.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>सिरियल नम्बर</TableHead>
                        <TableHead>बालकको नाम</TableHead>
                        <TableHead>उमेर</TableHead>
                        <TableHead>लिङ्ग</TableHead>
                        <TableHead>अभिभावक</TableHead>
                        <TableHead>जिल्ला</TableHead>
                        <TableHead>सम्पर्क</TableHead>
                        <TableHead>तौल</TableHead>
                        <TableHead>दर्ता मिति</TableHead>
                        <TableHead>स्थिति</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {record.serial_no}
                          </TableCell>
                          <TableCell>{record.childName}</TableCell>
                          <TableCell>{record.age}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {record.gender === "male" ? "पुरुष" : "महिला"}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.guardianName}</TableCell>
                          <TableCell>{record.district}</TableCell>
                          <TableCell>{record.contactNumber}</TableCell>
                          <TableCell>{record.weight} कि.ग्रा.</TableCell>
                          <TableCell>{record.date}</TableCell>
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

          <TabsContent value="screenings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  स्वर्णप्राशन स्क्रिनिङ लग
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>क्र.सं.</TableHead>
                        <TableHead>मिति</TableHead>
                        <TableHead>बिरामी ID</TableHead>
                        <TableHead>मात्रा</TableHead>
                        <TableHead>सेवन गराउने</TableHead>
                        <TableHead>प्रतिक्रिया</TableHead>
                        <TableHead>ब्याच नम्बर</TableHead>
                        <TableHead>टिप्पणी</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {screenings.map((screening, index) => (
                        <TableRow key={screening.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {new Date(
                              screening.screening_date
                            ).toLocaleDateString("ne-NP")}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {screening.patient_id}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {Array.from(
                                  {
                                    length:
                                      Number.parseInt(screening.dose_amount) ||
                                      1,
                                  },
                                  (_, i) => (
                                    <div
                                      key={i}
                                      className="w-2 h-2 bg-amber-400 rounded-full"
                                    ></div>
                                  )
                                )}
                              </div>
                              <span className="text-sm">
                                {screening.dose_amount} थोपा
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {screening.administered_by}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                screening.child_reaction === "normal"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {screening.child_reaction === "normal"
                                ? "सामान्य"
                                : "प्रतिक्रिया"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {screening.batch_number}
                          </TableCell>
                          <TableCell className="text-xs max-w-32 truncate">
                            {screening.notes || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Success Rate Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>सफलता दर विश्लेषण</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          सामान्य प्रतिक्रिया
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {stats.normalReactions}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600">
                          {stats.totalScreenings > 0
                            ? (
                                (stats.normalReactions /
                                  stats.totalScreenings) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-red-800">
                          प्रतिकूल प्रतिक्रिया
                        </p>
                        <p className="text-2xl font-bold text-red-900">
                          {stats.adverseReactions}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-600">
                          {stats.totalScreenings > 0
                            ? (
                                (stats.adverseReactions /
                                  stats.totalScreenings) *
                                100
                              ).toFixed(1)
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>उमेर समूह अनुसार प्रदर्शन</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ageGroupData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>सारांश तथ्याङ्क</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {stats.total}
                    </div>
                    <div className="text-sm text-gray-600">
                      कुल दर्ता संख्या
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {stats.totalScreenings}
                    </div>
                    <div className="text-sm text-gray-600">कुल स्क्रिनिङ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {stats.totalScreenings > 0
                        ? Math.round(
                            (stats.normalReactions / stats.totalScreenings) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">सफलता दर</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {stats.totalScreenings > 0
                        ? Math.round(
                            (stats.adverseReactions / stats.totalScreenings) *
                              100
                          )
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">
                      प्रतिकूल प्रतिक्रिया दर
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* Monthly Registration Trend */}
            <Card>
              <CardHeader>
                <CardTitle>मासिक दर्ता प्रवृत्ति</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="registrations"
                      stroke="#3B82F6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">दैनिक औसत</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {stats.total > 0 ? Math.round(stats.total / 30) : 0}
                  </div>
                  <p className="text-gray-600">दर्ता प्रति दिन</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">स्क्रिनिङ दर</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {stats.total > 0
                      ? (stats.totalScreenings / stats.total).toFixed(1)
                      : 0}
                  </div>
                  <p className="text-gray-600">प्रति बिरामी</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">कभरेज</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {uniqueDistricts.length}
                  </div>
                  <p className="text-gray-600">जिल्लाहरू</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
