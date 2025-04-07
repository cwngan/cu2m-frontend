"use client";
import { useRef, useState } from "react";
import { CourseBasicInfo } from "../types/Course";
import SearchResultBlock from "./SearchResultBlock";

const sampleSearchResults = [
  {
    _id: crypto.randomUUID(),
    code: "ENGG1110",
    title: "Problem Solving with Programming",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "MATH1510",
    title: "Calculus for Engineers",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "CSCI1130",
    title: "Introduction to Computing with Java",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "ENGG1120",
    title: "Linear Algebra for Engineers",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "ENGG1130",
    title: "Multivariable Calculus for Engineers",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "CSCI2100",
    title: "Data Structures",
    units: 3,
  },
];

export default function SearchBlock() {
  const formRef = useRef<HTMLFormElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const [resultBlockOpen, setResultBlockOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CourseBasicInfo[]>([]);
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full">
      <div className="container mx-auto flex flex-col items-start justify-start px-4">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            // Simulate a search action
            // To be replaced by an API call
            const query = queryRef.current?.value;
            if (query) {
              console.log(`Searching for ${query}`);
              setSearchResults(sampleSearchResults);
              setResultBlockOpen(true);
            }
          }}
        >
          <div className="flex items-center gap-2 border border-b-0 bg-white p-3">
            <input
              type="text"
              placeholder="ENGG1110"
              className="h-8 w-32 border p-2"
              required
              ref={queryRef}
            />
            <button type="submit" className="cursor-pointer">
              Go
            </button>
          </div>
        </form>
        {resultBlockOpen && (
          <div className="flex max-h-64 w-full flex-row flex-wrap gap-3 overflow-auto border border-b-0 bg-white p-3">
            {searchResults.map((res) => (
              <SearchResultBlock key={res._id} res={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
