import { useState } from "react";
import InputFrom from "./InputFrom";

export default function CreateCoursePlan() {
  const [showForm, setShowForm] = useState(false);

  const InputInfo = () => {
    setShowForm(true); // Show the form when the block is clicked
  };

  const handleCloseForm = () => {
    setShowForm(false); // Close the form
  };

  return (
    <>
      {/* Create Course Plan Block */}
      <div
        onClick={InputInfo}
        className="group flex h-52 w-42 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-zinc-100 transition delay-10 duration-300 ease-in-out hover:scale-110 hover:bg-amber-200 hover:shadow-lg"
      >
        <div className="flex h-40 w-40 items-center justify-center text-9xl font-light text-gray-400 group-hover:hidden">
          +
        </div>
        <div className="hidden h-40 w-40 animate-pulse items-center justify-center text-9xl text-white select-none group-hover:flex">
          +
        </div>
      </div>

      {/* Input Form */}
      {showForm && (
        <div
          className="fixed top-0 right-0 z-50 flex h-full w-full items-center justify-center"
          onClick={() => setShowForm(false)} // Close the form when clicking outside
        >
          <div
            className="animate-fade-in-up relative translate-y-0 transform opacity-100 transition-all duration-500 ease-in-out"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
          >
            {/* Pass the handleCloseForm function as a prop */}
            <InputFrom onClose={handleCloseForm} />
          </div>
        </div>
      )}
    </>
  );
}
