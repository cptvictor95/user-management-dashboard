import { loginToApplication } from "../support/test-helpers";

describe("User Management - Delete User", () => {
  beforeEach(() => {
    loginToApplication();
  });

  describe("Delete User Modal", () => {
    it("should open delete confirmation dialog when clicking Delete button", () => {
      // Click Delete button on the first user card
      cy.contains("button", "Delete").first().click();

      // Check confirmation dialog opens
      cy.contains("Delete User").should("be.visible");
      cy.contains("Are you sure you want to delete").should("be.visible");

      // Check buttons are present
      cy.contains("Cancel").should("be.visible");
      cy.contains("Delete").should("be.visible");
    });

    it("should close dialog when clicking Cancel", () => {
      // Open delete dialog
      cy.contains("button", "Delete").first().click();
      cy.contains("Delete User").should("be.visible");

      // Click Cancel
      cy.contains("Cancel").click();

      // Dialog should close
      cy.contains("Delete User").should("not.exist");
    });
  });

  describe("Successful User Deletion", () => {
    it("should successfully delete user when confirming", () => {
      // Click Delete button on the first user card
      cy.contains("button", "Delete").first().click();
      cy.contains("Delete User").should("be.visible");

      // Confirm deletion
      cy.contains("button", "Delete").click();

      // Check loading state
      cy.contains("Deleting...").should("be.visible");

      // Dialog should close after successful deletion
      cy.contains("Delete User").should("not.exist");

      // Should be back on dashboard
      cy.contains("User Management Dashboard").should("be.visible");

      // Note: reqres.in is a mock API, so the user won't actually be deleted
      // We're testing the UI flow completion, not actual data persistence
    });

    it("should handle deletion with loading state", () => {
      // Click Delete button
      cy.contains("button", "Delete").first().click();
      cy.contains("Delete User").should("be.visible");

      // Confirm deletion
      cy.contains("button", "Delete").click();

      // Check loading state
      cy.contains("Deleting...").should("be.visible");

      // Delete button should be disabled during loading
      cy.contains("Deleting...").should("be.disabled");
    });
  });

  describe("Delete Different Users", () => {
    it("should be able to delete multiple different users", () => {
      // Delete first user
      cy.contains("button", "Delete").first().click();
      cy.contains("Delete User").should("be.visible");
      cy.contains("button", "Delete").click();

      // Wait for dialog to close
      cy.contains("Delete User").should("not.exist");
      cy.contains("User Management Dashboard").should("be.visible");

      // Check if there are multiple delete buttons available and delete second user
      cy.get("button")
        .contains("Delete")
        .then(($buttons) => {
          if ($buttons.length > 1) {
            // Click the second Delete button
            cy.get("button").contains("Delete").eq(1).click();
            cy.contains("Delete User").should("be.visible");
            cy.contains("button", "Delete").click();

            cy.contains("Delete User").should("not.exist");
            cy.contains("User Management Dashboard").should("be.visible");
          } else {
            // Log that only one user is available for deletion
            cy.log(
              "Only one user available for deletion, test passed with first user delete"
            );
          }
        });
    });
  });

  describe("Delete Button State", () => {
    it("should disable delete button during deletion process", () => {
      // Check initial state
      cy.contains("button", "Delete").first().should("not.be.disabled");

      // Click Delete button
      cy.contains("button", "Delete").first().click();
      cy.contains("Delete User").should("be.visible");

      // Confirm deletion
      cy.contains("button", "Delete").click();

      // Delete button should be disabled during loading
      cy.contains("Deleting...").should("be.disabled");
    });
  });
});
