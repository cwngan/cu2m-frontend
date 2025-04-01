import { MouseEventHandler } from "react";

interface ButtonProps {
  text: string;
  action?: MouseEventHandler<HTMLDivElement>;
}
export default function Button({ text, action }: ButtonProps) {
  return (
    <div
      className="p-2 bg-neutral-300 px-12 font-bold cursor-pointer"
      onClick={action}
    >
      {text}
    </div>
  );
}
