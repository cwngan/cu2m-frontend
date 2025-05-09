"use client";
import { useRef, useState, WheelEvent } from "react";
import SearchResultBlock from "./SearchResultBlock";
import { apiClient } from "@/apiClient";
import { Course, CourseRead } from "@/app/types/Models";
import CourseDetailBlock from "./CourseDetailBlock";
import SearchResultLoadingBlock from "./SearchResultLoadingBlock";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/outline";

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
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [hasUpdated, setHasUpdated] = useState<boolean>(false);

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

            setIsUpdating(true);
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
                  setIsUpdating(false);
                  setHasUpdated(true);
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
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-700 transition duration-150 hover:scale-110"
                onClick={() => setResultBlockOpen(true)} // Close the form when clicking outside
              >
                <ArrowUpCircleIcon className="size-6" />
              </div>
            )}

            {/* show lower arrow after opening, click to close the search result*/}
            {resultBlockOpen && (
              <div
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-700 transition duration-150 hover:scale-110"
                onClick={() => setResultBlockOpen(false)} // Close the form when clicking outside
              >
                <ArrowDownCircleIcon className="size-6" />
              </div>
            )}
          </div>
        </form>

        {/* searchbox after opening up */}

        {resultBlockOpen && !isUpdating && (
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="z-10 flex max-h-64 w-full flex-row gap-4 overflow-x-auto rounded-tr-xl border border-stone-400 bg-white p-4 whitespace-nowrap shadow-lg"
          >
            {searchResults.length > 0 &&
              searchResults.map((res) => (
                <SearchResultBlock
                  key={res._id}
                  res={res}
                  popupDetail={popupDetail}
                  showPopupDetail={showPopupDetail}
                  setPopupDetail={setPopupDetail}
                  setShowPopupDetail={setShowPopupDetail}
                />
              ))}
            {hasUpdated && searchResults.length == 0 && (
              <div className="flex h-16 w-full flex-col justify-center text-center text-xl">
                No courses found!
              </div>
            )}
            {!hasUpdated && (
              <div className="flex h-16 w-full flex-col justify-center text-center text-xl">
                Search by course code, title or description...
              </div>
            )}
          </div>
        )}

        {isUpdating && (
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="z-10 flex max-h-64 w-full flex-row gap-4 overflow-x-auto rounded-tr-xl border border-stone-400 bg-white p-4 whitespace-nowrap shadow-lg"
          >
            {[...Array(8)].map((_, idx) => (
              <SearchResultLoadingBlock key={idx} />
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
