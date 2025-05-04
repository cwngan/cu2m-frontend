import clsx from "clsx";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputBoxProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function InputBox(props: InputBoxProps) {
  return (
    <input
      {...props}
      className={clsx(
        "w-96 rounded-md border border-neutral-400 p-2 leading-none ring-slate-400 hover:ring-2",
        props.className, // still allow override if needed, but default is always applied
      )}
    />
  );
}
