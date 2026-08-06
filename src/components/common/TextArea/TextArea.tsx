import "./TextArea.css";

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
}: TextAreaProps) {
  return (
    <div className="textarea-group">

      <label className="textarea-label">
        {label}

        {required && (
          <span className="required-mark">
            *
          </span>
        )}
      </label>

      <textarea
        className="textarea-field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
      />

    </div>
  );
}

export default TextArea;