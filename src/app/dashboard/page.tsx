import CoursePlanGridContainer from "./components/CoursePlanGridContainer";
import TopBar from "./components/TopBar";

export default async function Page() {
  return (
    <div className="container mx-auto">
      <TopBar />
      <CoursePlanGridContainer />
    </div>
  );
}
