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
    addStudent: (state, action) => {
      state.data.push(action.payload);
    },
    updateStudent: (state, action) => {
      const index = state.data.findIndex((student) => student.registration_number === action.payload.registration_number);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
    },
    deleteStudent: (state, action) => {
      state.data = state.data.filter((student) => student.registration_number !== action.payload);
    },  
  },
});

export const { setStudentData, clearStudentData, addStudent, updateStudent, deleteStudent } = studentSlice.actions;

export default studentSlice.reducer; // This is the student reducer