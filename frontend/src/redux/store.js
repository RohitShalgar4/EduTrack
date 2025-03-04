import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';
import studentReducer from './studentSlice';

const userPersistConfig = {
  key: 'user',
  storage,
  whitelist: ['authUser'],
};

const studentPersistConfig = {
  key: 'student',
  storage,
  whitelist: ['data'],
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedStudentReducer = persistReducer(studentPersistConfig, studentReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    student: persistedStudentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
