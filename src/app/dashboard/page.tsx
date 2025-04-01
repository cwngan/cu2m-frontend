import CoursePlanGrid from "./components/CoursePlanGrid";
import SortDropdown from "./components/SortDropdown";
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
        <div className="mb-3 flex items-center justify-between text-3xl">
          <span>Course Plans</span>
          <SortDropdown sortBy={sort_by} />
        </div>
        <CoursePlanGrid sortBy={sort_by} />
      </div>
    </div>
  );
}
