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
} from '../features/databaseSlice';

import $ from 'jquery';
import './css/my_drag.css';
import buildTableQuery from '../scripts/buildTableQuery';
import buildTableJoin from '../scripts/buildTableJoin';
import addJoinColumnToSelect from '../scripts/addJoinColumnToSelect';

function DraggableTable({
    table: { tableName: crtTableName, properties: crtProperties },
    append,
    remove,
    setQuery,
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
    // let selectFields = [];
    function onChange(event) {
        event.stopPropagation();

        const { checked, value } = event.currentTarget;
        const [tableName, colName] = value.split('?');

        if (checked) {
            setFieldsInSelectStatement(crtFields => [...crtFields, tableName + '.' + colName]);
            append({ colName, tableName });

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
                return crtFields;
            });
        }
    }

    useEffect(() => {
        let finalString = 'SELECT * FROM ';
        const desiredJoinBy = ' JOIN ';
        const queries = new Map(),
            allJoinableOfCrtTable = [];
        tables.forEach(({ tableQuery, tableName }) => {
            const buildedTableQuery = buildTableQuery(tables, tableName);
            if (buildedTableQuery) queries.set(tableName, `(${buildedTableQuery}) AS ${tableName}`);
        });
        tables.forEach(({ tableName }) => {
            allJoinableOfCrtTable.push(
                ...buildTableJoin(tables, tableName, desiredJoinBy, queries)
            );
        });

        const uniqueJoins = allJoinableOfCrtTable.reduce((acc, curr) => {
            if (!acc.some(e => e.joinOnField === curr.joinOnField)) acc.push(curr);
            return acc;
        }, []);
        let concatJoinString = '';

        if (queries.size === 1)
            concatJoinString = Array.from(queries.values())[0] && Array.from(queries.values())[0];
        else if (queries.size === 2) {
            const [joinBy, joinOnField, refCol] = uniqueJoins.reduce((acc, curr) => {
                if (
                    curr.between.includes(Array.from(queries.keys())[0]) &&
                    curr.between.includes(Array.from(queries.keys())[1])
                ) {
                    acc.push(curr.joinBy);
                    acc.push(curr.joinOnField);
                    acc.push(curr.refCol);
                }
                return acc;
            }, []);

            for (const [tableName, finalTableQuery] of queries.entries()) {
                if (uniqueJoins.length) {
                    const appendedJoinColToTableQuery = addJoinColumnToSelect(
                        finalTableQuery,
                        `${tableName}.${refCol}`,
                        tableName
                    );

                    if (appendedJoinColToTableQuery)
                        queries.set(tableName, appendedJoinColToTableQuery);
                }
            }
            concatJoinString = uniqueJoins.length
                ? Array.from(queries.values()).join(joinBy) + joinOnField
                : Array.from(queries.values()).join(joinBy);
        } else {
            let result = uniqueJoins.reduce(
                (acc, { joinBy, joinOnField, refCol, between }, index) => {
                    if (queries.has(between[0]) && queries.has(between[1])) {
                        let orgStartTable = queries.get(between[0]);
                        let orgEndTable = queries.get(between[1]);

                        const startTable = addJoinColumnToSelect(
                            orgStartTable,
                            `${between[0]}.${refCol}`,
                            between[0]
                        );
                        const endTable = addJoinColumnToSelect(
                            orgEndTable,
                            `${between[1]}.${refCol}`,
                            between[1]
                        );

                        const concatTwoTable = [startTable, joinBy, endTable, joinOnField];

                        acc.push({
                            orgStartTable,
                            orgEndTable,
                            concatTwoTable,
                        });
                        if (index === 0) {
                        } else {
                            acc.forEach(
                                (
                                    { orgStartTable: vOrgStartTable, orgEndTable: vOrgEndTable },
                                    crtIdx
                                ) => {
                                    if (
                                        [vOrgStartTable, vOrgEndTable].includes(orgStartTable) &&
                                        crtIdx !== index
                                    ) {
                                        //last el of prev item;
                                        if (acc[crtIdx] && acc[index]) {
                                            const isStart =
                                                vOrgStartTable === orgStartTable ? 0 : 2;
                                            console.log(isStart);
                                            console.log(acc[crtIdx]);
                                            console.log(between[0]);
                                            console.log(between[1]);

                                            acc[crtIdx] = {
                                                ...acc[crtIdx],
                                                concatTwoTable: [
                                                    isStart === 0
                                                        ? addJoinColumnToSelect(
                                                              acc[crtIdx].concatTwoTable[0],
                                                              `${acc[crtIdx].concatTwoTable[0]
                                                                  .split('AS')[1]
                                                                  .trim()}.${refCol}`,
                                                              acc[crtIdx].concatTwoTable[0]
                                                                  .split('AS')[1]
                                                                  .trim()
                                                          )
                                                        : acc[crtIdx].concatTwoTable[0],
                                                    acc[crtIdx].concatTwoTable[1],
                                                    isStart === 2
                                                        ? addJoinColumnToSelect(
                                                              acc[crtIdx].concatTwoTable[2],
                                                              `${acc[crtIdx].concatTwoTable[2]
                                                                  .split('AS')[1]
                                                                  .trim()}.${refCol}`,
                                                              acc[crtIdx].concatTwoTable[2]
                                                                  .split('AS')[1]
                                                                  .trim()
                                                          )
                                                        : acc[crtIdx].concatTwoTable[2],
                                                    acc[crtIdx].concatTwoTable[3],
                                                ],
                                            };
                                            console.log(acc[index]);

                                            acc[index] = {
                                                ...acc[index],
                                                concatTwoTable: [
                                                    acc[index].concatTwoTable[1],
                                                    acc[index].concatTwoTable[2],
                                                    acc[index].concatTwoTable[3],
                                                ],
                                            };
                                        }
                                    }

                                    if (
                                        [vOrgStartTable, vOrgEndTable].includes(orgEndTable) &&
                                        crtIdx !== index
                                    ) {
                                        //last el of prev item;
                                        if (acc[index]) {
                                            acc[index] = {
                                                ...acc[index],
                                                concatTwoTable: [
                                                    acc[index].concatTwoTable[1],
                                                    acc[index].concatTwoTable[0],
                                                    acc[index].concatTwoTable[3],
                                                ],
                                            };
                                        }
                                    }
                                }
                            );
                        }
                    }
                    return acc;
                },
                []
            );
            //if field was added by addJoincolumn function will be not showned on select of final query string.
            result = result
                .map(({ concatTwoTable }, index) => {
                    if (index === 0) return concatTwoTable;
                    if (concatTwoTable[0].includes('SELECT')) return [',', ...concatTwoTable];
                    return concatTwoTable;
                })
                .flat();

            concatJoinString = result.join(' ');
        }
        let joinSelectParts = [];
        for (const [tableName, tableQuery] of queries.entries()) {
            const selectPart = tableQuery.split('FROM')[0].replace('(SELECT', '').trim();
            joinSelectParts.push(selectPart);
        }
        finalString = finalString.replace('*', joinSelectParts);

        const tablesNotJoinWithTheRest = [];

        Array.from(queries.keys()).forEach(tableName => {
            if (concatJoinString !== '' && !concatJoinString.includes(`AS ${tableName}`)) {
                tablesNotJoinWithTheRest.push(queries.get(tableName));
            }
        });
        if (tablesNotJoinWithTheRest.length)
            finalString += concatJoinString + ',' + tablesNotJoinWithTheRest.join(',');
        else finalString += concatJoinString;
        queries.size ? setQuery(finalString) : setQuery('');
    }, [tables]);

    function onMouseDown(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    return (
        <div style={{ marginRight: '50px' }}>
            <Draggable
                style={{ width: 'fit-content !important' }}
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
                        {crtProperties.map(({ COLUMN_NAME, CONSTRAINT_TYPE }, index) => {
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
                                            // onClick={onClick}
                                            onMouseDown={onMouseDown}
                                            value={crtTableName + '?' + COLUMN_NAME}
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
