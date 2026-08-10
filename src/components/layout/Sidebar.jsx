function Sidebar() {
  return (
    <div
      style={{
        width: "250px",
        minWidth: "250px",
        flexShrink: 0,
        minHeight: "100vh",
        backgroundColor: "#18353A",
        color: "white",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      <h2>Inventory Manager</h2>

      <hr />

      <p>Dashboard</p>
      <p>Products</p>
      <p>Categories</p>
      <p>Suppliers</p>
      <p>Stock In</p>
      <p>Stock Out</p>
      <p>Adjustment</p>
      <p>Users</p>
    </div>
  );
}

export default Sidebar;