import api from '../../util/Api';
import {
  MSG_ERROR,
  MSG_WARNING,
  QUESTION_QUERY,
  PAGINATION_FOR_QUESTION,
  LOADING_QUESTION_TABLE,
  MSG_SUCCESS,
  SET_CURRENT_QUESTION_INFO,
  BRAIN_GAME_TYPE_QUERY,
} from '../types';

export const acPaginationQuestion = (pagination, page) => async (
  dispatch,
  getState
) => {
  let payload = {
    pagination,
    page
  };
  dispatch({ type: LOADING_QUESTION_TABLE, payload: true });
  dispatch({ type: PAGINATION_FOR_QUESTION, payload });
  let body = {};
  body.pagination = getState().questionReducer.pagination;
  body.page = getState().questionReducer.page;
  try {
    const { data } = await api.get('question', {
      params: body
    });
    if (data.success) {
      dispatch({ type: QUESTION_QUERY, payload: data });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
    dispatch({ type: LOADING_QUESTION_TABLE, payload: false });
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_QUESTION_TABLE, payload: false });
  }
};

export const queryQuestion = (pagination, page) => async (dispatch, getState) => {
  dispatch({ type: LOADING_QUESTION_TABLE, payload: true });
  let payload = {
    pagination,
    page
  };
  dispatch({ type: PAGINATION_FOR_QUESTION, payload });
  let body = {};
  body.pagination = getState().questionReducer.pagination;
  body.page = getState().questionReducer.page;
  try {
    const { data } = await api.get('question', { params: body });
    if (data.success) {
      dispatch({ type: QUESTION_QUERY, payload: data });
      dispatch({ type: LOADING_QUESTION_TABLE, payload: false });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
      dispatch({ type: LOADING_QUESTION_TABLE, payload: false });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: LOADING_QUESTION_TABLE, payload: false });
  }
};

export const createQuestion = body => async (dispatch) => {
  delete body.buttonDisable;

  try {
    const { data } = await api.post('question', body);
    console.log(data);
    if (data.success) {
      dispatch({ type: MSG_SUCCESS, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const getQuestion = () => async (dispatch, getState) => {
  const _id = getState().questionReducer._id;
  try {
    if (_id === '') {
      dispatch({ type: SET_CURRENT_QUESTION_INFO, payload: {
        _id: '',
        question: '',
        answers: [],
        brain_game_type: 1
      }});
    } else {
      const { data } = await api.get('question/' + _id);
      if (data.success) {
        dispatch({ type: SET_CURRENT_QUESTION_INFO, payload: data.question });
      } else {
        dispatch({ type: MSG_ERROR, payload: data.message });
      }
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const updateQuestion = body => async dispatch => {
  try {
    delete body.buttonDisable;
    const { data } = await api.post('question', body);
    if (data.success) {
      dispatch({ type: MSG_SUCCESS, payload: 'Question saved.' });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const deleteQuestion = _id => async dispatch => {
  let body = {};
  body._id = _id;
  try {
    const { data } = await api.post('question/delete', body);
    if (data.success) {
      dispatch({ type: MSG_SUCCESS, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const getBrainGameType = () => async dispatch => {
  try {
    const { data } = await api.get('brain_game_type');
    if (data.success) {
      dispatch({ type: BRAIN_GAME_TYPE_QUERY, payload: data.brain_game_types });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const getBrainGameTypes = (userId) => async dispatch => {
  try {
    const { data } = await api.get('brain_game_type', {
      params: {
        user_id: userId
      }
    });
    if (data.success) {
      dispatch({ type: BRAIN_GAME_TYPE_QUERY, payload: data.brain_game_types });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};


export const addBrainGameType = game_type_name => async (dispatch) => {
  try {
    const { data } = await api.post('brain_game_type', {game_type_name});
    if (data.success) {
      dispatch({ type: BRAIN_GAME_TYPE_QUERY, payload: data.brain_game_types });
      dispatch({ type: MSG_SUCCESS, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const removeBrainGameType = _id => async (dispatch) => {
  try {
    const { data } = await api.post('brain_game_type/delete', {_id: _id});
    if (data.success) {
      dispatch({ type: BRAIN_GAME_TYPE_QUERY, payload: data.brain_game_types });
      dispatch({ type: MSG_SUCCESS, payload: data.message });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const setCurrentQuestionInfo = info => dispatch => {
  dispatch({ type: SET_CURRENT_QUESTION_INFO, payload: info });
};
