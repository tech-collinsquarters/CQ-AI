import { DashboardLayout } from "@/components/workspace/dashboard-layout";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
