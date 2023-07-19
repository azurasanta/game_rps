import {
  LANDING_QUERY_ONE,
  LANDING_QUERY,
  PAGINATION_FOR_LANDING,
  LOADING_LANDING_TABLE,
  ADD_LANDING_TOTAL
} from '../types';

const initialState = {
  landingItemList: [],
  pagination: 25,
  page: 1,
  totalResults: 0,
  pages: 1,
  loading: false
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case LANDING_QUERY_ONE:
      return { ...state, ...payload };
    case LANDING_QUERY:
      return { ...state, landingItemList: payload };
    case ADD_LANDING_TOTAL:
      return { ...state, totalResults: payload.total, pages: payload.pages };
    case PAGINATION_FOR_LANDING:
      return {
        ...state,
        pagination: payload.pagination,
        page: payload.page
      };
    case LOADING_LANDING_TABLE:
      return { ...state, loading: payload };
    default:
      return state;
  }
};
