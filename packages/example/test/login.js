// Generated with ❤ by Concordia
// source: /home/ssparisi/Documentos/tcc/healer/packages/example/features/login.testcase
//
// THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

const assert = require( 'assert' ).strict;

Feature( 'Login' );

Scenario( 'Successful login | Login with username and password - 1', async ( { I } ) => {
    I.amOnPage( '/login.html' ); // (11,2)  [Login Screen]
    I.fillField( 'username', 'alice' ); // (12,2)  {Username}, valid: last element
    I.fillField( 'password', '4l1c3pass' ); // (13,4)  {Password}, valid: last element
    I.click( 'submit' ); // (14,4)  {Submit}
    I.amOnPage( '/welcome.html' ); // (15,2)  [Welcome Screen]
} );

Scenario( 'Successful login | Login with username and password - 2', async ( { I } ) => {
    I.amOnPage( '/login.html' ); // (21,2)  [Login Screen]
    I.fillField( 'username', 'bob' ); // (22,2)  {Username}, valid: random element
    I.fillField( 'password', '123456' ); // (23,4)  {Password}, valid: random element
    I.click( 'submit' ); // (24,4)  {Submit}
    I.amOnPage( '/welcome.html' ); // (25,2)  [Welcome Screen]
} );

Scenario( 'Successful login | Login with username and password - 3', async ( { I } ) => {
    I.amOnPage( '/login.html' ); // (31,2)  [Login Screen]
    I.fillField( 'username', '' ); // (32,2)  {Username}, invalid: not filled
    I.fillField( 'password', '123456' ); // (33,4)  {Password}, valid: first element
    I.click( 'submit' ); // (34,4)  {Submit}
    I.see( 'Please inform the username.' ); // (35,2)  from <username>
} );

Scenario( 'Successful login | Login with username and password - 4', async ( { I } ) => {
    I.amOnPage( '/login.html' ); // (41,2)  [Login Screen]
    I.fillField( 'username', '­ÖÛgç í=IËræ¼jÀÖï c6Ö|\\' ); // (42,2)  {Username}, invalid: inexistent element
    I.fillField( 'password', 'À®m1¾ÍÁZ:ÈÊ/ßÁÄw(J¨0±' ); // (43,4)  {Password}, invalid: inexistent element
    I.click( 'submit' ); // (44,4)  {Submit}
    I.see( 'Username or password incorrect!' ); // (45,2)  from <username>
    I.see( 'Username or password incorrect!' ); // (46,4)  from <password>
} );

Scenario( 'Successful login | Login with username and password - 5', async ( { I } ) => {
    I.amOnPage( '/login.html' ); // (52,2)  [Login Screen]
    I.fillField( 'username', 'bob' ); // (53,2)  {Username}, valid: first element
    I.fillField( 'password', '' ); // (54,4)  {Password}, invalid: not filled
    I.click( 'submit' ); // (55,4)  {Submit}
    I.see( 'Please inform the password.' ); // (56,2)  from <password>
} );
