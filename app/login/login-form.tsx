"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, User, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Logo from "../../logo.jpeg";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        // const response = await fetch(
        //   "https://health-service.gyanbazzar.com/login",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //       Accept: "application/json",
        //     },
        //     body: JSON.stringify({
        //       email: username,
        //       password: password,
        //     }),
        //   }
        // );

        // const result = await response.json();

        // if (response.ok && result.token) {
        //   localStorage.setItem("authToken", result.token);

        //   localStorage.setItem("user", JSON.stringify(result.data));

        router.push("/");
      } else {
        setError("गलत प्रयोगकर्ता नाम वा पासवर्ड");
      }
    } catch (err) {
      setError("लगइन गर्दा समस्या भयो। कृपया फेरि प्रयास गर्नुहोस्।");
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    // { username: "premium", password: "admin123", assignedTo: "प्रशासक" },
    {
      username: "volunteer1",
      password: "abcd1234",
      assignedTo: "Prem Kumar Tirwari",
    },
    {
      username: "volunteer2",
      password: "abcd1234",
      assignedTo: "Nawaraj Dangi",
    },
    {
      username: "volunteer3",
      password: "abcd1234",
      assignedTo: "Rajan Chaudhary",
    },
    { username: "volunteer4", password: "abcd1234", assignedTo: "Hari Rijal" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative p-4 rounded-full bg-white shadow-lg ring-4 ring-blue-100 transition-all duration-300 hover:ring-blue-200 hover:shadow-xl">
              <Image
                src={Logo || "/placeholder.svg"}
                alt="Logo"
                width={120}
                height={120}
                className="h-[120px] w-[120px] object-contain transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            स्वर्णबिन्दु प्राशन
          </CardTitle>
          <CardDescription className="text-gray-600">
            कृपया आफ्नो खाता जानकारी प्रविष्ट गर्नुहोस्
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">प्रयोगकर्ता नाम</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="प्रयोगकर्ता नाम प्रविष्ट गर्नुहोस्"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">पासवर्ड</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड प्रविष्ट गर्नुहोस्"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  लगइन गर्दै...
                </>
              ) : (
                "लगइन गर्नुहोस्"
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem
                value="demo-accounts"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 text-sm font-medium text-gray-700 hover:no-underline">
                  डेमो खाताहरू
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Username</TableHead>
                        <TableHead className="text-xs">Password</TableHead>
                        <TableHead className="text-xs">Assigned to</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {demoAccounts.map((account, index) => (
                        <TableRow key={index}>
                          <TableCell className="text-xs font-medium">
                            {account.username}
                          </TableCell>
                          <TableCell className="text-xs">
                            {account.password}
                          </TableCell>
                          <TableCell className="text-xs">
                            {account.assignedTo}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
