import "./Sidebar.css";

function Sidebar() {

  return (

    <aside className="sidebar">

      <nav>

        <button className="sidebar-item active">
          Dashboard
        </button>

        <button className="sidebar-item">
          Transactions
        </button>

        <button className="sidebar-item">
          Members
        </button>

        <button className="sidebar-item">
          Reports
        </button>

        <button className="sidebar-item">
          Settings
        </button>

      </nav>

    </aside>

  );

}

export default Sidebar;