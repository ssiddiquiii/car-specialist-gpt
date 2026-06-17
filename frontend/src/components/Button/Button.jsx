import { BUTTON_VARIANTS } from "../../constants/ui/button";

function Button({ children, variant = "primary", onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-lg px-6 py-3 font-medium transition ${BUTTON_VARIANTS[variant]}`}
    >
      {children}
    </button>
  );
}

export default Button;
