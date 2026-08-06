import { useState } from "react";
import "./Input.css";
import {
  EyeIcon,
  EyeOffIcon,
} from "./EyeIcons";

type InputProps = {
  label: string;
  type?: React.HTMLInputTypeAttribute;
  value: string | number;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
};

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  className = "",
}: InputProps) {

  const [showPassword, setShowPassword] =
    useState(false);

  const isPassword =
    type === "password";

  return (
    <div className={`input-group ${className}`}>

      <label className="input-label">

        {label}

        {required && (
          <span className="required-mark">
            *
          </span>
        )}

      </label>

      <div className="input-wrapper">

        <input
          className="input-field"
          type={
            isPassword
              ? (
                showPassword
                  ? "text"
                  : "password"
              )
              : type
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
        />

        {isPassword && (

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            tabIndex={-1}
          >

            {showPassword ? (
              <EyeOffIcon />
            ) : (
              <EyeIcon />
            )}

          </button>

        )}

      </div>

    </div>
  );
}

export default Input;