@core @javascript
Feature: Edit switch scroll back to position
  In order to easily edit a page
  As a user
  The page needs to scroll to what I was editing

  Background:
    Given the following "courses" exist:
      | fullname | shortname | format |
      | Course 1 | C1        | topics |

  Scenario: Editing a course retains specific edition position
    When I log in as "admin"
    And I am on "Course 1" course homepage with editing mode on
    # Generate multiple sections to have a long page.
    And I add a "Page" to section "1"
    And I set the following fields to these values:
      | Name         | activity not visible |
      | Page content | Test                 |
    And I press "Save and return to course"
    And I add a "Quiz" to section "1"
    And I set the field "Name" to "Test quiz"
    And I press "Save and return to course"
    And I add a "Page" to section "2"
    And I set the following fields to these values:
      | Name         | Page 2 |
      | Page content | Test   |
    And I press "Save and return to course"
    And I add a "Page" to section "3"
    And I set the following fields to these values:
      | Name         | Page 3 |
      | Page content | Test   |
    And I press "Save and return to course"
    And I add a "Page" to section "4"
    And I set the following fields to these values:
      | Name         | Page 4 |
      | Page content | Test   |
    And I press "Save and return to course"
    And I add a "Page" to section "5"
    And I set the following fields to these values:
      | Name         | Visible page activity |
      | Page content | Test                  |
    And I press "Save and return to course"
    And I am on "Course 1" course homepage
    And I hover "Visible page activity" "activity"
    And I click on "Edit mode" "checkbox"
    And Section "5" should be visible from user point of view
    And Section "1" should not be visible from user point of view
    And I click on "Edit mode" "checkbox"
    # Checking collapsed works as well.
    And Section "5" should be visible from user point of view
    And Section "1" should not be visible from user point of view
