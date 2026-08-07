import "./SummaryCard.css";

import type { ReactNode } from "react";

type SummaryCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  color?: string;
};

function SummaryCard({
  title,
  value,
  icon,
  color = "#2563eb",
}: SummaryCardProps) {
  return (
    <div className="summary-card">

      <div
        className="summary-card-icon"
        style={{
          backgroundColor: color,
        }}
      >
        {icon}
      </div>

      <div className="summary-card-content">

        <p className="summary-card-title">
          {title}
        </p>

        <h2 className="summary-card-value">
          {value}
        </h2>

      </div>

    </div>
  );
}

export default SummaryCard;