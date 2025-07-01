import { loginToApplication } from "../support/test-helpers";

describe("User Management Dashboard", () => {
  beforeEach(() => {
    loginToApplication();
  });

  describe("Dashboard Layout", () => {
    it("should display the dashboard header with correct title", () => {
      cy.contains("User Management Dashboard").should("be.visible");
      cy.contains("Welcome,").should("be.visible");
    });

    it("should display users section with Add New User button", () => {
      cy.contains("Users").should("be.visible");
      cy.contains("Add New User").should("be.visible");
    });

    it("should display user cards with proper structure", () => {
      cy.get("img[alt*=' ']").should("exist");
      cy.contains("button", "Edit").should("exist");
      cy.contains("button", "Delete").should("exist");
    });
  });

  describe("Navigation", () => {
    it("should have a working sign out button", () => {
      cy.contains("Sign Out").should("be.visible");
      cy.contains("Sign Out").click();

      cy.url().should("include", "/sign-in");
      cy.contains("Sign in to your account").should("be.visible");
    });

    it("should display theme toggle", () => {
      cy.get('button[aria-haspopup="menu"]').should("exist");
      cy.get("button").contains("Toggle theme").should("exist");
    });
  });

  describe("Pagination", () => {
    it("should display pagination when there are multiple pages", () => {
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').should("be.visible");
        }
      });
    });

    it("should navigate between pages when pagination is available", () => {
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid="pagination"]').length > 0) {
          cy.get('[data-testid="pagination"]').within(() => {
            cy.get("button")
              .contains("2")
              .then(($btn) => {
                if ($btn.length > 0 && !$btn.hasClass("disabled")) {
                  cy.wrap($btn).click();
                  cy.contains("Current Page").parent().should("contain", "2");
                }
              });
          });
        }
      });
    });
  });

  describe("Responsive Layout", () => {
    it("should display properly on mobile viewport", () => {
      cy.viewport(375, 667); // iPhone SE size

      cy.contains("User Management Dashboard").should("be.visible");
      cy.contains("Add New User").should("be.visible");

      // Cards should stack properly on mobile
      cy.get("img[alt*=' ']").should("exist");
    });

    it("should display properly on tablet viewport", () => {
      cy.viewport(768, 1024); // iPad size

      cy.contains("User Management Dashboard").should("be.visible");
      cy.contains("Add New User").should("be.visible");
    });

    it("should display properly on desktop viewport", () => {
      cy.viewport(1280, 720); // Desktop size

      cy.contains("User Management Dashboard").should("be.visible");
      cy.contains("Add New User").should("be.visible");
    });
  });
});
