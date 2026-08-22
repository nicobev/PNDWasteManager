import "/src/assets/styles/toggle.css";

function Toggle({ fieldName, id, value, onChange, onLabel, offLabel }) {
  const isOn = value === true || value === onLabel;

  const handleClick = () => {
    onChange(!isOn);
  };

  return (
    <div className="toggle">
      <label htmlFor={id}>{fieldName}</label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isOn}
        className={`toggle-switch ${isOn ? 'on' : 'off'}`}
        onClick={handleClick}
      >
        <span className="toggle-thumb" />
      </button>
      <span className="toggle-state-label">{isOn ? (onLabel ?? 'On') : (offLabel ?? 'Off')}</span>
    </div>
  );
}

export default Toggle;