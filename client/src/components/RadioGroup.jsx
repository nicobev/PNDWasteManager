import "/src/assets/styles/radiobutton.css";

function RadioGroup({ fieldName, name, options, value, onChange, required }) {
  return (
    <div className="radiogroup">
      <label>{fieldName}</label>
      {required && <span className="requiredicon">*</span>}
      <div className="radio-options">
        {options.map((opt) => (
          <label key={opt.value} htmlFor={`${name}-${opt.value}`}>
            <input
              type="radio"
              id={`${name}-${opt.value}`}
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={onChange}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

export default RadioGroup;