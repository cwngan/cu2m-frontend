"use client";
import { useState } from "react";
import CoursePlanGrid from "./CoursePlanGrid";
import SortDropdown from "./SortDropdown";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import "@/app/background.css";

export default function CoursePlanGridContainer() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort_by") || "name",
  );
  const [starredFilter, setStarredFilter] = useState<boolean>(false);
  return (
    <div className="mt-12 w-full p-5">
      <div className="mb-3 flex items-end justify-center gap-5 py-7">
        <div className="text-6xl">Course plans</div>
        <div
          className={clsx(
            "hover: transform cursor-pointer rounded-lg px-8 py-2 transition-transform duration-200 hover:scale-110 active:scale-90",
            starredFilter ? "bg-amber-200" : "bg-neutral-300",
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
