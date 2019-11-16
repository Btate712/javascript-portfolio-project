# javascript-portfolio-project
Flatiron School JavaScript and Rails Portfolio Project

This application is designed to help users study by allowing them to create and
answer multiple choice questions.  The questions are organized by topic and
persisted in a database by a rails api backend.  The frontend is a single html
page populated with elements via JavaScript.

On the backend, RESTful routes are used with the exception that the Encounter
show route and method is actually used to get all encounters for a particular
User (The show route/method is used like a filtered index route/method).  The
decision to use this unconventional routing method was based on the thought that
it's undesireable for the api to return encounter data for users other than the
current user and the fact that a POST request is needed to tell the API which
user encounter data is being requested for (no "current_user" maintained on the
backend since the backend just responds to api requests).  The backend uses JWT
user authentication.

The app initially shows a login page where a user can create a new account and/or
log in to an existing account.  Once logged in, the user can choose between
taking a quiz, creating a new question, reviewing a list of topics and subsequently
the questions for those topics, or viewing user stats.
