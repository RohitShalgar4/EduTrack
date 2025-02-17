// userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    authUser: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
        console.log("Redux - setAuthUser Payload:", action.payload); // Debug Redux action payload
        state.authUser = {
          ...action.payload,
          role: action.payload.role || "student", // Ensure role is always set
        };
      },      
  },
});

export const { setAuthUser } = userSlice.actions;
export default userSlice.reducer;