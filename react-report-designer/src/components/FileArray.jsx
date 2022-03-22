import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import ConditionField from './ConditionField';

function FieldArray() {
    const { control, register } = useForm();
    const { fields, append, prepend, remove, swap, move, insert } = useFieldArray({
        control, // control props comes from useForm (optional: if you are using FormContext)
        name: 'test', // unique name for your Field Array
    });

    return (
        <div>
            {fields.map((field, index) => (
                <ConditionField field={field} register={register} key={field.id} index={index}/>
            ))}

            <button type='button' onClick={() => append({ firstName: 'bill', lastName: 'luo' })}>
                Thêm
            </button>
        </div>
    );
}

export default FieldArray;
