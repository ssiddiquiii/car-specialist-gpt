function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  className = "",
  style = {},
  ...props
}) {
  const variantClass = variant === "primary" ? "btn-primary"
    : variant === "outline" ? "btn-outline"
    : "btn-primary";

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
