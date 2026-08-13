import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/products": "Products",
    "/categories": "Categories",
    "/suppliers": "Suppliers",
    "/stockin": "Stock In",
    "/stockout": "Stock Out",
    "/adjustment": "Stock Adjustment",
    "/users": "User Management",
  };

  const pageTitle = location.pathname.startsWith("/transactions/")
    ? "Transaction Detail"
    : pageTitles[location.pathname] || "Inventory Management";

  /*
   * Get user information
   *
   * Your login code stores individual values:
   * fullName
   * role
   *
   * We also support a stored "user" object
   * in case that format exists.
   */

  let fullName = localStorage.getItem("fullName");
  let role = localStorage.getItem("role");

  // Try reading the user object if individual values are missing
  if (!fullName || !role) {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);

        fullName = user.fullName;
        role = user.role;
      } catch (error) {
        console.error("Invalid user data in localStorage");
      }
    }
  }

  // Final fallback
  fullName = fullName || "User";
  role = role || "Staff";

  /*
   * Generate initials
   *
   * Sathya       -> S
   * Ravi Admin   -> RA
   * Ganesh Kumar -> GK
   */
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="navbar-container">
      {/* Page Title */}
      <div className="navbar-title">{pageTitle}</div>

      {/* Right Side */}
      <div className="navbar-right">
        {/* Avatar */}
        <div className="navbar-avatar">{initials}</div>

        {/* User Name */}
        <div className="navbar-user-name">{fullName}</div>

        {/* Role */}
        <div className="navbar-role">{role}</div>

        {/* Logout */}
        <button type="button" className="navbar-logout" onClick={handleLogout}>
          <span className="logout-icon">↪</span>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
