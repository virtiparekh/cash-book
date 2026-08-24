import "./TopHeader.css";

import type { CashBookGroup } from "../../../types/cashBook";

type TopHeaderProps = {
  userName: string;
  cashBookName: string;
  selectedCashBookId: string;
  cashBooks: CashBookGroup[];
  onCashBookChange: (cashBookId: string) => void;
  onLogout: () => void;
  onMenuClick: () => void;
};

function TopHeader({
  userName,
  // cashBookName,
  selectedCashBookId,
  cashBooks,
  onCashBookChange,
  onLogout,
  onMenuClick,
}: TopHeaderProps) {

  return (
    <header className="top-header">

      {/* LEFT */}

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


      {/* CENTER */}

      <div className="top-header__center">

        <select
          className="top-header__select"
          value={selectedCashBookId}
          onChange={(event) =>
            onCashBookChange(
              event.target.value
            )
          }
          aria-label="Select Cash Book"
        >

          {cashBooks.map((cashBook) => (

            <option
              key={cashBook.id}
              value={cashBook.id}
            >
              {cashBook.name}
            </option>

          ))}

        </select>

      </div>


      {/* RIGHT */}

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