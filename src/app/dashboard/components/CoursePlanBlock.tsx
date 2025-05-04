import clsx from "clsx";
import { CoursePlan, CoursePlanRead, CoursePlanUpdate } from "@/app/types/Models";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/scrollbar.css";
import axios from "axios";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import moment from "moment";

export default function CoursePlanBlock({
  plan,
  isUpdating: allUpdating,
  handleBlockChange,
}: {
  plan: CoursePlan;
  isUpdating: boolean;
  handleBlockChange: (updatedPlan: CoursePlan) => void;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<boolean>(allUpdating);
  useEffect(() => {
    setIsUpdating(allUpdating);
  }, [allUpdating]); 

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
              const coursePlanUpdate: CoursePlanUpdate = { "favourite": !plan.favourite };
              axios.patch<CoursePlanResponseModel>(`/api/course-plans/${plan._id}`, coursePlanUpdate, {
                baseURL: process.env.NEXT_PUBLIC_API_URL,
              })
              .then((res) => {
                const response = res.data;
                if (response.status == "ERROR" || response.data === null) {
                  throw new Error(response.error);
                }

                let updatedPlan: CoursePlanRead = response.data as CoursePlanRead;
                updatedPlan.updated_at = moment(updatedPlan.updated_at);
                handleBlockChange(updatedPlan);
                setIsUpdating(false);
              }).catch((err) => {
                console.error(err);
                alert("Course plan update failed");
              })
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
