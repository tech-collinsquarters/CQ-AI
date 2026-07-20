import { PlanComparison } from "@/components/settings/plan-comparison";
import { PlanUsageCard } from "@/components/settings/plan-usage-card";

export default function SettingsPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 md:px-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Your plan, usage, and account preferences.
        </p>
      </div>

      <PlanUsageCard />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Available plans
        </h2>
        <PlanComparison />
      </div>
    </section>
  );
}
