import { useState } from "react";
import InputFrom from "./InputFrom";

export default function CreateCoursePlan({ID}:{ID:number}) {
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
        className="group flex items-center justify-center h-52 w-42 bg-zinc-100 border-2 border-dashed border-gray-300 rounded-2xl transition delay-10 duration-300 ease-in-out hover:scale-110 hover:bg-amber-200 hover:shadow-lg"
      >
        <div
          className="text-gray-400 text-9xl font-light w-40 h-40 flex items-center justify-center group-hover:hidden"
        >
          +
        </div>
        <div
          className="animate-pulse hidden text-white w-40 h-40 text-9xl font-large group-hover:flex items-center justify-center"
        >
          +
        </div>
      </div>

      {/* Input Form */}
      {showForm && (
        <div
          className="flex items-center justify-center fixed top-0 right-0 w-full h-full z-50"
          onClick={() => setShowForm(false)} // Close the form when clicking outside
        >
          <div
            className="relative transition-all duration-500 ease-in-out transform opacity-100 translate-y-0 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
          >
            {/* Pass the handleCloseForm function as a prop */}
            <InputFrom 
            onClose={handleCloseForm}
            maxID={ID} />
          </div>
        </div>
      )}
    </>
  );
}