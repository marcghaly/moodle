@enrol @enrol_cohort @javascript
Feature: Cohort email send and setup
  In order to send an email to enrolled users
  As an editing teacher
  I need to be able to customize and setup sent message

  Background:
    Given the following "users" exist:
      | username    | firstname | lastname | email                   |
      | teacher001  | Teacher   | 001      | teacher001@example.com  |
    And the following "cohorts" exist:
      | name         | idnumber | visible |
      | Alpha1       | A1       | 1       |
    And the following "users" exist:
      | username | firstname | lastname | email           |
      | user1    | User      | One      | one@example.com |
      | user2    | User      | Two      | two@example.com |
    And the following "cohort members" exist:
      | user  | cohort |
      | user1 | A1     |
      | user2 | A1     |
    And the following "courses" exist:
      | fullname   | shortname | format | startdate       |
      | Course 001 | C001      | weeks  | ##1 month ago## |
    And the following "course enrolments" exist:
      | user       | course | role           | timestart       |
      | teacher001 | C001   | editingteacher | ##1 month ago## |

  Scenario: Setup email to cohort
    When I log in as "teacher001"
    And I am on the "Course 001" "enrolment methods" page
    And I select "Cohort sync" from the "Add method" singleselect
    And I should see "Send course welcome message"
    And I should see "Custom welcome message"
    And I click on "id_customint3" "select"
    And I should see "No"
    And I should see "From the course contact"
    And I should see "From the key holder"
    And I should see "From the no-reply address"
    And I open the autocomplete suggestions list
    And I click on "Alpha1" item in the autocomplete list
    And "Alpha1" "autocomplete_selection" should exist
    And "Alpha1" "autocomplete_selection" should exist
    And I set the field "id_customint3" to "From the no-reply address"
    And I set the field "id_customtext1" to "Dummy custom message"
    And I press "Add method"
    And I click on "Edit" "link" in the "Cohort sync (Alpha1 - Student)" "table_row"
    And I should see "From the no-reply address"
    And I should see "Dummy custom message"
    And I should see "Cohort sync (Alpha1 - Student)"

  Scenario: Email configuration is correct when setup
    When I log in as "admin"
    And I navigate to "Plugins > Enrolments > Cohort sync" in site administration
    And I set the field "id_s_enrol_cohort_sendcoursewelcomemessage" to "From the key holder"
    And I press "Save changes"
    And I am on the "Course 001" "enrolment methods" page
    And I select "Cohort sync" from the "Add method" singleselect
    And I should see "From the key holder"
