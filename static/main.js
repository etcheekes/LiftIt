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

// reveal hidden form and submit form to alter cell value
function alterTableRowCell(buttonClass, endpoint, cellValueName) {

    // obtain array of references to buttons that reveal a hidden form once clicked
    selectedButtons = document.querySelectorAll(buttonClass)

    // add event listener to each button
    selectedButtons.forEach(item => {
        item.addEventListener('click', handleForm)
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
            const cellExercise = row.insertCell(0);
            cellExercise.innerHTML = data[0]["exercise"];
            const cellMuscle = row.insertCell(1);
            cellMuscle.innerHTML = data[0]["muscle"];
            const cellEquipment = row.insertCell(2);
            cellEquipment = data[0]["equipment"]
            const cellRepetitions = row.insertCell(3);
            cellRepetitions = data[0]["repetitions"];
            const cellWeight = data[0]["weight"] + ' ' + data[0]["measurement"];
            cellWeight = data[0]["weight"];
            const cellDelete = row.insertCell(5);
            cellDelete = "Delete";

            // reset form
            


        });
    });
}