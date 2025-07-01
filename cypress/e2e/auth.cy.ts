describe("Sign In Page", () => {
  beforeEach(() => {
    // Clear local storage before each test to ensure clean state
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit("/sign-in");
  });

  it("should display the sign-in form correctly", () => {
    // Check page title and description
    cy.contains("Sign in to your account").should("be.visible");
    cy.contains("Welcome! Please enter your details to continue.").should(
      "be.visible"
    );

    // Check form fields are present
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("be.visible");
    cy.get('button[type="submit"]').should("contain", "Sign In");

    // Check navigation link to sign-up
    cy.contains("Sign up here").should("be.visible");
  });

  it("should show validation errors for empty form submission", () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();

    // Check validation messages appear
    cy.contains("Please enter a valid email address").should("be.visible");
    cy.contains("Password is required").should("be.visible");
  });

  it("should show validation error for invalid email format", () => {
    // Enter invalid email format
    cy.get('input[type="email"]').type("invalid-email");
    cy.get('input[type="password"]').type("somepassword");

    // Submit the form to trigger validation
    cy.get('button[type="submit"]').click();

    // Check that HTML5 validation prevents form submission by checking if form is still invalid
    // The input should have the :invalid CSS pseudo-class
    cy.get('input[type="email"]:invalid').should("exist");

    // Also ensure we haven't navigated away (validation should prevent form submission)
    cy.url().should("include", "/sign-in");
  });

  it("should successfully sign in with valid credentials", () => {
    // Fill in valid credentials (using reqres.in test data)
    cy.get('input[type="email"]').type("eve.holt@reqres.in");
    cy.get('input[type="password"]').type("cityslicka");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard (welcome page)
    cy.url().should("not.include", "/sign-in");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Should see dashboard content (the welcome page from Part 1)
    cy.contains("User Management Dashboard").should("be.visible");
    cy.contains("Welcome,").should("be.visible");
  });

  it("should navigate to sign-up page when clicking the link", () => {
    // Click the sign-up navigation link
    cy.contains("Sign up here").click();

    // Should navigate to sign-up page
    cy.url().should("include", "/sign-up");
  });

  it("should show loading state during sign-in process", () => {
    // Fill in credentials
    cy.get('input[type="email"]').type("eve.holt@reqres.in");
    cy.get('input[type="password"]').type("pistol");

    // Submit and check loading state
    cy.get('button[type="submit"]').click();
    cy.contains("Signing in...").should("be.visible");
  });
});

describe("Sign Up Page", () => {
  beforeEach(() => {
    // Clear local storage before each test to ensure clean state
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit("/sign-up");
  });

  it("should display the sign-up form correctly", () => {
    // Check page title and description
    cy.contains("Create your account").should("be.visible");
    cy.contains(
      "Join us today! Please fill in your details to get started."
    ).should("be.visible");

    // Check form fields are present
    cy.get('input[type="email"]').should("be.visible");
    cy.get('input[type="password"]').should("have.length", 2); // password and confirm password
    cy.get('button[type="submit"]').should("contain", "Create account");

    // Check navigation link to sign-in
    cy.contains("Sign in here").should("be.visible");
  });

  it("should show validation errors for empty form submission", () => {
    // Try to submit empty form
    cy.get('button[type="submit"]').click();

    // Check validation messages appear
    cy.contains("Please enter a valid email address").should("be.visible");
    cy.contains("Password must be at least 6 characters").should("be.visible");
  });

  it("should show validation error for invalid email format", () => {
    // Enter invalid email format
    cy.get('input[type="email"]').type("invalid-email");
    cy.get('input[type="password"]').first().type("password123");
    cy.get('input[type="password"]').last().type("password123");

    // Submit the form to trigger validation
    cy.get('button[type="submit"]').click();

    // Check that HTML5 validation prevents form submission
    cy.get('input[type="email"]:invalid').should("exist");

    // Also ensure we haven't navigated away
    cy.url().should("include", "/sign-up");
  });

  it("should show error when passwords do not match", () => {
    // Fill form with valid email but mismatched passwords
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').first().type("password123");
    cy.get('input[type="password"]').last().type("differentpassword");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check password match validation from Zod schema
    cy.contains("Passwords don't match").should("be.visible");

    // Ensure we stay on sign-up page
    cy.url().should("include", "/sign-up");
  });

  it("should show validation error for short password", () => {
    // Fill form with short password
    cy.get('input[type="email"]').type("test@example.com");
    cy.get('input[type="password"]').first().type("123");
    cy.get('input[type="password"]').last().type("123");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Check password length validation
    cy.contains("Password must be at least 6 characters").should("be.visible");

    // Ensure we stay on sign-up page
    cy.url().should("include", "/sign-up");
  });

  it("should successfully sign up with valid credentials", () => {
    // Fill in valid credentials (using reqres.in test data)
    cy.get('input[type="email"]').type("eve.holt@reqres.in");
    cy.get('input[type="password"]').first().type("password123");
    cy.get('input[type="password"]').last().type("password123");

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard (welcome page)
    cy.url().should("not.include", "/sign-up");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    // Should see dashboard content
    cy.contains("User Management Dashboard").should("be.visible");
    cy.contains("Welcome,").should("be.visible");
  });

  it("should navigate to sign-in page when clicking the link", () => {
    // Click the sign-in navigation link
    cy.contains("Sign in here").click();

    // Should navigate to sign-in page
    cy.url().should("include", "/sign-in");
  });

  it("should show loading state during sign-up process", () => {
    // Fill in credentials
    cy.get('input[type="email"]').type("eve.holt@reqres.in");
    cy.get('input[type="password"]').first().type("password123");
    cy.get('input[type="password"]').last().type("password123");

    // Submit and check loading state
    cy.get('button[type="submit"]').click();
    cy.contains("Creating account...").should("be.visible");
  });
});
