export default function buildTableQuery(tables, crtTableName) {
    let finalQuery = '';
    tables.forEach(({ tableName, tableQuery }) => {
        if (tableName === crtTableName) {
            let queryParts = [];
            Object.keys(tableQuery).forEach(partName => {
                if (!tableQuery[partName]?.length) {
                    //continue
                } else {
                    let caseQuery = [];
                    switch (partName) {
                        case 'fieldsInSelect': {
                            queryParts.push({
                                partName,
                                content: tableQuery[partName].join(', '),
                            });
                            break;
                        }
                        case 'fieldsInFunction': {
                            tableQuery[partName].forEach(({ name, aggregateFunction }) => {
                                caseQuery.push(`${aggregateFunction}(${name})`);
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
            let haveFieldInSelect = false;
            if (queryParts.length) finalQuery = 'SELECT ';
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
                }
                if (!finalQuery.includes('FROM')) finalQuery += ` FROM ${crtTableName}`;

                if (partName === 'fieldsInWhere') {
                    finalQuery += ` WHERE ${content}`;
                }
                if (haveAggregateFunction) {
                    finalQuery += ` GROUP BY ${storedSelectFields}`;
                }
                if (partName === 'fieldsInOrderBy') {
                    finalQuery += ` ORDER BY ${content}`;
                }
            });
            return;
        }
    });

    return finalQuery;
}
