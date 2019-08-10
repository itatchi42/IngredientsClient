import { ADD_POST, DELETE_POST } from './types';

export const createPost = ({ title, body }) => ({
  type: ADD_POST,
  payload: {
    title,
    body
  }
});

export const deletePost = title => ({
  type: DELETE_POST,
  payload: {
    title
  }
});