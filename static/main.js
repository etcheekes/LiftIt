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

// when button is clicked reveal/hide the form with className

function revealClassForm(className) {
  // obtain all elements with a specific class name
  getElements = document.getElementsByClassName(className);
          
  // add event listener to each element with this class and reveal form tag upon clicking
  for (let i = 0; i < getElements.length; i++) {
    getElements[i].addEventListener("click", function() {
      // Get the parent <td> element of the button
      const pa = this.parentNode;
      // Get the <form> in the <td> element
      const forms = pa.getElementsByTagName("form");
        // toggle form display
        if (forms[0].style.display === "none") {
          forms[0].style.display = "inline";
        }
        else {
          forms[0].style.display = "none";
          //undo_buttons[1].style.display = "none"
        }
    });
  }
}


// order table by exercise name alphabetically in browse.html

function orderTableBrowse(data, property, parentElement) {

    // obtain reference to button
    alphabetize = document.querySelector('#alphabetize');

    alphabetize.addEventListener('click', () => {
        // if list is unordered set to ascending order
        if (alphabetize.getAttribute("value") === "unordered"){
            ordered = ascendingOrder(data, property);
            alphabetize.setAttribute("value", "ascending");
        }
        // if list is ascending order set to descending order
        else if (alphabetize.getAttribute("value") === "ascending"){
            ordered =  descendingOrder(data, property);
            alphabetize.setAttribute("value", "descending");
        }
        // if list is descending set to ascending order
        else {
            ordered = ascendingOrder(data, property);
            alphabetize.setAttribute("value", "ascending");
        }
        
        // obtain reference to table body
        const tableBody = document.querySelector(parentElement);

        // clear table
        removeChildNodes(tableBody);

        // create, fill, and place rows in table
        for (let row = 0; row < ordered.length; row += 1){
            // create new row
            const newRow = document.createElement("tr");

            // create and fill cells to populate row (to improve, could programmatically create the amount of cells I need)
            const cell1 = document.createElement("td");
            cell1.textContent = ordered[row].exercise;
            const cell2 = document.createElement("td");
            cell2.textContent = ordered[row].muscle;
            const cell3 = document.createElement("td");
            cell3.textContent = ordered[row].equipment;
            const cell4 = document.createElement("td");

            // create delete form
            const form = document.createElement("form");
            form.setAttribute("action", "/dynamic_delete_exercise_from_database");
            form.setAttribute("method", "post");
            form.setAttribute("onsubmit", "return conDelete()");
            // create input elements for delete form
            const delInput = document.createElement("input");
            delInput.setAttribute("type", "hidden");
            delInput.setAttribute("name", "delete");
            // obtain id number for the row, this is used to identify the row to delete from the server
            const exerciseId = ordered[row].id;
            delInput.setAttribute("value", exerciseId);
            // create button
            const delButton = document.createElement("button");
            delButton.setAttribute("type", "submit");
            delButton.textContent = "Delete";
            // append inputs to form
            form.appendChild(delInput);
            form.appendChild(delButton);
            
            // append delete form to cell 4
            cell4.appendChild(form);

            // append cells to row
            newRow.append(cell1, cell2, cell3, cell4);

            // append row to tbody
            tableBody.appendChild(newRow);

            // add event listener that uses fetch to remove exercise from database without having to reload page
            form.addEventListener("submit", (event) => {
                // prevent form submitting normally
                event.preventDefault();
                // use fetch to submit form data asynchronously
                const formData = new FormData(event.target);
                fetch("/delete_exercise_from_database", {
                    'method': 'POST',
                    'body': formData
                })
                // remove row from user's view once deleted from database
                .then(() => newRow.remove());
            });
        }
    })
    
}

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

function deleteRowFromTable(buttonClass) {

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
            fetch("/view_plan", {
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

// order table by exercise name alphabetically in view_plan.html

/*function orderTablePlan(data, property, parentElement) {

    // Obtain reference to button
    alphabetize = document.querySelector('#alphabetize');

    alphabetize.addEventListener('click', () => {
        // if list is unordered set to ascending order
        if (alphabetize.getAttribute("value") === "unordered"){
            ordered = ascendingOrder(data, property);
            alphabetize.setAttribute("value", "ascending");
        }
        // if list is ascending order set to descending order
        else if (alphabetize.getAttribute("value") === "ascending"){
            ordered =  descendingOrder(data, property);
            alphabetize.setAttribute("value", "descending");
        }
        // if list is descending set to ascending order
        else {
            ordered = ascendingOrder(data, property);
            alphabetize.setAttribute("value", "ascending");
        }
        
        // obtain reference to table body
        const tableBody = document.querySelector(parentElement);

        // clear table
        removeChildNodes(tableBody);

        // create, fill, and place rows in table
        
        for (let row = 0; row < ordered.length; row += 1){
            // create new row
            const newRow = document.createElement("tr");

            // create and fill cells to populate row (to improve, could programmatically create the amount of cells I need)
            const cell1 = document.createElement("td");
            cell1.textContent = ordered[row].exercise;
            const cell2 = document.createElement("td");
            cell2.textContent = ordered[row].muscle;
            const cell3 = document.createElement("td");
            cell3.textContent = ordered[row].equipment;

            // HTML elements for changing repetition number within table
            const cell4 = document.createElement("td");
                // create button
                const btnChangeReps = document.createElement("button");
                btnChangeReps.setAttribute("type", "submit");
                btnChangeReps.setAttribute("class", "access_reps");
                btnChangeReps.setAttribute("data-toggle", "tooltip");
                btnChangeReps.setAttribute("title", "Click to change");
                btnChangeReps.textContent = ordered[row].reps;

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
                repRow.setAttribute("value", ordered[row].track_row);
                
                const getWkName = document.createElement("input");
                getWkName.setAttribute("type", "hidden");
                getWkName.setAttribute("name", "get_wk_name");
                getWkName.setAttribute("value", ordered[row].wk_name);
                
                const subBtn = document.createElement("input");
                subBtn.setAttribute("type", "submit");
                subBtn.setAttribute("value", "ok");

                // attach input elements to form 
                formChangeReps.append(repNumber, repRow, getWkName, subBtn);

                // reveal form when rep number is clicked
                btnChangeReps.addEventListener("click", () => {
                    if (formChangeReps.style.display === "none"){
                        formChangeReps.style.display = "inline";
                    }
                    else {
                        formChangeReps.style.display = "none";
                    }
                })

                // dynamically alter table (fetch request)
                formChangeReps.addEventListener("submit", (event) => {
                    // stop default form submission
                    event.preventDefault();
                    // use fetch to submit form data asynchronously
                    const formData = new FormData(event.target);
                    // use fetch to submit form data asynchronously
                    fetch("/view_plan", {
                        'method': 'POST',
                        'body': formData
                    })
                    // update rep number
                    .then(() => { 
                        btnChangeReps.textContent = formData.get('rep_number');
                    })
                    // hide formChangeReps element
                    .then(() => formChangeReps.style.display = "none");

                })

                // attach button and form to cell4
                cell4.append(btnChangeReps, formChangeReps);

            // functionality for changing weight number and measurement within table
            const cell5 = document.createElement("td");
                // weight number
                // create button
                const btnChangeWeight = document.createElement("button");
                btnChangeWeight.setAttribute("type", "submit");
                btnChangeWeight.setAttribute("class", "access_weight");
                btnChangeWeight.setAttribute("data-toggle", "tooltip");
                btnChangeWeight.setAttribute("title", "Click to change");
                btnChangeWeight.textContent = ordered[row].weight;

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
                weightRow.setAttribute("value", ordered[row].track_row);
                
                const getWkNameWeight = document.createElement("input");
                getWkNameWeight.setAttribute("type", "hidden");
                getWkNameWeight.setAttribute("name", "get_wk_name");
                getWkNameWeight.setAttribute("value", ordered[row].wk_name);
                
                const weightBtn = document.createElement("input");
                weightBtn.setAttribute("type", "submit");
                weightBtn.setAttribute("value", "ok");

                // attach input elements to form 
                formChangeWeight.append(weightNumber, weightRow, getWkNameWeight, weightBtn);

                // reveal form when weight number is clicked
                btnChangeWeight.addEventListener("click", () => {
                    if (formChangeWeight.style.display === "none"){
                        formChangeWeight.style.display = "inline";
                    }
                    else {
                        formChangeWeight.style.display = "none";
                    }
                })

                // dynamically alter table (fetch request)
                formChangeWeight.addEventListener("submit", (event) => {
                    // stop default form submission
                    event.preventDefault();
                    // use fetch to submit form data asynchronously
                    const formData = new FormData(event.target);
                    // use fetch to submit form data asynchronously
                    fetch("/view_plan", {
                        'method': 'POST',
                        'body': formData
                    })
                    // update rep number
                    .then(() => { 
                        btnChangeWeight.textContent = formData.get('weight_number');
                    })
                    // hide formChangeReps element
                    .then(() => formChangeWeight.style.display = "none");

                })
                // create span element to place measurement in
                spanWeight = document.createElement("span");
                spanWeight.append(btnChangeWeight, formChangeWeight);

                // attach button and form to cell5
                cell5.append(spanWeight);


                // weight measurement
                // create button
                const btnChangeMeasurement = document.createElement("button");
                btnChangeMeasurement.setAttribute("type", "submit");
                btnChangeMeasurement.setAttribute("class", "access_measurement");
                btnChangeMeasurement.setAttribute("data-toggle", "tooltip");
                btnChangeMeasurement.setAttribute("title", "Click to change");
                btnChangeMeasurement.textContent = ordered[row].measurement;

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
                measurementRow.setAttribute("value", ordered[row].track_row);
                
                const getWkNameMeasurement = document.createElement("input");
                getWkNameMeasurement.setAttribute("type", "hidden");
                getWkNameMeasurement.setAttribute("name", "get_wk_name");
                getWkNameMeasurement.setAttribute("value", ordered[row].wk_name);
                
                const measurementBtn = document.createElement("input");
                measurementBtn.setAttribute("type", "submit");
                measurementBtn.setAttribute("value", "ok");

                // attach input elements to form 
                formChangeMeasurement.append(measurementType, measurementRow, getWkNameMeasurement, measurementBtn);

                // reveal form when weight number is clicked
                btnChangeMeasurement.addEventListener("click", () => {
                    if (formChangeMeasurement.style.display === "none"){
                        formChangeMeasurement.style.display = "inline";
                    }
                    else {
                        formChangeMeasurement.style.display = "none";
                    }
                })

                // dynamically alter table (fetch request)
                formChangeMeasurement.addEventListener("submit", (event) => {
                    // stop default form submission
                    event.preventDefault();
                    // use fetch to submit form data asynchronously
                    const formData = new FormData(event.target);
                    // use fetch to submit form data asynchronously
                    fetch("/view_plan", {
                        'method': 'POST',
                        'body': formData
                    })
                    // update rep number
                    .then(() => { 
                        btnChangeMeasurement.textContent = formData.get('measurement_update');
                    })
                    // hide formChangeReps element
                    .then(() => formChangeMeasurement.style.display = "none");

                })
                // create span element to place measurement in
                spanMeasurement = document.createElement("span");
                spanMeasurement.append(btnChangeMeasurement, formChangeMeasurement);

                // attach button and form to cell5
                cell5.append(spanMeasurement);
            
            // delete button and functionality
            const cell6 = document.createElement("td");
                // create delete form
                const form = document.createElement("form");
                form.setAttribute("action", "/view_plan");
                form.setAttribute("method", "post");
                form.setAttribute("onsubmit", "return conDelete()");
                // create input elements for delete form
                const delInput = document.createElement("input");
                delInput.setAttribute("type", "hidden");
                delInput.setAttribute("name", "delete");
                // obtain id number for the row, this is used to identify the row in the wk_plan table to delete from the server
                const exerciseId = ordered[row].track_row;
                delInput.setAttribute("value", exerciseId);
                // create button
                const delButton = document.createElement("button");
                delButton.setAttribute("type", "submit");
                delButton.textContent = "Delete";
                // append inputs to form
                form.appendChild(delInput);
                form.appendChild(delButton);

                // add event listener that uses fetch to remove exercise from database without having to reload page
                form.addEventListener("submit", (event) => {
                    // prevent form submitting normally
                    event.preventDefault();
                    // use fetch to submit form data asynchronously
                    const formData = new FormData(event.target);
                    fetch("/view_plan", {
                        'method': 'POST',
                        'body': formData
                    })
                    // remove row from user's view once deleted from database
                    .then(() => {
                        newRow.remove()})
                    // remove element from ordered from the browser data, so if user orders again, the data is updated
                    .then(() => {
                    // Obtain unique track_row number
                    let identifier = parseInt(formData.get('delete'))
                    // remove array element whose object property for track_row matches the identifier
                    let i = 0;
                    while (i < ordered.length) {
                        if (ordered[i].track_row === identifier) {
                            ordered.splice(i, 1);
                        }
                        else {
                            i += 1;
                        }
                    }
                    })
                });
                
                // append delete form to cell 4
                cell6.appendChild(form);

            // append cells to row
            newRow.append(cell1, cell2, cell3, cell4, cell5, cell6);

            // append row to tbody
            tableBody.appendChild(newRow);

        }
    })
    
}*/

function ascendingOrder(data, property) {
    // parse to JSON
    let sortedData = JSON.parse(data)
    // sort algorithm, JSON data is sorted by the property parameter
    sortedData.sort((a, b) => {
        if (a[property] < b[property]) {
            return -1;
          }
          if (a[property] > b[property]) {
            return 1;
          }
          return 0;
        });
    return sortedData;
}

function descendingOrder(data, property) {
    // parse to JSON
    let sortedData = JSON.parse(data)
    // sort algorithm
    sortedData.sort((a, b) => {
        if (a[property] < b[property]) {
            return 1;
          }
          if (a[property] > b[property]) {
            return -1;
          }
          return 0;
        });
    return sortedData;
}

// remove childNodes
function removeChildNodes(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}