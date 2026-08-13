import "./TopHeader.css";

type TopHeaderProps = {
  userName: string;
  cashBookName: string;
  onLogout: () => void;

  onMenuClick: () => void;
  // sidebarOpen: boolean;
};

function TopHeader({
  userName,
  cashBookName,
  onLogout,
  onMenuClick,
  // sidebarOpen,
}: TopHeaderProps) {
  return (
    <header className="top-header">

      {/* -----------------------------------------
          Left
      ------------------------------------------ */}

      <div className="top-header__left">

        <button
          type="button"
          className="top-header__menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          ☰
        </button>

        <div className="top-header__logo">
          ₹
        </div>

        <div className="top-header__brand">
          Family Cash Book
        </div>

      </div>


      {/* -----------------------------------------
          Center
      ------------------------------------------ */}

      <div className="top-header__center">

        <select
          className="top-header__select"
          defaultValue={cashBookName}
        >
          <option value={cashBookName}>
            {cashBookName}
          </option>
        </select>

      </div>


      {/* -----------------------------------------
          Right
      ------------------------------------------ */}

      <div className="top-header__right">

        <div className="top-header__user">

          <div className="top-header__avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <span>
            {userName}
          </span>

        </div>

        <button
          type="button"
          className="top-header__logout"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default TopHeader;