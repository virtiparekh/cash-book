import "./TopHeader.css";

type TopHeaderProps = {
  userName: string;
  cashBookName: string;
  onLogout: () => void;
};

function TopHeader({
  userName,
  cashBookName,
  onLogout,
}: TopHeaderProps) {
  return (
    <header className="top-header">

      <div className="top-header__left">

        <div className="top-header__logo">
          ₹
        </div>

        <div className="top-header__brand">
          Family Cash Book
        </div>

      </div>

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