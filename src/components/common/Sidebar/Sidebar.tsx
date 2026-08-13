import "./Sidebar.css";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onNavigate: (item: string) => void;
};

function Sidebar({
  isOpen,
  onClose,
  activeItem,
  onNavigate,
}: SidebarProps) {

  const handleNavigation = (
    item: string
  ) => {

    onNavigate(item);
    onClose();

  };

  return (
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar--open"
          : ""
      }`}
    >

      <nav>

        <button
          type="button"
          className={`sidebar-item ${
            activeItem === "Dashboard"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("Dashboard")
          }
        >
          <span className="sidebar-icon">
            ⌂
          </span>

          <span>
            Dashboard
          </span>
        </button>


        <button
          type="button"
          className={`sidebar-item ${
            activeItem === "Transactions"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("Transactions")
          }
        >
          <span className="sidebar-icon">
            ↔
          </span>

          <span>
            Transactions
          </span>
        </button>


        <button
          type="button"
          className={`sidebar-item ${
            activeItem === "Members"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("Members")
          }
        >
          <span className="sidebar-icon">
            👥
          </span>

          <span>
            Members
          </span>
        </button>


        <button
          type="button"
          className={`sidebar-item ${
            activeItem === "Reports"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("Reports")
          }
        >
          <span className="sidebar-icon">
            ▥
          </span>

          <span>
            Reports
          </span>
        </button>


        <button
          type="button"
          className={`sidebar-item ${
            activeItem === "Settings"
              ? "active"
              : ""
          }`}
          onClick={() =>
            handleNavigation("Settings")
          }
        >
          <span className="sidebar-icon">
            ⚙
          </span>

          <span>
            Settings
          </span>
        </button>

      </nav>

    </aside>
  );
}

export default Sidebar;