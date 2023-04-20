# LiftIt 


This version of Lift-It is not the current version nor is it deployed, please see the repository for the current version of lift-it [here](https://github.com/etcheekes/Liftit_Django) or try out the up-to-date app [here] (https://lift-it.up.railway.app/home/)

#### Video Demo: https://www.youtube.com/watch?v=JCkquwHqHI0

## Description:

Lift-It is a dynamic workout planner web application that lets users browse exercises, make exercises, and create personal workout plans. The frontend uses HTML, CSS, and JavaScript while jinja was used to dynamically render pages. Each page is responsive and adapts to different screen sizes. The backend uses python and flask as its web application framework while SQLite is the database engine used. The website was developed on a virtual environment using Visual Studio Code as the IDE.

### Frontend

The frontend contains nine HTML files in the templates folder (I also discuss each page's functionality):

- layout.html contains the HTML skeleton, links in external files, and implements a nav bar with links to other pages. A logged in user only sees links to the login.html and register.html pages on the nav bar. 
- Home.html greets a non-logged in user with a short slogan while a logged in user sees introductory paragraphs.
- Users can register on register.html and their username and (hashed) password gets saved in the database.
- Login.html lets users log in and their details are validated in the backend server. Upon logging in for the first time each user receives a unique session ID. The session ID is used to link activity and database table rows uniquely to each user.
- Browse.html lets users search and delete all stored exercises. Users can search by word, muscle, or equipment. Results display in a table with four columns named exercise, muscle, equipment, and delete.
- Create-exercise.html lets a user add an exercise to the database that is unique to them.
- Manage_workouts.html lets users create (i.e., name a workout) or delete an existing workout for themselves.
- Customise-workout.html is where users can view, add, and remove exercises from a created workout.
    - Viewing a workout displays a table consisting of six columns which are exercise, muscle, equipment, repetitions, weight, and remove. From the table directly the user can alter the repetitions and weight values.
    - A user adding an exercise to a workout involves them supplying an exercise name from their stored exercises (which is autosuggested for them as they type), repetitions intended, weight, and weight measurement.

Other frontend files within the static folder are:
- The styles.css file contains numerous CSS rules that style elements throughout the website. 
- The main.js file contains several JavaScript functions that manipulate the DOM. These functions alter elements’ contents, reveal hidden elements, and submit forms. 

### Backend

Backend files include:

- The main backend file is app.py which imports the modules needed for using flask, setting up sessions and cookies, interacting with the SQLite database, and hashing of passwords. Furthermore, app.py provides the server-end logic and functionality for each webpage (of which the main functionalities were previously discussed for each HTML page).
- Functions.py contains a function that redirects users to the login.html page if attempting to access a page restricted to non-logged in users.
- The lifit.db database which stores the relevant data used when generating the website.

The liftit.db database contains five tables:

- The exercises table contains information on each exercise. Importantly, each row uniquely links to a user by the user_id column which contains the user’s session ID.
- The default_exercises table contains pre-loaded exercises. This table is untouched apart from copying its contents to the exercises table for a user when they first log in.
- The users table stores the user’s unique session id, username, and hashed password.
- The users_wk_name simply links a workout plan name with a specific user. This allowed the website to first let a user store a workout plan in name only in the database which then makes it possible for the user to add details to it (these details being stored in the workout_details table).
- The workout_details table stores information regarding the user’s personally created workout plans. Workout plans are uniquely linked to each user.

