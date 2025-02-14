import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null, // Initial state for student data
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentData: (state, action) => {
      state.data = action.payload; // Store student data from API response
    },
    clearStudentData: (state) => {
      state.data = null; // Clear student data if needed (e.g., logout)
    },
  },
});

export const { setStudentData, clearStudentData } = studentSlice.actions;

export default studentSlice.reducer; // This is the student reducer