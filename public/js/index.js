/*eslint-disable */

import "@babel/polyfill";
import { displayMap } from "./mapbox.js";
import { login, logout } from "./login.js";
import { updateSettings } from "./updateSettings.js";
import { bookTour } from "./stripe.js";
import { signup } from "./signup.js";

// dom elements
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--signup");
const logoutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-password");
const bookBtn = document.getElementById("book-tour");

// delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
loginForm.addEventListener("submit", (event) => {
  const email = document.querySelector("#email").value;
  const password = document.querySelector("#password").value;
  event.preventDefault();
  login(email, password);
});

if (signupForm)
signupForm.addEventListener("submit", (event) => {
  const name = document.querySelector("#name-signup").value;
  const email = document.querySelector("#email-signup").value;
  const password = document.querySelector("#password-signup").value;
  const passwordConfirm = document.querySelector("#confirm-password-signup").value;
  event.preventDefault();
  console.log("💵💵💵💵💵💵💵", name, email, password, passwordConfirm);
  signup(name, email, password, passwordConfirm);
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", logout);
}

if (userDataForm)
  userDataForm.addEventListener("submit", (event) => {
    event.preventDefault();
    // this section is to do it in a new way
    const form = new FormData();
    form.append("name", document.querySelector("#name").value);
    form.append("email", document.querySelector("#email").value);
    form.append("photo", document.querySelector("#photo").files[0]);
    // console.log(form);
    // console.log(document.querySelector("#photo").files);
    updateSettings(form, "data");
    // const name = document.querySelector("#name").value;
    // const email = document.querySelector("#email").value;
    // updateSettings({ name, email }, "data");
  });

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    document.querySelector(".btn--save-password").textContent = "Updating...";

    const passwordCurrent = document.querySelector("#password-current").value;
    const password = document.querySelector("#password").value;
    const passwordConfirm = document.querySelector("#password-confirm").value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password",
    );

    document.querySelector(".btn--save-password").textContent = "Save password";

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });

if (bookBtn) {
  bookBtn.addEventListener("click", (event) => {
    event.target.textContent = "Processing...";
    // const tourId = event.target.dataset.tourId
    const { tourId } = event.target.dataset;
    console.log("💵💵💵💵 - tour ID : "+tourId);
    bookTour(tourId)
  });
}
