/*eslint-disable */

import axios from "axios";
import { showAlert } from "./alerts";

// type is 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const updatePasswordUrl =
      "http://127.0.0.1:3001/api/v1/users/updateMyPassword";
    const updateMeUrl = "http://127.0.0.1:3001/api/v1/users/updateMe";

    const url = type === "password" ? updatePasswordUrl : updateMeUrl;
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });
    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} Updated successfully`);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
