export default function buildTableJoin(tables, crtTable, desiredJoinBy, queries) {
    let allJoinableOfCrtTable = [];

    if (tables.length >= 2) {
        const { connectors } = tables.filter(({ tableName }) => tableName === crtTable)[0];
        tables.forEach(({ tableName, tableQuery: { fieldsInSelect, fieldsInFunction } }) => {
            if (tableName !== crtTable) {
                connectors.forEach(({ start, end, refColumn }) => {
                    if (
                        queries.get(start) &&
                        queries.get(end) &&
                        [start, end].includes(tableName) &&
                        (fieldsInSelect?.length || fieldsInFunction?.length)
                    ) {
                        allJoinableOfCrtTable.push({
                            joinBy: desiredJoinBy,
                            joinOnField: ` ON ${start}.${refColumn} = ${end}.${refColumn}`,
                            refCol: refColumn,
                            between: [start, end],
                        });
                    }
                });
            }
        });
    }

    return allJoinableOfCrtTable;
}
