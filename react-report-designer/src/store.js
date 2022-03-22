import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import databaseSlice from './features/databaseSlice';

const rootReducer = combineReducers({
    database: databaseSlice,
});

const store = configureStore({
    reducer: rootReducer,
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
