import moment from "moment";
import ConfirmDeleteBlock from "./ConfirmDeleteBlock";

describe("<ConfirmDeleteBlock />", () => {
  it("renders", () => {
    cy.mount(
      <ConfirmDeleteBlock
        plan={null}
        isOpen={true}
        onClose={() => {}}
        handleDeleteChange={() => {}}
      />,
    );
    cy.get("div").should("exist");
  });

  it("cancel button handling", () => {
    const onClose = cy.stub();
    const plan = {
      _id: "123",
      name: "Test Plan",
      description: "Test Description",
      updated_at: moment(),
      semesters: [],
      favourite: false,
      user_id: "456",
    };
    cy.mount(
      <ConfirmDeleteBlock
        plan={plan}
        isOpen={true}
        onClose={onClose}
        handleDeleteChange={() => {}}
      />,
    );
    cy.contains("Cancel").click();
    cy.wrap(onClose).should("have.been.called");
  });

  it("delete button handling", () => {
    const onClose = cy.stub();
    const plan = {
      _id: "123",
      name: "Test Plan",
      description: "Test Description",
      updated_at: moment(),
      semesters: [],
      favourite: false,
      user_id: "456",
    };
    cy.intercept("DELETE", "/api/course-plans/*", {
      statusCode: 200,
      body: {
        status: "OK",
        data: null,
      },
    }).as("deletePlan");
    cy.mount(
      <ConfirmDeleteBlock
        plan={plan}
        isOpen={true}
        onClose={onClose}
        handleDeleteChange={() => {}}
      />,
    );
    cy.contains("Delete").click();
    cy.wait("@deletePlan").then(({ response, request }) => {
      expect(request.method).to.equal("DELETE");
      expect(request.url).to.include("/api/course-plans/123");
      expect(response!.statusCode).to.equal(200);
      expect(response!.body.status).to.equal("OK");
      expect(response!.body.data).to.equal(null);
    });
    cy.wrap(onClose).should("have.been.called");
  });
});
