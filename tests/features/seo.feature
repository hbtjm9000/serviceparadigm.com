Feature: SEO and Standards Compliance
  As the site owner
  I want all pages to follow SEO best practices and legal standards
  So that the site ranks well and meets compliance requirements

  Background:
    Given I browse the site

  Scenario: All public pages return HTTP 200
    When I visit each public page
    Then every page should return HTTP 200
    And every page should have a non-empty body

  Scenario: Each page has unique meta description
    When I visit each public page
    Then each page should have a meta description
    And all meta descriptions should be unique

  Scenario: Sitemap is accessible
    When I request "/sitemap-index.xml"
    Then I should receive HTTP 200

  Scenario: robots.txt is accessible and contains sitemap reference
    When I request /robots.txt
    Then I should receive HTTP 200
    And the content should contain "Sitemap"

  Scenario: Legal pages have substantive content
    When I visit the privacy page
    Then the page content should be longer than 500 characters
    And the page should mention "Paradigm IT Services"

    When I visit the terms page
    Then the page content should be longer than 500 characters
    And the page should mention "Paradigm IT Services"

  Scenario: OG meta tags present on all pages
    When I visit each public page
    Then each page should have an og:image meta tag
    And each page should have an og:title meta tag

  Scenario: External links have rel="noopener"
    When I visit each public page
    Then every external link targeting _blank should have rel="noopener"
