const levelColors: { [key: number]: string } = {
  1: "bg-green-800/30 text-gray-80",
  2: "bg-zinc-500/40",
  3: "bg-teal-700/30",
  4: "bg-stone-600/40 text-stone-800",
};

const unitsColors: { [key: number]: string } = {
  0: "bg-lime-100",
  1: "bg-yellow-100",
  2: "bg-amber-200",
  3: "bg-orange-300",
  4: "bg-red-300",
  5: "bg-pink-300",
};

export const getCourseColor = (code: string): string => {
  // Extract the first digit from the numeric part of the course code (e.g., CSCI2100 -> 2)
  const match = code.match(/\d/);
  const level = match ? parseInt(match[0]) : undefined;
  return level !== undefined ? levelColors[level] : "bg-neutral-200";
};

export const getUnitsColor = (units: number): string => {
  const fixedUnits = Math.min(5, units);
  return unitsColors[fixedUnits];
};
