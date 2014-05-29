@core @core_question
Feature: Editing a question in use that has been attempted triggers regrade warning
  While editing an attempted question
  As a teacher
  I want to know if it needs regrading.

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email                |
      | teacher1 | Teacher   | 1        | teacher1@example.com |
      | student1 | Student   | 1        | student1@example.com |
    And the following "courses" exist:
      | fullname | shortname | format |
      | Course 1 | C1        | weeks  |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
    And the following "question categories" exist:
      | contextlevel | reference | name           |
      | Course       | C1        | Test questions |
    And the following "questions" exist:
      | questioncategory | qtype     | name            | questiontext              |
      | Test questions   | truefalse | First question  | Answer the first question |
      | Test questions   | truefalse | Second question | Answer the first question |
    And the following "activities" exist:
      | activity | name           | course | idnumber | attempts | gradepass | completion | completionusegrade | completionpass | completionattemptsexhausted |
      | quiz     | Test quiz name | C1     | quiz1    | 1        | 5.00      | 2          | 1                  | 1              | 1                           |
    And quiz "Test quiz name" contains the following questions:
      | question        | page |
      | First question  | 1    |
    And user "student1" has attempted "Test quiz name" with responses:
      | slot | response |
      | 1    | False    |

  @javascript
  Scenario: Regrade warning should be displayed when editing attempted question
    Given I am on the "First question" "core_question > edit" page logged in as teacher1
    And I set the field "Question text" to "Something new"
    And I press "Save changes"
    And I should see "Do you want to save anyway?"
    And I should see "This question is used in at least one quiz opened by one or more students."
    And I should see "Changes will apply as soon as you click on the \"Save changes\" button."
    And I should see "If you want these changes to be applied to past attempts,"
    And I should see "you may have to regrade all attempts in quizzes containing this question."
    And I click on "Cancel" "button" in the ".modal-content" "css_element"
    And I press "Save changes and continue editing"
    And I should see "Do you want to save anyway?"
    And I should see "This question is used in at least one quiz opened by one or more students."
    And I should see "Changes will apply as soon as you click on the \"Save changes\" button."
    And I should see "If you want these changes to be applied to past attempts,"
    And I should see "you may have to regrade all attempts in quizzes containing this question."
    And I am on the "Second question" "core_question > edit" page logged in as teacher1
    And I set the field "Question text" to "Another new thing"
    And I press "Save changes"
    And I should not see "Do you want to save anyway?"
    And I should not see "This question is used in at least one quiz opened by one or more students."
    And I should not see "Changes will apply as soon as you click on the \"Save changes\" button."
    And I should not see "If you want these changes to be applied to past attempts,"
    And I should not see "you may have to regrade all attempts in quizzes containing this question."
