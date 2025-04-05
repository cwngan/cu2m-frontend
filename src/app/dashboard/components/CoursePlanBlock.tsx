import { CoursePlan } from "../types/CoursePlan";

export default function CoursePlanBlock({ plan }: { plan: CoursePlan }) {
  return (
    <div className="group relative flex h-52 w-42 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border p-4">
      <div className="mb-4 text-2xl">{plan.name}</div>
      <div>{plan.updated_at.format("HH:mm")}</div>
      <div>{plan.updated_at.format("DD/MM/YYYY")}</div>
      <div className="absolute hidden h-full w-full overflow-hidden bg-white/85 p-4 text-ellipsis group-hover:block">
        <div className="h-full overflow-hidden text-ellipsis">
          {plan.description}
        </div>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-b from-white/0 from-50% to-white/100 to-90%"></div>
      </div>
    </div>
  );
}
