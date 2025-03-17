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
      console.log("Redux - setAuthUser Raw Payload:", action.payload); // Debug log
      
      // Ensure we have all required fields
      const userData = {
        ...action.payload,
        role: action.payload.role || "student",
        department: action.payload.department || null,
      };
      
      console.log("Redux - Processed User Data:", userData); // Debug log
      state.authUser = userData;
    },
    logoutUser: (state) => {
      state.authUser = null;
    },
  },
});

export const { setAuthUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;