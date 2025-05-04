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
        "border leading-none p-2 w-96 rounded-md border-neutral-400 ring-slate-400 hover:ring-2",
        props.className // still allow override if needed, but default is always applied
      )}
    />
  );
}
