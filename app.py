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

        # Redirect user to home page
        return render_template("home.html")

    return render_template("login.html")

# browse exercises
@app.route("/browse")
@login_required
def browse():

    # obtain distinc categories 
    muscle = db.execute("SELECT DISTINCT muscle FROM exercises")
    equipment = db.execute("SELECT DISTINCT equipment FROM exercises")
    
    # to display exercises with said muscle group
    muscle_display = request.args.get("exercises")

    # once muscle group is chosen
    if muscle_display != None:
        category_to_display = db.execute("SELECT * FROM exercises WHERE muscle = ?", muscle_display)
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display)

    # to display exercises by equipment
    equipment_display = request.args.get("equipments")

    #once equipment is chosen
    if equipment_display != None:
        category_to_display = db.execute("SELECT * FROM exercises WHERE equipment = ?", equipment_display)
        return render_template("browse.html", muscle=muscle, equipment=equipment, category_to_display=category_to_display)

    return render_template("browse.html", muscle=muscle, equipment=equipment)

# add exercise to user database
@app.route("/add", methods=["GET","POST"])
@login_required
def add():

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
        db.execute("INSERT INTO exercises (exercise, muscle, equipment) VALUES (?, ?, ?)", store_name, store_muscle, store_equip)

        return render_template("home.html")

    return render_template("add.html")

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
        return render_template("home.html")
    else:
        return render_template("register.html")

@app.route("/logout")
def logout():
    
    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return render_template("home.html")