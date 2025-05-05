import { Course } from "@/app/types/Models";
import clsx from "clsx";

export default function CourseDetailBlock({
  course,
  isOpen,
  onClose,
}: {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}) {
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
        <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl bg-white p-6 ring-2 ring-zinc-300/20"></div>
      </div>
    </>
  );
}
