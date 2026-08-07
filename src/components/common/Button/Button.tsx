import "./Button.css";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "success";

type ButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: ButtonVariant;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
};

function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) {

  return (
    <button
      type={type}
      disabled={disabled}
      className={`app-button app-button--${variant} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;