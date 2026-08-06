import "./Logo.css";

type LogoProps = {
  showSubtitle?: boolean;
};

function Logo({
  showSubtitle = true,
}: LogoProps) {
  return (
    <div className="app-logo">
      <svg
        className="logo-icon"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="8"
          y="6"
          width="48"
          height="52"
          rx="8"
          fill="#2563EB"
        />

        <rect
          x="14"
          y="12"
          width="36"
          height="40"
          rx="4"
          fill="#FFFFFF"
        />

        <text
          x="32"
          y="38"
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill="#10B981"
        >
          ₹
        </text>
      </svg>

      <div>
        <div className="logo-title">
          Family Cash Book
        </div>

        {showSubtitle && (
          <div className="logo-subtitle">
            Smart Shared Expense Tracker
          </div>
        )}
      </div>
    </div>
  );
}

export default Logo;