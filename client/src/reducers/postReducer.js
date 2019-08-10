// postReducer.js

import { ADD_POST, DELETE_POST } from '../actions/types';

export default function postReducer(state = [], action) {
  switch (action.type) {
    case ADD_POST:
      return [...state, action.payload];
    case DELETE_POST:
      return state.filter(post => post.title !== action.payload.title);
    default:
      return state;
  }
}