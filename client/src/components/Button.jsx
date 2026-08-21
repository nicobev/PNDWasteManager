import "/src/assets/styles/button.css";

function Button({ buttonText, id, type, onClick }){
  return(
    <button className="button" id={id} type={type??'button'} onClick={onClick}>
        {buttonText}
    </button>
  );
}

export default Button;