import {
  loginToApplication,
  openEditUserModal,
  fillUserForm,
  verifyValidationErrors,
} from "../support/test-helpers";

describe("User Management - Edit User", () => {
  beforeEach(() => {
    loginToApplication();
  });

  describe("Edit User Modal", () => {
    it("should open edit user modal when clicking Edit button on user card", () => {
      // Click Edit button on the first user card
      openEditUserModal();

      // Check form fields are present and pre-populated
      cy.get("#first_name").should("be.visible").should("not.have.value", "");
      cy.get("#last_name").should("be.visible").should("not.have.value", "");
      cy.get("#email").should("be.visible").should("not.have.value", "");

      // Check buttons are present
      cy.contains("Cancel").should("be.visible");
      cy.contains("Update User").should("be.visible");
    });

    it("should pre-populate form with existing user data", () => {
      // Click Edit button on the first user card
      openEditUserModal();

      // Verify form is pre-populated with user data
      // Using George Bluth's data from reqres.in (first user on page 1)
      cy.get("#first_name").should("have.value", "George");
      cy.get("#last_name").should("have.value", "Bluth");
      cy.get("#email").should("have.value", "george.bluth@reqres.in");
    });

    it("should close modal when clicking Cancel", () => {
      // Open edit modal
      openEditUserModal();

      // Click Cancel
      cy.contains("Cancel").click();

      // Modal should close
      cy.contains("Edit User").should("not.exist");
    });

    it("should close modal when clicking outside", () => {
      // Open edit modal
      openEditUserModal();

      // Click outside the modal (on the backdrop)
      cy.get('[role="dialog"]').parent().click({ force: true });

      // Modal should close
      cy.contains("Edit User").should("not.exist");
    });
  });

  describe("Edit Form Validation", () => {
    beforeEach(() => {
      // Open the edit user modal before each validation test
      openEditUserModal();
    });

    it("should show validation errors when clearing required fields", () => {
      // Clear all fields
      cy.get("#first_name").clear();
      cy.get("#last_name").clear();
      cy.get("#email").clear();

      // Try to submit empty form
      cy.contains("Update User").click();

      // Check validation messages appear
      verifyValidationErrors();

      // Modal should remain open
      cy.contains("Edit User").should("be.visible");
    });

    it("should show validation error for invalid email format", () => {
      // Change email to invalid format
      cy.get("#email").clear().type("invalid-email");

      // Submit form
      cy.contains("Update User").click();

      // Check that HTML5 validation prevents form submission
      cy.get("#email:invalid").should("exist");

      // Modal should remain open
      cy.contains("Edit User").should("be.visible");
    });

    it("should show validation error for missing first name only", () => {
      // Clear only first name
      cy.get("#first_name").clear();

      // Submit form
      cy.contains("Update User").click();

      // Check first name validation error
      cy.contains("First name is required").should("be.visible");
    });

    it("should show validation error for missing last name only", () => {
      // Clear only last name
      cy.get("#last_name").clear();

      // Submit form
      cy.contains("Update User").click();

      // Check last name validation error
      cy.contains("Last name is required").should("be.visible");
    });
  });

  describe("Successful User Update", () => {
    beforeEach(() => {
      // Open the edit user modal before each success test
      openEditUserModal();
    });

    it("should successfully update user with valid data", () => {
      // Modify the user data
      fillUserForm({
        firstName: "Updated",
        lastName: "User",
        email: "updated.user@example.com",
      });

      // Submit form
      cy.contains("Update User").click();

      // Check loading state
      cy.contains("Updating...").should("be.visible");

      // Modal should close after successful update
      cy.contains("Edit User").should("not.exist");

      // Should be back on dashboard
      cy.contains("User Management Dashboard").should("be.visible");

      // Note: reqres.in is a mock API, so the updated user data won't persist
      // We're testing the UI flow completion, not actual data persistence
    });

    it("should handle partial updates (change only one field)", () => {
      // Change only the first name
      cy.get("#first_name").clear().type("Modified");

      // Submit form
      cy.contains("Update User").click();

      // Check loading state
      cy.contains("Updating...").should("be.visible");

      // Modal should close after successful update
      cy.contains("Edit User").should("not.exist");

      // Should be back on dashboard
      cy.contains("User Management Dashboard").should("be.visible");
    });

    it("should handle updates with special characters in names", () => {
      // Test with special characters
      fillUserForm({
        firstName: "O'Connor",
        lastName: "Smith-Jones",
        email: "special.chars@domain.co.uk",
      });

      // Submit form
      cy.contains("Update User").click();

      // Modal should close after successful update
      cy.contains("Edit User").should("not.exist");
      cy.contains("User Management Dashboard").should("be.visible");
    });
  });

  describe("Edit Loading States", () => {
    beforeEach(() => {
      // Open the edit user modal
      openEditUserModal();
    });

    it("should show loading state during user update", () => {
      // Modify user data
      fillUserForm({
        firstName: "Loading",
        lastName: "Test",
        email: "loading.test@example.com",
      });

      // Submit form
      cy.contains("Update User").click();

      // Check button shows loading state
      cy.contains("Updating...").should("be.visible");

      // Submit button should be disabled during loading
      cy.contains("Updating...").should("be.disabled");
    });

    it("should disable cancel button during submission", () => {
      // Modify user data
      cy.get("#first_name").clear().type("Cancel");
      cy.get("#last_name").clear().type("Disabled");

      // Submit form
      cy.contains("Update User").click();

      // Cancel button should be disabled during submission
      cy.contains("Cancel").should("be.disabled");
    });
  });

  describe("Edit Different Users", () => {
    it("should be able to edit multiple different users", () => {
      const updates = [
        {
          firstName: "First",
          lastName: "Update",
          email: "first.update@test.com",
        },
        {
          firstName: "Second",
          lastName: "Update",
          email: "second.update@test.com",
        },
      ];

      // Edit first user
      openEditUserModal();
      fillUserForm(updates[0]);
      cy.contains("Update User").click();

      // Wait for modal to close
      cy.contains("Edit User").should("not.exist");
      cy.contains("User Management Dashboard").should("be.visible");

      // Check if there are multiple edit buttons available and edit second user
      cy.get("button")
        .contains("Edit")
        .then(($buttons) => {
          if ($buttons.length > 1) {
            // Click the second Edit button
            cy.get("button").contains("Edit").eq(1).click();
            cy.contains("Edit User").should("be.visible");

            fillUserForm(updates[1]);
            cy.contains("Update User").click();

            cy.contains("Edit User").should("not.exist");
            cy.contains("User Management Dashboard").should("be.visible");
          } else {
            // Log that only one user is available for editing
            cy.log(
              "Only one user available for editing, test passed with first user edit"
            );
          }
        });
    });
  });
});
