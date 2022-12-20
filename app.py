# simplifies python SQL querying
from cs50 import SQL
# allow sessions and cookies
from flask import Flask, render_template, request, session, redirect
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

        # check username submitted
        if not request.form.get("username"):
            error = "must provide username"
            return render_template("error.html", error=error)

        # Ensure password submitted
        elif not request.form.get("password"):
            error = "must provide password"
            return render_template("error.html", error=error)

        # Obtain username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            error = "invalid username and/or password"
            return render_template("error.html", error=error)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id_user"]

        # if user has no rows in exercises table then fill table with default exercises + user's unique id
        first_time_login = db.execute("SELECT * FROM exercises WHERE user_id = ?", session["user_id"])
        
        if len(first_time_login) == 0:
            db.execute("INSERT INTO exercises (exercise, muscle, equipment, user_id) SELECT default_exercise, default_muscle, default_equipment, ? FROM default_exercises", session["user_id"])

        # Redirect user to home pagebrowse
        return render_template("home.html")

    return render_template("login.html")


@app.route("/browse", methods=["GET", "POST"])
@login_required
def browse():


    # obtain distinct categories from default options and user created exercises. 
    muscle = db.execute("SELECT DISTINCT muscle FROM exercises WHERE user_id = ?", session["user_id"])
    equipment = db.execute("SELECT DISTINCT equipment FROM exercises WHERE user_id = ?", session["user_id"])

    # to display exercises with said muscle group
    muscle_display = request.args.get("exercises")

    # once muscle group is chosen
    if muscle_display != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (muscle = ? AND user_id = ?)", muscle_display, session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table)

    # to display exercises by equipment
    equipment_display = request.args.get("equipments")

    #once equipment is chosen
    if equipment_display != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (equipment = ? AND user_id = ?)", equipment_display, session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table)

    # to display exercises containing the text that the user inputted
    exercise_name = request.args.get("exercise_name")

    if exercise_name != None:
        reveal_table = 'show'
        category_to_display = db.execute("SELECT * FROM exercises WHERE (exercise LIKE ?) AND user_id = ?", "%" + exercise_name + "%", session["user_id"])
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display, reveal_table=reveal_table)

    return render_template("browse.html", muscle=muscle, equipment=equipment)


@app.route("/add_exercise", methods=["GET","POST"])
@login_required
def add_exercise():

    if request.method == "POST":
        # Obtain exercises
        store_name = request.form.get("name_store")
        store_muscle = request.form.get("muscle_store")
        store_equip = request.form.get("equip_store")

        # If not all fields are filled in
        if None in (store_name, store_muscle, store_equip):
            # TO.DO create error.html template
            return render_template("home.html")

        # Update database with new exercise
        db.execute("INSERT INTO exercises (exercise, muscle, equipment, user_id) VALUES (?, ?, ?, ?)", store_name, store_muscle, store_equip, session["user_id"])

        return render_template("add_exercise.html")

    # obtain all possible muscle and equipment categories
    all_muscles = db.execute("SELECT DISTINCT muscle FROM exercises WHERE user_id = ?", session["user_id"])

    all_equipment = db.execute("SELECT DISTINCT equipment FROM exercises WHERE user_id = ?", session["user_id"])

    return render_template("add_exercise.html", all_muscles=all_muscles, all_equipment=all_equipment)


# functions as simple bridging page to add_workout and name_workout pages
@app.route("/workout_plan", methods=["POST", "GET"])
@login_required
def workout_plan():

    return render_template("workout_plan.html")



@app.route("/name_workout", methods=["GET", "POST"])
@login_required
def name_workout():


    if request.method == "POST":

        # create name for workout
        if "wk_name" in request.form:
            wk_name = request.form.get("wk_name")
            db.execute("INSERT INTO users_wk_name (user, wk_name) VALUES (?, ?)", session["user_id"], wk_name)
        
        # delete workout
        if "wk_delete" in request.form:
            wk_delete = request.form.get("wk_delete")
            db.execute("DELETE FROM users_wk_name WHERE wk_name = ? AND user = ?", wk_delete, session["user_id"])
            db.execute("DELETE FROM workout_details WHERE wk_name = ? AND trackuser = ?", wk_delete, session["user_id"])

        user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

        return render_template("name_workout.html", user_workouts=user_workouts)

        # todo add option to delete workout from here
    
    # obtain name of user's made workouts
    user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

    return render_template("name_workout.html", user_workouts=user_workouts)


@app.route("/add_workout", methods=["GET", "POST"])
@login_required
def add_workout():

    # obtain user's self-made workout names
    user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

    # obtain all exercises available to the user
    all_exercises = db.execute("SELECT exercise FROM exercises WHERE user_id = ?", session["user_id"])

    if request.method == "POST":

        # obtain user's self-made workout names
        user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

        # obtain all possible exercises 
        all_exercises = db.execute("SELECT exercise FROM exercises WHERE user_id = ?", session["user_id"])

        # get user input regarding adding exercise
        if "wk_plan_add" and "exercise_name" and "reps" and "weight" and "measurement" in request.form:
            wk_name_add = request.form.get("wk_plan_add")
            exercise_name = request.form.get("exercise_name")
            reps = request.form.get("reps")
            weight = request.form.get("weight")
            measurement = request.form.get("measurement")

            # throw error if user leaves field empty
            # note wk_name_add returns '0' if workout name is not chosen
            if len(wk_name_add) == 0 or len(exercise_name) == 0 or len(reps) == 0 or len(weight) == 0 or len(measurement) == 0:
                error = "Please fill in all fields"
                return render_template("error.html", error=error)

            # error if exercise not in all_exercises
            exercise_exists = 0
            for exercise in all_exercises:
                if exercise_name in exercise['exercise']:
                    exercise_exists += 1
            
            if exercise_exists < 1:
                error = "Exercise not in database, please choose from the suggestion"
                return render_template("error.html", error=error)
            
            # obtain unique id for exercise
            key = db.execute("SELECT id FROM exercises WHERE exercise = ? AND user_id =?", exercise_name, session["user_id"])
            key = key[0]['id']

            # add exercise to database for user
            db.execute("INSERT INTO workout_details (trackuser, wk_name, track_ex, reps, weight, measurement) VALUES (?, ?, ?, ?, ?, ?)", session["user_id"], wk_name_add, key, reps, weight, measurement)

    return render_template("add_workout.html", user_workouts=user_workouts, all_exercises=all_exercises)


@app.route("/view_plan", methods=["GET", "POST"])
@login_required
def view():

    # obtain name of user's made workouts
    user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

    # obtain all exercises available to the user
    all_exercises = db.execute("SELECT exercise FROM exercises WHERE user_id = ?", session["user_id"])

    if request.method == "POST":

        # if user chooses to retrieve a workout
        if "wk_plan" in request.form:

            # obtain user's desired workout
            wk_choice = request.form.get("wk_plan")

            # check user errors
            # user submits blank
            if len(wk_choice) == 0:
                error = "Please choose a workout plan"
                return render_template("error.html", error=error)

            # data on the user's created workouts 
            users_wks = db.execute("SELECT exercises.exercise, exercises.muscle, exercises.equipment, workout_details.wk_name, workout_details.reps, CAST (workout_details.weight AS TEXT)AS weight, workout_details.measurement FROM exercises INNER JOIN workout_details ON workout_details.track_ex=exercises.id WHERE workout_details.trackuser = ? AND workout_details.wk_name = ? ", session["user_id"], wk_choice)

            # user submits workout that does not exist or has no exercises
            if len(users_wks) == 0:
                error = "That workout plan does not exist or lacks any exercises"
                return render_template("error.html", error=error)

            return render_template("view_plan.html", users_wks=users_wks, user_workouts=user_workouts)
        
        # get user input regarding adding exercise
        if "wk_plan_add" and "exercise_name" and "reps" and "weight" and "measurement" in request.form:
            wk_name_add = request.form.get("wk_plan_add")
            exercise_name = request.form.get("exercise_name")
            reps = request.form.get("reps")
            weight = request.form.get("weight")
            measurement = request.form.get("measurement")

            # throw error if user leaves field empty
            # note wk_name_add returns '0' if workout name is not chosen
            if len(wk_name_add) == 0 or len(exercise_name) == 0 or len(reps) == 0 or len(weight) == 0 or len(measurement) == 0:
                error = "Please fill in all fields"
                return render_template("error.html", error=error)

            # error if exercise not in all_exercises
            exercise_exists = 0
            for exercise in all_exercises:
                if exercise_name in exercise['exercise']:
                    exercise_exists += 1
            
            if exercise_exists < 1:
                error = "Exercise not in database, please choose from the suggestion"
                return render_template("error.html", error=error)
            
            # obtain unique id for exercise
            key = db.execute("SELECT id FROM exercises WHERE exercise = ? AND user_id =?", exercise_name, session["user_id"])
            key = key[0]['id']

            # add exercise to user workout
            db.execute("INSERT INTO workout_details (trackuser, wk_name, track_ex, reps, weight, measurement) VALUES (?, ?, ?, ?, ?, ?)", session["user_id"], wk_name_add, key, reps, weight, measurement)
        
        
    return render_template("view_plan.html", user_workouts=user_workouts, all_exercises=all_exercises)



@app.route("/register", methods=["POST", "GET"])
def register():

    if request.method == "POST":

        # Get username and password
        username = request.form.get("username")
        password = request.form.get("password")
        password_confirm = request.form.get("confirmation")

        # Check for user entry errors
        if not username:
            error = "must provide a username"
            return render_template("error.html", error=error)
        if not password:
            error = "must provide a passsword"
            return render_template("error.html", error=error)
        if not password_confirm:
            error = "must confirm password"
            return render_template("error.html", error=error)
        if password != password_confirm:
            error = "both passwords must be the same"
            return render_template("error.html", error=error)
            
        # check if username already take
        name_check = db.execute("SELECT username FROM users WHERE username = ?", username)
        if len(name_check) != 0:
            error = "username already taken"
            return render_template("error.html", error=error)
        
        # hash user's password
        password = generate_password_hash(password)

        # place user information data
        db.execute("INSERT INTO users (username, hash) VALUES (?,?)", username, password)
        return render_template("login.html")
    else:
        return render_template("register.html")

@app.route("/delete_exercise_from_workout_plan", methods=["POST", "GET"])
@login_required
def deletion():

    # This page serves only to delete exercise from a user-created workout
    if request.method == "POST":

        # get exercise to delete
        to_delete = request.form.get("delete")

        # get id number for exercise
        exercise_id = db.execute("SELECT id FROM exercises WHERE exercise = ? AND user_id = ?", to_delete, session["user_id"])
        exercise_id = exercise_id[0]['id']

        # remove exercise from workout plan
        db.execute("DELETE FROM workout_details WHERE track_ex = ? AND trackuser = ?", exercise_id, session["user_id"])
        
        # obtain user-created workouts to feed back into view_plan page
        user_workouts = db.execute("SELECT wk_name FROM users_wk_name WHERE user = ?", session["user_id"])

        return render_template("view_plan.html", user_workouts=user_workouts)

@app.route("/delete_exercise_from_database", methods=["POST"])
@login_required
def delete():

    # This page serves only to delete exercises from the database (deletion is specific to the user logged in)
    if request.method == "POST":

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
            error = "Exercise is not stored"
            return render_template("error.html", error=error)

        return render_template("browse.html")

        


@app.route("/logout")
def logout():
    
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return render_template("login.html")

