import { Box } from '@mui/material';
import React from 'react';
import TableName from './TableName';

function ListTableName({ tableNames }) {
    return (
        <Box
            sx={{
                width: '293px',
                height: 'fit-content',
                backgroundColor: '#fff',
                borderRadius: '16px',
                border: '1px solid rgba(118, 118, 118, 0.28)',
                padding: '12px',
                boxShadow: 'rgb(0 0 0 / 28%) 0px 8px 28px',
            }}
        >
            {tableNames.map(({ name }) => (
                <TableName key={name} name={name} />
            ))}
        </Box>
    );
}

export default ListTableName;
