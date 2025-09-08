"use client";

import { useSearchParams } from "next/navigation";
import RegisterPage from "../register/page";

export default function SelfRegisterWrapper() {
  // Force "self" mode here
  const effectiveMode = "self";

  return <RegisterPage key={effectiveMode} />;
}
