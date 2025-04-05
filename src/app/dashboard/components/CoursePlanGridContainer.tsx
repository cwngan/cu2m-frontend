"use client";
import { useState } from "react";
import CoursePlanGrid from "./CoursePlanGrid";
import SortDropdown from "./SortDropdown";
import { useSearchParams } from "next/navigation";

export default function CoursePlanGridContainer() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort_by") || "name",
  );
  return (
    <div className="mt-12 w-full p-4">
      <div className="mb-3 flex items-center justify-between text-3xl">
        <span>Course Plans</span>
        <SortDropdown {...{ sortBy, setSortBy }} />
      </div>
      <CoursePlanGrid {...{ sortBy }} />
    </div>
  );
}
