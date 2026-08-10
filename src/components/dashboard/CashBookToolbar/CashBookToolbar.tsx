import "./CashBookToolbar.css";
import { useState } from "react";

import FilterSelect
  from "../../common/FilterSelect/FilterSelect";

type CashBookToolbarProps = {
  onCashIn: () => void;
  onCashOut: () => void;

  members: string[];
  categories: string[];
  paymentModes: string[];

  onFiltersChange: (
    filters: {
      duration: string;
      member: string;
      category: string;
      paymentMode: string;
      fromDate: string;
      toDate: string;
    }
  ) => void;
};

function CashBookToolbar({
  onCashIn,
  onCashOut,
  members,
  categories,
  paymentModes,
  onFiltersChange,
}: CashBookToolbarProps) {

  const [duration, setDuration] =
    useState("All Time");

  const [member, setMember] =
    useState("All Members");

  const [category, setCategory] =
    useState("All Categories");

  const [paymentMode, setPaymentMode] =
    useState("All Modes");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");


  const updateFilters = (
    nextFilters: {
      duration?: string;
      member?: string;
      category?: string;
      paymentMode?: string;
      fromDate?: string;
      toDate?: string;
    }
  ) => {

    const updatedFilters = {

      duration:
        nextFilters.duration ??
        duration,

      member:
        nextFilters.member ??
        member,

      category:
        nextFilters.category ??
        category,

      paymentMode:
        nextFilters.paymentMode ??
        paymentMode,

      fromDate:
        nextFilters.fromDate ??
        fromDate,

      toDate:
        nextFilters.toDate ??
        toDate,

    };

    onFiltersChange(
      updatedFilters
    );

  };


  const handleDurationChange = (
    value: string
  ) => {

    setDuration(value);

    /*
     * If user leaves Custom Range,
     * clear the custom dates.
     */
    if (value !== "Custom Range") {

      setFromDate("");
      setToDate("");

      onFiltersChange({

        duration: value,

        member,

        category,

        paymentMode,

        fromDate: "",

        toDate: "",

      });

      return;

    }

    updateFilters({
      duration: value,
    });

  };


  const handleMemberChange = (
    value: string
  ) => {

    setMember(value);

    updateFilters({
      member: value,
    });

  };


  const handleCategoryChange = (
    value: string
  ) => {

    setCategory(value);

    updateFilters({
      category: value,
    });

  };


  const handlePaymentModeChange = (
    value: string
  ) => {

    setPaymentMode(value);

    updateFilters({
      paymentMode: value,
    });

  };


  const handleFromDateChange = (
    value: string
  ) => {

    setFromDate(value);

    updateFilters({
      fromDate: value,
    });

  };


  const handleToDateChange = (
    value: string
  ) => {

    setToDate(value);

    updateFilters({
      toDate: value,
    });

  };

  const handleClearFilters = () => {
  setDuration("All Time");
  setMember("All Members");
  setCategory("All Categories");
  setPaymentMode("All Modes");

  onFiltersChange({
    duration: "All Time",
    member: "All Members",
    category: "All Categories",
    paymentMode: "All Modes",
    fromDate:"",
    toDate:""
  });
};


  return (

    <section
      className="cashbook-toolbar"
    >

      <div className="toolbar-left">

        <FilterSelect

          label="Duration"

          value={duration}

          onChange={
            handleDurationChange
          }

          options={[
            "Today",
            "This Week",
            "This Month",
            "This Year",
            "Custom Range",
            "All Time",
          ]}

        />


        {duration ===
          "Custom Range" && (

          <div className="custom-date-range">

            <div className="custom-date-field">

              <label>
                From
              </label>

              <input

                type="date"

                value={fromDate}

                onChange={(event) =>
                  handleFromDateChange(
                    event.target.value
                  )
                }

              />

            </div>


            <div className="custom-date-field">

              <label>
                To
              </label>

              <input

                type="date"

                value={toDate}

                min={fromDate || undefined}

                onChange={(event) =>
                  handleToDateChange(
                    event.target.value
                  )
                }

              />

            </div>

          </div>

        )}


        <FilterSelect

          label="Member"

          value={member}

          onChange={
            handleMemberChange
          }

          options={[
            "All Members",
            ...members,
          ]}

        />


        <FilterSelect

          label="Category"

          value={category}

          onChange={
            handleCategoryChange
          }

          options={[
            "All Categories",
            ...categories,
          ]}

        />


        <FilterSelect

          label="Payment"

          value={paymentMode}

          onChange={
            handlePaymentModeChange
          }

          options={[
            "All Modes",
            ...paymentModes,
          ]}

        />

      </div>


      <div className="toolbar-right">

  <button
    type="button"
    className="clear-filters-button"
    onClick={handleClearFilters}
    title="Clear all filters"
  >
    ↻ Clear Filters
  </button>

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