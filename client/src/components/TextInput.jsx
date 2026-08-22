import { useState } from "react";
import "/src/assets/styles/textinput.css";

function TextInput({ fieldName, placeholder, id, type, required}){
  const [ value, setValue ] = useState('');
  const [touched, setTouched] = useState(false);

  const showError = required && touched && value.trim() === '';

  return(
    <div className="textInput">
      <label htmlFor={id}>{fieldName} {required&&<span className="requiredicon">*</span>}</label>
      <input id={id}
        type={type??'text'}
        value = {value}
        onChange={(e)=>setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
      />
      {showError && <p className="error-text">This field is required.</p>}
      
    </div>

  );
}

export default TextInput;