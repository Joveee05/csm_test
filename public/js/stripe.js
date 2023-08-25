import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51Lq1phF6oLHorAFl8iLcgvTuj0z29nU6NBNvR0dUfaCIoB1zmZWCa31sVX89Q8tkuW0ZdYAvBEb8VifWWqnXHdBZ00BKQIwVVj'
);

export const subscribe = async (userId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/users/checkout-session/${userId}`);
    // console.log(session);

    // 2) Create checkout form + chanre credit card
    await stripe.redirectToCheckout({
      sessionId: session.data,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
