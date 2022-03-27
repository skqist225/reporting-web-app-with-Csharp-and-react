export default function addJoinColumnToSelect(finalTableQuery, joinField) {
    if (finalTableQuery?.includes(joinField)) {
        return [finalTableQuery, false];
    } else {
        let selectPart = finalTableQuery.split('FROM')[0].replace('(SELECT', '').trim();
        return [
            `(SELECT ${selectPart + ', ' + joinField} FROM ${finalTableQuery.split('FROM').pop()}`,
            true,
        ];
    }
}
