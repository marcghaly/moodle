@core @javascript @core_course
Feature: Course hidden status display.
  In order to see course hidden status easily
  as a user
  I should be able to see hidden status on course page

  Background:
    Given the following "courses" exist:
      | fullname | shortname | format |
      | Course 1 | C1        | topics |

  Scenario: See course hidden status or not
    And I am on the "C1" "Course" page logged in as admin
    And I should not see "Hidden from students"
    And I click on "Settings" "link"
    And I set the field "Course visibility" to "Hide"
    When I press "Save and display"
    Then I should see "Hidden from students"
