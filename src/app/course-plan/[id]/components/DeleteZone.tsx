import { useRef, useContext } from "react";
import { useDrop } from "react-dnd";
import { SearchBlockContext } from "./SearchBlock";

export default function DeleteZone({
  onRemove,
}: {
  onRemove: (courseId: string, semesterPlanId: string) => void;
}) {
  const deleteRef = useRef<HTMLDivElement>(null);
  const { isOpen: isSearchBlockOpen } = useContext(SearchBlockContext);

  const [{ isOver }, dropConnector] = useDrop(() => ({
    accept: "COURSE",
    drop: (item: { courseId: string; semesterPlanId: string }) => {
      onRemove(item.courseId, item.semesterPlanId);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  dropConnector(deleteRef);

  return (
    <div
      ref={deleteRef}
      className={`fixed bottom-0 left-0 z-40 h-32 w-full bg-red-500/50 transition-opacity duration-200 ${
        isSearchBlockOpen ? "opacity-0" : isOver ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex h-full items-center justify-center text-2xl font-bold text-white">
        Drop to Delete
      </div>
    </div>
  );
}
