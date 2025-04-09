interface ButtonProps {
  text: string;
}

export default function Button({ text }: ButtonProps) {
  return (
    <button
      className="cursor-pointer bg-neutral-300 p-2 px-12 font-bold"
      type="submit"
    >
      {text}
    </button>
  );
}
