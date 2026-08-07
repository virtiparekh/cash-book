import "./CashBookToolbar.css";
import { useState } from "react";

import FilterSelect
  from "../../common/FilterSelect/FilterSelect";

type CashBookToolbarProps = {
  onCashIn: () => void;
  onCashOut: () => void;
};

function CashBookToolbar({
  onCashIn,
  onCashOut,
}: CashBookToolbarProps) {
  const [duration, setDuration] =
    useState("All Time");

  const [member, setMember] =
    useState("All Members");

  const [category, setCategory] =
    useState("All Categories");

  const [paymentMode, setPaymentMode] =
    useState("All Modes");

  return (

    <section className="cashbook-toolbar">

      <div className="toolbar-left">

        <FilterSelect
          label="Duration"
          value={duration}
          onChange={setDuration}
          options={[
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "All Time",
          ]}
        />

        <FilterSelect
          label="Member"
          value={member}
          onChange={setMember}
          options={[
            "All Members",
          ]}
        />

        <FilterSelect
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            "All Categories",
          ]}
        />

        <FilterSelect
          label="Payment"
          value={paymentMode}
          onChange={setPaymentMode}
          options={[
            "All Modes",
          ]}
        />

      </div>

      <div className="toolbar-right">

        <button
          className="cash-in"
          type="button"
          onClick={onCashIn}
        >
          Cash In
        </button>

        <button
          className="cash-out"
          type="button"
          onClick={onCashOut}
        >
          Cash Out
        </button>

      </div>

    </section>

  );

}

export default CashBookToolbar;