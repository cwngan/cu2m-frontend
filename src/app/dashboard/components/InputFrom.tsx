import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoursePlan } from "../types/CoursePlan";
import moment from "moment";
import { ObjectId } from "bson";

export default function InputFrom({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [numOfYears, setNumOfYears] = useState(4); //no. of years default set as 4 years
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  //the created plan object that could be passed to the backend
  const newPlan: CoursePlan = {
    _id: new ObjectId().toHexString(),
    name: name,
    updated_at: moment(),
    description: description,
    favourite: false,
  };

  // navigation function of the add button
  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/course-plan/${newPlan._id}`); // navigate to an id greater than maxID
  };

  const plus = () => {
    if (numOfYears < 8) setNumOfYears(numOfYears + 1); // maximum 8 years
  };

  const minus = () => {
    if (numOfYears > 2) setNumOfYears(numOfYears - 1); // minimum 2 years
  };

  return (
    <form
      onSubmit={handleAdd} // Attach the custom handler to the form
      className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform flex-col gap-3 rounded-lg border bg-white p-6 shadow-md"
    >
      {/* Plan name*/}
      <label className="flex flex-row items-center">
        <span className="w-22 font-medium text-gray-700">Name:</span>
        <input
          type="text"
          placeholder="Plan name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-violet-400 focus:outline-none"
        />
      </label>

      {/* No. of year */}
      <label className="flex flex-row items-center">
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
      </label>

      {/* Description */}
      <label className="flex flex-col">
        <span className="font-medium text-gray-700">Description:</span>
        <textarea
          rows={4}
          placeholder=""
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 rounded-md border border-gray-300 p-2 focus:ring-2 focus:ring-violet-400 focus:outline-none"
        />
      </label>

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
          className="rounded-md bg-violet-400 px-4 py-2 text-white transition hover:bg-indigo-500"
        >
          Add
        </button>
      </div>
    </form>
  );
}
