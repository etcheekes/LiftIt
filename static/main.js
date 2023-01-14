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


// order table by exercise name alphabetically

function orderTable(data, property, parentElement) {

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
            cell4.textContent = "Delete";

            // append cells to row
            newRow.appendChild(cell1);
            newRow.appendChild(cell2);
            newRow.appendChild(cell3);
            newRow.appendChild(cell4);

            // append row to tbody
            tableBody.appendChild(newRow);
        }
    })
    
}

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

// populate table in browse.html
function populateBrowseTable() {

    // reference needed elements
    browseResults = document.querySelector('.search');
    nameForm = document.querySelector('#name_form');
    muscleForm = document.querySelector('#muscle_form');
    equipmentForm = document.querySelector('#equipment_form');
    alphabetize = document.querySelector('#alphabetize');

    // event listener for forms
    const formArray = [nameForm, muscleForm, equipmentForm, alphabetize];
    formArray.forEach(function (elem) {
        elem.addEventListener('submit', (event) => {
            //event.preventDefault();
            console.log("hello")
            // stop normal form action from occurring
            // create table row and cells
            //const newRow = document.createElement("tr");
            //const cell1 = document.createElement("td");
            //const cell2 = document.createElement("td");
            //const cell3 = document.createElement("td");
        })
    })
}
