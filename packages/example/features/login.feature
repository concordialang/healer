Feature: Login
  As a user
  I would like to authenticate myself
  In order to access the application

Scenario: Successful login
  Given that I can see the login screen
  When I enter with valid credentials
  Then I can access the application's main screen

  Variant: Login with username and password
    Given that I visit the [Login Screen]
    When I fill {Username}
      and I fill {Password}
      and I click on {Submit}
    Then I am in [Welcome Screen]
      and I have a ~user logged in~

Table: Users
  | username | password  |
  | bob      | 123456    |
  | alice    | 4l1c3pass |

UI Element: Username
  - id is "username"
  - required
    Otherwise I must see "Please inform the username."
  - value comes from "SELECT username FROM [Users]"
    Otherwise I must see "Username or password incorrect!"

UI Element: Password
  - id is "password"
  - required
    Otherwise I must see "Please inform the password."
  - value comes from "SELECT password FROM [Users] WHERE username = {Username}"
    Otherwise I must see "Username or password incorrect!"

UI Element: Submit
  - id is "submit"
  - type is button

Constants:
- "Login Screen" is "/login.html"
- "Welcome Screen" is "/welcome.html"
