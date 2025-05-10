import * as Router from "next/navigation";
import SortDropdown from "./SortDropdown";
import {
  AppRouterContext,
  AppRouterInstance,
} from "next/dist/shared/lib/app-router-context.shared-runtime";

describe("<SortDropdown />", () => {
  let router: AppRouterInstance;
  beforeEach(() => {
    router = {
      back: cy.stub().as("router:back"),
      forward: cy.stub().as("router:forward"),
      prefetch: cy.stub().as("router:prefetch"),
      replace: cy.stub().as("router:replace"),
      refresh: cy.stub().as("router:refresh"),
      push: cy.stub().as("router:push"),
    };
    cy.stub(Router, "useRouter").returns(router);
  });
  it("renders", () => {
    cy.mount(
      <AppRouterContext.Provider value={router}>
        <SortDropdown sortBy="name" setSortBy={() => {}} />
      </AppRouterContext.Provider>,
    );
    cy.get("select").should("exist");
    cy.get("select").should("have.value", "name");
  });

  it("changes sort order", () => {
    const setSortBy = cy.stub();
    cy.mount(
      <AppRouterContext.Provider value={router}>
        <SortDropdown sortBy="name" setSortBy={setSortBy} />
      </AppRouterContext.Provider>,
    );
    cy.get("select").select("last_edit");
    cy.get("select").should("have.value", "last_edit");
    cy.get("@router:push").should("have.been.calledWith", "?sort_by=last_edit");
    cy.get("select").select("name");
    cy.get("select").should("have.value", "name");
    cy.get("@router:push").should("have.been.calledWith", "?sort_by=name");
  });
});
