import { Suspense } from "react";
import CoursePlanGridContainer from "./components/CoursePlanGridContainer";
import TopBar from "./components/TopBar";
import "@/app/background.css";

export default async function Page() {
  return (
    <div className="absolute h-screen w-screen overflow-hidden bg-radial-[at_50%_50%] from-white via-zinc-100 to-zinc-200">
      <div className="animated-lines z-0"></div>
      <div className="relative z-40 container mx-auto">
        <TopBar />
        <Suspense>
          <CoursePlanGridContainer />
        </Suspense>
      </div>
    </div>
  );
}
