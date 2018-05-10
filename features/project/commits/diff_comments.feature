@project_commits
Feature: Project Commits Diff Comments
  Background:
    Given I sign in as a user
    And I own project "Shop"
    And I visit project commit page

  @javascript
  Scenario: I can have multiple forms
    Given I open a diff comment form
    And I write a diff comment like ":-1: I don't like this"
    And I open another diff comment form
    Then I should see a diff comment form with ":-1: I don't like this"
    And I should see an empty diff comment form

  @javascript
  Scenario: I can preview multiple forms separately
    Given I preview a diff comment text like "Should fix it :smile:"
    And I preview another diff comment text like "DRY this up"
    Then I should see two separate previews

  @javascript
  Scenario: I preview a diff comment
    Given I preview a diff comment text like "Should fix it :smile:"
    Then I should see the diff comment preview
    And I should not see the diff comment text field

  @javascript
  Scenario: I can edit after preview
    Given I preview a diff comment text like "Should fix it :smile:"
    Then I should see the diff comment write tab

  @javascript
  Scenario: I can add a comment on a side-by-side commit diff (left side)
    Given I open a diff comment form
    And I click side-by-side diff button
    When I leave a diff comment in a parallel view on the left side like "Old comment"
    Then I should see a diff comment on the left side saying "Old comment"

  @javascript
  Scenario: I can add a comment on a side-by-side commit diff (right side)
    Given I open a diff comment form
    And I click side-by-side diff button
    When I leave a diff comment in a parallel view on the right side like "New comment"
    Then I should see a diff comment on the right side saying "New comment"
