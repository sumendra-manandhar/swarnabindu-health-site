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
import { Heart, Loader2, User, Lock } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Heart className="h-8 w-8 text-red-600" />
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="पासवर्ड प्रविष्ट गर्नुहोस्"
                  className="pl-10"
                  required
                />
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

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm text-gray-700 mb-2">
              डेमो खाताहरू:
            </h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div>
                <strong>प्रशासक:</strong> admin / admin123
              </div>
              <div>
                <strong>स्वयंसेवक:</strong> volunteer1 / vol123
              </div>
              <div>
                <strong>स्वयंसेवक:</strong> volunteer2 / vol123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
