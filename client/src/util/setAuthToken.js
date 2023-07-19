import axios from './Api';

const setAuthToken = token => {
  delete axios.defaults.headers.common['x-auth-token'];

  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  }
};

export default setAuthToken;
