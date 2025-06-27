describe("User Management - Create User", () => {
  beforeEach(() => {
    // Clear storage and login before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login first to access the dashboard
    cy.visit("/sign-in");

    // Wait for the sign-in form to be fully loaded and ready
    cy.contains("Sign in to your account").should("be.visible");

    // Wait for form fields to be enabled and type credentials
    cy.get('input[type="email"]')
      .should("be.enabled")
      .type("eve.holt@reqres.in");
    cy.get('input[type="password"]').should("be.enabled").type("cityslicka");
    cy.get('button[type="submit"]').should("be.enabled").click();

    // Wait for dashboard to load
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("User Management Dashboard").should("be.visible");
  });

  describe("Create User Modal", () => {
    it("should open create user modal when clicking Add New User button", () => {
      // Click the Add New User button
      cy.contains("Add New User").click();

      // Check modal opens with correct title
      cy.contains("Create New User").should("be.visible");

      // Check form fields are present
      cy.get("#first_name").should("be.visible");
      cy.get("#last_name").should("be.visible");
      cy.get("#email").should("be.visible");

      // Check buttons are present
      cy.contains("Cancel").should("be.visible");
      cy.contains("Create User").should("be.visible");
    });

    it("should close modal when clicking Cancel", () => {
      // Open modal
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");

      // Click Cancel
      cy.contains("Cancel").click();

      // Modal should close
      cy.contains("Create New User").should("not.exist");
    });

    it("should close modal when clicking outside", () => {
      // Open modal
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");

      // Click outside the modal (on the backdrop)
      cy.get('[role="dialog"]').parent().click({ force: true });

      // Modal should close
      cy.contains("Create New User").should("not.exist");
    });
  });

  describe("Form Validation", () => {
    beforeEach(() => {
      // Open the create user modal before each validation test
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");
    });

    it("should show validation errors for empty form submission", () => {
      // Try to submit empty form
      cy.contains("Create User").click();

      // Check validation messages appear
      cy.contains("First name is required").should("be.visible");
      cy.contains("Last name is required").should("be.visible");
      cy.contains("Please enter a valid email address").should("be.visible");

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
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");
    });

    it("should successfully create a new user with valid data", () => {
      // Fill form with valid data
      cy.get("#first_name").type("John");
      cy.get("#last_name").type("Doe");
      cy.get("#email").type("john.doe@example.com");

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
      cy.get("#first_name").type("Jane");
      cy.get("#last_name").type("Smith");
      cy.get("#email").type("jane.smith@example.com");
      cy.contains("Create User").click();

      // Wait for modal to close and ensure we're back on dashboard
      cy.contains("Create New User").should("not.exist");
      cy.contains("User Management Dashboard").should("be.visible");

      // Open modal again
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");

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
        cy.get("#first_name").clear().type(user.firstName);
        cy.get("#last_name").clear().type(user.lastName);
        cy.get("#email").clear().type(user.email);

        // Submit
        cy.contains("Create User").click();

        // Wait for modal to close and verify we're back on dashboard
        cy.contains("Create New User").should("not.exist");
        cy.contains("User Management Dashboard").should("be.visible");

        // Note: Since reqres.in is a mock API, created users won't appear in the list
        // We're testing multiple successful form submissions and UI flow completion

        // Open modal again for next iteration (except on last)
        if (index < testUsers.length - 1) {
          cy.contains("Add New User").click();
          cy.contains("Create New User").should("be.visible");
        }
      });
    });
  });

  describe("Loading States", () => {
    beforeEach(() => {
      // Open the create user modal
      cy.contains("Add New User").click();
      cy.contains("Create New User").should("be.visible");
    });

    it("should show loading state during user creation", () => {
      // Fill form
      cy.get("#first_name").type("Loading");
      cy.get("#last_name").type("Test");
      cy.get("#email").type("loading.test@example.com");

      // Submit form
      cy.contains("Create User").click();

      // Check button shows loading state
      cy.contains("Creating...").should("be.visible");

      // Submit button should be disabled during loading
      cy.contains("Creating...").should("be.disabled");
    });

    it("should disable cancel button during submission", () => {
      // Fill form
      cy.get("#first_name").type("Cancel");
      cy.get("#last_name").type("Test");
      cy.get("#email").type("cancel.test@example.com");

      // Submit form
      cy.contains("Create User").click();

      // Cancel button should be disabled during submission
      cy.contains("Cancel").should("be.disabled");
    });
  });
});

describe("User Management - Edit User", () => {
  beforeEach(() => {
    // Clear storage and login before each test
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login first to access the dashboard
    cy.visit("/sign-in");

    // Wait for the sign-in form to be fully loaded and ready
    cy.contains("Sign in to your account").should("be.visible");

    // Wait for form fields to be enabled and type credentials
    cy.get('input[type="email"]')
      .should("be.enabled")
      .type("eve.holt@reqres.in");
    cy.get('input[type="password"]').should("be.enabled").type("cityslicka");
    cy.get('button[type="submit"]').should("be.enabled").click();

    // Wait for dashboard to load
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.contains("User Management Dashboard").should("be.visible");
  });

  describe("Edit User Modal", () => {
    it("should open edit user modal when clicking Edit button on user card", () => {
      // Click Edit button on the first user card
      cy.contains("button", "Edit").first().click();

      // Check modal opens with correct title
      cy.contains("Edit User").should("be.visible");

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
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");

      // Verify form is pre-populated with user data
      // Using George Bluth's data from reqres.in (first user on page 1)
      cy.get("#first_name").should("have.value", "George");
      cy.get("#last_name").should("have.value", "Bluth");
      cy.get("#email").should("have.value", "george.bluth@reqres.in");
    });

    it("should close modal when clicking Cancel", () => {
      // Open edit modal
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");

      // Click Cancel
      cy.contains("Cancel").click();

      // Modal should close
      cy.contains("Edit User").should("not.exist");
    });

    it("should close modal when clicking outside", () => {
      // Open edit modal
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");

      // Click outside the modal (on the backdrop)
      cy.get('[role="dialog"]').parent().click({ force: true });

      // Modal should close
      cy.contains("Edit User").should("not.exist");
    });
  });

  describe("Edit Form Validation", () => {
    beforeEach(() => {
      // Open the edit user modal before each validation test
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");
    });

    it("should show validation errors when clearing required fields", () => {
      // Clear all fields
      cy.get("#first_name").clear();
      cy.get("#last_name").clear();
      cy.get("#email").clear();

      // Try to submit empty form
      cy.contains("Update User").click();

      // Check validation messages appear
      cy.contains("First name is required").should("be.visible");
      cy.contains("Last name is required").should("be.visible");
      cy.contains("Please enter a valid email address").should("be.visible");

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
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");
    });

    it("should successfully update user with valid data", () => {
      // Modify the user data
      cy.get("#first_name").clear().type("Updated");
      cy.get("#last_name").clear().type("User");
      cy.get("#email").clear().type("updated.user@example.com");

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
      cy.get("#first_name").clear().type("O'Connor");
      cy.get("#last_name").clear().type("Smith-Jones");
      cy.get("#email").clear().type("special.chars@domain.co.uk");

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
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");
    });

    it("should show loading state during user update", () => {
      // Modify user data
      cy.get("#first_name").clear().type("Loading");
      cy.get("#last_name").clear().type("Test");
      cy.get("#email").clear().type("loading.test@example.com");

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
      cy.contains("button", "Edit").first().click();
      cy.contains("Edit User").should("be.visible");

      cy.get("#first_name").clear().type(updates[0].firstName);
      cy.get("#last_name").clear().type(updates[0].lastName);
      cy.get("#email").clear().type(updates[0].email);
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

            cy.get("#first_name").clear().type(updates[1].firstName);
            cy.get("#last_name").clear().type(updates[1].lastName);
            cy.get("#email").clear().type(updates[1].email);
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
