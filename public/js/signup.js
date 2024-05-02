/*eslint-disable */

// const axios = require("axios");

import axios from "axios";
import { showAlert } from "./alerts";

export const signup = async (name, email, password, confirmPassword) => {
  try {
    // console.log(email, password);
    // const res = await axios.post("/api/v1/users/login", { email, password });
    // console.log("💵💵💵" + res.data);
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name,
        email,
        password,
        confirmPassword,
      },
    });
    console.log("💵💵💵" + res.data);

    if (res.data.status === "success") {
      showAlert("success", "Signed up successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};