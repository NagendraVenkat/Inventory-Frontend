import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const role = localStorage.getItem("role");

  const isAdmin = role === "Admin";
  const isStaff = role === "Staff";
  const isUser = role === "User";

  return (
    <aside className="sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          IM
        </div>

        <div className="brand-text">
          <div className="brand-title">
            Inventory Manager
          </div>

          <div className="brand-subtitle">
            Inventory System
          </div>
        </div>
      </div>


      {/* Navigation */}
      <nav className="sidebar-nav">

        {/* Dashboard */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▦</span>
          <span>Dashboard</span>
        </NavLink>


        {/* Products */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▤</span>
          <span>Products</span>
        </NavLink>


        {/* Categories */}
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▦</span>
          <span>Categories</span>
        </NavLink>


        {/* Suppliers */}
        <NavLink
          to="/suppliers"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <span className="nav-icon">▰</span>
          <span>Suppliers</span>
        </NavLink>


        {/* Staff + Admin */}
        {(isAdmin || isStaff) && (
          <>
            <div className="sidebar-section-title">
              STOCK
            </div>

            <NavLink
              to="/stockin"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">↓</span>
              <span>Stock In</span>
            </NavLink>


            <NavLink
              to="/stockout"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">↑</span>
              <span>Stock Out</span>
            </NavLink>
          </>
        )}


        {/* Admin Only */}
        {isAdmin && (
          <>
            <div className="sidebar-section-title">
              ADMIN
            </div>

            <NavLink
              to="/adjustment"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">±</span>
              <span>Adjustment</span>
            </NavLink>


            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">♙</span>
              <span>Users</span>
            </NavLink>
          </>
        )}

      </nav>


      {/* Current Role */}
      <div className="sidebar-footer">

        <div className="role-label">
          ROLE
        </div>

        <div className="role-value">
          {role || "User"}
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;