import SortDropdown from "./SortDropdown";

describe("<SortDropdown />", () => {
  it("renders", function () {
    cy.mountWithRouter(<SortDropdown sortBy="name" setSortBy={() => {}} />);
    cy.get("select[name='sort_by']").should("exist");
    cy.get("select[name='sort_by']").should("have.value", "name");
    cy.get("select[name='sort_by'] option").contains("Name");
    cy.get("select[name='sort_by'] option").contains("Last edit");
  });

  it("changes sort order", function () {
    cy.mountWithRouter(<SortDropdown sortBy="name" setSortBy={() => {}} />);
    cy.get("select").select("last_edit");
    cy.get("select").should("have.value", "last_edit");
    cy.get("@router:push").should("have.been.calledWith", "?sort_by=last_edit");
    cy.get("select").select("name");
    cy.get("select").should("have.value", "name");
    cy.get("@router:push").should("have.been.calledWith", "?sort_by=name");
  });
});
