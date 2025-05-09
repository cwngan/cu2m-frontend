import { Course } from "@/app/types/Models";
import clsx from "clsx";
import { CourseDetailItem } from "./CourseDetailItem";
import { getUnitsColor } from "../utils";

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
                <CourseDetailItem
                  key={"course-detail-item-units"}
                  className="justify-center col-span-1"
                >
                  Units
                </CourseDetailItem>
                <CourseDetailItem
                  key={"course-detail-item-units-value"}
                  className="col-span-3"
                >
                  <div
                    className={clsx(
                      "flex h-8 w-16 items-center justify-center rounded-md text-center",
                      getUnitsColor(course.units),
                    )}
                  >
                    {course.units.toFixed(1).toString()}{" "}
                  </div>
                </CourseDetailItem>
                <CourseDetailItem
                  key={"course-detail-item-graded"}
                  className="justify-center"
                >
                  Graded
                </CourseDetailItem>
                <CourseDetailItem
                  key={"course-detail-item-graded-value"}
                  className="col-span-3"
                >
                  <div
                    className={clsx(
                      "flex h-8 w-16 items-center justify-center rounded-md text-center",
                      course.is_graded ? "bg-green-400" : "bg-red-400",
                    )}
                  >
                    {course.is_graded ? "Yes" : "No"}
                  </div>
                </CourseDetailItem>
                <CourseDetailItem
                  key={"course-detail-item-description"}
                  className="justify-center col-span-1"
                >
                  Description
                </CourseDetailItem>
                <CourseDetailItem
                  key={"course-detail-item-description-value"}
                  className="col-span-3"
                >
                  {course.description.split("\n").map((str, index) => (
                    <span
                      key={`course-detail-item-description-paragraph-${index}`}
                    >
                      {str}
                    </span>
                  ))}
                </CourseDetailItem>
                {course.parsed && (
                  <>
                    <CourseDetailItem
                      key={"course-detail-item-prerequisites"}
                      className="justify-center col-span-1"
                    >
                      Prerequisites
                    </CourseDetailItem>
                    <CourseDetailItem
                      key={"course-detail-item-prerequisites-value"}
                      className="col-span-3"
                    >
                      {course.prerequisites === "" ? "-" : course.prerequisites}
                    </CourseDetailItem>
                  </>
                )}
                {!course.parsed && (
                  <>
                    <CourseDetailItem
                      key={"course-detail-item-prerequisites"}
                      className="justify-center col-span-1"
                    >
                      Prerequisites (Not parsed)
                    </CourseDetailItem>
                    <CourseDetailItem
                      className="col-span-3"
                      key={"course-detail-item-prerequisites-value"}
                    >
                      {course.original}
                    </CourseDetailItem>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
