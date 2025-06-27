import {
  loginToApplication,
  openCreateUserModal,
  fillUserForm,
  verifyUserFormFields,
  verifyValidationErrors,
} from "../support/test-helpers";

describe("User Management - Add User", () => {
  beforeEach(() => {
    loginToApplication();
  });

  describe("Create User Modal", () => {
    it("should open create user modal when clicking Add New User button", () => {
      // Click the Add New User button
      openCreateUserModal();

      // Check form fields are present
      verifyUserFormFields();

      // Check buttons are present
      cy.contains("Cancel").should("be.visible");
      cy.contains("Create User").should("be.visible");
    });

    it("should close modal when clicking Cancel", () => {
      // Open modal
      openCreateUserModal();

      // Click Cancel
      cy.contains("Cancel").click();

      // Modal should close
      cy.contains("Create New User").should("not.exist");
    });

    it("should close modal when clicking outside", () => {
      // Open modal
      openCreateUserModal();

      // Click outside the modal (on the backdrop)
      cy.get('[role="dialog"]').parent().click({ force: true });

      // Modal should close
      cy.contains("Create New User").should("not.exist");
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      // Open the create user modal before each validation test
      openCreateUserModal();
    });

    it("should show validation errors for empty form submission", () => {
      // Try to submit empty form
      cy.contains("Create User").click();

      // Check validation messages appear
      verifyValidationErrors();

      // Modal should remain open
      cy.contains("Create New User").should("be.visible");
    });

    it("should show validation error for invalid email format", () => {
      // Fill form with invalid email
      cy.get("#first_name").type("John");
      cy.get("#last_name").type("Doe");
      cy.get("#email").type("invalid-email");

      // Submit form to trigger validation
      cy.contains("Create User").click();

      // Check that HTML5 validation prevents form submission
      // The input should have the :invalid CSS pseudo-class
      cy.get("#email:invalid").should("exist");

      // Modal should remain open (form submission prevented by validation)
      cy.contains("Create New User").should("be.visible");
    });

    it("should show validation error for missing first name", () => {
      // Fill form but leave first name empty
      cy.get("#last_name").type("Doe");
      cy.get("#email").type("john.doe@example.com");

      // Submit form
      cy.contains("Create User").click();

      // Check first name validation error
      cy.contains("First name is required").should("be.visible");
    });

    it("should show validation error for missing last name", () => {
      // Fill form but leave last name empty
      cy.get("#first_name").type("John");
      cy.get("#email").type("john.doe@example.com");

      // Submit form
      cy.contains("Create User").click();

      // Check last name validation error
      cy.contains("Last name is required").should("be.visible");
    });
  });

  describe("Successful User Creation", () => {
    beforeEach(() => {
      // Open the create user modal before each success test
      openCreateUserModal();
    });

    it("should successfully create a new user with valid data", () => {
      // Fill form with valid data
      fillUserForm({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
      });

      // Submit form
      cy.contains("Create User").click();

      // Check loading state
      cy.contains("Creating...").should("be.visible");

      // Modal should close after successful creation
      cy.contains("Create New User").should("not.exist");

      // Should be back on dashboard
      cy.contains("User Management Dashboard").should("be.visible");

      // Verify we're on page 1 (onUserCreated callback should navigate to first page)
      cy.contains("1").should("be.visible");

      // Note: reqres.in is a mock API, so the created user won't actually appear in the list
      // We're testing the UI flow completion, not the actual data persistence
    });

    it("should clear form after successful creation", () => {
      // Fill and submit form
      fillUserForm({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@example.com",
      });
      cy.contains("Create User").click();

      // Wait for modal to close and ensure we're back on dashboard
      cy.contains("Create New User").should("not.exist");
      cy.contains("User Management Dashboard").should("be.visible");

      // Open modal again
      openCreateUserModal();

      // Form should be empty (reset after successful creation)
      cy.get("#first_name").should("have.value", "");
      cy.get("#last_name").should("have.value", "");
      cy.get("#email").should("have.value", "");
    });

    it("should handle form submission with different valid data combinations", () => {
      const testUsers = [
        {
          firstName: "Alice",
          lastName: "Johnson",
          email: "alice.johnson@test.com",
        },
        {
          firstName: "Bob",
          lastName: "Wilson",
          email: "bob.wilson@company.org",
        },
        {
          firstName: "Charlie",
          lastName: "Brown",
          email: "c.brown@domain.net",
        },
      ];

      testUsers.forEach((user, index) => {
        // Fill form
        fillUserForm(user);

        // Submit
        cy.contains("Create User").click();

        // Wait for modal to close and verify we're back on dashboard
        cy.contains("Create New User").should("not.exist");
        cy.contains("User Management Dashboard").should("be.visible");

        // Note: Since reqres.in is a mock API, created users won't appear in the list
        // We're testing multiple successful form submissions and UI flow completion

        // Open modal again for next iteration (except on last)
        if (index < testUsers.length - 1) {
          openCreateUserModal();
        }
      });
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      // Open the create user modal
      openCreateUserModal();
    });

    it("should show loading state during user creation", () => {
      // Fill form
      fillUserForm({
        firstName: "Loading",
        lastName: "Test",
        email: "loading.test@example.com",
      });

      // Submit form
      cy.contains("Create User").click();

      // Check button shows loading state
      cy.contains("Creating...").should("be.visible");

      // Submit button should be disabled during loading
      cy.contains("Creating...").should("be.disabled");
    });

    it("should disable cancel button during submission", () => {
      // Fill form
      fillUserForm({
        firstName: "Cancel",
        lastName: "Test",
        email: "cancel.test@example.com",
      });

      // Submit form
      cy.contains("Create User").click();

      // Cancel button should be disabled during submission
      cy.contains("Cancel").should("be.disabled");
    });
  });
});
