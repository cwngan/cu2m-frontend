import clsx from "clsx";
import {
  Dispatch,
  HTMLAttributes,
  SetStateAction,
  useEffect,
  useRef,
  // useState,
} from "react";
import { useDrag } from "react-dnd";

// interface DropResultType {
//   allowedDrop?: boolean;
// }

export default function DraggableBlock<ItemType>(
  props: {
    blockType: string;
    dragItem: ItemType;
    setIsDragging: Dispatch<SetStateAction<boolean>> | null;
  } & HTMLAttributes<HTMLDivElement>,
) {
  const { children, blockType, dragItem, className, setIsDragging } = props;
  const drag = useRef<HTMLDivElement>(null);
  // const [didBounce, setDidBounce] = useState(false);

  const [{ isDragging }, dragConnector] = useDrag(() => ({
    type: blockType,
    item: dragItem,
    // end: (item, monitor) => {
    //   const dropResult = monitor.getDropResult<DropResultType>();
    //   // If no drop result or drop was not allowed, trigger bounce animation
    //   if (!dropResult || !dropResult.allowedDrop) {
    //     setDidBounce(true);
    //     setTimeout(() => setDidBounce(false), 300); // Reset after animation
    //   }
    // },
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
      {...props}
      className={clsx(
        "transform rounded-lg transition-transform duration-200 hover:scale-105 hover:transition active:scale-100",
        isDragging ? "scale-105 opacity-50" : "",
        // didBounce && "animate-bounce",
        className,
      )}
    >
      {children}
    </div>
  );
}
