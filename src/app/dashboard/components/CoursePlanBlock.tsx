import clsx from "clsx";
import {
  CoursePlan,
  CoursePlanRead,
  CoursePlanUpdate,
} from "@/app/types/Models";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "@/app/scrollbar.css";
import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import moment from "moment";
import InputForm from "./InputForm";
import { apiClient } from "@/apiClient";
import ConfirmDeleteBlock from "./ConfirmDeleteBlock";

export default function CoursePlanBlock({
  plan,
  isUpdating: allUpdating,
  handleBlockChange,
  handleDeleteChange,
}: {
  plan: CoursePlan;
  isUpdating: boolean;
  handleBlockChange: (updatedPlan: CoursePlan) => void;
  handleDeleteChange: (deletedPlan: CoursePlan) => void;
}) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<boolean>(allUpdating);

  useEffect(() => {
    setIsUpdating(allUpdating);
  }, [allUpdating]);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const InputInfo = () => {
    setShowForm(true); // Show the form when the block is clicked
  };

  const ConfirmDelete = () => {
    setShowDelete(true); // Show the delete confirmation
  };

  const handleCloseForm = () => {
    // Close all forms
    setShowForm(false);
    setShowDelete(false);
  };

  return (
    <>
      {/* course plan block */}
      <div
        className={clsx(
          "group duration 400 relative transition delay-20 ease-in-out transform-3d hover:flex hover:scale-110",
          isUpdating
            ? "cursor-not-allowed select-none"
            : showForm || showDelete
              ? "cursor-default select-none"
              : "cursor-pointer",
          showForm || showDelete ? "z-999" : "hover:z-999",
        )}
        onClick={() => {
          if (!showForm && !showDelete && !isUpdating)
            router.push(`/course-plan/${plan._id}`);
        }}
      >
        <div
          className={clsx(
            "relative z-10 flex h-52 w-42 flex-col items-center justify-center rounded-2xl bg-white p-4 shadow-lg transition duration-300 ease-in-out",
          )}
        >
          {isUpdating && (
            <div className="absolute top-0 left-0 h-full w-full rounded-2xl bg-zinc-100/75"></div>
          )}
          {!showForm && !showDelete && (
            <div className="absolute top-2 flex w-full flex-row justify-between p-2 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100">
              <a
                onClick={async (e) => {
                  e.stopPropagation();
                  ConfirmDelete();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-trash"
                  viewBox="0 0 16 16"
                >
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
              </a>
              <a
                onClick={async (e) => {
                  e.stopPropagation();
                  InputInfo();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-gear"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
                  <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115z" />
                </svg>
              </a>
            </div>
          )}

          <div className="mb-4 max-w-full truncate text-2xl font-medium text-zinc-800">
            {plan.name}
          </div>
          <div className="text-md text-zinc-600">
            {plan.updated_at.format("HH:mm")}
          </div>
          <div className="text-md text-zinc-500">
            {plan.updated_at.format("DD/MM/YYYY")}
          </div>
        </div>

        {/* Hover decription*/}
        <div className="absolute top-4 h-42 w-42 -translate-z-10 flex-col overflow-hidden rounded-b-2xl bg-gradient-to-b from-white via-zinc-100 to-zinc-200 px-4 py-8 text-ellipsis transition duration-350 group-hover:flex group-hover:translate-y-45">
          {/* Title block with star icon of the course plan when hover */}
          <div className="relative flex items-center justify-center">
            <div
              // star icon
              className="z-40 transform cursor-default text-3xl text-slate-600 transition-transform duration-250 select-none active:scale-50"
              onClick={async (e) => {
                e.stopPropagation();
                // Simulate an API call to update the favourite status
                setIsUpdating(true);
                const coursePlanUpdate: CoursePlanUpdate = {
                  favourite: !plan.favourite,
                };
                apiClient
                  .patch<CoursePlanResponseModel>(
                    `/api/course-plans/${plan._id}`,
                    coursePlanUpdate,
                  )
                  .then((res) => {
                    const response = res.data;
                    if (response.status == "ERROR" || response.data === null) {
                      throw new Error(response.error);
                    }

                    const updatedPlan: CoursePlanRead =
                      response.data as CoursePlanRead;
                    updatedPlan.updated_at = moment(updatedPlan.updated_at);
                    handleBlockChange(updatedPlan);
                    setIsUpdating(false);
                  })
                  .catch((err) => {
                    console.error(err);
                    alert("Course plan update failed");
                  });
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
      {/* Input Form */}
      {/* Pass the handleCloseForm function as a prop */}
      <InputForm
        mode="update"
        plan={plan}
        onClose={handleCloseForm}
        handleBlockChange={handleBlockChange}
        isOpen={showForm}
      />
      {/* Delete Form */}
      {/* Pass the handleCloseForm function as a prop */}
      <ConfirmDeleteBlock
        plan={plan}
        onClose={handleCloseForm}
        handleDeleteChange={handleDeleteChange}
        isOpen={showDelete}
      />
    </>
  );
}
