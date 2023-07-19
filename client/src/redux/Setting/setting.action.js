import axios from '../../util/Api';

import {
  MSG_ERROR,
  MSG_WARNING,
  MSG_SUCCESS,
} from '../types';

export const getSettings = () => async (dispatch) => {
  try {
    const { data } = await axios.get('/settings', {});
    if (data.success) {
        return data.settings;
    } else {
        dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
  }
};

export const saveSettings = settings => async dispatch => {
  try {
    const { data } = await axios.post('/settings', {settings});
    if (data.success) {
      dispatch({ type: MSG_SUCCESS, payload: 'System settings have been saved.' });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};
