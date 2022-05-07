import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Draggable from 'react-draggable';
import { Checkbox } from '@mui/material';
import primary_key from '../primary_key.png';
import LeaderLine from 'leader-line';
import {
    addConnectors,
    emptyConnectors,
    removeTable,
    updateFieldsInSelect,
    updateFieldsInWhere,
} from '../features/databaseSlice';

import $ from 'jquery';
import './css/my_drag.css';

function DraggableTable({
    table: { tableName: crtTableName, properties: crtProperties },
    append,
    remove,
    fields,
}) {
    const dispatch = useDispatch();
    const { tables, signToRemoveConnector, removedTable } = useSelector(state => state.database);
    const [fieldsInSelectStatement, setFieldsInSelectStatement] = useState([]);

    function drawConnector(startElement, endElement) {
        const start = document.querySelector(startElement);
        const end = document.querySelector(endElement);

        const line = new LeaderLine(start, end, {
            color: 'rgba(30, 130, 250, 0.5)',
            size: 4,
            hide: true,
            path: 'grid',
        }).setOptions({
            startSocket: 'auto',
            endSocket: 'auto',
        });
        line.show('draw');
        return line._id;
    }

    function removeConnectors(connectors) {
        connectors.forEach(({ id }, index) => {
            $('.leader-line').each(function () {
                if ($(this).children('defs').children('path').attr('id').includes(id))
                    $(this).remove();
            });
        });
    }

    useEffect(() => {
        let localConnectors = [];
        tables.forEach(({ properties, tableName }) => {
            properties.forEach(({ COLUMN_REFERENCE, COLUMN_NAME }) => {
                if (COLUMN_REFERENCE && COLUMN_REFERENCE === crtTableName) {
                    const isConnectorAdded = localConnectors.some(({ start, end, refColumn }) => {
                        if (start === tableName && end === crtTableName) {
                            return true;
                        }
                    });
                    if (!isConnectorAdded)
                        localConnectors.push({
                            start: tableName,
                            end: crtTableName,
                            refColumn: COLUMN_NAME,
                            id: drawConnector(`.${tableName}`, `.${crtTableName}`),
                        });
                }
            });
            crtProperties.forEach(({ COLUMN_REFERENCE, COLUMN_NAME }) => {
                if (COLUMN_REFERENCE && COLUMN_REFERENCE === tableName) {
                    const isConnectorAdded = localConnectors.some(({ start, end, refColumn }) => {
                        if (start === crtTableName && end === tableName) {
                            return true;
                        }
                    });
                    if (!isConnectorAdded)
                        localConnectors.push({
                            start: crtTableName,
                            end: tableName,
                            refColumn: COLUMN_NAME,
                            id: drawConnector(`.${crtTableName}`, `.${tableName}`),
                        });
                }
            });
        });
        localConnectors.forEach(line => {
            dispatch(addConnectors(line));
        });
    }, []);

    useEffect(() => {
        if (signToRemoveConnector && crtTableName === removedTable) {
            fields.forEach(field => {
                if (field.tableName === removedTable) {
                    remove(field);
                }
            });

            removeConnectors(
                tables.filter(({ tableName }) => tableName === crtTableName)[0].connectors
            );

            dispatch(removeTable(crtTableName));
        }
    }, [signToRemoveConnector]);

    function onDragStop(e) {
        e.stopPropagation();
        e.preventDefault();

        const { connectors } = tables.filter(({ tableName }) => tableName === crtTableName)[0];
        removeConnectors(connectors);

        const localConnectors = [];
        connectors.forEach(({ start, end, refColumn }) => {
            localConnectors.push({
                start,
                end,
                refColumn,
                id: drawConnector('.' + start, '.' + end),
            });
        });
        dispatch(emptyConnectors(crtTableName));

        localConnectors.forEach(line => {
            dispatch(addConnectors(line));
        });
    }

    function onChange(event) {
        event.stopPropagation();

        const { checked, value } = event.currentTarget;
        const [tableName, colName, dataType] = value.split('?');

        if (checked) {
            setFieldsInSelectStatement(crtFields => [...crtFields, tableName + '.' + colName]);
            append({ colName, tableName, dataType });

            setFieldsInSelectStatement(crtFields => {
                dispatch(updateFieldsInSelect({ tableName, fieldsInSelect: crtFields }));
                return crtFields;
            });
        } else {
            setFieldsInSelectStatement(crtFields =>
                crtFields.filter(field => field !== `${tableName}.${colName}`)
            );
            remove({ colName, tableName });

            setFieldsInSelectStatement(crtFields => {
                dispatch(
                    updateFieldsInSelect({
                        tableName,
                        fieldsInSelect: crtFields,
                    })
                );
                let {
                    tableQuery: { fieldsInWhere },
                } = tables.filter(({ tableName: tblName }) => tblName === tableName)[0];
                dispatch(
                    updateFieldsInWhere({
                        tableName,
                        fieldsInWhere: fieldsInWhere.filter(
                            ({ name }) => name !== `${tableName}.${colName}`
                        ),
                    })
                );
                return crtFields;
            });
        }
    }

    function onMouseDown(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <div style={{ marginRight: '50px' }}>
            <Draggable
                defaultClassName={'react-draggable my-draggable ' + crtTableName}
                defaultPosition={{ x: 0, y: 0 }}
                position={null}
                onStop={onDragStop}
            >
                <div
                    style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            fontWeight: '600',
                            fontSize: '18px',
                            textAlign: 'center',
                            backgroundColor: 'rgba(0,120,215,255)',
                            color: 'white',
                            paddingTop: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        {crtTableName}
                    </div>
                    <div
                        style={{
                            border: '4px solid #0078d7',
                            borderRadius: '12px',
                            borderTopLeftRadius: '0',
                            borderTopRightRadius: '0',
                            overflow: 'hidden',
                        }}
                    >
                        {crtProperties.map(({ COLUMN_NAME, CONSTRAINT_TYPE, DATA_TYPE }, index) => {
                            if (COLUMN_NAME === 'PASSWORD') {
                                return null;
                            }
                            if (
                                CONSTRAINT_TYPE === 'FK' &&
                                crtProperties.some(
                                    ({ COLUMN_NAME: columnName }, idx) =>
                                        columnName === COLUMN_NAME && index !== idx
                                )
                            )
                                return null;
                            else
                                return (
                                    <div
                                        key={COLUMN_NAME + index}
                                        id={
                                            CONSTRAINT_TYPE
                                                ? `${crtTableName} ${CONSTRAINT_TYPE}`
                                                : ''
                                        }
                                        style={{
                                            height: '30px',
                                            borderBottom: '1px solid #b0b0b0',
                                            paddingRight: '10px',
                                        }}
                                        className='normal-flex'
                                    >
                                        <Checkbox
                                            onChange={onChange}
                                            onMouseDown={onMouseDown}
                                            value={
                                                crtTableName + '?' + COLUMN_NAME + '?' + DATA_TYPE
                                            }
                                            className={crtTableName}
                                        />
                                        <span style={{ fontSize: '14px' }}>{COLUMN_NAME}</span>
                                        {CONSTRAINT_TYPE === 'PK' && (
                                            <img src={primary_key} width='20px' height='20px' />
                                        )}
                                    </div>
                                );
                        })}
                    </div>
                </div>
            </Draggable>
        </div>
    );
}

export default DraggableTable;
