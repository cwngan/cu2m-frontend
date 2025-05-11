"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  WheelEvent,
} from "react";
import SearchResultBlock from "./SearchResultBlock";
import { apiClient } from "@/apiClient";
import { Course, CourseRead } from "@/app/types/Models";
import CourseDetailBlock from "./CourseDetailBlock";
import SearchResultLoadingBlock from "./SearchResultLoadingBlock";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
} from "@heroicons/react/24/outline";

// Context for controlling open/close state externally if needed
export const SearchBlockContext = createContext<{
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}>({});

export default function SearchBlock() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const queryRef = useRef<HTMLInputElement>(null);
  // Local state for open/close
  const [resultBlockOpen, setResultBlockOpen] = useState(false);
  // Context support (if provided by parent)
  const context = useContext(SearchBlockContext);
  // Use context if available, otherwise fallback to local state
  const isOpen =
    context.isOpen !== undefined ? context.isOpen : resultBlockOpen;
  const setIsOpen = context.setIsOpen || setResultBlockOpen;
  // ---
  // NOTE FOR FUTURE MERGE CONFLICTS:
  // This block allows both local and context-based control of open/close state.
  // If merging with a branch that uses only local state or only context, keep this dual approach for flexibility.
  // ---
  const [searchResults, setSearchResults] = useState<CourseRead[]>([]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += event.deltaY; // Scroll horizontally
    }
  };

  const [showPopupDetail, setShowPopupDetail] = useState<boolean>(false);
  const [popupDetail, setPopupDetail] = useState<Course | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [hasUpdated, setHasUpdated] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(true);

  useEffect(() => {
    console.log("Current state: ", isDragging);
    if (isDragging) setResultBlockOpen(false);
    else setResultBlockOpen(true);
  }, [isDragging]);

  const onClose = () => {
    setShowPopupDetail(false);
  };

  const fetchCourses = useCallback(() => {
    setIsUpdating(true);
    const query = queryRef.current?.value;
    if (query) {
      console.log(`Searching for ${query}`);
      apiClient
        .get(`/api/courses?keywords[]=${query}&basic=true`)
        .then((res) => {
          const response = res.data;
          if (response.status === "ERROR" || response.data === null) {
            throw new Error(response.error);
          }

          setSearchResults(response.data);
          setIsOpen(true);
          setIsUpdating(false);
          setHasUpdated(true);
        })
        .catch((err) => {
          console.error(err);
          alert("Course fetch failed");
        });
    }
  }, [queryRef, setSearchResults, setIsOpen, setIsUpdating, setHasUpdated]);

  return (
    // the whole search block
    <div className="fixed bottom-0 left-0 z-50 w-full">
      <div className="container mx-auto flex flex-col items-start justify-start px-4">
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            fetchCourses();
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
              onChange={fetchCourses}
            />
            <button type="submit" className="cursor-pointer">
              Go
            </button>
            {/* show upper arrow before opening, click to open the search result */}
            {!isOpen && (
              <div
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-100 transition duration-150 hover:scale-110"
                onClick={() => setIsOpen(true)}
              >
                <ArrowUpCircleIcon className="size-6" />
              </div>
            )}
            {/* show lower arrow after opening, click to close the search result*/}
            {isOpen && (
              <div
                className="hover: flex h-8 items-center justify-center rounded-lg text-slate-100 transition duration-150 hover:scale-110"
                onClick={() => setIsOpen(false)}
              >
                <ArrowDownCircleIcon className="size-6" />
              </div>
            )}
          </div>
        </form>
        {/* searchbox after opening up */}

        {isOpen && !isUpdating && (
          <div
            ref={scrollContainerRef}
            onWheel={handleWheel}
            className="z-10 flex max-h-64 w-full flex-row gap-4 overflow-x-auto overflow-y-hidden overscroll-contain rounded-tr-xl border border-stone-400 bg-white p-4 whitespace-nowrap shadow-lg"
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
                  setIsDragging={setIsDragging}
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
