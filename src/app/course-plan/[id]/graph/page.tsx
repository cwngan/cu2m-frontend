import axios from "axios";
import TopBar from "../components/TopBar";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import GraphView from "./components/GraphView";

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
    data = await axios.get(`${process.env.API_URL}/api/course-plans/${id}`, {
      headers: {
        Cookie: headersList.get("cookie") || "",
      },
    });
  } catch {
    notFound();
  }

  return (
    <div className="flex h-full w-full justify-center">
      <TopBar coursePlanId={id} />
      <GraphView coursePlanId={id} coursePlanResponse={data.data} />
    </div>
  );
}
