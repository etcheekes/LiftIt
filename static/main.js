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
  /*getElements = document.getElementsByClassName(className);
          
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
        }
    });
  }
  */
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

    selectedButtons.forEach(item => {
        item.addEventListener('click', handleForm)
    })

    function handleForm(event) {

        // obtain reference to hidden form by: referencing button's parent node and referencing form through the parent node
        const btn = event.target;
        const btnParent = btn.parentNode;
        const form = btnParent.querySelector('form');
        // reveal form if hidden, hide if revealed
        if (form.style.display === "none") {
            form.style.display = "inline";
                // event listener for form submit 
                form.addEventListener('submit', (event) => {
                    // prevent default action
                    event.preventDefault();
                    // use fetch to submit data asynchronously
                    const formData = new FormData(form);
                    fetch(endpoint, {
                        'method': 'POST',
                        'body': formData
                    })
                    .then(() => {
                        // get value that user submitted to update frontend table for user
                        btn.innerHTML = formData.get(cellValueName);
                    })  // hide form once user submits
                    .then(() => form.style.display = "none")
                })
    
            // update table
            /* update rep number
            .then(() => { 
                btnChangeWeight.textContent = formData.get('weight_number');
            })
            // hide formChangeReps element
            .then(() => formChangeWeight.style.display = "none");*/

        // hide form if hidden
          } else {

            form.style.display = "none";
          }
    }
}