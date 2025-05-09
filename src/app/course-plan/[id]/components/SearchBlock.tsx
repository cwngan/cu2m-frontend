"use client";
import { useRef, useState, createContext } from "react";
import { CourseBasicInfo } from "../types/Course";
import SearchResultBlock from "./SearchResultBlock";
import { apiClient } from "@/apiClient";

export const SearchBlockContext = createContext<{
  isOpen: boolean;
}>({
  isOpen: false,
});

export default function SearchBlock() {
  const formRef = useRef<HTMLFormElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const [resultBlockOpen, setResultBlockOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CourseBasicInfo[]>([]);

  return (
    <SearchBlockContext.Provider value={{ isOpen: resultBlockOpen }}>
      <div className="fixed bottom-0 left-0 z-50 w-full">
        <div className="container mx-auto flex flex-col items-start justify-start px-4">
          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              const query = queryRef.current?.value;
              if (query) {
                try {
                  const response = await apiClient.get("/api/courses/", {
                    params: {
                      keywords: query.split(/[\s,]+/), // Split by whitespace or commas
                      basic: true, // Only get basic course info
                    },
                  });

                  if (response.status === 200 && response.data.data) {
                    setSearchResults(response.data.data);
                    setResultBlockOpen(true);
                  }
                } catch (error) {
                  console.error("Error searching courses:", error);
                  alert("Failed to search courses");
                }
              }
            }}
          >
            <div className="flex items-center gap-3 rounded-t-xl bg-zinc-300 p-3">
              <input
                type="text"
                placeholder="Search courses (e.g. ENGG CSCI)"
                className="h-8 w-32 border p-2 duration-150 hover:bg-neutral-100 hover:transition"
                required
                ref={queryRef}
              />
              <button type="submit" className="cursor-pointer">
                Go
              </button>
              {!resultBlockOpen && (
                <div
                  className="hover: flex h-8 items-center justify-center rounded-lg text-slate-100 transition duration-150 hover:scale-110"
                  onClick={() => setResultBlockOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                  >
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v5.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293z" />
                  </svg>
                </div>
              )}
            </div>
          </form>

          {resultBlockOpen && (
            <div className="z-10 flex max-h-64 w-full flex-row flex-wrap gap-5 overflow-auto rounded-tr-xl border border-stone-400 bg-white p-3 shadow-lg">
              {searchResults.map((res) => (
                <SearchResultBlock key={res._id} res={res} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SearchBlockContext.Provider>
  );
}
