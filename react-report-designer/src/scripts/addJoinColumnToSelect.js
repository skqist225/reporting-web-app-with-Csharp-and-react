export default function addJoinColumnToSelect(finalTableQuery, joinField, tableName) {
    if (finalTableQuery?.includes(joinField)) {
        return finalTableQuery;
    } else {
        const selectPart =
            finalTableQuery.split('FROM')[0].replace('(SELECT', '').trim() + `, ${joinField}`;

        return `(SELECT ${selectPart} FROM ${tableName}) AS ${tableName}`;
    }
}
