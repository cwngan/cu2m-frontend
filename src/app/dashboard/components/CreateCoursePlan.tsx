import { useState } from "react";
import InputForm from "./InputForm";

export default function CreateCoursePlan() {
  const [showForm, setShowForm] = useState(false);

  const inputInfo = () => {
    setShowForm(true); // Show the form when the block is clicked
  };

  const handleCloseForm = () => {
    setShowForm(false); // Close the form
  };

  return (
    <>
      {/* Create Course Plan Block */}
      <div
        onClick={inputInfo}
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
      {/* Pass the handleCloseForm function as a prop */}
      <InputForm
        mode="add"
        plan={null}
        onClose={handleCloseForm}
        handleBlockChange={null}
        isOpen={showForm}
      />
    </>
  );
}
