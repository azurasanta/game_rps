import {
  SET_SOCKET,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  MSG_ERROR,
  MSG_INFO,
  MSG_SUCCESS,
  MSG_WARNING,
  SET_UNREAD_MESSAGE_COUNT,
  SET_BALANCE,
  SET_URL,
  TRANSACTION_LOADED,
  VERIFICATION_SUCCESS,
  SET_USERNAME_PASSWORD,
  SET_DARK_MODE,
  TOGGLE_MUTE,
  TOGGLE_DRAWER,
  START_LOADING,
  END_LOADING,
  SET_REFERRAL_CODE

} from '../types';
import axios from '../../util/Api';
import setAuthToken from '../../util/setAuthToken';
import history from '../history';

// Load User
export const getUser = (is_reload) => async dispatch => {
  if (localStorage.token) {
    localStorage.removeItem('isAdminAuthenticated');
    setAuthToken(localStorage.token);
  }
  try {
    const res = await axios.get('/auth/user');
    if (res.data.success) {
      dispatch({ type: USER_LOADED, payload: res.data.user });
      dispatch({ type: SET_UNREAD_MESSAGE_COUNT, payload: res.data.unread_message_count });
      dispatch({ type: TRANSACTION_LOADED, payload: res.data.transactions });
      
      if (!is_reload) {
        dispatch({ type: MSG_INFO, payload: res.data.message });
      }
      return {
        status: 'success',
        user: res.data.user
      }
    } else {
      dispatch({ type: AUTH_ERROR });
    }
  } catch (err) {
    console.log(err);
    dispatch({ type: MSG_WARNING, payload: err });
  }
  return {
    status: 'failed'
  }
};

// Register User
export const userSignUp = ({
  userName,
  email,
  password,
  bio,
  avatar,
  referralCode
}) => async dispatch => {
  const body = JSON.stringify({ username: userName, email, password, bio, avatar, referralCode }); // <- add referralCode to the request body
  try {
    dispatch({ type: START_LOADING });
    const res = await axios.post('/user', body);
    dispatch({ type: END_LOADING });

    if (res.data.success) {
      dispatch({ type: SET_USERNAME_PASSWORD, payload: {email, password} });
      dispatch(setReferralCode(referralCode)); // <- dispatch setReferralCode with the referralCode value
      return { status: 'success' };
    } else {
      dispatch({ type: REGISTER_FAIL });
      dispatch({ type: MSG_ERROR, payload: res.data.error });
      return { status: 'failed', error: res.data.error};
    }
  } catch (err) {
    console.log('err***', err);
    dispatch({ type: MSG_WARNING, payload: err });
    return { status: 'failed', error: err };
  }
};

//referral
export const setReferralCode = (referralCode) => {
  return {
    type: SET_REFERRAL_CODE,
    payload: referralCode
  }
}


// Login User
export const userSignIn = body => async dispatch => {
  try {
    dispatch({ type: START_LOADING });
    const res = await axios.post('/auth', body);
    dispatch({ type: END_LOADING });

    if (res.data.success) {
      setAuthToken(res.data.token);
      dispatch({ type: LOGIN_SUCCESS, payload: res.data });
      dispatch({ type: MSG_SUCCESS, payload: res.data.message });
      return { status: 'success', user: res.data.user };
    } else {
      dispatch({ type: LOGIN_FAIL });
      dispatch({ type: MSG_ERROR, payload: res.data.error });
    }
  } catch (err) {
    console.log('err', err);
    dispatch({ type: MSG_WARNING, payload: err });
  }
  return { status: 'failed' };
};

// Edit Profile
export const changePasswordAndAvatar = (new_password, new_avatar)  => async dispatch => {
  try {
    const { data } = await axios.post('/auth/changePasswordAndAvatar', {new_password, new_avatar});
    if (data.success) {
      dispatch({ type: MSG_SUCCESS, payload: 'User infomation has been saved.' });
      return true;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
  return false;
};

// Delete Account
export const deleteAccount = () => async dispatch => {
  try {
    const { data } = await axios.post('/auth/deleteAccount');
    if (data.success) {
      // dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'warning', title: 'RPS Bet', message: 'Your account has been deleted.'} });
      dispatch({ type: LOGOUT });
    } else {
      // dispatch({ type: OPEN_ALERT_MODAL, payload: {alert_type: 'warning', title: 'Warning!', message: data.error} });
      // dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

// Logout / Clear Profile
export const userSignOut = clear_token => async dispatch => {
  dispatch({ type: LOGOUT });
  try {
    const { data } = await axios.post('/auth/logout');
    if (data.success) {
      if (clear_token) setAuthToken();
      history.push('/');
      dispatch({ type: MSG_INFO, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const verifyEmail = verification_code => async dispatch => {
  try {
    const { data } = await axios.post('/auth/verify_email', {verification_code});
    if (data.success) {
      dispatch({ type: VERIFICATION_SUCCESS, payload: true });
      dispatch({ type: MSG_INFO, payload: 'Your account has been successfully verified.' });
      return true;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
  return false;
};

export const resendVerificationEmail = () => async dispatch => {
  try {
    const { data } = await axios.post('/auth/resend_verification_email');
    if (data.success) {
      dispatch({ type: MSG_INFO, payload: data.message });
      return true;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
  return false;
};

export const sendResetPasswordEmail = (email) => async dispatch => {
  try {
    const { data } = await axios.post('/auth/sendResetPasswordEmail', { email });
    if (data.success) {
      dispatch({ type: MSG_INFO, payload: 'Recover Password Email has been sent. Please check your mail box (including spam).'})
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error })
    }
  } catch (e) {
    console.log('error', e)
  }
}

export const resetPassword = (params) => async dispatch => {
  try {
    const { data } = await axios.post('/auth/resetPassword', params);
    if (data.success) {
      dispatch({ type: MSG_INFO, payload: 'Password has been changed.'})
      return true;
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error })
    }
  } catch (e) {
    console.log('error', e)
  }
  return false;
}

export const setSocket = socket => dispatch => {
  dispatch({ type: SET_SOCKET, payload: socket });
}

export const setUnreadMessageCount = messageCount => dispatch => {
  dispatch({ type: SET_UNREAD_MESSAGE_COUNT, payload: messageCount });
}

export const setUrl = url => dispatch => {
  dispatch({ type: SET_URL, payload: url });
};

export const setBalance = balance => dispatch => {
  dispatch({ type: SET_BALANCE, payload: balance });
}

export const toggleMute = isMuted => dispatch => {
  dispatch({ type: TOGGLE_MUTE, payload: isMuted });
}

export const toggleDrawer = isDrawerOpen => dispatch => {
  dispatch({ type: TOGGLE_DRAWER, payload: isDrawerOpen });
}

export const setDarkMode = isDarkMode => dispatch => {
  dispatch({ type: SET_DARK_MODE, payload: isDarkMode });
}

// Change User Name
export const changeUserName = (newUserName) => async (dispatch) => {
  try {
    const { data } = await axios.put('/user/username', { newUserName });
    if (data.success) {
      dispatch({ type: USER_LOADED, payload: data.user });
      dispatch({ type: MSG_SUCCESS, payload: 'Your username has been updated successfully' });
      return { status: 'success', user: data.user };
    } else {
      dispatch({ type: MSG_ERROR, payload: data.error });
    }
  } catch (error) {
    console.log('error', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
  return { status: 'failed' };
};



export const setUserInfo = userInfo => dispatch => {
  dispatch({ type: USER_LOADED, payload: userInfo });
}