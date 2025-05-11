import CreateCoursePlan from "./CreateCoursePlan";

describe("<CreateCoursePlan />", () => {
  it("renders", function () {
    cy.mountWithRouter(<CreateCoursePlan />);
    cy.contains("+");
  });

  it("open and close form", function () {
    cy.mountWithRouter(<CreateCoursePlan />);
    cy.contains("Create Plan").should("not.be.visible");
    cy.contains("+").click();
    cy.contains("Create Plan").should("be.visible");
    cy.get("input[name='name']").should("be.visible");
    cy.get("textarea[name='description']").should("be.visible");
  });

  it("close form with button", function () {
    cy.mountWithRouter(<CreateCoursePlan />);
    cy.contains("+").click();
    cy.get("button[type='button']").click();
    cy.contains("Create Plan").should("not.be.visible");
  });

  it("close form with background", function () {
    cy.mountWithRouter(<CreateCoursePlan />);
    cy.contains("+").click();
    cy.get("body").click(0, 0);
    cy.contains("Create Plan").should("not.be.visible");
  });
});
