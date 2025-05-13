import SemesterPlanGrid from "./components/SemesterPlanGrid";
import TopBar from "./components/TopBar";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;
  return (
    <div className="flex h-screen w-screen justify-center">
      <TopBar coursePlanId={id} />
      <SemesterPlanGrid coursePlanId={id} />
    </div>
  );
}
