import Input from "../Input/Input";

type NumberInputProps = {
  label: string;
  value: number;
  onChange: (
    value: number
  ) => void;
  disabled?: boolean;
};

function NumberInput({
  label,
  value,
  onChange,
  disabled = false,
}: NumberInputProps) {
  return (
    <Input
      label={label}
      type="number"
      value={value.toString()}
      disabled={disabled}
      onChange={(event) =>
        onChange(
          Number(event.target.value)
        )
      }
    />
  );
}

export default NumberInput;