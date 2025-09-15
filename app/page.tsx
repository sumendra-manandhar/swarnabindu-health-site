"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OfflineStorage } from "@/lib/offline-storage";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Database,
  Droplets,
  FileText,
  Heart,
  RefreshCw,
  Search,
  Shield,
  TrendingUp,
  UserPlus,
  Users,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    malePatients: 0,
    femalePatients: 0,
    todayRegistrations: 0,
    totalScreenings: 0,
    pendingSync: 0,
    // 👇 added
    totalSelfPatients: 0,
    maleSelfPatients: 0,
    femaleSelfPatients: 0,
    todaySelfRegistrations: 0,
  });

  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    loadStatistics();

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

  const loadStatistics = async () => {
    setLoading(true);

    try {
      const userDistrict = getUserDistrict() || "दाङ"; // fallback
      const registrationTable =
        userDistrict === "चितवन" ? "chitwan_registrations" : "registrations";

      const offlineRegistrations = OfflineStorage.getOfflineRegistrations();
      const offlineScreenings = OfflineStorage.getOfflineScreenings();

      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const todayRegsOffline = offlineRegistrations.filter((reg) => {
        const regDate = new Date(reg.timestamp);
        return regDate >= new Date(startOfDay) && regDate <= new Date(endOfDay);
      });

      const isOnline =
        typeof navigator !== "undefined" ? navigator.onLine : false;

      const onlineStats = {
        totalPatients: 0,
        malePatients: 0,
        femalePatients: 0,
        totalScreenings: 0,
        todayRegistrations: 0,
        totalSelfPatients: 0,
        maleSelfPatients: 0,
        femaleSelfPatients: 0,
        todaySelfRegistrations: 0,
      };

      if (isOnline) {
        try {
          // Registrations based on district
          const { data: registrations } = await supabase
            .from(registrationTable)
            .select("id, gender");

          if (registrations) {
            onlineStats.totalPatients = registrations.length;
            onlineStats.malePatients = registrations.filter(
              (p) => p.gender === "male"
            ).length;
            onlineStats.femalePatients = registrations.filter(
              (p) => p.gender === "female"
            ).length;
          }

          const { data: todayRegs } = await supabase
            .from(registrationTable)
            .select("id")
            .gte("created_at", startOfDay)
            .lte("created_at", endOfDay);

          onlineStats.todayRegistrations = todayRegs ? todayRegs.length : 0;

          // Screenings (same for all districts)
          const { data: screenings } = await supabase
            .from("screenings")
            .select("id");
          if (screenings) onlineStats.totalScreenings = screenings.length;

          // Self registrations (same table)
          const { data: selfRegs } = await supabase
            .from("self_registrations")
            .select("id, gender");

          if (selfRegs) {
            onlineStats.totalSelfPatients = selfRegs.length;
            onlineStats.maleSelfPatients = selfRegs.filter(
              (p) => p.gender === "male"
            ).length;
            onlineStats.femaleSelfPatients = selfRegs.filter(
              (p) => p.gender === "female"
            ).length;
          }

          const { data: todaySelfRegs } = await supabase
            .from("self_registrations")
            .select("id")
            .gte("created_at", startOfDay)
            .lte("created_at", endOfDay);

          onlineStats.todaySelfRegistrations = todaySelfRegs
            ? todaySelfRegs.length
            : 0;
        } catch (error) {
          console.warn("Failed to load online stats:", error);
        }
      }

      // Merge online + offline into UI state
      setStats({
        totalPatients: onlineStats.totalPatients + offlineRegistrations.length,
        malePatients:
          onlineStats.malePatients +
          offlineRegistrations.filter((reg) => reg.data.gender === "male")
            .length,
        femalePatients:
          onlineStats.femalePatients +
          offlineRegistrations.filter((reg) => reg.data.gender === "female")
            .length,
        todayRegistrations:
          onlineStats.todayRegistrations + todayRegsOffline.length,
        totalScreenings: onlineStats.totalScreenings + offlineScreenings.length,
        pendingSync: offlineRegistrations.filter((reg) => !reg.synced).length,
        totalSelfPatients: onlineStats.totalSelfPatients,
        maleSelfPatients: onlineStats.maleSelfPatients,
        femaleSelfPatients: onlineStats.femaleSelfPatients,
        todaySelfRegistrations: onlineStats.todaySelfRegistrations,
      });
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div
              className={`w-3 h-3 rounded-full ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm font-medium">
              {isOnline ? "Online" : "Offline Mode"}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            स्वर्णबिन्दु प्राशन कार्यक्रम
          </h1>
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Swarnabindu Prashan Program
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            बालबालिकाको स्वास्थ्य र प्रतिरक्षा क्षमता बृद्धिको लागि आयुर्वेदिक
            स्वर्णबिन्दु प्राशन कार्यक्रम | Ayurvedic Swarnabindu Prashan
            program for childrens health and immunity enhancement
          </p>
        </div>
        {/* Connection Status Alert */}
        {!isOnline && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <WifiOff className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Youre currently offline. Data will be saved locally and synced
              when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                कुल बिरामी | Total Patients
              </CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className=" text-5xl font-bold text-blue-800">
                {stats.totalPatients}
              </div>
              <p className="text-xs text-blue-600 mt-1">Registered children</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                आजका दर्ता | Todays Registrations
              </CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <div className="flex align-bottom justify-between gap-2 p-4">
              <CardContent>
                <div className="text-5xl font-bold text-green-800">
                  {stats.todayRegistrations}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  New registrations today
                </p>
              </CardContent>
              <CardContent>
                <div className="text-3xl font-bold text-shadow-amber-400">
                  {stats.todayRegistrations}
                </div>
                <p className="text-xs text-green-600 mt-1">Self Registered</p>
              </CardContent>
            </div>
          </Card>

          <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                कुल स्क्रिनिङ | Total Screenings
              </CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-purple-800">
                {stats.totalScreenings}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                Health screenings completed
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                लिङ्ग वितरण | Gender Distribution
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600">
                    {stats.malePatients}
                  </div>
                  <div className="text-xs text-blue-500">पुरुष | Male</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-pink-600">
                    {stats.femalePatients}
                  </div>
                  <div className="text-xs text-pink-500">महिला | Female</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Sync Alert */}
        {stats.pendingSync > 0 && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Database className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              {stats.pendingSync} records are pending sync. Visit the{" "}
              <Link href="/sync" className="underline font-medium">
                sync page
              </Link>{" "}
              to upload them.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-green-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-green-800">
                नयाँ दर्ता | New Registration
              </CardTitle>
              <CardDescription>
                Register a new child for the Swarnabindu program
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/register">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  नयाँ दर्ता गर्नुहोस् | Register New Child
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-blue-800">
                स्वर्णबिन्दु प्राशन | Swarnabindu Prashan
              </CardTitle>
              <CardDescription>
                Administer Swarnabindu drops to registered children
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/screening">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Droplets className="h-4 w-4 mr-2" />
                  स्वर्णबिन्दु दिनुहोस् | Give Swarnabindu
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-purple-800">
                बिरामी व्यवस्थापन | Patient Management
              </CardTitle>
              <CardDescription>
                View and manage registered patients
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/patients">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Users className="h-4 w-4 mr-2" />
                  बिरामी हेर्नुहोस् | View Patients
                </Button>
              </Link>
            </CardContent>
          </Card> */}

          <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">Self Registered</CardTitle>
              <CardDescription>
                Search and view self-registered users
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/selfregistered">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <FileText className="h-4 w-4 mr-2" />
                  नयाँ दर्ता हेर्नुहोस् | Self Registered
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-800">
                रिपोर्ट | Reports
              </CardTitle>
              <CardDescription>
                Generate and view program reports
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/reports">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <FileText className="h-4 w-4 mr-2" />
                  रिपोर्ट हेर्नुहोस् | View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-teal-600" />
              </div>
              <CardTitle className="text-teal-800">
                डाटा सिंक | Data Sync
              </CardTitle>
              <CardDescription>
                Synchronize offline data with server
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/sync">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  डाटा सिंक गर्नुहोस् | Sync Data
                </Button>
              </Link>
              {stats.pendingSync > 0 && (
                <Badge variant="destructive" className="mt-2">
                  {stats.pendingSync} pending
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg hover:shadow-xl transition-all hover:scale-105">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-800">
                आपातकालीन | Emergency
              </CardTitle>
              <CardDescription>
                Emergency contacts and procedures
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <AlertTriangle className="h-4 w-4 mr-2" />
                आपातकालीन सम्पर्क | Emergency Contact
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Program Information */}
        <Card className="border-2 border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-800">
              कार्यक्रम जानकारी | Program Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  स्वर्णबिन्दु प्राशनको फाइदाहरू | Benefits
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    प्रतिरक्षा क्षमता बृद्धि | Immunity enhancement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    बुद्धि र स्मरण शक्ति विकास | Intelligence and memory
                    development
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    पाचन क्रिया सुधार | Digestive improvement
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    श्वासप्रश्वास सम्बन्धी समस्या कम | Reduced respiratory
                    issues
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-purple-700 mb-3">
                  लक्षित समूह | Target Group
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />६ महिनादेखि ५
                    वर्षसम्मका बालबालिका | Children 6 months to 5 years
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    स्वस्थ बालबालिका | Healthy children
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    नियमित खुराक आवश्यक | Regular doses required
                  </li>
                  <li className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    पुष्य नक्षत्रमा सेवन उत्तम | Best taken during Pushya
                    Nakshatra
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
