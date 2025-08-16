"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthGuard({
  children,
  requireAdmin = false,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (requireAdmin && user?.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requireAdmin, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">लोड गर्दै...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && user?.role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
