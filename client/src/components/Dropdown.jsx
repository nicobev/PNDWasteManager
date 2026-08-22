import useRequiredField from "../hooks/useRequiredField";
import "/src/assets/styles/dropdown.css";

function Dropdown({ fieldName, id, options, value, onChange, required }) {
  const { showError, markTouched } = useRequiredField(value, required);

  return (
    <div className="dropdown">
      <label htmlFor={id}>{fieldName}</label>
      {required && <span className="requiredicon">*</span>}
      <select
        id={id}
        value={value}
        onChange={(e) => { onChange(e); markTouched(); }}
        required={required}
      >
        <option value="">Select {fieldName}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {showError && <p className="error-text">This field is required.</p>}
    </div>
  );
}
export default Dropdown;