import React from 'react';
import {Checkbox} from '@mui/material';
import { pink } from '@mui/material/colors';
import { useDispatch } from 'react-redux';
import { fetchTableProperties, updateTables } from '../features/databaseSlice';

function TableName({name}) {
    const dispatch = useDispatch();
    async  function onChange(event) {
        const tableName = event.currentTarget.value;
        const checked = event.currentTarget.checked;
        if(checked)
        dispatch(fetchTableProperties(tableName));
        else dispatch(updateTables(tableName));
    }

    return (
        <div className='normal-flex'>
            <div>
                <Checkbox
                    sx={{
                    color: pink[800],
                    '&.Mui-checked': {
                        color: pink[600],
                    },
                    }}
                    value={name}
                    onChange={onChange}
                />
            </div>
            <div style={{fontWeight:'600'}}>{name}</div>
        </div>
    )
}

export default TableName