"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";

interface TopBarProps {
  coursePlanId: string;
}

export default function TopBar({ coursePlanId }: TopBarProps) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    const fetchCoursePlanName = async () => {
      // Simulate an API call to fetch the course plan name
      const response = await new Promise<{ name: string }>((resolve) =>
        setTimeout(() => resolve({ name: "TEST PLAN" }), 200),
      );
      setName(response.name);
    };
    if (coursePlanId) {
      fetchCoursePlanName();
    }
  }, [coursePlanId]);
  return (
    <div className="fixed top-0 left-0 h-12 w-full border-b">
      <div className="container mx-auto flex h-full items-center justify-between gap-4 px-4">
        <Link href={"/dashboard"}>Back</Link>
        <div>
          {name ? (
            name
          ) : (
            <Skeleton
              className="h-5"
              containerClassName="w-36 block leading-none"
            />
          )}
        </div>
        <div>
          {/* User Icon Placeholder */}
          <div>Icon</div>
        </div>
      </div>
    </div>
  );
}
