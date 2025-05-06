import { Course } from "@/app/types/Models";
import clsx from "clsx";
import { CourseDetailItem } from "./CourseDetailItem";

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
      {isOpen && (
        <div
          className={clsx(
            "animate-fade-in-up fixed top-[calc(50vh)] left-[calc(50vw)] z-1000 translate-y-0 transform transition-all duration-500 ease-in-out",
            isOpen
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0",
          )}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
        >
          {course !== null && (
            <div className="absolute top-1/2 left-1/2 flex w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-xl bg-white p-6 text-wrap ring-2 ring-zinc-300/20">
              <div className="text-3xl font-medium text-zinc-800">
                {course.code}
              </div>
              <div className="text-2xl font-medium text-zinc-800">
                {course.title}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {/* TODO: set opacity */}
                <CourseDetailItem className="justify-center" span={1}>Units</CourseDetailItem>
                <CourseDetailItem span={3}>
                  {course.units.toFixed(1).toString()}{" "}
                </CourseDetailItem>
                <CourseDetailItem className="justify-center" span={1}>Graded</CourseDetailItem>
                <CourseDetailItem span={3}>
                  <div className={clsx("flex w-16 h-8 items-center justify-center text-center rounded-md", course.is_graded ? "bg-green-400" : "bg-red-400")}>
                    {course.is_graded ? "Yes" : "No"}
                  </div>
                </CourseDetailItem>
                <CourseDetailItem className="justify-center" span={1}>Description</CourseDetailItem>
                <CourseDetailItem span={3}>
                  {course.description.split("\n").map((str) => (
                    <span>{str}</span>
                  ))}
                </CourseDetailItem>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
