export default function buildTableQuery(tables, crtTableName) {
    let finalQuery = '';
    tables.forEach(({ tableName, tableQuery }) => {
        if (!tableQuery.fieldsInSelect.length && !tableQuery.fieldsInFunction.length) {
            return;
        }
        if (tableName === crtTableName) {
            let queryParts = [];
            Object.keys(tableQuery).forEach(partName => {
                if (!tableQuery[partName]?.length) {
                    //continue
                } else {
                    let caseQuery = [];
                    switch (partName) {
                        case 'fieldsInSelect': {
                            console.log(tableQuery[partName])
                            let unhiddenFields = tableQuery[partName].filter(field => !field.includes(':hidden'));
                            console.log(unhiddenFields)
                            queryParts.push({
                                partName,
                                content: unhiddenFields.length ? unhiddenFields.join(', ') : '',
                            });
                            break;
                        }
                        case 'fieldsInFunction': {
                            tableQuery[partName].forEach(({ name, aggregateFunction }) => {
                                caseQuery.push(
                                    `${aggregateFunction}(${name}) AS ${aggregateFunction}_${name
                                        .split('.')
                                        .pop()}`
                                );
                            });
                            queryParts.push({
                                partName,
                                content: caseQuery.join(', '),
                            });

                            break;
                        }
                        case 'fieldsInWhere': {
                            tableQuery[partName].forEach(({ name, conditon, expression }) => {
                                caseQuery.push(`${name} ${conditon} ${expression}`);
                            });
                            queryParts.push({
                                partName,
                                content: caseQuery.join(' AND '),
                            });
                            break;
                        }
                        case 'fieldsInOrderBy': {
                            tableQuery[partName].forEach(({ name, order }) => {
                                caseQuery.push(`${name} ${order}`);
                            });

                            queryParts.push({
                                partName,
                                content: caseQuery.join(', '),
                            });
                            break;
                        }
                    }
                }
            });

            let haveAggregateFunction = false;
            let storedSelectFields = '';
            let storeOrderByFields = '';
            let storedWhereFields = '';
            let haveFieldInSelect = false;
            if (queryParts.length) finalQuery = 'SELECT ';
            console.log('queryParts: ', queryParts)
            queryParts.forEach(({ partName, content }) => {
                switch (partName) {
                    case 'fieldsInSelect': {
                        finalQuery += content;
                        storedSelectFields = content;
                        haveFieldInSelect = true;
                        break;
                    }
                    case 'fieldsInFunction': {
                        finalQuery += haveFieldInSelect ? `, ${content}` : content;
                        haveAggregateFunction = true;
                        break;
                    }
                    case 'fieldsInWhere': {
                        storedWhereFields = ` WHERE ${content}`;
                        break;
                    }
                    // case 'fieldsInOrderBy': {
                    //     storeOrderByFields = ` ORDER BY ${content}`;
                    //     break;
                    // }
                }
            });
            if (!finalQuery.includes('FROM')) finalQuery += ` FROM ${crtTableName}`;
            finalQuery += storedWhereFields;
            if (haveAggregateFunction) {
                if (storedSelectFields) finalQuery += ` GROUP BY ${storedSelectFields}`;
                else {
                    const fieldsInFunction = tableQuery['fieldsInFunction']
                        .map(({ name }) => name)
                        .join(', ');
                    finalQuery += ` GROUP BY ${fieldsInFunction}`;
                }
            }
            finalQuery += storeOrderByFields;
            return;
        }
    });

    return finalQuery;
}
