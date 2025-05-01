import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

interface SortDropdownProps {
  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;
}

const SortDropdown = ({ sortBy, setSortBy }: SortDropdownProps) => {
  const router = useRouter();
  return (
    <div className="ml-auto flex items-center text-lg">
      <div className="mr-2">Sort by:</div>
      <select
        name="sort_by"
        defaultValue={sortBy}
        onChange={(e) => {
          setSortBy(e.target.value);
          router.push(`?sort_by=${e.target.value}`);
        }}
        className="rounded-lg border p-1"
      >
        <option value="name">Name</option>
        <option value="last_edit">Last edit</option>
      </select>
    </div>
  );
};

export default SortDropdown;
