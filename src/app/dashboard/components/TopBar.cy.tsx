import React from "react";
import TopBar from "./TopBar";

before(() => {
  cy.intercept("GET", "/api/user/me", { fixture: "testuser.json" }).as(
    "getUser",
  );
});

describe("<TopBar />", () => {
  it("renders", () => {
    cy.mount(<TopBar />);
    cy.get("div").contains("Welcome, John");
    cy.get("div").contains("Logout");
  });
});
