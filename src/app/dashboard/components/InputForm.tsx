import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CoursePlan,
  CoursePlanCreate,
  CoursePlanRead,
} from "@/app/types/Models";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import moment from "moment";
import { apiClient } from "@/apiClient";
import clsx from "clsx";

export default function InputForm({
  isOpen,
  mode,
  plan,
  onClose,
  handleBlockChange,
}: {
  isOpen: boolean;
  mode: string;
  plan: CoursePlan | null;
  onClose: () => void;
  handleBlockChange: ((updatedPlan: CoursePlan) => void) | null;
}) {
  const router = useRouter();
  // const [numOfYears, setNumOfYears] = useState(4); //no. of years default set as 4 years
  const [description, setDescription] = useState(
    plan === null ? "" : plan.description,
  );
  const [name, setName] = useState(plan === null ? "" : plan.name);

  useEffect(() => {
    if (plan !== null) {
      setDescription(plan.description);
      setName(plan.name);
    }
  }, [plan]);

  // navigation function of the add button
  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    // Submit a new plan
    const coursePlanCreate: CoursePlanCreate = {
      description: description,
      name: name,
    };
    apiClient
      .post<CoursePlanResponseModel>("/api/course-plans/", coursePlanCreate)
      .then((res) => {
        const response = res.data;
        if (response.status === "ERROR" || response.data === null) {
          throw new Error(response.error);
        }
        const newPlan: CoursePlanRead = response.data as CoursePlanRead;
        router.push(`/course-plan/${newPlan._id}`); // navigate to course plan id
      })
      .catch((err) => {
        console.error(err);
        alert("Course plan creation failed");
      });
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    // Submit a new plan
    const coursePlanUpdate: CoursePlanCreate = {
      description: description,
      name: name,
    };

    if (plan !== null) {
      apiClient
        .patch<CoursePlanResponseModel>(
          `/api/course-plans/${plan._id}`,
          coursePlanUpdate,
        )
        .then((res) => {
          const response = res.data;
          if (response.status === "ERROR" || response.data === null) {
            throw new Error(response.error);
          }
          const updatedPlan: CoursePlanRead = response.data as CoursePlanRead;
          updatedPlan.updated_at = moment(updatedPlan.updated_at);
          if (handleBlockChange !== null) {
            handleBlockChange(updatedPlan);
          } else {
            throw new Error("handleBlockChange is null");
          }
        })
        .catch((err) => {
          console.error(err);
          alert("Course plan update failed");
        });
      onClose();
    } else {
      console.error("plan is null");
      alert("Course plan update failed");
    }
  };

  // const plus = () => {
  //   if (numOfYears < 8) setNumOfYears(numOfYears + 1); // maximum 8 years
  // };

  // const minus = () => {
  //   if (numOfYears > 2) setNumOfYears(numOfYears - 1); // minimum 2 years
  // };

  return (
    <>
      <div
        className={clsx(
          "fixed top-0 right-0 z-50 flex h-full w-full items-center justify-center bg-black/50 transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose} // Close the form when clicking outside
      ></div>
      <div
        className={clsx(
          "animate-fade-in-up fixed top-[calc(50vh)] left-[calc(50vw)] z-1000 translate-y-0 transform transition-all duration-500 ease-in-out",
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
      >
        <form
          onSubmit={mode === "add" ? handleAdd : handleUpdate} // Attach the custom handler to the form
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl bg-white p-6 ring-2 ring-zinc-300/20"
        >
          {/* Plan name*/}
          <div className="mb-4 text-2xl font-medium text-zinc-800">
            {mode === "add" ? "Create Plan" : "Update Plan"}
          </div>
          <label className="flex flex-row items-center">
            <span className="w-22 font-medium text-gray-700">Name:</span>
            <input
              type="text"
              name="name"
              placeholder="Plan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-zinc-400 focus:outline-none"
            />
          </label>

          {/* No. of year */}
          {/* <label className="flex flex-row items-center">
        <span className="w-22 font-medium text-gray-700">No. of Year:</span>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={numOfYears}
            readOnly
            className="h-12 w-12 rounded-md border border-gray-300 text-center focus:outline-none"
          />
          <button
            type="button"
            onClick={plus}
            className="w-6 rounded-md bg-gray-300 py-1 text-gray-700 transition hover:bg-gray-400"
          >
            +
          </button>
          <button
            type="button"
            onClick={minus}
            className="w-6 rounded-md bg-gray-300 py-1 text-gray-700 transition hover:bg-gray-400"
          >
            -
          </button>
        </div>
      </label> */}

          {/* Description */}
          <label className="flex flex-col">
            <span className="font-medium text-gray-700">Description:</span>
            <textarea
              name="description"
              rows={4}
              placeholder=""
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-zinc-400 focus:outline-none"
            />
          </label>

          {/* Buttons */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              className="cursor-pointer rounded-md bg-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer rounded-md bg-slate-400 px-4 py-2 text-white transition hover:bg-slate-500"
            >
              {mode === "add" ? "Add" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
