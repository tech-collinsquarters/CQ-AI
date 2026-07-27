import { DashboardLayout } from "@/components/workspace/dashboard-layout";
import { JurisdictionPromptDialog } from "@/components/settings/jurisdiction-prompt-dialog";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <JurisdictionPromptDialog />
    </>
  );
}
