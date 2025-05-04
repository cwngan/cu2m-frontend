"use client";
import { useRef, useState, WheelEvent } from "react";
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
  {
    _id: crypto.randomUUID(),
    code: "CSCI3100",
    title: "Software Engineering",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "CSCI3160",
    title: "Design and Analysis of Algorithms",
    units: 3,
  },
  {
    _id: crypto.randomUUID(),
    code: "CHEM2870",
    title: "Integrated Chemistry Laboratory II",
    units: 4,
  },
];

export default function SearchBlock() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const [resultBlockOpen, setResultBlockOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CourseBasicInfo[]>([]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += event.deltaY; // Scroll horizontally
      event.preventDefault(); // Prevent default vertical scroll
    }
  };

  return (
    // the whole search block
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
          {/* searchbox before opening up */}
          <div className="flex items-center gap-3 rounded-t-xl bg-zinc-300 p-3">
            <input
              type="text"
              placeholder="ENGG1110"
              className="h-8 w-32 border p-2 duration-150 hover:bg-neutral-100 hover:transition"
              required
              ref={queryRef}
            />
            <button type="submit" className="cursor-pointer">
              Go
            </button>
            {/* show upper arrow before opening, click to open the search result */}

            {!resultBlockOpen && (
              <div
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-100 transition duration-150 hover:scale-110"
                onClick={() => setResultBlockOpen(true)} // Close the form when clicking outside
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path d="M16 8A8 8 0 1 0 0 8a8 8 0 0 0 16 0m-7.5 3.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707z" />
                </svg>
              </div>
            )}

            {/* show lower arrow after opening, click to close the search result*/}
            {resultBlockOpen && (
              <div
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-100 transition duration-150 hover:scale-110"
                onClick={() => setResultBlockOpen(false)} // Close the form when clicking outside
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z" />
                </svg>
              </div>
            )}
          </div>
        </form>

        {/* searchbox after opening up */}

        {resultBlockOpen && (
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="z-10 flex max-h-64 w-full flex-row gap-5 overflow-x-auto rounded-tr-xl border border-stone-400 bg-white p-3 whitespace-nowrap shadow-lg"
          >
            {searchResults.map((res) => (
              <SearchResultBlock key={res._id} res={res} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
