// remove hidden tag

function showField() {
    document.getElementById('hiddenField').hidden = false;
  }

// change content in header

function changeHeader(h_tag, order, change) {
  // reference the header element
  let header = document.getElementsByTagName(h_tag)[order];
  // change its content
  header.innerHTML = change;
}

// change select option tag value

function changeOption(id, change) {
  document.getElementById(id).value = change;
}

// submit form

function submitForm(id) {
  document.getElementById(id).submit();
}

// confirm delete

function conDelete() {
  return confirm("Confirm removal")
}



// Order table ascending or descending order by col_num
function orderTable(col_num) {
    // obtain reference to button
    alphabetize = document.querySelector('#order')

    // event listener for button
    alphabetize.addEventListener('click', () => {

    let tbody, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;

    tbody = document.querySelector('#order_rows')
    switching = true;

    // set sorting direction ascending
    dir = "asc"

    // loop until no switching has been done
    while (switching) {
        // no switching done by default
        switching = false;
        rows = tbody.rows;
        // loop through tbody rows
        for (i = 0; i < rows.length - 1; i += 1) {
            // by default no switch should occur
            shouldSwitch = false
            // compare element from current row and one from next
            x = rows[i].querySelectorAll("TD")[col_num];
            y = rows[i + 1].querySelectorAll("TD")[col_num];
            // check if two rows should switch place, direct is determined
            // by whether dir = asc or desc
            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                  //mark switch and break loop:
                  shouldSwitch= true;
                  break;
                }
              } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                  //mark switch and break loop:
                  shouldSwitch = true;
                  break;
            }
          }
        }
        if (shouldSwitch) {
            //if switch marked, make switch, and record a switch being done
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            // increase switchcount by 1 each time a switch is done
            switchcount += 1;
        } else {
            // reverse dir value if no switching has done (indicates table has already been sorted the opposing direction)
            if (switchcount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
})
} 

// delete row from table
function deleteRowFromTable(buttonClass, endpoint) {

    // obtain array of references to delete buttons 
    deleteButtons = document.querySelectorAll(buttonClass)

    // add event listener to each button
    deleteButtons.forEach(item => {
        item.addEventListener('click', (event) => {
            // prevent default form submission
            event.preventDefault();
            // confirm deletion 
            if(!confirm("Confirm removal")){
                return;
            };
            // obtain parent form element for button
            form = event.target.parentElement;
            // use fetch to submit form data asynchronously
            const formData = new FormData(form);
            fetch(endpoint, {
                'method': 'POST',
                'body': formData
            })
            // remove row from user's view once deleted from database
            .then(() => {
                // obtain row element
                rowDelete = event.target.closest('tr');
                // remove row element
                rowDelete.remove()});
            })
    })
}

// To identify whether cells have event listener or not
let cellsWithEventListeners = [];
// reveal hidden form and submit form to alter cell value
function alterTableRowCell(buttonClass, endpoint, cellValueName) {

    // obtain array of references to buttons that reveal a hidden form once clicked
    selectedButtons = document.querySelectorAll(buttonClass);

    // add event listener to each button if it has not already got an event listener
    selectedButtons.forEach(item => {
        // check if current item is in cellsWithEventListeners
        if(!cellsWithEventListeners.includes(item)){
            // add event listener
            item.addEventListener('click', handleForm);
            // add to array
            cellsWithEventListeners.push(item);
        }
    })

    function handleForm(event) {

        // obtain reference to hidden form by: referencing button's parent node and referencing form through the parent node
        const btn = event.target;
        const btnParent = btn.parentNode;
        const form = btnParent.querySelector('form');

        // function expresssion for revealing form
        let formListener = (event) => {
            // prevent default action
            event.preventDefault();
            // use fetch to submit data asynchronously
            const formData = new FormData(form);
            fetch(endpoint, {
                'method': 'POST',
                'body': formData
            })
            .then(() => {
                // update table get value that user submitted to update frontend table for user
                btn.innerHTML = formData.get(cellValueName);
            })  // hide and reset form
            .then(() => {
                // hide form
                form.style.display = "none";
            })
        }

        // reveal form if hidden, hide if revealed
        if (form.style.display === "none") {
            form.style.display = "inline";
            // add event listener to form, third argument ensures multiple listener events can't be triggered
            form.addEventListener('submit', formListener, { once: true });
        } else {
            form.style.display = "none";
    }
}   
}


// add row to table from form submit
function addRow(formClass, endpoint, tbodyElementIdentifier) {

    form = document.querySelector(formClass)

    // add event listener for form submit
    form.addEventListener('submit', (event) => {

        // prevent default form submission
        event.preventDefault();

        // use fetch to submit data asynchronously
        const formData = new FormData(form);
        fetch(endpoint, {
            'method': 'POST',
            'body': formData
        })
        // check response is ok, if so, then retrieve information on the user's last exercise added to workout
        .then(response => {
            if (response.ok) {
                // fetch data for new row
                return fetch('/get_last_user_created_row', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        })
        // obtain data
        .then(response => response.json())
        .then(data => {
            // update table using the data
            // obtain reference to table 
            table = document.querySelector(tbodyElementIdentifier);

            // insert empty row at start of table
            const row = table.insertRow(0);

            // attach workout plan information to relevant rows
            // todo: make equipment, reps, and weight and delete buttons interactive
            const cellExercise = row.insertCell(0);
            cellExercise.innerHTML = data[0]["exercise"];

            const cellMuscle = row.insertCell(1);
            cellMuscle.innerHTML = data[0]["muscle"];

            const cellEquipment = row.insertCell(2);
            cellEquipment.innerHTML = data[0]["equipment"];

            // information needed for synchronising the backend and frontend from user altering reps, weight and measurement
            trackRow = data[0]["track_row"];
            wkName = data[0]["wk_name"];

            const cellReps = row.insertCell(3);
            // create and append html td elements children
            alterReps(cellReps, trackRow, wkName, data[0]["reps"]);
            // implement functionality for rep button
            alterTableRowCell(".access_reps", "/view_plan", "rep_number");

            const cellWeightMeasuremet = row.insertCell(4);
            // create and append html weight td elements children
            alterWeight(cellWeightMeasuremet, trackRow, wkName, data[0]["weight"]);
            // implement functionality for weight button
            alterTableRowCell('.access_weight', '/view_plan', "weight_number");
            // need to incorporate cellMeasurement
            //cellWeight.innerHTML = data[0]["weight"] + ' ' + data[0]["measurement"];
            // create and append html measurement td elements children
            alterMeasurement(cellWeightMeasuremet, trackRow, wkName, data[0]["measurement"])
            // implement functionality for measurement button
            alterTableRowCell('.access_measurement', '/view_plan', "measurement_update");

            const cellDelete = row.insertCell(5);
            cellDelete.innerHTML = "Delete";

        });
    });
}

// create interactive <td> element that alters (repetition number in view_plan.html)

function alterReps(cell, rowIdentifier, wkName, reps) {
    // Recreate rep button
    // create button
    const btnChangeReps = document.createElement("button");
    btnChangeReps.setAttribute("type", "submit");
    btnChangeReps.setAttribute("class", "access_reps");
    btnChangeReps.setAttribute("data-toggle", "tooltip");
    btnChangeReps.setAttribute("title", "Click to change");
    btnChangeReps.textContent = reps;

    // create form
    const formChangeReps = document.createElement("form");
    formChangeReps.setAttribute("action", "/view_plan");
    formChangeReps.setAttribute("method", "post");
    formChangeReps.setAttribute("style", "display: none;");

    // input elements for form
    const repNumber = document.createElement("input");
    repNumber.setAttribute("type", "number");
    repNumber.setAttribute("name", "rep_number");

    const repRow = document.createElement("input");
    repRow.setAttribute("type", "hidden");
    repRow.setAttribute("name", "rep_row");
    repRow.setAttribute("value", rowIdentifier);

    const getWkName = document.createElement("input");
    getWkName.setAttribute("type", "hidden");
    getWkName.setAttribute("name", "get_wk_name");
    getWkName.setAttribute("value", wkName);

    const subBtn = document.createElement("input");
    subBtn.setAttribute("type", "submit");
    subBtn.setAttribute("value", "ok");

    // attach input elements to form 
    formChangeReps.append(repNumber, repRow, getWkName, subBtn);

    // attach button and form to cell
    cell.append(btnChangeReps, formChangeReps);
}

function alterWeight(cell, rowIdentifier, wkName, weight) {
    // recreate weight button
    const btnChangeWeight = document.createElement("button");
    btnChangeWeight.setAttribute("type", "submit");
    btnChangeWeight.setAttribute("class", "access_weight");
    btnChangeWeight.setAttribute("data-toggle", "tooltip");
    btnChangeWeight.setAttribute("title", "Click to change");
    btnChangeWeight.textContent = weight;

    // create form
    const formChangeWeight = document.createElement("form");
    formChangeWeight.setAttribute("action", "/view_plan");
    formChangeWeight.setAttribute("method", "post");
    formChangeWeight.setAttribute("style", "display: none;");

    // input elements for form

    const weightNumber = document.createElement("input");
    weightNumber.setAttribute("type", "number");
    weightNumber.setAttribute("name", "weight_number");

    const weightRow = document.createElement("input");
    weightRow.setAttribute("type", "hidden");
    weightRow.setAttribute("name", "weight_row");
    weightRow.setAttribute("value", rowIdentifier);

    const getWkNameWeight = document.createElement("input");
    getWkNameWeight.setAttribute("type", "hidden");
    getWkNameWeight.setAttribute("name", "get_wk_name");
    getWkNameWeight.setAttribute("value", wkName);

    const weightBtn = document.createElement("input");
    weightBtn.setAttribute("type", "submit");
    weightBtn.setAttribute("value", "ok");

    // attach input elements to form 
    formChangeWeight.append(weightNumber, weightRow, getWkNameWeight, weightBtn)

    // create span element to place measurement in
    spanWeight = document.createElement("span");
    spanWeight.append(btnChangeWeight, formChangeWeight);

    // attach button and form to cell5
    cell.append(spanWeight);
}

function alterMeasurement(cell, rowIdentifier, wkName, measurement) {

    // weight measurement
    // create button
    const btnChangeMeasurement = document.createElement("button");
    btnChangeMeasurement.setAttribute("type", "submit");
    btnChangeMeasurement.setAttribute("class", "access_measurement");
    btnChangeMeasurement.setAttribute("data-toggle", "tooltip");
    btnChangeMeasurement.setAttribute("title", "Click to change");
    btnChangeMeasurement.textContent = measurement;

    // create form
    const formChangeMeasurement = document.createElement("form");
    formChangeMeasurement.setAttribute("action", "/view_plan");
    formChangeMeasurement.setAttribute("method", "post");
    formChangeMeasurement.setAttribute("style", "display: none;");

    // input elements for form

    const measurementType = document.createElement("input");
    measurementType.setAttribute("type", "text");
    measurementType.setAttribute("name", "measurement_update");

    const measurementRow = document.createElement("input");
    measurementRow.setAttribute("type", "hidden");
    measurementRow.setAttribute("name", "measurement_row");
    measurementRow.setAttribute("value", rowIdentifier);

    const getWkNameMeasurement = document.createElement("input");
    getWkNameMeasurement.setAttribute("type", "hidden");
    getWkNameMeasurement.setAttribute("name", "get_wk_name");
    getWkNameMeasurement.setAttribute("value", wkName);

    const measurementBtn = document.createElement("input");
    measurementBtn.setAttribute("type", "submit");
    measurementBtn.setAttribute("value", "ok");

    // attach input elements to form 
    formChangeMeasurement.append(measurementType, measurementRow, getWkNameMeasurement, measurementBtn);

    // create span element to place measurement in
    spanMeasure = document.createElement("span");
    spanMeasure = document.createElement("span");
    spanMeasure.append(btnChangeMeasurement, formChangeMeasurement);

    // attach button and form to cell5
    cell.append(spanMeasure);
}