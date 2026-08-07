import {
  FaPlus,
  FaMinus,
  FaEquals,
} from "react-icons/fa";

import "./FinancialSummary.css";

type FinancialSummaryProps = {
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
};

function FinancialSummary({
  totalCashIn,
  totalCashOut,
  netBalance,
}: FinancialSummaryProps) {

  const formatCurrency = (
    amount: number
  ) => {

    return amount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

  };

  return (

    <section className="financial-summary">

      <div className="summary-item">

        <div className="summary-title">

          <div className="summary-icon cashin-icon">

            <FaPlus />

          </div>

          <span>
            Cash In
          </span>

        </div>

        <h2 className="summary-value">

          ₹ {formatCurrency(totalCashIn)}

        </h2>

      </div>

      <div className="summary-divider" />

      <div className="summary-item">

        <div className="summary-title">

          <div className="summary-icon cashout-icon">

            <FaMinus />

          </div>

          <span>
            Cash Out
          </span>

        </div>

        <h2 className="summary-value">

          ₹ {formatCurrency(totalCashOut)}

        </h2>

      </div>

      <div className="summary-divider" />

      <div className="summary-item">

        <div className="summary-title">

          <div className="summary-icon balance-icon">

            <FaEquals />

          </div>

          <span>
            Net Balance
          </span>

        </div>

        <h2
          className={
            netBalance >= 0
              ? "summary-value positive"
              : "summary-value negative"
          }
        >

          ₹ {formatCurrency(netBalance)}

        </h2>

      </div>

    </section>

  );

}

export default FinancialSummary;