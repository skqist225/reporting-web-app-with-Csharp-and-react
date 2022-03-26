export default function addJoinColumnToSelect(finalTableQuery, joinField, tableName) {
    if (finalTableQuery?.includes(joinField)) {
        return [finalTableQuery, false];
    } else {
        const selectPart =
            finalTableQuery.split('FROM')[0].replace('(SELECT', '').trim() + `, ${joinField}`;
        console.log(selectPart);
        return [`(SELECT ${selectPart} FROM ${finalTableQuery.split('FROM').pop()}`, true];
    }
}
