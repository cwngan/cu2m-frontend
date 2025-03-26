import clsx from "clsx";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputBoxProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function InputBox(props: InputBoxProps) {
  return (
    <input
      {...{
        ...props,
        className: clsx(
          "border leading-none p-2 w-96 text-2xl",
          props.className
        ),
      }}
    />
  );
}
