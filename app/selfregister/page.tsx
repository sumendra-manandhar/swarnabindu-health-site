// app/selfregister/page.tsx
import { Suspense } from "react";
import SelfRegisterWrapper from "./self-register-wrapper";

export default function SelfRegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelfRegisterWrapper />
    </Suspense>
  );
}
