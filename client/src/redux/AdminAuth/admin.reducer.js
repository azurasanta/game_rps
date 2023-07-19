import {
  ADMIN_REGISTER_FAIL,
  ADMIN_LOADED,
  ADMIN_AUTH_ERROR,
  ADMIN_LOGIN_SUCCESS,
  ADMIN_LOGIN_FAIL,
  ADMIN_LOGOUT,
  SET_URL
} from '../types';

const initialState = {
  token: localStorage.getItem('token'),
  isAdminAuthenticated: localStorage.getItem('isAdminAuthenticated'),
  isAdmin: false,
  loading: true,
  admin: null,
  adminName: '',
  liveUrl: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case ADMIN_LOADED:
      return {
        ...state,
        isAdmin: 1,
        adminName: payload.first_name + ' ' + payload.last_name,
        isAdminAuthenticated: true,
        loading: false,
        admin: payload
      };
    case ADMIN_LOGIN_SUCCESS:
      localStorage.setItem('admin_token', payload.token);
      localStorage.setItem('isAdminAuthenticated', 1);
      console.log('admin_login_success');
      return {
        ...state,
        ...payload,
        adminName: payload.admin.first_name + ' ' + payload.admin.last_name,
        isAdminAuthenticated: true,
        loading: false
      };
    case ADMIN_REGISTER_FAIL:
    case ADMIN_AUTH_ERROR:
    case ADMIN_LOGIN_FAIL:
    case ADMIN_LOGOUT:
      localStorage.removeItem('admin_token');
      localStorage.removeItem('isAdminAuthenticated');
      return {
        ...state,
        token: null,
        isAdmin: false,
        adminName: '',
        isAdminAuthenticated: false,
        loading: false
      };
    case SET_URL:
      return {
        ...state, liveUrl: payload
      }
    default:
      return state;
  }
}
