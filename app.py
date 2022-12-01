from cs50 import SQL
from flask import Flask, render_template, request

# configure application
app = Flask(__name__)

# connect to database
db = SQL("sqlite:///liftit.db")

# homepage and testing out database

@app.route("/")
def home():
    test = db_test.execute("SELECT * FROM Track")
    loop_by = len(test)
    return render_template("home.html", test=test, loop_by=loop_by)

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