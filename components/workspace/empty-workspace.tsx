import { WelcomeCard } from "@/components/workspace/welcome-card";

export function EmptyWorkspace() {
  return (
    <section
      className="flex flex-1 items-center justify-center px-4 py-10"
      aria-label="Main workspace"
    >
      <WelcomeCard />
    </section>
  );
}
