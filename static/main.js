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