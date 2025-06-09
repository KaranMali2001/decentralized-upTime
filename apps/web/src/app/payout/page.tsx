"use client";

import { PayoutV6 } from "@/components/payout/v3";
import { useState } from "react";

export default function PayoutPage() {
  const [currentVersion, setCurrentVersion] = useState<"v1" | "v2" | "v3">(
    "v1"
  );

  return (
    <div className="min-h-screen bg-background">
      <PayoutV6 />
    </div>
  );
}
