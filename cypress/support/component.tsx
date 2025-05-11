// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import {
  AppRouterInstance,
  AppRouterContext,
} from "next/dist/shared/lib/app-router-context.shared-runtime";
import "./commands";

import { mount, MountOptions } from "cypress/react";
import * as Router from "next/navigation";
import { ReactNode } from "react";
import "@/app/globals.css";
import "cypress-real-events";

// Augment the Cypress namespace to include type definitions for
// your custom command.
// Alternatively, can be defined in cypress/support/component.d.ts
// with a <reference path="./component" /> at the top of your spec.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
      mountWithRouter: typeof mountWithRouter;
    }
  }
}

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
  cy.wrap(router).as("router");
});

function mountWithRouter(
  component: ReactNode,
  options?: MountOptions,
  rendererKey?: string,
) {
  return mount(
    <AppRouterContext.Provider value={router}>
      {component}
    </AppRouterContext.Provider>,
    options,
    rendererKey,
  );
}

Cypress.Commands.add("mount", mount);
Cypress.Commands.add("mountWithRouter", mountWithRouter);

// Example use:
// cy.mount(<MyComponent />)
