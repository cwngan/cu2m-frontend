import axios from "axios";
import SemesterPlanGrid from "./components/SemesterPlanGrid";
import TopBar from "./components/TopBar";
import { headers } from "next/headers";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  const data = await axios.get(
    `${process.env.API_URL}/api/course-plans/${id}`,
    {
      headers: {
        Cookie: headersList.get("cookie") || "",
      },
    },
  );
  return (
    <div className="flex h-screen w-screen justify-center">
      <TopBar coursePlanId={id} />
      <SemesterPlanGrid coursePlanId={id} coursePlanResponse={data.data} />
    </div>
  );
}
