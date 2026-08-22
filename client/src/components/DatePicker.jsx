import useRequiredField from "../hooks/useRequiredField";
import "/src/assets/styles/datepicker.css";

function DatePicker({ fieldName, id, value, onChange, required }) {
    const { showError, markTouched } = useRequiredField(value, required);
    return (
        <div className="datepicker">
        <label htmlFor={id}>{fieldName}</label>
        {required && <span className="requiredicon">*</span>}
        <input 
            type="date"
            id={id}
            value={value} 
            onChange={onChange} 
            required={required} 
            onBlur={markTouched}
        />
        {showError && <p className="error-text">This field is required.</p>}
        </div>
    );
}

export default DatePicker;