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