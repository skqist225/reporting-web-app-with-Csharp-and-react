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
    removedTable: '',
    signToRemoveConnector: false,
    isHavingLocalQuery: false,
};

const databaseSlice = createSlice({
    name: 'database',
    initialState,
    reducers: {
        preRemoveTable: (state, { payload }) => {
            state.signToRemoveConnector = true;
            state.removedTable = payload;
        },
        removeTable: (state, { payload }) => {
            state.tables = state.tables.filter(({ tableName }) => tableName !== payload);
            state.tables = state.tables.map(table => ({
                ...table,
                connectors:
                    table.connectors.filter(({ start, end }) => ![start, end].includes(payload)) ||
                    [],
            }));

            state.signToRemoveConnector = false;
        },
        addConnectors: (state, { payload: { start, end, id } }) => {
            state.tables = state.tables.map(table => {
                if ([start, end].includes(table.tableName)) {
                    return { ...table, connectors: [...table.connectors, { start, end, id }] };
                }

                return table;
            });
        },
        emptyConnectors: (state, { payload }) => {
            state.tables = state.tables.map(table => ({
                ...table,
                connectors:
                    table.connectors.filter(({ start, end }) => ![start, end].includes(payload)) ||
                    [],
            }));
        },
        updateTableQuery: (state, { payload: { tableName, tableQuery } }) => {
            state.tables = state.tables.map(table => ({
                ...table,
                tableQuery: table.tableName === tableName ? tableQuery : table.tableQuery,
            }));
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchTableNames.fulfilled, (state, { payload }) => {
                state.tableNames = payload.Table;
            })
            .addCase(fetchTableProperties.fulfilled, (state, { payload }) => {
                const set = new Set([...state.tables]);

                payload.Table = payload.Table.map(({ COLUMN_NAME, CONSTRAINT_NAME }, index) => {
                    return CONSTRAINT_NAME?.includes('FK')
                        ? {
                              COLUMN_NAME,
                              CONSTRAINT_TYPE: 'FK',
                              COLUMN_REFERENCE: CONSTRAINT_NAME.split('_').pop(),
                          }
                        : { COLUMN_NAME, CONSTRAINT_TYPE: CONSTRAINT_NAME?.includes('PK') && 'PK' };
                });

                set.add({
                    tableName: payload.tableName,
                    properties: payload.Table,
                    connectors: [],
                    tableQuery: '',
                });
                state.tables = Array.from(set);
            })
            .addCase(fetchTableProperties.pending, (state, { payload }) => {
                // state.tablesLoading = true;
            });
    },
});

export const {
    actions: {
        removeTable,
        addConnectors,
        emptyConnectors,
        resetConnectors,
        preRemoveTable,
        updateTableQuery,
    },
} = databaseSlice;

export default databaseSlice.reducer;
