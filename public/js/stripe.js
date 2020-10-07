/* eslint-disable */
import axios from "axios";
import { showAlert } from "./alerts";
const stripe = Stripe(
  "pk_test_51HYxBPEQTS1Q7TheumeNkuZg1mDOHSLmUGQZ5mbNTmWcMfzd6ePb1cAvXdDYPDkzBPIEAWmhx2bZldVZbn80E4oC00PA9UzwtU"
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
