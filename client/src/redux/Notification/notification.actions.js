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

export const closeMsgBar = () => dispatch => {
  dispatch({
    type: MSG_CLOSE
  });
};

export const errorMsgBar = text => dispatch => {
  dispatch({ type: MSG_ERROR, payload: text });
};

export const infoMsgBar = text => dispatch => {
  dispatch({ type: MSG_INFO, payload: text });
};
export const successMsgBar = text => dispatch => {
  dispatch({ type: MSG_SUCCESS, payload: text });
};

export const warningMsgBar = text => dispatch => {
  dispatch({ type: MSG_WARNING, payload: text });
};

export const openGamePasswordModal = () => dispatch => { dispatch({ type: OPEN_GAME_PASSWORD_MODAL }); };

export const closeGamePasswordModal = () => dispatch => { dispatch({ type: CLOSE_GAME_PASSWORD_MODAL }); };
export const closeAlert = () => dispatch => { dispatch({ type: CLOSE_ALERT_MODAL }); };
export const setPasswordCorrect = (data) => dispatch => { dispatch({ type: SET_PASSWORD_CORRECT, payload: data }) };