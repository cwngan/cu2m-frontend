import clsx from "clsx";
import { CoursePlan } from "../types/CoursePlan";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./scrollbar.css";

export default function CoursePlanBlock({
  plan: orgiPlan,
  isUpdating: allUpdating,
}: {
  plan: CoursePlan;
  isUpdating: boolean;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<boolean>(allUpdating);
  const [plan, setPlan] = useState<CoursePlan>(orgiPlan);
  useEffect(() => {
    setIsUpdating(allUpdating);
  }, [allUpdating]);
  useEffect(() => {
    setPlan(orgiPlan);
  }, [orgiPlan]);

  return (
    // course plan block
    <div
      className={clsx(
        "group duration 400 shaodw-2xl relative flex h-52 w-42 flex-col items-center justify-center rounded-2xl bg-white shadow-lg transition delay-20 ease-in-out transform-3d hover:flex hover:scale-110",
        isUpdating
          ? "cursor-not-allowed opacity-25 select-none"
          : "cursor-pointer opacity-100",
      )}
      onClick={() => {
        router.push(`/course-plan/${plan._id}`);
      }}
    >
      <div className="mb-4 text-2xl font-medium text-zinc-800">{plan.name}</div>
      <div className="text-md text-zinc-600">
        {plan.updated_at.format("HH:mm")}
      </div>
      <div className="text-md text-zinc-500">
        {plan.updated_at.format("DD/MM/YYYY")}
      </div>

      {/* Hover decription*/}
      <div className="from absolute h-42 w-42 -translate-z-10 flex-col overflow-hidden rounded-b-2xl bg-gradient-to-b via-zinc-800/10 to-zinc-800/20 p-4 text-ellipsis transition duration-350 group-hover:flex group-hover:translate-y-45">
        {/* Title block with star icon of the course plan when hover */}
        <div className="relative flex items-center justify-center">
          <div
            // star icon
            className="z-40 transform cursor-default text-3xl text-slate-600 transition-transform duration-250 select-none active:scale-50"
            onClick={async (e) => {
              e.stopPropagation();
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
        <div className="hide-scrollbar z-40 max-h-32 flex-grow overflow-y-auto text-ellipsis text-gray-800">
          {plan.description}
        </div>
        <div className="absolute top-0 left-0 h-full w-full"></div>
      </div>
      {/* end of the hover description */}
    </div>
  );
}
