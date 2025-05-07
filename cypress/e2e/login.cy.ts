describe("testuser login", () => {
  it("login", () => {
    cy.visit("/user/login");
    cy.get("input[name=username]").type("testuser");
    cy.get("input[name=password]").type("testpassword");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/dashboard");
  });
});
