"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  UserPlus,
  Users,
  Activity,
  FileText,
  Database,
  User,
  LogOut,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import Image from "next/image";
import Logo from "../logo.jpeg";

const navigationItems = [
  { href: "/", label: "गृहपृष्ठ", icon: Home, roles: ["admin", "volunteer"] },
  {
    href: "/register",
    label: "नयाँ दर्ता",
    icon: UserPlus,
    roles: ["admin", "volunteer"],
  },
  {
    href: "/screening",
    label: "स्क्रिनिङ",
    icon: Activity,
    roles: ["admin", "volunteer"],
  },

  { href: "/reports", label: "रिपोर्ट", icon: FileText, roles: ["admin"] },
  {
    href: "/sync",
    label: "डाटा सिंक",
    icon: Database,
    roles: ["admin", "volunteer"],
  },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, canAccessReports } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const filteredNavItems = navigationItems.filter((item) => {
    if (item.href === "/reports") {
      return canAccessReports();
    }
    return item.roles.includes(user?.role || "volunteer");
  });

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src={Logo} // <-- update with your image path
                alt="Logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
              {/* <Heart className="h-8 w-8 text-red-500" /> */}
              <span className="font-bold text-xl text-gray-900">
                स्वर्णबिन्दु
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* User dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-3"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {user.role === "admin" ? "प्रशासक" : "स्वयंसेवक"}
                    </Badge>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                    {user.district && (
                      <p className="text-xs text-gray-500">
                        जिल्ला: {user.district}
                      </p>
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    लगआउट
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
