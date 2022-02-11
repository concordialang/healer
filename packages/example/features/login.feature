Feature: Login
  As a user
  I would like to authenticate myself
  In order to access the application

Scenario: Successful login
  Given that I can see the login screen
  When I enter with valid credentials
  Then I can access the application's main screen

  Variant: Login with valid username and password
    Given that I visit the [Login Screen]
    When I enter with "alice" in {Username}
      and I enter with "4l1c3pass" in {Password}
      and I click on {Submit}
    Then I am in [Welcome Screen]

Scenario: Fail login
  Given that I can see the login screen
  When I enter with invalid credentials
  Then I can see an error message

  Variant: Login with invalid username and password
    Given that I visit the [Login Screen]
    When I enter with "bob" in {Username}
      and I enter with "4l1c3pass" in {Password}
      and I click on {Submit}
    Then I see "Username or password incorrect!"

UI Element: Username
  - locator is "username"

UI Element: Password
  - locator is "password"

UI Element: Submit
  - locator is "submit"

Constants:
- "Login Screen" is "/login.html"
- "Welcome Screen" is "/welcome.html"
