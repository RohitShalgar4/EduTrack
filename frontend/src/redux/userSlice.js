// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authUser: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      console.log('Setting auth user:', action.payload);
      state.authUser = {
        ...action.payload,
        role: action.payload.role || 'student'
      };
    },
    logoutUser: (state) => {
      state.authUser = null;
    },
  },
});

export const { setAuthUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;