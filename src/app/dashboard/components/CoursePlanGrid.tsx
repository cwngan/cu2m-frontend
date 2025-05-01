import moment from "moment";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import clsx from "clsx";
import { CoursePlan } from "../types/CoursePlan";
import { RawCoursePlan } from "../types/RawCoursePlan";
import CoursePlanBlock from "./CoursePlanBlock";
import CreateCoursePlan from "./CreateCoursePlan";

// data structure simulation for course plan(receicing RawCoursePlan typed objects as data)
const template: { data: RawCoursePlan[] } = {
  data: [
    {
      _id: "124",
      name: "abcd",
      updated_at: "2025-03-30T12:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
      favourite: false,
    },
    {
      _id: "125",
      name: "abcde",
      updated_at: "2025-04-01T08:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
      favourite: true,
    },
    {
      _id: "126",
      name: "bbcd",
      updated_at: "2025-03-31T08:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
      favourite: false,
    },
  ],
};

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
  const rawData = template; //should call API to get data in actual implementation
  const [coursePlans, setCoursePlans] = useState<CoursePlan[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsUpdating(true);
      const response = await new Promise<{ data: RawCoursePlan[] }>((resolve) =>
        setTimeout(() => resolve(rawData), 500),
      );
      //store the data fetched from API
      const coursePlans: CoursePlan[] = response.data
        .map((plan) => {
          return {
            _id: plan._id,
            name: plan.name,
            updated_at: moment(plan.updated_at),
            description: plan.description,
            favourite: plan.favourite,
          };
        })
        .sort(compFunc);
      setCoursePlans(coursePlans);
      setIsUpdating(false);
    };
    fetchData();
  }, [compFunc, rawData]);

  useEffect(() => {
    // data fetching performed by API call simulation
    const fetchData = async () => {
      setIsUpdating(true);
      const response = await new Promise<{ data: RawCoursePlan[] }>((resolve) =>
        setTimeout(() => resolve(rawData), 500),
      );
      let coursePlans: CoursePlan[] = response.data
        .map((plan) => {
          return {
            _id: plan._id,
            name: plan.name,
            updated_at: moment(plan.updated_at),
            description: plan.description,
            favourite: plan.favourite,
          };
        })
        .sort(compFunc);
      // Filter starred plans out
      if (starredFilter) {
        coursePlans = coursePlans.filter((plan) => plan.favourite);
      }
      setCoursePlans(coursePlans);
      setIsUpdating(false);
    };
    fetchData();
  }, [compFunc, rawData, starredFilter]);

  // Find the maximum ID, to be replaced by API call in actual implementation
  const maxID = Number(coursePlans[coursePlans.length - 1]?._id) || 0;

  return (
    <div className={clsx("flex flex-row flex-wrap gap-6")}>
      {/* Always place the CreateCoursePlan block before all existing plans */}
      <CreateCoursePlan ID={maxID} />
      {/* Display coursePlanBlocks from array "plan" */}
      {coursePlans.length > 0
        ? coursePlans.map((plan) => (
            <CoursePlanBlock
              key={plan._id}
              plan={plan}
              isUpdating={isUpdating}
            />
          ))
        : null}
      {/* if the course plan aren't loaded yet, display skeleton*/}
      {coursePlans.length === 0 &&
        [...Array(3)].map((_, idx) => (
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
