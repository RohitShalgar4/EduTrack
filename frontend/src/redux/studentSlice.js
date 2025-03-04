import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  data: null, 
  userId: null, 
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setStudentData: (state, action) => {
      // Ensure we only set data if it has an _id
      if (action.payload && action.payload._id) {
        state.data = action.payload; 
        state.userId = action.payload.userId || action.payload._id; 
      } else {
        console.error('Invalid student data received:', action.payload);
        state.data = null;
        state.userId = null;
      }
    },
    clearStudentData: (state) => {
      state.data = null; 
      state.userId = null;
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

export default studentSlice.reducer; 