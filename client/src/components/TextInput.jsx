import { useState } from "react";
import "/src/assets/styles/textinput.css";

function TextInput({ fieldName, placeholder, id, type}){
  const [ value, setValue ] = useState('');
  return(
    <div className="textInput">
      <label htmlFor={id}>{fieldName}</label>
      <input id={id}
        type={type??'text'}
        value = {value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default TextInput;