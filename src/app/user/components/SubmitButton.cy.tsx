import React from "react";
import SubmitButton from "./SubmitButton";

const params = ["Submit", ""];

describe("<SubmitButton />", () => {
  params.forEach((param) => {
    it(`renders button with text=${param.length > 0 ? param : "<empty>"}`, () => {
      // see: https://on.cypress.io/mounting-react
      cy.mount(<SubmitButton text={param} />);
      // check if the button is rendered
      cy.get("button").should("exist");
      // check if the button functions correctly
      cy.get("button").click();
    });
  });
});
