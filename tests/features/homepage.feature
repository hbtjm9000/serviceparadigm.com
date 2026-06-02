Feature: Homepage
  As a visitor to serviceparadigm.com
  I want the homepage to load quickly and present the value proposition
  So that I understand what Paradigm IT Services offers

  Background:
    Given I am on the homepage

  Scenario: Page loads successfully
    Then the page should load with status 200
    And the page title should contain "Paradigm IT Services"
    And the body should not be empty

  Scenario: Hero section is visible
    Then I should see the hero section heading "Engineering the Next Paradigm"
    And I should see a "Start Your Transformation" call-to-action button
    And I should see a "Get Started" call-to-action button

  Scenario: Navigation is present and functional
    Then I should see the main navigation bar
    And the navigation should contain links to "Services, Elements, Insights, About, Contact"

  Scenario: Services section is displayed
    When I scroll to the "Strategic Pillars" section
    Then I should see the heading "Strategic Pillars"
    And I should see cards for AI Strategy, Solutions Architecture, and Cybersecurity Architecture

  Scenario: Mission section is displayed
    When I scroll to the "Vision and Execution" section
    Then I should see the heading "Bridging the Latency between Vision and Execution."
    And I should see statistics for cost per minute and digital transformation failure rate

  Scenario: Newsletter signup form is visible
    Then I should see a newsletter email input field
    And I should see a submit button for the newsletter

  Scenario: Footer contains required links
    And I should see a link to the "privacy" page
    And I should see a link to the "terms" page
    And I should see a link to the "accessibility" page
    And I should see a link to the LinkedIn company page

  Scenario: Meta tags are properly set
    Then the page should have an og:image meta tag
    And the page should have a meta description

  Scenario: All images have alt text
    Then every image on the page should have an alt attribute
