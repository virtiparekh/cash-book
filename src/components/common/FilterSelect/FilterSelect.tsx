import "./FilterSelect.css";

type FilterSelectProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string
  ) => void;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: FilterSelectProps) {

  return (

    <div className="filter-select">

      <label>

        {label}

      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >

        {options.map((option) => (

          <option
            key={option}
            value={option}
          >

            {option}

          </option>

        ))}

      </select>

    </div>

  );

}

export default FilterSelect;