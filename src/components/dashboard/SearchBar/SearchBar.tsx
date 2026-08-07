import { FaSearch } from "react-icons/fa";

import "./SearchBar.css";

function SearchBar() {

  return (

    <div className="search-bar">

      <FaSearch className="search-icon" />

      <input
        type="text"
        placeholder="Search by amount, remarks or category..."
      />

    </div>

  );

}

export default SearchBar;