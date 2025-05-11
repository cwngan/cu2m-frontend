"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import { apiClient } from "@/apiClient";
import { usePathname } from "next/navigation";
import Image from "next/image";

interface TopBarProps {
  coursePlanId: string;
}

export default function TopBar({ coursePlanId }: TopBarProps) {
  const [name, setName] = useState<string | null>(null);
  const pathname = usePathname();
  const isGraphMode = pathname.endsWith("/graph");

  useEffect(() => {
    const fetchCoursePlanName = async () => {
      try {
        const response = await apiClient.get(
          `/api/course-plans/${coursePlanId}`,
        );
        if (response.status === 200 && response.data.data) {
          setName(response.data.data.course_plan.name);
        }
      } catch (error) {
        console.error("Failed to fetch course plan name:", error);
      }
    };

    if (coursePlanId) {
      fetchCoursePlanName();
    }
  }, [coursePlanId]);

  return (
    <div className="from-neutral-60 via0-neutral-300 fixed top-0 left-0 z-30 h-12 w-full border-b border-white bg-gradient-to-br to-neutral-300 shadow-md inset-ring inset-ring-neutral-300">
      <div className="container mx-auto flex h-full items-center justify-between gap-4 px-4">
        <Link href={"/dashboard"}>Back</Link>
        <div className="flex items-center gap-4">
          {name ? (
            name
          ) : (
            <Skeleton
              className="h-5"
              containerClassName="w-36 block leading-none"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={
              isGraphMode
                ? `/course-plan/${coursePlanId}`
                : `/course-plan/${coursePlanId}/graph`
            }
            className="rounded p-2 transition-colors hover:bg-neutral-200"
            title={isGraphMode ? "Switch to Grid View" : "Switch to Graph View"}
          >
            <Image
              src={isGraphMode ? "/grid.svg" : "/graph.svg"}
              alt={isGraphMode ? "Grid View" : "Graph View"}
              width={24}
              height={24}
              className="text-neutral-800"
            />
          </Link>
          {/* User Icon Placeholder */}
        </div>
      </div>
    </div>
  );
}
