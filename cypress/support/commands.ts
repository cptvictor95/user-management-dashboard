/// <reference types="cypress" />

// Export to make this a module and fix global scope issues
export {};

// Type definitions for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      /**
       * Custom command for quick login and navigation to dashboard
       * @example cy.loginAndVisitDashboard()
       */
      loginAndVisitDashboard(): Chainable<Subject>;

      /**
       * Custom command to login a user with session support
       * @example cy.login()
       * @example cy.login('user@example.com', 'password123')
       */
      login(email?: string, password?: string): Chainable<Subject>;

      /**
       * Custom command to logout a user
       * @example cy.logout()
       */
      logout(): Chainable<Subject>;

      /**
       * Custom command to check if user is authenticated
       * @example cy.shouldBeAuthenticated()
       */
      shouldBeAuthenticated(): Chainable<Subject>;

      /**
       * Custom command to check if user is not authenticated
       * @example cy.shouldNotBeAuthenticated()
       */
      shouldNotBeAuthenticated(): Chainable<Subject>;
    }
  }
}

// Custom command for quick login to dashboard
Cypress.Commands.add("loginAndVisitDashboard", () => {
  cy.visit("/sign-in");
  cy.get('input[type="email"]').type("eve.holt@reqres.in");
  cy.get('input[type="password"]').type("cityslicka");
  cy.get('button[type="submit"]').click();
  cy.url().should("eq", Cypress.config().baseUrl + "/");
  cy.contains("User Management Dashboard").should("be.visible");
});

// Custom command for login with session support
Cypress.Commands.add(
  "login",
  (email: string = "eve.holt@reqres.in", password: string = "cityslicka") => {
    cy.session([email, password], () => {
      cy.visit("/sign-in");
      cy.get('input[type="email"]').type(email);
      cy.get('input[type="password"]').type(password);
      cy.get('button[type="submit"]').click();

      // Wait for successful login and redirect
      cy.url().should("eq", Cypress.config().baseUrl + "/");
      cy.contains("User Management Dashboard").should("be.visible");
    });
  }
);

// Custom command for logout
Cypress.Commands.add("logout", () => {
  cy.visit("/");
  cy.contains("Sign Out").click();
  cy.url().should("include", "/sign-in");
});

// Custom command to check if user is authenticated
Cypress.Commands.add("shouldBeAuthenticated", () => {
  cy.visit("/");
  cy.url().should("not.include", "/sign-in");
  cy.contains("User Management Dashboard").should("be.visible");
});

// Custom command to check if user is not authenticated
Cypress.Commands.add("shouldNotBeAuthenticated", () => {
  cy.visit("/");
  cy.url().should("include", "/sign-in");
});
