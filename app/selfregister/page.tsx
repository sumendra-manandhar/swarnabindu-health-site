"use client";

import RegisterPage from "../register/page";
import { useSearchParams } from "next/navigation";

export default function SelfRegisterWrapper() {
  // Always force mode=self
  const params = new URLSearchParams();
  params.set("mode", "self");

  return <RegisterPage key="self" />;
}
