import { redirect } from "next/navigation";

import { CustomerDetail } from "@/components/admin/customer-detail";
import { getCurrentAdmin } from "@/services/authService";

type AdminUserPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  const { userId } = await params;
  return <CustomerDetail userId={userId} />;
}
