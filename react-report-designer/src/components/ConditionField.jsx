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

function ConditionField({field, register, index}) {
    const functions = ['COUNT', 'SUM', 'MIN', 'MAX', 'AVG'];
    const orders = ['ASC', 'DESC'];
    const operators = ['>', '<', '>=', '<=', '=', '<>'];
    function onFunctionChange() {}
    function handleChange() {}

    return (
        <div
            key={field.id}
            {...register(`test.${index}.value`)}
            style={{
                height: '60px',
                // border: '1px solid blue',
                borderRadius: '4px',
                marginBottom: '5px',
            }}
            className='normal-flex'
        >
            <FormControl sx={{ height: '100%' }}>
                <InputLabel htmlFor='component-outlined'>Tên trường</InputLabel>
                <OutlinedInput
                    id='component-outlined'
                    defaultValue='a'
                    label='Tên trường'
                    readOnly
                    size='medium'
                />
            </FormControl>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Hàm</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={functions[0]}
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

            <div>
                <FormControlLabel
                    control={<Checkbox onChange={handleChange} name='gilad' />}
                    label='Tham gia vào GROUP BY'
                />
            </div>

            <FormControl sx={{ m: 1, width: 200 }}>
                <InputLabel id='demo-multiple-checkbox-label'>Sắp xếp</InputLabel>
                <Select
                    labelId='demo-multiple-checkbox-label'
                    id='demo-multiple-checkbox'
                    value={orders[0]}
                    label='Sắp xếp'
                    size='small'
                >
                    {orders.map(order => (
                        <MenuItem key={order} value={order}>
                            <ListItemText primary={order} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div>
                <FormControl sx={{ m: 1, width: 200 }}>
                    <InputLabel id='demo-multiple-checkbox-label'>Sắp xếp</InputLabel>
                    <Select
                        labelId='demo-multiple-checkbox-label'
                        id='demo-multiple-checkbox'
                        value={operators[0]}
                        label='Truy vấn'
                        size='small'
                    >
                        {operators.map(operator => (
                            <MenuItem key={operator} value={operator}>
                                <ListItemText primary={operator} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <TextField id='demo-helper-text-misaligned-no-helper' label='Trường' size='medium' />
        </div>
    );
}

export default ConditionField;
