import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import { CoursePlan } from "@/app/types/Models";
import { apiClient } from "@/apiClient";

export default function ConfirmDeleteBlock({
  plan,
  onClose,
  handleDeleteChange,
}: {
  plan: CoursePlan;
  onClose: () => void;
  handleDeleteChange: (deletedPlan: CoursePlan) => void;
}) {
  const handleDelete = (event: React.FormEvent) => {
    event.preventDefault();
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
  };
  return (
    <form
      onSubmit={handleDelete}
      className="absolute top-1/2 left-1/2 flex flex-auto -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-lg border bg-white p-6 shadow-md"
    >
      <div className="mb-4 flex-1 text-2xl font-medium text-nowrap text-zinc-800">
        Are you sure to delete the course plan "{plan.name}"?
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
  );
}
