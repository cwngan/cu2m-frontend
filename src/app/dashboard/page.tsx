import CoursePlanGrid from "./components/CoursePlanGrid";
import TopBar from "./components/TopBar";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort_by: "last_edit" | "name" }>;
}) {
  let { sort_by } = await searchParams;
  if (sort_by !== "last_edit" && sort_by !== "name") {
    sort_by = "name";
  }
  return (
    <div className="container mx-auto">
      <TopBar />
      <div className="mt-12 w-full p-4">
        <div className="mb-3 text-3xl">Course Plans</div>
        <CoursePlanGrid sortBy={sort_by} />
      </div>
    </div>
  );
}
