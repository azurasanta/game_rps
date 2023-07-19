import {
  QUESTION_QUERY,
  PAGINATION_FOR_QUESTION,
  LOADING_QUESTION_TABLE,
  SET_CURRENT_QUESTION_INFO,
  BRAIN_GAME_TYPE_QUERY,
} from '../types';

const initialState = {
  _id: '',
  question: '',
  answers: [],
  incorrect_answers: [],
  game_type_list: [],
  brain_game_type: null,
  new_brain_game_type: '',
  new_answer: '',
  new_incorrect_answer: '',
  queryData: [],
  pagination: 10,
  page: 1,
  totalResults: 0,
  lastQuery: null,
  pages: 1,
  loading: false,
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case QUESTION_QUERY:
      return {
        ...state,
        queryData: payload.questions,
        totalResults: payload.total,
        pages: payload.pages
      };
    case PAGINATION_FOR_QUESTION:
      return { ...state, pagination: payload.pagination, page: payload.page };
    case LOADING_QUESTION_TABLE:
      return { ...state, loading: payload };
    case SET_CURRENT_QUESTION_INFO:
      return { ...state, ...payload };
    case BRAIN_GAME_TYPE_QUERY:
      let brain_game_type= null;
      if (payload.length > 0) {
        brain_game_type = payload[0]._id;
      }
      return { ...state, game_type_list: payload, brain_game_type };
    default:
      return state;
  }
};

// a-202-210-40
