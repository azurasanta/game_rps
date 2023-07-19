import {
  ADMIN_REGISTER_FAIL,
  ADMIN_LOADED,
  ADMIN_AUTH_ERROR,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAIL,
  ADMIN_LOGOUT,
  MSG_ERROR,
  MSG_INFO,
  MSG_SUCCESS,
  MSG_WARNING,
  SET_URL
} from '../types';
import axios from '../../util/Api';
import setAuthToken from '../../util/setAuthToken';
import history from '../history';

// Load Admin
export const getAdmin = () => async dispatch => {
  if (localStorage.admin_token) {
    localStorage.removeItem('isAuthenticated');
    setAuthToken(localStorage.admin_token);
  }
  try {
    const res = await axios.get('/admin/auth/admin');
    if (res.data.success) {
      dispatch({ type: ADMIN_LOADED, payload: res.data.admin });
      dispatch({ type: MSG_INFO, payload: res.data.message });
    } else {
      dispatch({ type: ADMIN_AUTH_ERROR });
    }
  } catch (err) {
    console.log(err);
    dispatch({ type: MSG_WARNING, payload: err });
  }
};

// Register Admin
export const adminSignUp = ({
  firstName,
  lastName,
  email,
  password
}) => async dispatch => {
  const body = JSON.stringify({ first_name: firstName, last_name: lastName, email, password });
  try {
    const res = await axios.post('/admin/auth/signup', body);
    console.log(res);
    if (res.data.success) {
      history.push('/admin/signin');
      dispatch({ type: MSG_SUCCESS, payload: res.data.message });
    } else {
      dispatch({ type: ADMIN_REGISTER_FAIL });
      dispatch({ type: MSG_ERROR, payload: res.data.error });
    }
  } catch (err) {
    console.log('err***', err);
    dispatch({ type: MSG_WARNING, payload: err });
  }
};
// Login Admin
export const adminSignIn = body => async dispatch => {
  try {
    const res = await axios.post('/admin/auth', body);
    if (res.data.success) {
      setAuthToken(res.data.token);
      dispatch({ type: ADMIN_LOGIN_SUCCESS, payload: res.data });
      dispatch({ type: MSG_INFO, payload: res.data.message });
      dispatch(getAdmin());
    } else {
      console.log('error');
      dispatch({ type: ADMIN_LOGIN_FAIL });
      dispatch({ type: MSG_ERROR, payload: res.data.error });
    }
  } catch (err) {
    console.log('err', err);
    dispatch({ type: MSG_WARNING, payload: err });
  }
};

// Logout / Clear Profile
export const adminSignOut = body => async dispatch => {
  dispatch({ type: ADMIN_LOGOUT });
  try {
    const { data } = await axios.post('/auth/logout');
    if (data.success) {
      setAuthToken();
      dispatch({ type: MSG_INFO, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const setUrl = url => dispatch => {
  dispatch({ type: SET_URL, payload: url });
};

export const getStatisticsData = _id => async dispatch => {
  try {
    const { data } = await axios.get('statistics/get-total-statistics', {params: {}});
    if (data.success) {
      return data.statistics;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
}