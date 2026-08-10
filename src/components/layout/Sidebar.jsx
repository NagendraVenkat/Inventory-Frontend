import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const role = localStorage.getItem("role");

  const isAdmin = role === "Admin";
  const isStaff = role === "Staff";

  return (
    <aside className="sidebar">
      {/* =========================
                Sidebar Brand
            ========================= */}

      <div className="sidebar-brand">
        <div className="sidebar-logo">IM</div>

        <div className="sidebar-brand-text">
          <h2>Inventory Manager</h2>
          <span>ABC Trading Co.</span>
        </div>
      </div>

      {/* =========================
                Navigation
            ========================= */}

      <nav className="sidebar-nav">
        {/* =========================
                    OVERVIEW
                ========================= */}

        <div className="nav-section">
          <div className="nav-section-title">OVERVIEW</div>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-grid-3x3-gap-fill"></i>
            <span>Dashboard</span>
          </NavLink>
        </div>

        {/* =========================
                    MASTERS
                    Available to all roles
                ========================= */}

        <div className="nav-section">
          <div className="nav-section-title">MASTERS</div>

          <NavLink
            to="/products"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-box-seam"></i>
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-list-columns"></i>
            <span>Categories</span>
          </NavLink>

          <NavLink
            to="/suppliers"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <i className="bi bi-truck"></i>
            <span>Suppliers</span>
          </NavLink>
        </div>

        {/* =========================
                    STOCK
                    Admin + Staff only
                ========================= */}

        {(isAdmin || isStaff) && (
          <div className="nav-section">
            <div className="nav-section-title">STOCK</div>

            <NavLink
              to="/stockin"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-arrow-down"></i>
              <span>Stock In</span>
            </NavLink>

            <NavLink
              to="/stockout"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-arrow-up"></i>
              <span>Stock Out</span>
            </NavLink>
          </div>
        )}

        {/* =========================
                    ADMIN
                    Admin only
                ========================= */}

        {isAdmin && (
          <div className="nav-section">
            <div className="nav-section-title">ADMIN</div>

            <NavLink
              to="/adjustment"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-sliders"></i>
              <span>Adjustment</span>
            </NavLink>

            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <i className="bi bi-person-circle"></i>
              <span>Users</span>
            </NavLink>
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
