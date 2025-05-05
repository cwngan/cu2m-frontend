import { Suspense } from "react";
import CoursePlanGridContainer from "./components/CoursePlanGridContainer";
import TopBar from "./components/TopBar";
import "@/app/background.css";

export default async function Page() {
  return (
    <div className="relative z-40 container mx-auto">
      <TopBar />
      <Suspense>
        <CoursePlanGridContainer />
      </Suspense>
    </div>
  );
}
