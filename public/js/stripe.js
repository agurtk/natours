/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
import { loadStripe } from "@stripe/stripe-js";
// import Stripe from "stripe";

export const bookTour = async (tourId) => {
  const stripe = await loadStripe(
    "pk_test_51P6tpQCYFQRE4Rg5qFwyRnJpke31sd45VogMBNSOWa7cXyplWVWyRa60tbjdLuwSg5XGTbQtSe80BsqtBnw3gb9E00lIVEuc2E",
  );
  // 1) Get checkout session from API

  try {
    // const session = await axios(
    //   `localhost:3001/api/v1/bookings/checkout-session/${tourId}`,
    //   // method: "GET",
    //   // url: `localhost:3001/api/v1/bookings/checkout-session/${tourId}`,
    // );
    const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    const session = response.data.session;
    console.log(session);

    // 2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.id
    });
  } catch (error) {
    console.log(error);
    showAlert("error", error);
  }
};
