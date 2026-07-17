import { CaseWorkspace } from "@/components/cases/case-workspace";

type CasePageProps = {
  params: Promise<{ caseId: string }>;
};

export default async function CasePage({ params }: CasePageProps) {
  const { caseId } = await params;
  return <CaseWorkspace caseId={caseId} />;
}
