@enrol @enrol_manual @javascript
Feature: Manual email send and setup
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
    And the following "permission overrides" exist:
      | capability                | permission   | role           | contextlevel | reference |
      | enrol/manual:config       | Allow        | editingteacher | Course       | C001      |

  Scenario: Setup manual enrolment email
    When I log in as "teacher001"
    And I am on the "Course 001" "enrolment methods" page
    And I click on "Edit" "link" in the "Manual enrolments" "table_row"
    And I should see "Send course welcome message"
    And I should see "Custom welcome message"
    And I click on "id_customint1" "select"
    And I should see "No"
    And I should see "From the course contact"
    And I should see "From the key holder"
    And I should see "From the no-reply address"
    And I set the field "id_customint1" to "From the no-reply address"
    And I set the field "id_customtext1" to "Dummy custom message"
    And I press "Save changes"
    And I click on "Edit" "link" in the "Manual enrolments" "table_row"
    And I should see "From the no-reply address"
    And I should see "Dummy custom message"

  Scenario: Email configuration is correct when setup
    When I log in as "admin"
    And I navigate to "Plugins > Enrolments > Manual enrolments" in site administration
    And I set the field "id_s_enrol_manual_sendcoursewelcomemessage" to "From the no-reply address"
    And I press "Save changes"
    And I am on the "Course 001" "enrolment methods" page
    And I click on "Delete" "link" in the "Manual enrolments" "table_row"
    And I press "Continue"
    And I select "Manual enrolments" from the "Add method" singleselect
    And I should see "From the no-reply address"
