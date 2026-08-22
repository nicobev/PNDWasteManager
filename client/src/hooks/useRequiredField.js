import { useState } from "react";

function useRequiredField(value, required) {
  const [touched, setTouched] = useState(false);
  const isEmpty = value === '' || value === null || value === undefined;
  const showError = required && touched && isEmpty;

  return { touched, showError, markTouched: () => setTouched(true) };
}

export default useRequiredField;