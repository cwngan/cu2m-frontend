import React from "react";
import InputBox from "./InputBox";

describe("<InputBox />", () => {
  it("renders", () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<InputBox />);
    // check if the input box is rendered
    cy.get("input").should("exist");
    // check if the input box functions correctly
    cy.get("input").type("Hello World");
    cy.get("input").should("have.value", "Hello World");
    // check if the input box has the correct class
    cy.get("input").should(
      "have.class",
      "w-96 rounded-md border border-neutral-400 p-2 leading-none ring-slate-400 hover:ring-2",
    );
    cy.mount(<InputBox className="custom-class" placeholder="Custom Class" />);
    // check if the input box has the correct class
    cy.get("input").should(
      "have.class",
      "w-96 rounded-md border border-neutral-400 p-2 leading-none ring-slate-400 hover:ring-2 custom-class",
    );
  });
});
