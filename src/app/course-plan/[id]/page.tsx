export const dynamic = "force-dynamic";
export const revalidate = 0;

import axios from "axios";
import SemesterPlanGrid from "./components/SemesterPlanGrid";
import TopBar from "./components/TopBar";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CoursePlanWithSemestersResponseModel } from "@/app/types/ApiResponseModel";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}) {
  const { id } = await params;
  const headersList = await headers();
  let data;
  try {
    data = await axios.get<CoursePlanWithSemestersResponseModel>(
      `/api/course-plans/${id}`,
      {
        baseURL: process.env.API_URL,
        headers: {
          Cookie: headersList.get("cookie") || "",
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    notFound();
  }
  return (
    <div className="flex h-screen w-screen justify-center">
      <TopBar coursePlanId={id} />
      <SemesterPlanGrid coursePlanId={id} coursePlanResponse={data.data} />
    </div>
  );
}
