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

// reveal form by class

function revealClassForm(className) {
  // obtain all elements with the class access_reps
  getElements = document.getElementsByClassName(className);
          
  // add event listener to each element with this class and reveal form tag upon clicking
  for (let i = 0; i < getElements.length; i++) {
      getElements[i].addEventListener("click", function() {
          const td = this.parentNode; // Get the parent <td> element of the button
          const forms = td.getElementsByTagName("form"); // Get the <form> elements in the <td> element
          if (forms.length > 0) {  // Make sure there is at least one form element
              forms[0].style.display = "block";  // Set the display property of the first form element to "block"
          } 
      });
      }
  }

