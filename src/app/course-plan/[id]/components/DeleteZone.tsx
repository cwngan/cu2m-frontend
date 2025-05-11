import { Dispatch, SetStateAction, useContext, useRef } from "react";
import { useDrop } from "react-dnd";
import { CourseRead } from "@/app/types/Models";
import clsx from "clsx";
import { SearchBlockContext } from "./SearchBlock";

export default function DeleteZone({
  onRemove,
  setIsDragging,
}: {
  onRemove: (courseCode: string | null, semesterPlanId: string) => void;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
}) {
  const deleteRef = useRef<HTMLDivElement>(null);
  const { isOpen: isSearchBlockOpen } = useContext(SearchBlockContext);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: "COURSE",
      drop: (item: { course: CourseRead; semesterPlanId: string }) => {
        setIsDragging(false);
        onRemove(item.course.code, item.semesterPlanId);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
        canDrop: !!monitor.canDrop(),
      }),
    }),
    [onRemove],
  );

  drop(deleteRef);

  return (
    <div
      ref={deleteRef}
      className={clsx(
        "fixed right-8 z-[51] flex h-16 w-16 items-center justify-center rounded-lg transition-all duration-200",
        isOver ? "scale-110 bg-red-500" : "bg-red-400 hover:bg-red-500",
        canDrop ? "opacity-100" : "opacity-70",
        // When search bar is closed, position just above it (16 = height of button)
        // When open, position above the search results area
        isSearchBlockOpen ? "bottom-[280px]" : "bottom-[calc(4rem_+_1rem)]",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="white"
        className={clsx(
          "h-8 w-8 transition-transform duration-200",
          isOver && "scale-110",
        )}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
        />
      </svg>
    </div>
  );
}
