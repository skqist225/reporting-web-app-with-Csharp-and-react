export default function buildTableJoin(tables, tblName, desiredJoinBy) {
    let joinBy = ',';
    let joinOnField = '';
    let refCol = '';
    if (tables.length >= 2) {
        let isCrtTableHavingFieldOnSelect = false;
        const {
            tableQuery: { fieldsInSelect, fieldsInFunction },
        } = tables.filter(({ tableName }) => tableName === tblName)[0];
        if (fieldsInSelect?.length || fieldsInFunction?.length)
            isCrtTableHavingFieldOnSelect = true;

        console.log(tblName);

        tables.forEach(({ connectors, tableName, tableQuery }) => {
            if (isCrtTableHavingFieldOnSelect && tableName !== tblName) {
                connectors.forEach(({ start, end, refColumn }) => {
                    console.log({ start, end, refColumn });
                    if ([start, end].includes(tblName)) {
                        joinBy = desiredJoinBy;
                        joinOnField = ` ON ${start}.${refColumn} = ${end}.${refColumn}`;
                        refCol = refColumn;
                    }
                });
            }
        });
    }

    return [joinBy, joinOnField, refCol];
}
