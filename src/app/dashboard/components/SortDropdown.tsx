"use client";
import React, { useRef } from "react";

interface SortDropdownProps {
  sortBy: "name" | "last_edit";
}

const SortDropdown = ({ sortBy }: SortDropdownProps) => {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form method="get" className="flex items-center text-lg" ref={form}>
      <div className="mr-2">Sort by:</div>
      <select
        name="sort_by"
        defaultValue={sortBy}
        onChange={() => {
          form.current?.submit();
        }}
        className="border p-1"
      >
        <option value="name">Name</option>
        <option value="last_edit">Last edit</option>
      </select>
    </form>
  );
};

export default SortDropdown;
