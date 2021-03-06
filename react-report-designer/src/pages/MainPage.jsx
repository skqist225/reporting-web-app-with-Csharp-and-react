import React, { useEffect, useState } from 'react';
import { Fab, TextareaAutosize } from '@mui/material';

import ConditionArray from '../components/ConditionArray';
import { useFieldArray, useForm } from 'react-hook-form';
import NavigationIcon from '@mui/icons-material/Navigation';
import ListTableName from '../components/ListTableName';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTableNames, isValidQuery, resetIsValid } from '../features/databaseSlice';
import DraggableTable from '../components/DraggableTable';
import buildFinalQuery from '../scripts/buildFinalQuery';

function MainPage() {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const { tableNames, tables, isValid, removedTable } = useSelector(state => state.database);
    const { control, register } = useForm();
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: 'test', // unique name for your Field Array
    });

    useEffect(() => {
        dispatch(fetchTableNames());
    }, []);

    function printReport() {
        dispatch(isValidQuery(query.replace(/=/g, 'EQUAL')));
    }

    useEffect(() => {
        if (isValid) {
            window.open(
                `${window.location.origin}/report?query=${query.replace(/=/g, 'EQUAL')}`,
                '_blank'
            );
        }
        if (isValid === false) {
            alert('query is invalid;');
        }
        dispatch(resetIsValid());
    }, [isValid]);

    useEffect(() => {
        setQuery(buildFinalQuery(tables));
    }, [tables]);

    return (
        <main style={{ maxHeight: '100vh', minHeight: '100vh' }}>
            <div id='editQuery' style={{ display: 'block' }}>
                <div className='' style={{ position: 'relative' }}>
                    <TextareaAutosize
                        aria-label='minimum height'
                        minRows={5}
                        placeholder='AUTOGENERATED QUERY'
                        style={{
                            width: '100%',
                            fontSize: '16px',
                            border: '2px solid paleblue',
                            borderRadius: '8px',
                            maxWidth: '100%',
                            minWidth: '100%'
                        }}
                        defaultValue={query}
                        readOnly
                    />
                    <div style={{ position: 'absolute', bottom: '10px', right: '0px' }}>
                        <Fab
                            variant='extended'
                            color='primary'
                            aria-label='add'
                            onClick={printReport}
                        >
                            <NavigationIcon sx={{ mr: 1 }} />
                            In b??o c??o
                        </Fab>
                    </div>
                </div>
                <div style={{ height: '269px', overflowY: 'scroll' }}>
                    <ConditionArray fields={fields} register={register} setQuery={setQuery} />
                </div>
                <div className='normal-flex' style={{ height: '100%' }}>
                    <div style={{ height: '550px' }}>{tableNames && <ListTableName tableNames={tableNames} />}</div>
                    <div style={{ width: '10px' }}>

                    </div>
                    <article
                        className='flex'
                        style={{
                            boxShadow: 'rgb(0 0 0 / 28%) 0px 8px 28px',
                            height: '550px',
                            width: '100%',
                            borderRadius: '8px',
                        }}
                    >
                        <div className='normal-flex'>
                            {tables.map(table => (
                                <DraggableTable
                                    table={table}
                                    key={table.tableName}
                                    append={append}
                                    remove={remove}
                                    fields={fields}
                                />
                            ))}
                        </div>
                    </article>
                </div>
            </div>
        </main>
    );
}

export default MainPage;
