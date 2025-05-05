import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import clsx from "clsx";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { CoursePlan, CoursePlanRead } from "@/app/types/Models";
import CoursePlanBlock from "./CoursePlanBlock";
import CreateCoursePlan from "./CreateCoursePlan";
import { apiClient } from "@/apiClient";

// data structure simulation for course plan(receicing RawCoursePlan typed objects as data)
// const template: { data: RawCoursePlan[] } = {
//   data: [
//     {
//       _id: "124",
//       name: "abcd",
//       updated_at: "2025-03-30T12:00:00Z",
//       description:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
//       favourite: false,
//     },
//     {
//       _id: "125",
//       name: "abcde",
//       updated_at: "2025-04-01T08:00:00Z",
//       description:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
//       favourite: true,
//     },
//     {
//       _id: "126",
//       name: "bbcd",
//       updated_at: "2025-03-31T08:00:00Z",
//       description:
//         "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
//       favourite: false,
//     },
//   ],
// };

// The display filter setting of dashboard page
interface CoursePlanGridProps {
  sortBy: string;
  starredFilter: boolean;
}

// filter function for sorting course plans
const compByName = (a: CoursePlan, b: CoursePlan) => {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
};

const compByLastEdit = (a: CoursePlan, b: CoursePlan) => {
  return a.updated_at > b.updated_at ? -1 : a.updated_at < b.updated_at ? 1 : 0;
};

export default function CoursePlanGrid({
  sortBy,
  starredFilter,
}: CoursePlanGridProps) {
  // determine the display filter type
  const compFunc =
    sortBy === "name"
      ? compByName
      : sortBy === "last_edit"
        ? compByLastEdit
        : compByName;
  const [coursePlans, setCoursePlans] = useState<CoursePlan[]>([]);
  const [renderedPlans, setRenderedPlans] = useState<CoursePlan[]>([]);
  const [isUpdating, setIsUpdating] = useState(true);

  const handleBlockChange = useCallback(
    (updatedPlan: CoursePlan) => {
      const index = coursePlans.findIndex(
        (plan) => plan._id === updatedPlan._id,
      );
      setCoursePlans((prev) => {
        const newCoursePlans = [...prev];
        newCoursePlans[index] = updatedPlan;
        return newCoursePlans;
      });
    },
    [coursePlans],
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);

      apiClient
        .get<CoursePlanResponseModel>("/api/course-plans/")
        .then((res) => {
          const response = res.data;
          if (response.status === "ERROR" || response.data === null) {
            throw new Error(response.error);
          }

          const coursePlans: CoursePlan[] = (response.data as CoursePlanRead[])
            .map((plan: CoursePlan) => {
              return {
                _id: plan._id,
                name: plan.name,
                updated_at: moment(plan.updated_at),
                description: plan.description,
                favourite: plan.favourite,
                user_id: plan.user_id,
              };
            })
            .sort(compFunc);
          setCoursePlans(coursePlans);
          setIsUpdating(false);
        })
        .catch((err) => {
          console.error(err);
          alert("Course plans fetch failed");
          setIsUpdating(false);
        });
    };
    fetchData();
  }, [compFunc]);

  useEffect(() => {
    if (starredFilter) {
      setRenderedPlans(coursePlans.filter((plan) => plan.favourite));
    } else {
      setRenderedPlans(coursePlans);
    }
  }, [coursePlans, starredFilter]);

  return (
    <div className={clsx("flex flex-row flex-wrap gap-6")}>
      {/* Always place the CreateCoursePlan block before all existing plans */}
      <CreateCoursePlan />
      {/* Display coursePlanBlocks from array "plan" */}
      {renderedPlans.length > 0
        ? renderedPlans.map((plan) => (
            <CoursePlanBlock
              key={plan._id}
              plan={plan}
              isUpdating={isUpdating}
              handleBlockChange={handleBlockChange}
            />
          ))
        : null}
      {/* if the course plan aren't loaded yet, display skeleton*/}
      {isUpdating &&
        [...Array(20)].map((_, idx) => (
          <div
            key={idx}
            className="flex h-52 w-42 flex-col items-center justify-center rounded-2xl bg-neutral-50 p-4"
          >
            <Skeleton
              count={1}
              className="h-6"
              containerClassName="w-24 mb-4"
            />
            <Skeleton
              containerClassName="w-12 gap-2 flex items-center flex-col mb-2"
              inline
            />
            <Skeleton
              containerClassName="w-24 gap-2 flex items-center flex-col"
              inline
            />
          </div>
        ))}
    </div>
  );
}
