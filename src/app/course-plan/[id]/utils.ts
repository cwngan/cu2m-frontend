const levelColors: { [key: number]: string } = {
  1: "bg-green-800/30 text-gray-80",
  2: "bg-zinc-500/40",
  3: "bg-teal-700/30",
  4: "bg-stone-600/40 text-stone-800",
};

export const getCourseColor = (code: string): string => {
  // Extract the first digit from the numeric part of the course code (e.g., CSCI2100 -> 2)
  const match = code.match(/\d/);
  const level = match ? parseInt(match[0]) : undefined;
  return level !== undefined ? levelColors[level] : "bg-neutral-200";
};
