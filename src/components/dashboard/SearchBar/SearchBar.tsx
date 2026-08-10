import { FaSearch } from "react-icons/fa";

import "./SearchBar.css";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

function SearchBar({
  value,
  onChange,
}: SearchBarProps) {

  return (
    <div className="search-bar">

      <FaSearch
        className="search-icon"
      />

      <input
        type="text"
        value={value}
        placeholder="Search by amount or remark ..."
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label="Search transactions"
      />

    </div>
  );
}

export default SearchBar;