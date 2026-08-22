import useRequiredField from "../hooks/useRequiredField";
import "/src/assets/styles/textinput.css";

function TextInput({ fieldName, placeholder, id, type, required, value, onChange }){
  const { showError, markTouched } = useRequiredField(value, required);

  return(
    <div className="textInput">
      <label htmlFor={id}>{fieldName} {required&&<span className="requiredicon">*</span>}</label>
      <input id={id}
        type={type??'text'}
        value = {value}
        onChange={onChange}
        onBlur={markTouched}
        placeholder={placeholder}
      />
      {showError && <p className="error-text">This field is required.</p>}
      
    </div>

  );
}

export default TextInput;