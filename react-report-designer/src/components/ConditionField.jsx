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
import { useSelector } from 'react-redux';

function ConditionField({ field, register, index, setQuery }) {
    const { tables } = useSelector(state => state.database);
    const functions = ['COUNT', 'SUM', 'MIN', 'MAX', 'AVG'];
    const orders = ['ASC', 'DESC'];
    const operators = ['>', '<', '>=', '<=', '=', '<>', 'LIKE', 'NOT LIKE'];
    function onFunctionChange() {}
    function handleChange() {}
    // console.log(field);
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
                    value={'Chọn'}
                    label='Hàm'
                    onChange={onFunctionChange}
                    size='small'
                >
                    <MenuItem key={'Chọn'} value={'Chọn'} readOnly>
                        <ListItemText primary={'Chọn'} />
                    </MenuItem>
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
                    value={'Chọn'}
                    label='Sắp xếp'
                    size='small'
                >
                    <MenuItem key={'Chọn'} value={'Chọn'} readOnly>
                        <ListItemText primary={'Chọn'} />
                    </MenuItem>
                    {orders.map(order => (
                        <MenuItem key={order} value={order}>
                            <ListItemText primary={order} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Nhập bảng</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={'Chọn'}
                    label='Sắp xếp'
                    size='small'
                >
                    <MenuItem key={'Chọn'} value={'Chọn'} readOnly>
                        <ListItemText primary={'Chọn'} />
                    </MenuItem>
                    {orders.map(order => (
                        <MenuItem key={order} value={order}>
                            <ListItemText primary={order} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Sắp xếp</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={'Chọn'}
                    label='Truy vấn'
                    size='small'
                >
                    <MenuItem key={'Chọn'} value={'Chọn'} readOnly>
                        <ListItemText primary={'Chọn'} />
                    </MenuItem>
                    {operators.map(operator => (
                        <MenuItem key={operator} value={operator}>
                            <ListItemText primary={operator} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <TextField id='demo-helper-text-misaligned-no-helper' label='Trường' size='small' />

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel htmlFor='component-outlined'>Tên cột</InputLabel>
                <OutlinedInput
                    id='component-outlined'
                    defaultValue={field.colName}
                    label='Tên cột'
                    readOnly
                    size='small'
                />
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel htmlFor='component-outlined'>Bảng</InputLabel>
                <OutlinedInput
                    id='component-outlined'
                    defaultValue={field.tableName}
                    label='Bảng'
                    readOnly
                    size='small'
                />
            </FormControl>
        </div>
    );
}

export default ConditionField;
