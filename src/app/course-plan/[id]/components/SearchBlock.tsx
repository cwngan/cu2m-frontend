"use client";
import { useRef, useState, WheelEvent } from "react";
import SearchResultBlock from "./SearchResultBlock";
import { apiClient } from "@/apiClient";
import { Course, CourseRead } from "@/app/types/Models";
import CourseDetailBlock from "./CourseDetailBlock";

export default function SearchBlock() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  const [resultBlockOpen, setResultBlockOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<CourseRead[]>([]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += event.deltaY; // Scroll horizontally
      event.preventDefault(); // Prevent default vertical scroll
    }
  };

  const [showPopupDetail, setShowPopupDetail] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<Course | null>(null);

  const onClose = () => {
    setShowPopupDetail(false);
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
              apiClient
                .get(`/api/courses?keywords=${query}&basic=true`)
                .then((res) => {
                  const response = res.data;
                  if (response.status === "ERROR" || response.data === null) {
                    throw new Error(response.error);
                  }

                  setSearchResults(response.data);
                  setResultBlockOpen(true);
                })
                .catch((err) => {
                  console.error(err);
                  alert("Course fetch failed");
                });
            }
          }}
        >
          {/* searchbox before opening up */}
          <div className="flex items-center gap-3 rounded-t-xl bg-zinc-300 p-3">
            <input
              type="text"
              placeholder="Search by keywords..."
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
            className="z-10 flex max-h-64 w-full flex-row gap-4 overflow-x-auto rounded-tr-xl border border-stone-400 bg-white p-4 whitespace-nowrap shadow-lg"
          >
            {searchResults.map((res) => (
              <SearchResultBlock
                key={res._id}
                res={res}
                popupDetail={popupDetail}
                showPopupDetail={showPopupDetail}
                setPopupDetail={setPopupDetail}
                setShowPopupDetail={setShowPopupDetail}
              />
            ))}
          </div>
        )}

        {/* TODO: Put CourseDetailBlock here */}
        <CourseDetailBlock
          course={popupDetail}
          isOpen={showPopupDetail}
          onClose={onClose}
        ></CourseDetailBlock>
      </div>
    </div>
  );
}
