import clsx from "clsx";
import { CoursePlan } from "../types/CoursePlan";
import { useEffect, useState } from "react";

export default function CoursePlanBlock({
  plan: orgiPlan,
  isUpdating: allUpdating,
}: {
  plan: CoursePlan;
  isUpdating: boolean;
}) {
  const [isUpdating, setIsUpdating] = useState<boolean>(allUpdating);
  const [plan, setPlan] = useState<CoursePlan>(orgiPlan);
  useEffect(() => {
    setIsUpdating(allUpdating);
  }, [allUpdating]);
  useEffect(() => {
    setPlan(orgiPlan);
  }, [orgiPlan]);
  return (
    <div
      className={clsx(
        "group relative flex h-52 w-42 flex-col items-center justify-center overflow-hidden rounded-2xl border p-4",
        isUpdating
          ? "cursor-not-allowed opacity-25 select-none"
          : "cursor-pointer opacity-100",
      )}
    >
      <div className="mb-4 text-2xl">{plan.name}</div>
      <div>{plan.updated_at.format("HH:mm")}</div>
      <div>{plan.updated_at.format("DD/MM/YYYY")}</div>
      <div className="absolute hidden h-full w-full flex-col overflow-hidden bg-white/85 p-4 text-ellipsis group-hover:flex">
        <div className="relative z-50 flex items-center justify-between">
          <div className="text-2xl font-bold">{plan.name}</div>
          <div
            className="cursor-default"
            onClick={async () => {
              // Simulate an API call to update the favourite status
              setIsUpdating(true);
              setTimeout(() => {
                setPlan((prev) => ({ ...prev, favourite: !prev.favourite }));
                setIsUpdating(false);
              }, 500);
            }}
          >
            {plan.favourite ? "★" : "☆"}
          </div>
        </div>
        <div className="flex-grow overflow-hidden text-ellipsis">
          {plan.description}
        </div>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-white/0 from-50% to-white/100 to-90%"></div>
      </div>
    </div>
  );
}
