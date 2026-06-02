Feature: Contact
  As a potential client
  I want to easily find and use the contact form
  So that I can inquire about services

  Background:
    Given I am on the contact page

  Scenario: Contact page loads correctly
    Then the page should load with status 200
    And the page title should contain "Contact"

  Scenario: Contact form has all required fields
    Then I should see a field labeled "Name"
    And I should see a field labeled "Email"
    And I should see a field labeled "Company"
    And I should see a field labeled "Service"
    And I should see a field labeled "Message"
    And I should see a submit button

  Scenario: Successful form submission
    When I fill in the contact form with valid data
    And I submit the form
    Then I should see a success confirmation message

  Scenario: Canonical contact information is displayed
    Then I should see the email address "hello@serviceparadigm.com" on the page
    And I should see a phone link with a "tel:" href
    And I should see a physical address

  Scenario: All mailto links use the canonical email
    Then every mailto link on the page should point to "hello@serviceparadigm.com"
