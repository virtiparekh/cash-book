import "./Alert.css";

import type { ReactNode } from "react";

type AlertProps = {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
};

type AlertVariant =
  | "success"
  | "error"
  | "warning"
  | "info";

function Alert({
  variant = "info",
  children,
  className = "",
}: AlertProps) {
  return (
    <div
      className={`app-alert app-alert--${variant} ${className}`}
    >
      {children}
    </div>
  );
}
export default Alert;