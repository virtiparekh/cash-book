import "./Button.css";

type ButtonVariant =
  | "primary"
  | "secondary";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit";
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: () => void;
};

function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
}: ButtonProps) {
  const className =
    variant === "primary"
      ? "primary-button"
      : "secondary-button";

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;