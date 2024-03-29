# simplifies python SQL querying
from cs50 import SQL
# allow sessions and cookies
from flask import Flask, render_template, request, session, flash, jsonify
from flask_session import Session
# security for passwords
from werkzeug.security import check_password_hash, generate_password_hash

# obtain function from functions.py
from functions import login_required

# configure application
app = Flask(__name__)

# connect to database
db = SQL("sqlite:///liftit.db")

# Configure session
	## When browser closed, the session goes away
app.config["SESSION_PERMANENT"] = False
	## set to use the file system
app.config["SESSION_TYPE"] = "filesystem"
	## tell app to support session
Session(app)

@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response

# homepage 
@app.route("/")
def home():
    return render_template("home.html")

# login
@app.route("/login", methods=["GET", "POST"])
def login():

    # forget any user_id
    session.clear()

    # If user submitted a form via POST (i.e., submitted login details)
    if request.method == "POST":
        
        # store current url to use in <a> tag on error page
        url = request.url

        # check username submitted
        if not request.form.get("username"):
            error = "must provide username"
            return render_template("error.html", error=error, url=url)

        # Ensure password submitted
        elif not request.form.get("password"):
            error = "must provide password"
            return render_template("error.html", error=error, url=url)

        # Obtain username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            error = "invalid username and/or password"
            return render_template("error.html", error=error, url=url)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id_user"]

        # if user has no rows in exercises table then fill table with default exercises and the user's unique id
        first_time_login = db.execute("SELECT * FROM exercises WHERE user_id = ?", session["user_id"])
        if len(first_time_login) == 0:
            db.execute("INSERT INTO exercises (exercise, muscle, equipment, user_id) SELECT default_exercise, default_muscle, default_equipment, ? FROM default_exercises", session["user_id"])

        # Redirect user to home page
        return render_template("home.html")

    return render_template("login.html")


@app.route("/browse", methods=["GET", "POST"])
@login_required
def browse():


    # obtain distinct categories for muscle and equipment values. 
    muscle = db.execute("SELECT DISTINCT muscle FROM exercises WHERE user_id = ? ORDER BY muscle COLLATE NOCASE ASC", session["user_id"])
    equipment = db.execute("SELECT DISTINCT equipment FROM exercises WHERE user_id = ? ORDER BY muscle COLLATE NOCASE ASC", session["user_id"])

    # to display exercises with said muscle group
    muscle_display = request.args.get("exercises")

    # once muscle group is chosen
    if muscle_display != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (muscle = ? AND user_id = ?)", muscle_display, session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table, muscle_display=muscle_display)

    # to display exercises by equipment
    equipment_display = request.args.get("equipments")

    #once equipment is chosen
    if equipment_display != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (equipment = ? AND user_id = ?)", equipment_display, session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table, equipment_display=equipment_display)

    # to display exercises containing the text that the user inputted
    exercise_name = request.args.get("exercise_name")

    if exercise_name != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (exercise LIKE ?) AND user_id = ?", "%" + exercise_name + "%", session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table)

    return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=[])


@app.route("/create-exercise", methods=["GET","POST"])
@login_required
def create_exercise():

    if request.method == "POST":
        # Obtain exercise information
        store_name = request.form.get("name_store")
        store_muscle = request.form.get("muscle_store")
        store_equip = request.form.get("equip_store")

        # store url for use in <a> tag in error.html;
        url = request.url

        # error if empty submission
        if len(store_name) == 0 or len(store_muscle) == 0 or len(store_equip) == 0:
            error = "Please fill in all fields"
            return render_template("error.html", error=error, url=url)
        
        # error if exercise name already exists
        user_exercises = db.execute("SELECT exercise FROM exercises WHERE user_id = ?", session["user_id"])
        for exercise in user_exercises:
            if exercise['exercise'] == store_name:
                error = "Exercise name taken"
                return render_template("error.html", error=error, url=url)

        # Update database with new exercise
        db.execute("INSERT INTO exercises (exercise, muscle, equipment, user_id) VALUES (?, ?, ?, ?)", store_name, store_muscle, store_equip, session["user_id"])

        # alert user that execise is successfully added
        flash("Exercise successfully added")
        return render_template("create-exercise.html")

    # obtain all possible distinct muscle and equipment categories
    all_muscles = db.execute("SELECT DISTINCT muscle FROM exercises WHERE user_id = ?", session["user_id"])

    all_equipment = db.execute("SELECT DISTINCT equipment FROM exercises WHERE user_id = ?", session["user_id"])

    return render_template("create-exercise.html", all_muscles=all_muscles, all_equipment=all_equipment)



@app.route("/manage-workouts", methods=["GET", "POST"])
@login_required
def manage_workouts():

    # obtain user's named workouts and organise in ascending order
    user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ? ORDER BY wk_name COLLATE NOCASE ASC", session["user_id"])

    if request.method == "POST":

        # store current url to use in <a> tag in error.html
        url = request.url

        # create name for workout
        if "wk_name" in request.form:
            wk_name = request.form.get("wk_name")

            # error if blank name supplied
            if len(wk_name) == 0:
                error = "Workout name can not be blank"
                return render_template("error.html", error=error, url=url)
            
            # error if workout name already taken
            for name in user_workouts:
                if name['wk_name'] == wk_name:
                    error = "Workout with that name already exists"
                    return render_template("error.html", error=error, url=url)
            
            db.execute("INSERT INTO users_wk_name (user, wk_name) VALUES (?, ?)", session["user_id"], wk_name)
            flash("Workout created! See Customise Workouts.")
            return render_template("manage-workouts.html", user_workouts=user_workouts)
        
        # delete workout
        if "wk_delete" in request.form:
            wk_delete = request.form.get("wk_delete")

            # return error is workout not selected
            if wk_delete == '0':
                error = "please select an existing workout"
                return render_template("error.html", error=error, url=url)
            
            # remove workout plan name and information from database
            db.execute("DELETE FROM users_wk_name WHERE wk_name = ? AND user = ?", wk_delete, session["user_id"])
            db.execute("DELETE FROM workout_details WHERE wk_name = ? AND trackuser = ?", wk_delete, session["user_id"])

            # let user know workout is successfully deleted
            flash("Workout deleted")
            
            return render_template("manage-workouts.html", user_workouts=user_workouts)

        return render_template("manage-workouts.html", user_workouts=user_workouts)

    return render_template("manage-workouts.html", user_workouts=user_workouts)




@app.route("/customise-workouts", methods=["GET", "POST"])
@login_required
def customise_workouts():

    # obtain name of user's made workouts
    user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ? ORDER BY wk_name COLLATE NOCASE ASC", session["user_id"])

    # obtain all exercises available to the user
    all_exercises = db.execute("SELECT exercise FROM exercises WHERE user_id = ?", session["user_id"])

    if request.method == "POST":

        # Trigger javascript which makes the header text and select element value the workout plan's name that the user requested
        keep = "keep"

        # for <a> tag in error.html
        url = request.url

    # if user chooses to retrieve a workout
        if "wk_plan" in request.form:

            # obtain user's desired workout
            wk_choice = request.form.get("wk_plan")

            # check user errors
            # user submits blank
            if wk_choice == '0':
                error = "Please choose a workout plan"
                return render_template("error.html", error=error, url=url)

            # data on the user's created workouts 
            users_wks = db.execute("SELECT exercises.exercise, exercises.muscle, exercises.equipment, workout_details.wk_name, workout_details.reps, CAST (workout_details.weight AS TEXT)AS weight, workout_details.measurement, workout_details.track_row FROM exercises INNER JOIN workout_details ON workout_details.track_ex=exercises.id WHERE workout_details.trackuser = ? AND workout_details.wk_name = ? ", session["user_id"], wk_choice)

            # user submits workout that does not exist or has no exercises
            if len(users_wks) == 0:
                error = "That workout plan does not exist or lacks any exercises"
                return render_template("error.html", error=error, url=url)

            return render_template("customise-workouts.html", users_wks=users_wks, user_workouts=user_workouts, wk_choice=wk_choice, all_exercises=all_exercises)
        
    # if user wishes to add new exercise to a workout plan

        if "wk_plan_add" and "exercise_name" and "reps" and "weight" and "measurement" in request.form:
            wk_name_add = request.form.get("wk_plan_add")
            exercise_name = request.form.get("exercise_name")
            reps = request.form.get("reps")
            weight = request.form.get("weight")
            measurement = request.form.get("measurement")

            # throw error if user leaves field empty
            # note wk_name_add returns '0' if workout name is not chosen
            if len(wk_name_add) == 0 or len(exercise_name) == 0 or len(reps) == 0 or len(weight) == 0 or len(measurement) == 0:
                url = request.url
                error = "Please fill in all fields"
                return render_template("error.html", error=error, url=url)

            # error if exercise not in all_exercises
            exercise_exists = 0
            for exercise in all_exercises:
                if exercise_name in exercise['exercise']:
                    exercise_exists += 1
            
            if exercise_exists < 1:
                error = "Exercise not in database, please choose from the suggestions. You add a new exercise on the Create Exercise page."
                url = request.url
                return render_template("error.html", error=error, url=url)
            
            # obtain unique id for exercise
            key = db.execute("SELECT id FROM exercises WHERE exercise = ? AND user_id =?", exercise_name, session["user_id"])
            key = key[0]['id']

            # add exercise to user workout
            db.execute("INSERT INTO workout_details (trackuser, wk_name, track_ex, reps, weight, measurement) VALUES (?, ?, ?, ?, ?, ?)", session["user_id"], wk_name_add, key, reps, weight, measurement)

            return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises, keep=keep, wk_name_add=wk_name_add)
        
    # if user updates reps

        if "rep_number" in request.form:

            # get new rep number and row id
            update = request.form.get("rep_number")
            row_id = request.form.get("rep_row")

            # error if not numeric (todo) or blank
            if len(update) == 0:
                url = request.url
                error = "Number value required"
                return render_template("error.html", error=error, url=url)

            # update rep number for that exercise in user_workouts table
            db.execute("UPDATE workout_details SET reps = ? WHERE track_row = ?", int(update), int(row_id))

            # retrieve workout plan name
            wk_name_add = request.form.get("get_wk_name")

            return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises, keep=keep, wk_name_add=wk_name_add)

    # if user updates weight

        if "weight_number" in request.form:

            # get new weight number and row id
            update = request.form.get("weight_number")
            row_id = request.form.get("weight_row")

            # error if not numeric (todo) or blank
            if len(update) == 0 or update.isnumeric() == False:
                url = request.url
                error = "Number value required"
                return render_template("error.html", error=error, url=url)

            # update weight number for that exercise in user_workouts table
            db.execute("UPDATE workout_details SET weight = ? WHERE track_row = ?", int(update), int(row_id))

            # retrieve workout plan name
            wk_name_add = request.form.get("get_wk_name")

            return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises, keep=keep, wk_name_add=wk_name_add)
    
    # if user updates measurement

        if "measurement_update" in request.form:

            # get new measurement value and row id

            update = request.form.get("measurement_update")
            row_id = request.form.get("measurement_row")

            # error if not string or blank
            if len(update) == 0 or update.isnumeric():
                url = request.url
                error = "Input missing or non-text input detected"
                return render_template("error.html", error=error, url=url)

            # update measurement for that exercise in user_workouts
            db.execute("UPDATE workout_details SET measurement = ? WHERE track_row = ?", update, int(row_id))

            # retrieve workout plan name
            wk_name_add = request.form.get("get_wk_name")

            return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises, keep=keep, wk_name_add=wk_name_add)

    # if user removes exercise from workout plan
        if "delete" in request.form:

            # get exercise to delete
            to_delete = request.form.get("delete")

            # remove exercise from user_workouts table
            db.execute("DELETE FROM workout_details WHERE track_row = ?", int(to_delete))

            # retrieve workout plan name
            wk_name_add = request.form.get("get_wk_name")
        

            return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises, keep=keep, wk_name_add=wk_name_add)

    return render_template("customise-workouts.html", user_workouts=user_workouts, all_exercises=all_exercises)



@app.route("/register", methods=["POST", "GET"])
def register():

    if request.method == "POST":

        # Get username and password
        username = request.form.get("username")
        password = request.form.get("password")
        password_confirm = request.form.get("confirmation")

        # for <a> tag in error.html
        url = request.url

        # Check for user entry errors
        if not username:
            error = "must provide a username"
            return render_template("error.html", error=error, url=url)
        if not password:
            error = "must provide a passsword"
            return render_template("error.html", error=error, url=url)
        if not password_confirm:
            error = "must confirm password"
            return render_template("error.html", error=error, url=url)
        if password != password_confirm:
            error = "both passwords must be the same"
            return render_template("error.html", error=error, url=url)
            
        # check if username already take
        name_check = db.execute("SELECT username FROM users WHERE username = ?", username)
        if len(name_check) != 0:
            error = "username already taken"
            return render_template("error.html", error=error, url=url)
        
        # hash user's password
        password = generate_password_hash(password)

        # place user information data into database
        db.execute("INSERT INTO users (username, hash) VALUES (?,?)", username, password)
        # if successful direct user to login page
        return render_template("login.html")
    else:
        return render_template("register.html")


@app.route("/delete_exercise_from_database", methods=["POST"])
@login_required
def delete():

    # This page serves only to delete exercises from the database (deletion is specific to the user logged in)
    if request.method == "POST":

        # obtain distinct categories from default options and user created exercises. 
        muscle = db.execute("SELECT DISTINCT muscle FROM exercises WHERE user_id = ?", session["user_id"])
        equipment = db.execute("SELECT DISTINCT equipment FROM exercises WHERE user_id = ?", session["user_id"])

        # get exercise row to delete
        to_delete = request.form.get("delete")
        row_to_delete = db.execute("SELECT * FROM exercises WHERE id = ? and user_id = ?", to_delete, session["user_id"])

        # check and (if existing) remove exercise from the user's personal workout plans 
        if row_to_delete[0]['id'] != 0:
            db.execute("DELETE FROM workout_details WHERE track_ex = ? AND trackuser = ?", int(to_delete), session["user_id"])

        # remove exercise from exercises TABLE
        if row_to_delete[0]['id'] != 0:
            db.execute("DELETE FROM exercises WHERE id = ? and user_id = ?", int(to_delete), session["user_id"])
        else:
            url = request.url
            error = "Exercise is not stored"
            return render_template("error.html", error=error, url=url)

        # get category (i.e., equipment or muscle) to use so we can re-display the same table after the user deletes a row
        if "muscle" in request.form:
            muscle_display = request.form.get("muscle")
            return render_template("browse.html", muscle_display=muscle_display, muscle=muscle, equipment=equipment, category_to_display=[])
        elif "equipment" in request.form:
            equipment_display = request.form.get("equipment")
            return render_template("browse.html", equipment_display=equipment_display, muscle=muscle, equipment=equipment, category_to_display=[])
        else:
            return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=[])



@app.route("/logout")
def logout():
    
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return render_template("login.html")

@app.route("/test")
@login_required
def test():

    return render_template("test.html")

# retrieve last row added to user-created workout from the logged in user
@app.route("/get_last_user_created_row", methods=["GET"])
def get_row():

    # obtain exercises from workout plan the user just added to
    # (as this request is only made when the user adds a exercise to a workout plan, by filtering the highest value track_row by user, we obtain the most recent addition)
    row = db.execute("SELECT exercises.exercise, exercises.muscle, exercises.equipment, workout_details.wk_name ,workout_details.reps, CAST (workout_details.weight AS TEXT) AS weight, workout_details.measurement, workout_details.track_row FROM exercises INNER JOIN workout_details ON workout_details.track_ex=exercises.id WHERE workout_details.trackuser = ? ORDER BY track_row DESC LIMIT 1", session["user_id"])
    # return row as json which is used to dynamically update the table
    return jsonify(row)