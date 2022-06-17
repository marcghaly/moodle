@enrol @enrol_self
Feature: Self email send and setup
  In order to send an email to enrolled users
  As an editing teacher
  I need to be able to customize and setup sent message

  Background:
    Given the following "users" exist:
      | username    | firstname | lastname | email                   |
      | teacher001  | Teacher   | 001      | teacher001@example.com  |
    And the following "users" exist:
      | username | firstname | lastname | email           |
      | user1    | User      | One      | one@example.com |
      | user2    | User      | Two      | two@example.com |
    And the following "courses" exist:
      | fullname   | shortname | format | startdate       |
      | Course 001 | C001      | weeks  | ##1 month ago## |
    And the following "course enrolments" exist:
      | user       | course | role           | timestart       |
      | teacher001 | C001   | editingteacher | ##1 month ago## |

  @javascript
  Scenario: Self enrolment email setup
    When I log in as "teacher001"
    And I am on the "Course 001" "enrolment methods" page
    And I select "Self enrolment" from the "Add method" singleselect
    And I should see "Send course welcome message"
    And I should see "Custom welcome message"
    And I click on "id_customint4" "select"
    And I should see "No"
    And I should see "From the course contact"
    And I should see "From the key holder"
    And I should see "From the no-reply address"
    And I set the field "id_name" to "Custom self enrolment name"
    And I set the field "id_customint4" to "From the no-reply address"
    And I set the field "id_customtext1" to "Dummy custom message"
    And I press "Add method"
    And I click on "Edit" "link" in the "Custom self enrolment name" "table_row"
    And I should see "From the no-reply address"
    And I should see "Dummy custom message"
