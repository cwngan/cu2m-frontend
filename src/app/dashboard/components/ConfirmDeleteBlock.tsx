import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { CoursePlan } from "@/app/types/Models";
import { apiClient } from "@/apiClient";
import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";

export default function ConfirmDeleteBlock({
  plan,
  isOpen,
  onClose,
  handleDeleteChange,
}: {
  plan: CoursePlan | null;
  isOpen: boolean;
  onClose: () => void;
  handleDeleteChange: (deletedPlan: CoursePlan) => void;
}) {
  const [name, setName] = useState(plan === null ? "" : plan.name);
  useEffect(() => {
    if (plan !== null) {
      setName(plan.name);
    }
  }, [plan]);
  const handleDelete = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (!plan) return;
      apiClient
        .delete<CoursePlanResponseModel>(`/api/course-plans/${plan._id}`)
        .then((res) => {
          const response = res.data;
          if (response.status === "ERROR") {
            throw new Error(response.error);
          }
          handleDeleteChange(plan);
        })
        .catch((err) => {
          console.error(err);
          alert("Course plan deletion failed");
        });
      onClose();
    },
    [plan, handleDeleteChange, onClose],
  );

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
          onSubmit={handleDelete}
          className="absolute top-1/2 left-1/2 flex flex-auto -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-lg bg-white p-6 ring-2 ring-zinc-300/20"
        >
          <div className="mb-4 flex-1 text-2xl font-medium text-nowrap text-zinc-800">
            Are you sure to delete the course plan &quot;{name}
            &quot;?
          </div>
          {/* Buttons */}
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              className="rounded-md bg-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-red-400 px-4 py-2 text-white transition hover:bg-red-500"
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
