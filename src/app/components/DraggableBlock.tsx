import clsx from "clsx";
import { ReactNode, useRef } from "react";
import { useDrag } from "react-dnd";

export default function DraggableBlock<ItemType>({
  children,
  blockType,
  dragItem,
  className,
}: {
  children: ReactNode;
  blockType: string;
  dragItem: ItemType;
  className?: string;
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

  return (
    <div
      ref={drag}
      className={clsx(
        "transform rounded-lg transition-transform duration-200 hover:scale-105 hover:transition active:scale-95",
        isDragging ? "opacity-50" : "",
        className,
      )}
    >
      {children}
    </div>
  );
}
