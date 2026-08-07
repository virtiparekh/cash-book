import "./DashboardHeader.css";

type DashboardHeaderProps = {
  title: string;
  subtitle: string;
};

function DashboardHeader({
  title,
  subtitle,
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">

      <div>

        <h1>{title}</h1>

        <p>{subtitle}</p>

      </div>

    </header>
  );
}

export default DashboardHeader;