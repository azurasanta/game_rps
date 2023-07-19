import api from '../../util/Api';
import {
  MSG_ERROR,
  MSG_WARNING,
  LANDING_QUERY,
  LANDING_QUERY_ONE,
  LOADING_LANDING_TABLE,
  PAGINATION_FOR_LANDING,
  ADD_LANDING_TOTAL
} from '../types';

export const acQueryItem = (pagination, page) => async (
  dispatch,
  getState
) => {
  dispatch({ type: LANDING_QUERY, payload: [] });
  dispatch({ type: LOADING_LANDING_TABLE, payload: true });
  let payload = {
    pagination,
    page
  };
  dispatch({ type: PAGINATION_FOR_LANDING, payload });
  let body = {};
  body.pagination = getState().landingReducer.pagination;
  body.page = getState().landingReducer.page;
  try {
    const { data } = await api.get('landing', { params: body });

    if (data.success) {
      dispatch({ type: LANDING_QUERY, payload: data.items });
      dispatch({ type: ADD_LANDING_TOTAL, payload: data });
    } else {
      dispatch({ type: MSG_ERROR, payload: data.message });
    }
    dispatch({ type: LOADING_LANDING_TABLE, payload: false });
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};

export const getItem = () => async (dispatch, getState) => {
  const _id = getState().landingReducer._id;
  try {
    if (_id === '') {
      dispatch({ type: LANDING_QUERY_ONE, payload: {
        _id: '',
        productName: '',
        price: '',
        image: '',
        startDateTime: new Date(),
        expireDateTime: new Date()
      }});
    } else {
      const { data } = await api.get('item/' + _id);
      if (data.success) {
        dispatch({ type: LANDING_QUERY_ONE, payload: data.item });
      } else {
        dispatch({ type: MSG_ERROR, payload: data.message });
      }
    }
  } catch (error) {
    console.log('error***', error);
    dispatch({ type: MSG_WARNING, payload: error });
  }
};
