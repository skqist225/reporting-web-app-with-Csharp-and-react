import ConditionField from './ConditionField';

function ConditionArray({ fields, register, setQuery }) {
    return (
        <div>
            {fields.map((field, index) => (
                <ConditionField
                    field={field}
                    register={register}
                    key={field.id}
                    index={index}
                    setQuery={setQuery}
                />
            ))}
        </div>
    );
}

export default ConditionArray;
