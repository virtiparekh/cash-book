import "./Select.css";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => void;
  required?: boolean;
  disabled?: boolean;
};

function Select({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}: SelectProps) {
  return (
    <div className="select-group">

      <label className="select-label">

        {label}

        {required && (
          <span className="required-mark">
            *
          </span>
        )}

      </label>

      <select
        className="select-field"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}

export default Select;