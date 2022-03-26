export const functions = ['Chọn', 'COUNT', 'SUM', 'MIN', 'MAX', 'AVG'];
export const orders = ['Chọn', 'ASC', 'DESC'];

export const operators = [
    {
        dataTypeCanUse: ['*'],
        value: 'Chọn',
    },
    {
        dataTypeCanUse: ['number'],
        value: '>',
    },
    {
        dataTypeCanUse: ['number'],
        value: '<',
    },
    {
        dataTypeCanUse: ['number'],
        value: '>=',
    },
    {
        dataTypeCanUse: ['number'],
        value: '<=',
    },
    {
        dataTypeCanUse: ['number', 'char', 'nvarchar'],
        value: '=',
    },
    {
        dataTypeCanUse: ['number', 'char', 'nvarchar'],
        value: '<>',
    },
    {
        dataTypeCanUse: ['char', 'nvarchar'],
        value: 'LIKE',
    },
    {
        dataTypeCanUse: ['char', 'nvarchar'],
        value: 'NOT LIKE',
    },
    {
        dataTypeCanUse: ['number', 'char', 'nvarchar'],
        value: 'IN',
    },
    {
        dataTypeCanUse: ['number', 'char', 'nvarchar'],
        value: 'NOT IN',
    },
];
