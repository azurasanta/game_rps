import {
  MSG_CLOSE,
  MSG_ERROR,
  MSG_INFO,
  MSG_SUCCESS,
  MSG_WARNING,
  CLOSE_ALERT_MODAL,
  OPEN_GAME_PASSWORD_MODAL,
  CLOSE_GAME_PASSWORD_MODAL,
  SET_PASSWORD_CORRECT
} from '../types';

const initialState = {
  openSk: false,
  message: '',
  status: null,
  showLogin: false,
  showSignup: false,
  showVerification: false,
  showAlert: false,
  showGamePasswordModal: false,
  title: '',
  alertMessage: '',
  alertType: '',
  roomStatus: '',
  isPasswordCorrect: false,
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case MSG_CLOSE:
      return {
        ...state,
        openSk: false
      };
    case MSG_ERROR:
      return {
        ...state,
        openSk: true,
        message: payload,
        status: MSG_ERROR
      };
    case MSG_INFO:
      return {
        ...state,
        openSk: true,
        message: payload,
        status: MSG_INFO
      };
    case MSG_SUCCESS:
      return {
        ...state,
        openSk: true,
        message: payload,
        status: MSG_SUCCESS
      };
    case MSG_WARNING:
      return {
        ...state,
        openSk: true,
        message: payload,
        status: MSG_WARNING
      };
    case CLOSE_ALERT_MODAL:
      return {
        ...state,
        showAlert: false,
        alertMessage: '',
        alertType: '',
        title: '',
      }
    case SET_PASSWORD_CORRECT:
      return {
        ...state,
        isPasswordCorrect: payload
      }
    case OPEN_GAME_PASSWORD_MODAL:
      return {
        ...state,
        showGamePasswordModal: true,
        isPasswordCorrect: false,
      }
    case CLOSE_GAME_PASSWORD_MODAL:
      return {
        ...state,
        showGamePasswordModal: false
      }
    default:
      return state;
  }
}
