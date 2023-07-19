import {
  SET_SOCKET,
  REGISTER_FAIL,
  USER_LOADED,
  SET_UNREAD_MESSAGE_COUNT,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  SET_URL,
  SET_BALANCE,
  SET_AVATAR,
  TRANSACTION_LOADED,
  NEW_TRANSACTION,
  VERIFICATION_SUCCESS,
  SET_USERNAME_PASSWORD,
  SET_DARK_MODE,
  SET_REFERRAL_CODE,
  TOGGLE_MUTE,
  TOGGLE_DRAWER
} from '../types';

const initialState = {
  socket: null,
  token: localStorage.getItem('token'),
  isAuthenticated: localStorage.getItem('isAuthenticated'),
  isDarkMode: localStorage.getItem('darkMode') === 'false' ? false : true,
  isAdmin: false,
  isMuted: localStorage.getItem('isMuted') === 'false' ? false : true,
  isDrawerOpen: localStorage.getItem('isDrawerOpen') === 'false' ? false : true,
  loading: true,
  user: { _id: null, email: '', password: '' },
  unreadMessageCount: 0,
  balance: 0,
  isActivated: true,
  userName: '',
  liveUrl: null,
  transactions: [],
  referralCode: null
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case SET_DARK_MODE:
      localStorage.setItem('darkMode', payload);
      return {
        ...state,
        isDarkMode: payload
      };
    case TOGGLE_MUTE:
      localStorage.setItem('isMuted', payload);
      return {
        ...state,
        isMuted: payload
      };
      case TOGGLE_DRAWER:
        localStorage.setItem('isDrawerOpen', payload);
        return {
          ...state,
          isDrawerOpen: payload
        };
    case SET_SOCKET:
      return {
        ...state,
        socket: payload
      };
    case TRANSACTION_LOADED:
      return {
        ...state,
        transactions: payload
      };
    case NEW_TRANSACTION:
      const newTransactions = [payload]
        .concat(JSON.parse(JSON.stringify(state.transactions)))
        .slice(0, 4);
      return {
        ...state,
        transactions: newTransactions
      };
    case SET_AVATAR:
      return {
        ...state,
        user: { ...state.user, avatar: payload }
      };
    case SET_USERNAME_PASSWORD:
      return {
        ...state,
        user: { ...state.user, ...payload }
      };
    case SET_UNREAD_MESSAGE_COUNT:
      return {
        ...state,
        unreadMessageCount: payload
      };
    case USER_LOADED:
      return {
        ...state,
        isAdmin: 0,
        userName: payload.username,
        isAuthenticated: true,
        isActivated: payload.is_activated,
        loading: false,
        user: { ...payload, password: '' },
        balance: payload.balance
      };
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      localStorage.setItem('isAuthenticated', 1);
      return {
        ...state,
        ...payload,
        user: { ...payload.user, password: '' },
        balance: payload.user.balance,
        isAdmin: 0,
        userName: payload.user.username,
        isActivated: payload.user.is_activated,
        isAuthenticated: true,
        loading: false
      };
    case VERIFICATION_SUCCESS:
      return {
        ...state,
        isActivated: payload
      };
    case REGISTER_FAIL:
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT:
      localStorage.removeItem('token');
      localStorage.removeItem('isAuthenticated');
      return {
        ...state,
        token: null,
        isAdmin: false,
        userName: '',
        isAuthenticated: false,
        loading: false
      };
    case SET_BALANCE:
      return {
        ...state,
        balance: payload
      };
    case SET_URL:
      return {
        ...state,
        liveUrl: payload
      };
    case SET_REFERRAL_CODE:
      return {
        ...state,
        referralCode: payload
      };
    default:
      return state;
  }
}
