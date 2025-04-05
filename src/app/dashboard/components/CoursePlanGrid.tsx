import moment, { Moment } from "moment";

interface RawCoursePlan {
  _id: string;
  name: string;
  updated_at: string;
  description: string;
}

interface CoursePlan {
  _id: string;
  name: string;
  updated_at: Moment;
  description: string;
}

const template: { data: RawCoursePlan[] } = {
  data: [
    {
      _id: "124",
      name: "abcd",
      updated_at: "2025-03-30T12:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
    },
    {
      _id: "125",
      name: "abcde",
      updated_at: "2025-04-01T08:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
    },
    {
      _id: "126",
      name: "bbcd",
      updated_at: "2025-03-31T08:00:00Z",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam feugiat eros ut volutpat sollicitudin. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Aenean id enim nisi. Suspendisse posuere convallis vehicula. Quisque ultricies interdum mollis. Proin faucibus lacus a massa accumsan volutpat. Vivamus vitae nibh eu diam fringilla imperdiet. Phasellus hendrerit sagittis nibh, egestas fermentum diam viverra a. Sed vestibulum feugiat finibus. Integer magna sapien, auctor vitae tincidunt eu, viverra non nisl. Pellentesque vulputate massa nec venenatis iaculis.",
    },
  ],
};

interface CoursePlanGridProps {
  sortBy: string;
}

const compByName = (a: CoursePlan, b: CoursePlan) => {
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
};

const compByLastEdit = (a: CoursePlan, b: CoursePlan) => {
  return a.updated_at > b.updated_at ? -1 : a.updated_at < b.updated_at ? 1 : 0;
};

export default function CoursePlanGrid({ sortBy }: CoursePlanGridProps) {
  const compFunc =
    sortBy === "name"
      ? compByName
      : sortBy === "last_edit"
        ? compByLastEdit
        : null;
  if (!compFunc) return <div>Error</div>;
  const rawData = template;
  const coursePlans: CoursePlan[] = rawData.data
    .map((plan) => {
      return {
        _id: plan._id,
        name: plan.name,
        updated_at: moment(plan.updated_at),
        description: plan.description,
      };
    })
    .sort(compFunc);
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {coursePlans.map((plan) => {
        return (
          <div
            key={plan._id}
            className="group relative flex h-52 w-42 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border p-4"
          >
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
      })}
    </div>
  );
}
