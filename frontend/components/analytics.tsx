"use client";

import { OpenPanelComponent } from "@openpanel/nextjs";

export function Analytics() {
  if(process.env.NODE_ENV !== "production") return null
  return (
    <OpenPanelComponent
      clientId={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID || ""}
      apiUrl="/api/op"
      trackOutgoingLinks={true}
      trackScreenViews={false}
    />
  );
}
