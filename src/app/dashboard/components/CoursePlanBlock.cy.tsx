import moment from "moment";
import CoursePlanBlock from "./CoursePlanBlock";

before(() => {
  cy.fixture("test_course_plans")
    .as("coursePlans")
    .then((coursePlans) => {
      coursePlans[0].updated_at = moment(coursePlans[0].updated_at);
      cy.wrap(
        <CoursePlanBlock
          plan={coursePlans[0]}
          isUpdating={false}
          handleBlockChange={() => {}}
          setPopupPlan={() => {}}
          setShowForm={() => {}}
          setShowDelete={() => {}}
          popupPlan={null}
        />,
      ).as("CoursePlanBlock");
    });
});

describe("<CoursePlanBlock />", () => {
  it("renders the course plan block correctly", function () {
    cy.mountWithRouter(this.CoursePlanBlock);
  });

  it("displays the course plan block", function () {
    cy.mountWithRouter(this.CoursePlanBlock);
    console.log(this.coursePlans[0]);
    cy.contains(this.coursePlans[0].name).should("exist");
    cy.contains(this.coursePlans[0].description).should("exist");
    const updated_at = moment(this.coursePlans[0].updated_at);
    cy.contains(updated_at.format("DD/MM/YYYY")).should("exist");
    cy.contains(updated_at.format("HH:mm")).should("exist");
  });

  it("opens the course plan", function () {
    cy.mountWithRouter(this.CoursePlanBlock);
    cy.contains(this.coursePlans[0].name).click();
    cy.get("@router:push").should(
      "be.calledWith",
      `/course-plan/${this.coursePlans[0]._id}`,
    );
  });

  it("check if the description is covered", function (done) {
    cy.mountWithRouter(this.CoursePlanBlock);
    cy.once("fail", (err) => {
      expect(err.message).to.include("failed because this element");
      expect(err.message).to.include("is being covered by another element");
      done();
    });
    cy.contains<HTMLElement>(this.coursePlans[0].description)
      .click({ timeout: 500 }) // using click here as a workaround to check if the description is covered
      .then(() => {
        done(Error("Description should not be clickable"));
      });
  });

  it("check if the block enlarges on hover", function () {
    cy.mountWithRouter(this.CoursePlanBlock);
    cy.get("[data-cy='course-plan-block']")
      .as("block")
      .invoke("outerWidth")
      .then((width) => {
        cy.get("[data-cy='course-plan-block']")
          .realHover()
          .invoke("outerWidth")
          .should("be.greaterThan", width);
      });
  });

  it("check if the description is visible on hover", function () {
    cy.mountWithRouter(this.CoursePlanBlock);
    cy.get("[data-cy='course-plan-block']")
      .realHover()
      .then(() => {
        cy.contains<HTMLElement>(this.coursePlans[0].description).click(); // using click here as a workaround to check if the description is covered
      });
  });
});
