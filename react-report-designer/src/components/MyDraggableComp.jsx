import React, { useEffect } from 'react';
import Draggable from 'react-draggable';
import { Checkbox } from '@mui/material';
import primary_key from '../primary_key.png';
import LeaderLine from 'leader-line';

import './css/my_drag.css';

function MyDraggableComp({ table, key }) {
    

    function addConnector() {
   var startElement = document.getElementById('DANGKY'),
        endElement = document.getElementById('GIANGVIEN');

          if (startElement && endElement)
            new LeaderLine(startElement, endElement, { color: 'red', size: 8 });
    }

    return (
        <div key={key} id={table.tableName}>
            <Draggable
                style={{ width: 'fit-content !important' }}
                defaultClassName='react-draggable my-draggable'
                defaultPosition={{ x: 0, y: 0 }}
                onDrag={addConnector}
            >
                <div style={{ border: '1px solid red' }}>
                    {table['properties'].map(({ COLUMN_NAME, CONSTRAINT_NAME }, index) => {
                        if (
                            CONSTRAINT_NAME &&
                            CONSTRAINT_NAME.includes('FK') &&
                            table['properties'].some(
                                ({ COLUMN_NAME: columnName }) => columnName === COLUMN_NAME
                            )
                        )
                            return null;
                        else
                            return (
                                <div key={COLUMN_NAME + index}>
                                    <Checkbox />
                                    <span>{COLUMN_NAME}</span>
                                    {CONSTRAINT_NAME !== null && CONSTRAINT_NAME.includes('PK') && (
                                        <img src={primary_key} width='36px' height={'36px'} />
                                    )}
                                </div>
                            );
                    })}
                </div>
            </Draggable>
        </div>
    );
}

export default MyDraggableComp;
