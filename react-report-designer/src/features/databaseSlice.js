import { createSlice, createAsyncThunk, isAnyOf } from '@reduxjs/toolkit';
import api from '../axios';

export const fetchTableNames = createAsyncThunk(
    'database/fetchTableNames',
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const { Table } = await api.get(`/db/all-tables`);
            return { Table };
        } catch ({ data: { errorMessage } }) {
            rejectWithValue(errorMessage);
        }
    }
);

export const fetchTableProperties = createAsyncThunk(
    'database/fetchTableProperties',
    async (tableName, { dispatch, getState, rejectWithValue }) => {
        try {
            const { Table } = await api.get(`/db/table-properties?tableName=${tableName}`);
            return { Table, tableName };
        } catch ({ data: { errorMessage } }) {
            rejectWithValue(errorMessage);
        }
    }
);

const initialState = {
    tableNames: [],
    tables: [],
    // tablesLoading: true,
};

const databaseSlice = createSlice({
    name: 'database',
    initialState,
    reducers: {
        updateTables: (state, { payload }) => {
            state.tables = state.tables.filter(({ tableName }) => tableName !== payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTableNames.fulfilled, (state, { payload }) => {
                state.tableNames = payload.Table;
            })
            .addCase(fetchTableProperties.fulfilled, (state, { payload }) => {
                const set = new Set([...state.tables]);
                console.log('before: ' + set);
                set.add({ tableName: payload.tableName, properties: payload.Table });
                console.log('after: ' + set);
                state.tables = Array.from(set);
                // state.tablesLoading = false;
            })
            .addCase(fetchTableProperties.pending, (state, { payload }) => {
                // state.tablesLoading = true;
            });
    },
});

export const {
    actions: { updateTables },
} = databaseSlice;

export default databaseSlice.reducer;
