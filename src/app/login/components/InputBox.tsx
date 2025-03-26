import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type InputBoxProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export default function InputBox(props: InputBoxProps) {
  return <input className="border leading-none p-2 w-96 text-2xl" {...props} />;
}
