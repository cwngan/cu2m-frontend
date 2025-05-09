import clsx from "clsx";
import { Dispatch, ReactNode, SetStateAction, useEffect, useRef } from "react";
import { useDrag } from "react-dnd";

export default function DraggableBlock<ItemType>({
  children,
  blockType,
  dragItem,
  className,
  setIsDragging,
}: {
  children: ReactNode;
  blockType: string;
  dragItem: ItemType;
  className?: string;
  setIsDragging: Dispatch<SetStateAction<boolean>> | null;
}) {
  const drag = useRef<HTMLDivElement>(null);
  const [{ isDragging }, dragConnector] = useDrag(() => ({
    type: blockType,
    item: dragItem,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  dragConnector(drag);

  useEffect(() => {
    if (setIsDragging === null) return;
    setIsDragging(isDragging);
  }, [isDragging, setIsDragging]);

  return (
    <div
      ref={drag}
      className={clsx(
        "transform rounded-lg transition-transform duration-200 hover:scale-105 hover:transition active:scale-100",
        isDragging ? "opacity-50" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}
