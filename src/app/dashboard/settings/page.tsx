"use client";

import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Settings"
        description="Manage your profile and account preferences"
      />
      <ProfileSettingsForm />
    </div>
  );
}
