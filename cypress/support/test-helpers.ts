/**
 * Common test utilities and helpers for user management tests
 */

/**
 * Performs the standard login flow that all dashboard tests need
 */
export const loginToApplication = () => {
  // Clear storage and login before each test
  cy.clearLocalStorage();
  cy.clearCookies();

  // Login to access the dashboard
  cy.visit("/sign-in");

  // Wait for the sign-in form to be fully loaded and ready
  cy.contains("Sign in to your account").should("be.visible");

  // Wait for form fields to be enabled and type credentials
  cy.get('input[type="email"]').should("be.enabled").type("eve.holt@reqres.in");
  cy.get('input[type="password"]').should("be.enabled").type("cityslicka");
  cy.get('button[type="submit"]').should("be.enabled").click();

  // Wait for dashboard to load
  cy.url().should("eq", Cypress.config().baseUrl + "/");
  cy.contains("User Management Dashboard").should("be.visible");
};

/**
 * Opens the create user modal
 */
export const openCreateUserModal = () => {
  cy.contains("Add New User").click();
  cy.contains("Create New User").should("be.visible");
};

/**
 * Opens the edit user modal for the first user
 */
export const openEditUserModal = () => {
  cy.contains("button", "Edit").first().click();
  cy.contains("Edit User").should("be.visible");
};

/**
 * Fills the user form with provided data
 */
export const fillUserForm = (userData: {
  firstName: string;
  lastName: string;
  email: string;
}) => {
  cy.get("#first_name").clear().type(userData.firstName);
  cy.get("#last_name").clear().type(userData.lastName);
  cy.get("#email").clear().type(userData.email);
};

/**
 * Verifies user form fields are visible
 */
export const verifyUserFormFields = () => {
  cy.get("#first_name").should("be.visible");
  cy.get("#last_name").should("be.visible");
  cy.get("#email").should("be.visible");
};

/**
 * Verifies form validation errors are displayed
 */
export const verifyValidationErrors = () => {
  cy.contains("First name is required").should("be.visible");
  cy.contains("Last name is required").should("be.visible");
  cy.contains("Please enter a valid email address").should("be.visible");
};
