import { Suspense } from "react";
import CoursePlanGridContainer from "./components/CoursePlanGridContainer";
import TopBar from "./components/TopBar";

export default async function Page() {
  return (
    <div className="container mx-auto">
      <Suspense>
        <TopBar />
        <CoursePlanGridContainer />
      </Suspense>
    </div>
  );
}
