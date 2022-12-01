from cs50 import SQL
from flask import Flask, render_template, request

# configure application
app = Flask(__name__)

# connect to database
db = SQL("sqlite:///liftit.db")

# homepage and testing out database

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/browse")
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

@app.route("/add", methods=["GET","POST"])
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

    