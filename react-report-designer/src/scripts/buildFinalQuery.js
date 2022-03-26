import { buildTableJoin, buildTableQuery, addJoinColumnToSelect } from '.';

export default function buildFinalQuery(tables) {
    let finalString = 'SELECT * FROM ';
    const desiredJoinBy = ' JOIN ';
    const queries = new Map(),
        allJoinableOfCrtTable = [];
    tables.forEach(({ tableQuery, tableName }) => {
        const buildedTableQuery = buildTableQuery(tables, tableName);
        if (buildedTableQuery) queries.set(tableName, `(${buildedTableQuery}) AS ${tableName}`);
    });
    tables.forEach(({ tableName }) => {
        allJoinableOfCrtTable.push(...buildTableJoin(tables, tableName, desiredJoinBy, queries));
    });

    const uniqueJoins = allJoinableOfCrtTable.reduce((acc, curr) => {
        if (!acc.some(e => e.joinOnField === curr.joinOnField)) acc.push(curr);
        return acc;
    }, []);

    const fieldNeedToExcludedFromFinalQuery = new Set([]);
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
                const [appendedJoinColToTableQuery, isModified] = addJoinColumnToSelect(
                    finalTableQuery,
                    `${tableName}.${refCol}`,
                    tableName
                );
                if (isModified) fieldNeedToExcludedFromFinalQuery.add(`${tableName}.${refCol}`);

                if (appendedJoinColToTableQuery)
                    queries.set(tableName, appendedJoinColToTableQuery);
            }
        }
        concatJoinString = uniqueJoins.length
            ? Array.from(queries.values()).join(joinBy) + joinOnField
            : Array.from(queries.values()).join(joinBy);
    } else {
        let result = uniqueJoins.reduce((acc, { joinBy, joinOnField, refCol, between }, index) => {
            if (queries.has(between[0]) && queries.has(between[1])) {
                let orgStartTable = queries.get(between[0]);
                let orgEndTable = queries.get(between[1]);

                const [startTable, isStartModified] = addJoinColumnToSelect(
                    orgStartTable,
                    `${between[0]}.${refCol}`,
                    between[0]
                );
                const [endTable, isEndModified] = addJoinColumnToSelect(
                    orgEndTable,
                    `${between[1]}.${refCol}`,
                    between[1]
                );
                if (isStartModified)
                    fieldNeedToExcludedFromFinalQuery.add(`${between[0]}.${refCol}`);
                if (isEndModified) fieldNeedToExcludedFromFinalQuery.add(`${between[1]}.${refCol}`);

                const concatTwoTable = [startTable, joinBy, endTable, joinOnField];

                acc.push({
                    orgStartTable,
                    orgEndTable,
                    concatTwoTable,
                });

                if (index === 0) {
                } else {
                    acc.forEach(
                        ({ orgStartTable: vOrgStartTable, orgEndTable: vOrgEndTable }, crtIdx) => {
                            if (
                                [vOrgStartTable, vOrgEndTable].includes(orgStartTable) &&
                                crtIdx !== index
                            ) {
                                //last el of prev item;
                                if (acc[crtIdx] && acc[index]) {
                                    const isStart = vOrgStartTable === orgStartTable ? 0 : 2;
                                    // console.log('--------------------------------------------');
                                    // console.log('orgStartTable');
                                    // console.log(`crtIndex ${crtIdx}: `, acc[crtIdx]);
                                    // console.log(`index ${index}: `, acc[index]);

                                    const [addColRef, isStartModified2] = addJoinColumnToSelect(
                                        acc[crtIdx].concatTwoTable[isStart],
                                        `${acc[crtIdx].concatTwoTable[isStart]
                                            .split('AS')[1]
                                            .trim()}.${refCol}`,
                                        acc[crtIdx].concatTwoTable[isStart].split('AS')[1].trim()
                                    );

                                    if (isStartModified2)
                                        fieldNeedToExcludedFromFinalQuery.add(
                                            `${acc[crtIdx].concatTwoTable[isStart]
                                                .split('AS')[1]
                                                .trim()}.${refCol}`
                                        );

                                    acc[crtIdx] = {
                                        ...acc[crtIdx],
                                        concatTwoTable: [
                                            isStart === 0
                                                ? addColRef
                                                : acc[crtIdx].concatTwoTable[0],
                                            acc[crtIdx].concatTwoTable[1],
                                            isStart === 2
                                                ? addColRef
                                                : acc[crtIdx].concatTwoTable[2],
                                            acc[crtIdx].concatTwoTable[3],
                                        ],
                                    };

                                    const indexConcatTwoTableLength =
                                        acc[index].concatTwoTable.length;
                                    if (indexConcatTwoTableLength === 4) {
                                        //remove select statement to join existing table
                                        acc[index].concatTwoTable.shift();

                                        const indexOfDuplicatedJoin = acc.findIndex(
                                            ({ concatTwoTable }, idx) => {
                                                if (
                                                    idx > crtIdx &&
                                                    idx < index &&
                                                    concatTwoTable[0].trim() === 'JOIN' &&
                                                    concatTwoTable[1] ===
                                                        acc[index].concatTwoTable[1]
                                                ) {
                                                    return idx;
                                                }
                                            }
                                        );
                                        console.log(indexOfDuplicatedJoin);

                                        if (indexOfDuplicatedJoin !== -1) {
                                            for (
                                                let i = crtIdx + 1;
                                                i <= indexOfDuplicatedJoin;
                                                i++
                                            ) {
                                                if (acc[i].concatTwoTable[0].includes('SELECT')) {
                                                    acc[i].concatTwoTable[0] =
                                                        ' JOIN ' +
                                                        acc[i].concatTwoTable[0] +
                                                        acc[indexOfDuplicatedJoin]
                                                            .concatTwoTable[2];

                                                    console.log(acc[index]);

                                                    //shift left

                                                    //store the rest of query
                                                    const shiftLeftArray = acc.filter(
                                                        (_, position) =>
                                                            position >= i &&
                                                            position < index &&
                                                            position !== indexOfDuplicatedJoin
                                                    );
                                                    acc[i] = acc[index];
                                                    acc = acc.filter((v, idx) => idx <= i);
                                                    // console.log(shiftLeftArray);
                                                    // console.log(acc[index]);

                                                    // acc[indexOfDuplicatedJoin] = acc[index];
                                                    // console.log('acc', acc);
                                                    shiftLeftArray.forEach(query =>
                                                        acc.push(query)
                                                    );
                                                    // acc[i] = acc[index];

                                                    console.log(acc);

                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    if (indexConcatTwoTableLength === 3) {
                                        //join
                                        acc[crtIdx] = {
                                            ...acc[crtIdx],
                                            concatTwoTable: [
                                                acc[crtIdx].concatTwoTable[1],
                                                acc[crtIdx].concatTwoTable[0],
                                                acc[crtIdx].concatTwoTable[3],
                                            ],
                                        };
                                        const [addColRefForJoinedTable, isModified3] =
                                            addJoinColumnToSelect(
                                                acc[index].concatTwoTable[1],
                                                `${acc[index].concatTwoTable[1]
                                                    .split('AS')[1]
                                                    .trim()}.${refCol}`,
                                                acc[index].concatTwoTable[1].split('AS')[1].trim()
                                            );
                                        if (isModified3)
                                            fieldNeedToExcludedFromFinalQuery.add(
                                                `${acc[index].concatTwoTable[1]
                                                    .split('AS')[1]
                                                    .trim()}.${refCol}`
                                            );
                                        // console.log(addColRefForJoinedTable);
                                        acc[index] = {
                                            ...acc[index],
                                            concatTwoTable: [
                                                acc[crtIdx].concatTwoTable[0],
                                                addColRefForJoinedTable,
                                                acc[crtIdx].concatTwoTable[2],
                                            ],
                                        };

                                        const temp = acc[index];
                                        acc[index] = acc[crtIdx];
                                        acc[crtIdx] = temp;
                                    }
                                }
                            }

                            if (
                                [vOrgStartTable, vOrgEndTable].includes(orgEndTable) &&
                                crtIdx !== index
                            ) {
                                //last el of prev item;
                                // console.log('orgEndTable');
                                // console.log(`crtIndex ${crtIdx}: `, acc[crtIdx]);
                                // console.log(`index ${index}: `, acc[index]);

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
                                if (acc[crtIdx] && acc[crtIdx].concatTwoTable.length === 3) {
                                    const [addColRefForJoinedTable, isModified3] =
                                        addJoinColumnToSelect(
                                            acc[crtIdx].concatTwoTable[1],
                                            `${acc[crtIdx].concatTwoTable[1]
                                                .split('AS')[1]
                                                .trim()}.${refCol}`,
                                            acc[crtIdx].concatTwoTable[1].split('AS')[1].trim()
                                        );
                                    if (isModified3)
                                        fieldNeedToExcludedFromFinalQuery.add(
                                            `${acc[index].concatTwoTable[1]
                                                .split('AS')[1]
                                                .trim()}.${refCol}`
                                        );

                                    acc[crtIdx] = {
                                        ...acc[crtIdx],
                                        concatTwoTable: [
                                            acc[crtIdx].concatTwoTable[0],
                                            addColRefForJoinedTable,
                                            acc[crtIdx].concatTwoTable[2],
                                        ],
                                    };
                                }
                            }
                        }
                    );
                }
            }
            return acc;
        }, []);
        //if field was added by addJoincolumn function will be not showned on select of final query string.
        console.log(result.map(({ concatTwoTable }) => concatTwoTable));
        result = result
            .map(({ concatTwoTable }, index) => {
                if (index === 0) return concatTwoTable;
                if (!concatTwoTable[0]?.includes('JOIN')) return [',', ...concatTwoTable];
                return concatTwoTable;
            })
            .flat();

        concatJoinString = result.join(' ');
    }
    let joinSelectParts = [];

    for (const [tableName, tableQuery] of queries.entries()) {
        let selectPart = tableQuery.split('FROM')[0].replace('(SELECT', '').trim();
        if (selectPart.includes(',')) {
            selectPart = selectPart
                .split(',')
                .reduce((acc, curr) => {
                    if (!fieldNeedToExcludedFromFinalQuery.has(curr.trim())) acc.push(curr);
                    return acc;
                }, [])
                .join(',');
        }
        joinSelectParts.push(selectPart);
    }
    finalString = finalString.replace('*', joinSelectParts.join(', '));

    const tablesNotJoinWithTheRest = [];

    Array.from(queries.keys()).forEach(tableName => {
        if (concatJoinString !== '' && !concatJoinString.includes(`AS ${tableName}`)) {
            tablesNotJoinWithTheRest.push(queries.get(tableName));
        }
    });
    if (tablesNotJoinWithTheRest.length)
        finalString += concatJoinString + ',' + tablesNotJoinWithTheRest.join(',');
    else finalString += concatJoinString;

    return queries.size ? finalString : '';
}
