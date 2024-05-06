/*eslint-disable */

// const axios = require("axios");

import axios from "axios";
import { showAlert } from "./alerts";

export const login = async (email, password) => {
  try {
    // console.log(email, password);
    // const res = await axios.post("/api/v1/users/login", { email, password });
    const res = await axios({
      method: "POST",
      // url: "http://127.0.0.1:3001/api/v1/users/login",
      url: "/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};

// document.querySelector(".form").addEventListener("submit", (event) => {
//   event.preventDefault();
//   const email = document.querySelector("#email").value;
//   const password = document.querySelector("#password").value;
//   login(email, password);
// });

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/api/v1/users/logout",
    });
    if ((res.data.status = "success")) location.replace("/");
  } catch (error) {
    console.log(error.response);
    showAlert("error", "Error logging out, please try again");
  }
}