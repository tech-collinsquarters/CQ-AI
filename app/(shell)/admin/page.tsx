import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getCurrentAdmin } from "@/services/authService";

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  return <AdminDashboard />;
}
