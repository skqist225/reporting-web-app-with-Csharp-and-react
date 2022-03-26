import React from 'react';
import {
    Checkbox,
    FormControl,
    FormControlLabel,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';
import { updateFieldsInWhere, updateFieldsInFunction } from '../features/databaseSlice';
import { functions, operators, orders } from './data_define/data_define';

function ConditionField({ field, register, index }) {
    const dispatch = useDispatch();
    const { tables } = useSelector(state => state.database);
    const [selectedOperator, setSelectedOperator] = React.useState('Chọn');
    const [selectedFunction, setSelectedFunction] = React.useState('Chọn');
    const [selectedOrderby, setSelectedOrderBy] = React.useState('Chọn');
    const [expression, setExpression] = React.useState('');

    let { colName, tableName, dataType } = field;
    dataType =
        dataType.toLowerCase() === 'nvarchar'
            ? 'nvarchar'
            : ['char', 'nchar', 'varchar'].includes(dataType)
            ? 'char'
            : 'number';
    let {
        tableQuery: { fieldsInWhere },
    } = tables.filter(({ tableName: tblName }) => tblName === tableName)[0];

    function onFunctionChange(e) {
        // setSelectedFunction(e.target.value);

        if (e.target.value !== 'Chọn') {
            dispatch(
                updateFieldsInFunction({
                    tableName: field.tableName,
                    fieldsInFunction: [
                        {
                            name: `${field.tableName}.${field.colName}`,
                            aggregateFunction: e.target.value,
                        },
                    ],
                })
            );
        } else {
            dispatch(
                updateFieldsInFunction({
                    tableName: field.tableName,
                    fieldsInFunction: [
                        //    {
                        //        name: `${field.tableName}.${field.colName}`,
                        //        aggregateFunction: e.target.value,
                        //    },
                    ],
                })
            );
        }
    }

    function onOrderByChange(e) {
        setSelectedOrderBy(e.target.value);
    }

    function onConditionChange(e) {
        setSelectedOperator(e.target.value);
        if (e.target.value === 'Chọn') {
            dispatch(
                updateFieldsInWhere({
                    tableName,
                    fieldsInWhere: fieldsInWhere.filter(
                        ({ name }) => name !== `${tableName}.${colName}`
                    ),
                })
            );
            setExpression('');
        } else {
            const stringTemplate =
                dataType === 'nvarchar'
                    ? `N'${expression}'`
                    : dataType.includes('char')
                    ? `'${expression}'`
                    : expression;

            const indexOfCrtFieldInWhere = fieldsInWhere.findIndex(
                ({ name }) => name === `${tableName}.${colName}`
            );
            if (indexOfCrtFieldInWhere !== -1) {
                dispatch(
                    updateFieldsInWhere({
                        tableName,
                        fieldsInWhere: fieldsInWhere.map((value, index) => {
                            if (index === indexOfCrtFieldInWhere)
                                return {
                                    ...value,
                                    conditon: e.target.value,
                                };

                            return value;
                        }),
                    })
                );
            } else {
                if (expression) {
                    dispatch(
                        updateFieldsInWhere({
                            tableName,
                            fieldsInWhere: [
                                ...fieldsInWhere,
                                {
                                    name: `${tableName}.${colName}`,
                                    conditon: e.target.value,
                                    expression: stringTemplate,
                                },
                            ],
                        })
                    );
                }
            }
        }
    }

    function onExpressionChange(e) {
        setExpression(e.target.value);

        if (selectedOperator && selectedOperator !== 'Chọn') {
            const stringTemplate =
                dataType === 'nvarchar'
                    ? `N'${e.target.value}'`
                    : dataType.includes('char')
                    ? `'${e.target.value}'`
                    : e.target.value;

            const indexOfCrtFieldInWhere = fieldsInWhere.findIndex(
                ({ name }) => name === `${tableName}.${colName}`
            );
            if (indexOfCrtFieldInWhere !== -1) {
                dispatch(
                    updateFieldsInWhere({
                        tableName,
                        fieldsInWhere: fieldsInWhere.map((value, index) => {
                            if (index === indexOfCrtFieldInWhere)
                                return {
                                    ...value,
                                    expression: stringTemplate,
                                };

                            return value;
                        }),
                    })
                );
            } else {
                dispatch(
                    updateFieldsInWhere({
                        tableName,
                        fieldsInWhere: [
                            ...fieldsInWhere,
                            {
                                name: `${tableName}.${colName}`,
                                conditon: selectedOperator,
                                expression: stringTemplate,
                            },
                        ],
                    })
                );
            }
        }
    }

    return (
        <div
            key={field.id}
            {...register(`test.${index}.value`)}
            style={{
                height: '60px',
                borderRadius: '4px',
                marginBottom: '5px',
            }}
            className='normal-flex'
        >
            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Hàm</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={selectedFunction}
                    label='Hàm'
                    onChange={onFunctionChange}
                    size='small'
                >
                    {functions.map(fn => (
                        <MenuItem key={fn} value={fn}>
                            <ListItemText primary={fn} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Sắp xếp</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={selectedOrderby}
                    label='Sắp xếp'
                    size='small'
                    onChange={onOrderByChange}
                >
                    {orders.map(order => (
                        <MenuItem key={order} value={order}>
                            <ListItemText primary={order} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <div className='normal-flex'>
                <FormControl sx={{ m: 1, width: 200 }}>
                    <InputLabel id='demo-multiple-checkbox-label'>Điều kiện truy vấn</InputLabel>
                    <Select
                        labelId='demo-multiple-checkbox-label'
                        id='demo-multiple-checkbox'
                        value={selectedOperator}
                        label='Điều kiện truy vấn'
                        size='small'
                        onChange={onConditionChange}
                    >
                        {operators.map(({ dataTypeCanUse, value }, index) => {
                            if (dataTypeCanUse.includes('*'))
                                return (
                                    <MenuItem key={value} value={value}>
                                        <ListItemText primary={value} />
                                    </MenuItem>
                                );
                            if (dataTypeCanUse.includes(dataType)) {
                                return (
                                    <MenuItem key={value} value={value}>
                                        <ListItemText primary={value} />
                                    </MenuItem>
                                );
                            }
                        })}
                    </Select>
                </FormControl>
                <TextField
                    id='demo-helper-text-misaligned-no-helper'
                    label='Giá trị'
                    size='small'
                    style={{ height: '100%' }}
                    value={expression}
                    onChange={onExpressionChange}
                />
            </div>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel htmlFor='component-outlined'>Tên cột</InputLabel>
                <OutlinedInput
                    id='component-outlined'
                    defaultValue={colName}
                    label='Tên cột'
                    readOnly
                    size='small'
                />
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel htmlFor='component-outlined'>Bảng</InputLabel>
                <OutlinedInput
                    id='component-outlined'
                    defaultValue={tableName}
                    label='Bảng'
                    readOnly
                    size='small'
                />
            </FormControl>
        </div>
    );
}

export default ConditionField;
