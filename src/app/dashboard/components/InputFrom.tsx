import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoursePlan } from "../types/CoursePlan";
import moment from "moment";

export default function InputFrom(
  { onClose,
    maxID,
   }: { 
    onClose: () => void;
    maxID: number;}
)  {
  
  const router = useRouter();
  const [numOfYears, setNumOfYears] = useState(4);//no. of years default set as 4 years
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");

  //the created plan object that could be passed to the backend
  const newPlan : CoursePlan = {
      _id: (maxID+1).toString(),
      name: name,
      updated_at: moment(),
      description: description,
      favourite: false,
  }

  // navigation function of the add button
  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/course-plan/${newPlan._id}`);// navigate to an id greater than maxID
  };

  const plus = () => {
    if (numOfYears < 8) setNumOfYears(numOfYears + 1);//maximum 8 years
  };

  const minus = () => {
    if (numOfYears > 2) setNumOfYears(numOfYears - 1); //minimum 2 years
  };

  return (
    <form 
    onSubmit={handleAdd} // Attach the custom handler to the form
    className="flex flex-col gap-3 p-6 border rounded-lg shadow-md bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

      {/* Plan name*/}
      <label className="flex flex-row items-center">
        <span className="w-22 text-gray-700 font-medium">Name:</span>
        <input
          type="text"
          placeholder="Plan name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>


        {/* No. of year */}
        <label className="flex flex-row items-center">
        <span className="w-22 text-gray-700 font-medium">No. of Year:</span>
        <div className="flex items-center gap-2">
          
          <input
            type="text"
            value={numOfYears}
            readOnly
            className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none"
          />
          <button
            type="button"
            onClick={plus}
            className="w-6 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            +
          </button>
          <button
            type="button"
            onClick={minus}
            className="w-6 py-1 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            -
          </button>
        </div>
      </label>

      {/* Description */}
      <label className="flex flex-col">
        <span className="text-gray-700 font-medium">Description:</span>
        <textarea
          rows={4}
          placeholder=""
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400"
        />
      </label>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
        <button
          type="button"
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          onClick={onClose} 
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-400 text-white rounded-md hover:bg-slate-500 transition"
        >
          Add
        </button>
      </div>
    </form>
  );
}