import "/src/assets/styles/button.css";

function Button({ buttonText, id, type, onClick, style }){
  return(
    <button className="button" id={id} type={type??'button'} onClick={onClick} style={style}>
        {buttonText}
    </button>
  );
}

export default Button;