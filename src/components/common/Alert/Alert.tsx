import "./Alert.css";

type AlertVariant =
  | "success"
  | "error"
  | "warning"
  | "info";

type AlertProps = {
  variant?: AlertVariant;
  children: React.ReactNode;
};

function Alert({
  variant = "info",
  children,
}: AlertProps) {
  return (
    <div
      className={`app-alert app-alert--${variant}`}
    >
      {children}
    </div>
  );
}

export default Alert;