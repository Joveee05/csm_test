import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (fullName, email, password, confirmPassword) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/users/sign_up',
      data: {
        fullName,
        email,
        password,
        confirmPassword,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account created successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
