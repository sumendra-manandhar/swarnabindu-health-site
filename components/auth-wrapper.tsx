"use client";

import type React from "react";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import Navbar from "@/components/nabvar";
import AuthGuard from "@/components/auth-guard";

const publicRoutes = ["/login"];

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isPublicRoute = publicRoutes.includes(pathname);

  // For public routes, render without navbar or auth guard
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, wrap with auth guard and navbar
  return (
    <AuthGuard requireAdmin={pathname === "/reports"}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
