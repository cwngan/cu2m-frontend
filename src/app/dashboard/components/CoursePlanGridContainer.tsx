"use client";
import { useState } from "react";
import CoursePlanGrid from "./CoursePlanGrid";
import SortDropdown from "./SortDropdown";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";

export default function CoursePlanGridContainer() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort_by") || "name",
  );
  const [starredFilter, setStarredFilter] = useState<boolean>(false);
  return (
    <div className="mt-12 w-full p-4">
      <div className="mb-3 flex items-end justify-start gap-4">
        <div className="text-3xl">Course Plans</div>
        <div
          className={clsx(
            "cursor-pointer rounded-lg px-8 py-1",
            starredFilter ? "bg-amber-200" : "bg-neutral-200",
          )}
          onClick={() => {
            setStarredFilter((prev) => !prev);
          }}
        >
          Starred
        </div>
        <SortDropdown {...{ sortBy, setSortBy }} />
      </div>
      <CoursePlanGrid {...{ sortBy, starredFilter }} />
    </div>
  );
}
