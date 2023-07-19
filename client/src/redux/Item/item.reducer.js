import {
  ITEM_QUERY_ONE,
  ITEM_QUERY,
  PAGINATION_FOR_ITEM,
  LOADING_ITEM_TABLE,
  SET_CURRENT_PRODUCT_INFO,
  SET_CURRENT_PRODUCT_ID,
  ADD_TOTAL
} from '../types';

const initialState = {
  _id: '',
  productName: '',
  price: '',
  image: '',
  startDateTime: new Date(),
  expireDateTime: new Date(),
  itemArray: [],
  pagination: 25,
  page: 1,
  totalResults: 0,
  pages: 1,
  loading: false
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case ITEM_QUERY_ONE:
    case SET_CURRENT_PRODUCT_INFO:
      return { ...state, ...payload };
    case ITEM_QUERY:
      return { ...state, itemArray: payload };
    case ADD_TOTAL:
      return { ...state, totalResults: payload.total, pages: payload.pages };
    case PAGINATION_FOR_ITEM:
      return {
        ...state,
        pagination: payload.pagination,
        page: payload.page
      };
    case LOADING_ITEM_TABLE:
      return { ...state, loading: payload };
    case SET_CURRENT_PRODUCT_ID:
      return { ...state, _id: payload };
    default:
      return state;
  }
};
