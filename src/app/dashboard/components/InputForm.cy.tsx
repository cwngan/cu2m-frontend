import { CoursePlanResponseModel } from "@/app/types/ApiResponseModel";
import InputForm from "./InputForm";
import { CoursePlanCreate, CoursePlanRead } from "@/app/types/Models";

describe("<InputForm />", () => {
  it("renders", function () {
    cy.mountWithRouter(
      <InputForm
        isOpen={true}
        mode="add"
        plan={null}
        onClose={() => {}}
        handleBlockChange={() => {}}
      />,
    );
    cy.get("input[name='name']").should("exist");
    cy.get("textarea[name='description']").should("exist");
    cy.get("button[type='submit']").should("exist");
  });

  it("fills in the form and submits", function () {
    const onClose = cy.stub();
    const handleBlockChange = cy.stub();
    cy.mountWithRouter(
      <InputForm
        isOpen={true}
        mode="add"
        plan={null}
        onClose={onClose}
        handleBlockChange={handleBlockChange}
      />,
    );
    cy.get("input[name='name']").type("Test Course Plan");
    cy.get("textarea[name='description']").type("This is a test course plan.");
    cy.intercept("POST", "/api/course-plans/", {
      statusCode: 200,
      body: { data: { _id: "12345" } },
    }).as("createCoursePlan");
    cy.get("button[type='submit']").click();
    cy.wait<CoursePlanCreate, CoursePlanResponseModel>(
      "@createCoursePlan",
    ).then(({ request, response }) => {
      expect(request.body.name).to.equal("Test Course Plan");
      expect(request.body.description).to.equal("This is a test course plan.");
      expect(response!.statusCode).to.equal(200);
      expect((response!.body.data as CoursePlanRead)._id).to.equal("12345");
    });
    cy.get("@router:push").should("have.been.calledWith", "/course-plan/12345");
  });
});
