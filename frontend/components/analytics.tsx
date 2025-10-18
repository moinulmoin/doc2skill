"use client";

import { OpenPanelComponent } from "@openpanel/nextjs";

export function Analytics() {
  // if(process.env.NODE_ENV !== "production") return null
  return (
    <OpenPanelComponent
      clientId="9c8ce166-5ffb-433b-852e-2cc8f8258838"
      apiUrl="/api/op"
      trackOutgoingLinks={true}
      trackScreenViews={false}
    />
  );
}
