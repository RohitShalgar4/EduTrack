import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    authUser: null,
    loading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.authUser = action.payload;
    },
    clearUser: (state) => {
      state.authUser = null;
    },
    updateUser: (state, action) => {
      state.authUser = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Add any extra reducers here
  }
});

export const { setUser, clearUser, updateUser } = userSlice.actions;
export default userSlice.reducer; 