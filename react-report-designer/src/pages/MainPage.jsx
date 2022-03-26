import React, { useEffect, useState } from 'react';
import { Fab, TextareaAutosize } from '@mui/material';

import ConditionArray from '../components/ConditionArray';
import { useFieldArray, useForm } from 'react-hook-form';
import NavigationIcon from '@mui/icons-material/Navigation';
import ListTableName from '../components/ListTableName';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTableNames, isValidQuery } from '../features/databaseSlice';
import DraggableTable from '../components/DraggableTable';
import addJoinColumnToSelect from '../scripts/addJoinColumnToSelect';
import buildTableJoin from '../scripts/buildTableJoin';
import buildTableQuery from '../scripts/buildTableQuery';

function MainPage() {
    const dispatch = useDispatch();
    const [query, setQuery] = useState('');
    const { tableNames, tables, isValid } = useSelector(state => state.database);
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
                '_blank' // <- This is what makes it open in a new window.
            );
        }
        if (isValid === false) {
            alert('query is invalid;');
        }
    }, [isValid]);

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
                                            // console.log('orgStartTable');
                                            // console.log(`crtIndex ${crtIdx}: `, acc[crtIdx]);
                                            // console.log(`index ${index}: `, acc[index]);

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

                                            const indexConcatTwoTableLength =
                                                acc[index].concatTwoTable.length;
                                            if (indexConcatTwoTableLength === 4)
                                                acc[index] = {
                                                    ...acc[index],
                                                    concatTwoTable: [
                                                        acc[index].concatTwoTable[1],
                                                        acc[index].concatTwoTable[2],
                                                        acc[index].concatTwoTable[3],
                                                    ],
                                                };
                                            if (indexConcatTwoTableLength === 3) {
                                                acc[crtIdx] = {
                                                    ...acc[crtIdx],
                                                    concatTwoTable: [
                                                        acc[crtIdx].concatTwoTable[1],
                                                        acc[crtIdx].concatTwoTable[0],
                                                        acc[crtIdx].concatTwoTable[3],
                                                    ],
                                                };

                                                const temp = acc[index];
                                                acc[index] = acc[crtIdx];
                                                acc[crtIdx] = temp;
                                                // console.log(`index : ${index}`, acc[index]);
                                                // console.log(`crtIndex : ${crtIdx}`, acc[crtIdx]);
                                            }
                                        }
                                    }

                                    if (
                                        [vOrgStartTable, vOrgEndTable].includes(orgEndTable) &&
                                        crtIdx !== index
                                    ) {
                                        // console.log('orgEndTable');
                                        // console.log(`crtIndex ${crtIdx}: `, acc[crtIdx]);
                                        // console.log(`index ${index}: `, acc[index]);

                                        //last el of prev item;
                                        if (acc[index] && acc[index].concatTwoTable.length === 4) {
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
                    console.log('concatTwoTable: ', concatTwoTable);
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
        console.log(tablesNotJoinWithTheRest);
        if (tablesNotJoinWithTheRest.length)
            finalString += concatJoinString + ',' + tablesNotJoinWithTheRest.join(',');
        else finalString += concatJoinString;

        queries.size ? setQuery(finalString) : setQuery('');
    }, [tables]);

    return (
        <main>
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
                        }}
                        defaultValue={query}
                        readOnly
                    />
                    <div style={{ position: 'absolute', bottom: '0', right: '0' }}>
                        <Fab
                            variant='extended'
                            color='primary'
                            aria-label='add'
                            onClick={printReport}
                        >
                            <NavigationIcon sx={{ mr: 1 }} />
                            In báo cáo
                        </Fab>
                    </div>
                </div>
                <div style={{ height: '269px', overflowY: 'scroll' }}>
                    <ConditionArray fields={fields} register={register} setQuery={setQuery} />
                </div>
                <div className='normal-flex' style={{ height: '100%' }}>
                    <div>{tableNames && <ListTableName tableNames={tableNames} />}</div>
                    <article
                        className='flex'
                        style={{
                            boxShadow: 'rgb(0 0 0 / 28%) 0px 8px 28px',
                            height: '500px',
                            width: '100%',
                            border: '1px solid red',
                        }}
                    >
                        <div className='normal-flex'>
                            {tables.map(table => (
                                <DraggableTable
                                    table={table}
                                    key={table.tableName}
                                    append={append}
                                    remove={remove}
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
