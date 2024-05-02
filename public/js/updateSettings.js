/*eslint-disable */

import axios from "axios";
import { showAlert } from "./alerts";

// type is 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const baseUrl = "/api/v1/users";

    const url =
      type === "password"
        ? `${baseUrl}/updateMyPassword`
        : `${baseUrl}/updateMe`;
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
