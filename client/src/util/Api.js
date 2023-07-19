import axios from 'axios';

export default axios.create({
  // baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://127.0.0.1:5001/api', //YOUR_API_URL HERE
  baseURL:
    process.env.NODE_ENV === 'production'
      ? '/api'
      : `http://${window.location.hostname}:5001/api`, //YOUR_API_URL HERE
  headers: {
    'Content-Type': 'application/json'
  }
  // withCredentials: true
});
