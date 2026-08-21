import { useState } from "react";

function TextInput({ fieldName, placeholder, id, type}){
  const [ value, setValue ] = useState('');
  return(
    <div>
      <label htmlFor={id}>{fieldName}</label>
      <input id={id}
        type={type||'text'}
        value = {value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default TextInput;