import { getDashboardSummary } from "../../services/dashboardService";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getDashboardSummary();

      if (!result.success) {
        setError(result.message || "Failed to load dashboard.");
        return;
      }

      setDashboard(result.data);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionClick = (transactionId) => {
    navigate(`/transactions/${transactionId}`);
  };

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================
       Loading
    ========================= */

  if (loading) {
    return <div className="dashboard-state">Loading dashboard...</div>;
  }

  /* =========================
       Error
    ========================= */

  if (error) {
    return <div className="dashboard-state dashboard-state-error">{error}</div>;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-page">
      {/* =====================================================
                SUMMARY CARDS
            ===================================================== */}

      <section className="summary-grid">
        {/* Total Products */}

        <div className="summary-card">
          <div className="summary-card-content">
            <p className="summary-card-title">TOTAL PRODUCTS</p>

            <h2 className="summary-card-value">{dashboard.totalProducts}</h2>

            <p className="summary-card-subtitle">Active products</p>
          </div>
        </div>

        {/* Stock Value */}

        <div className="summary-card">
          <div className="summary-card-content">
            <p className="summary-card-title">STOCK VALUE</p>

            <h2 className="summary-card-value stock-value">
              {formatCurrency(dashboard.totalStockValue)}
            </h2>

            <p className="summary-card-subtitle">At purchase price</p>
          </div>
        </div>

        {/* Low Stock */}

        <div className="summary-card">
          <div className="summary-card-content">
            <p className="summary-card-title">LOW STOCK ITEMS</p>

            <h2 className="summary-card-value summary-card-warning">
              {dashboard.lowStockCount}
            </h2>

            <p className="summary-card-subtitle">At/below reorder level</p>
          </div>
        </div>

        {/* Today's Transactions */}

        <div className="summary-card">
          <div className="summary-card-content">
            <p className="summary-card-title">TODAY'S TRANSACTIONS</p>

            <h2 className="summary-card-value">
              {dashboard.todayTransactions}
            </h2>

            <p className="summary-card-subtitle">Transactions today</p>
          </div>
        </div>
      </section>

      {/* =====================================================
                TABLE SECTION
            ===================================================== */}

      <section className="dashboard-tables-grid">
        {/* =================================================
                    LOW STOCK ALERTS
                ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-heading">
              <h2>
                <span className="alert-icon">⚠</span>
                Low Stock Alerts
              </h2>

              <p>Products at/below reorder level</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="dashboard-table low-stock-table">
              <colgroup>
                <col className="low-code-column" />
                <col className="low-product-column" />
                <col className="low-stock-column" />
                <col className="low-reorder-column" />
                <col className="low-status-column" />
              </colgroup>

              <thead>
                <tr>
                  <th>CODE</th>

                  <th>PRODUCT</th>

                  <th className="center-header">STOCK</th>

                  <th className="center-header">REORDER LVL</th>

                  <th className="center-header">STATUS</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.lowStocks && dashboard.lowStocks.length > 0 ? (
                  dashboard.lowStocks.map((product) => (
                    <tr key={product.productId || product.productCode}>
                      {/* Product Code */}
                      <td>
                        <span className="mono-text product-code">
                          {product.productCode}
                        </span>
                      </td>

                      {/* Product */}
                      <td>
                        <span className="product-name">
                          {product.productName}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="number-cell mono-text">
                        {product.currentStock}
                      </td>

                      {/* Reorder Level */}
                      <td className="number-cell mono-text">
                        {product.reorderLevel}
                      </td>

                      {/* Status */}
                      <td>
                        <span
                          className={
                            Number(product.currentStock) === 0
                              ? "status-badge status-danger"
                              : "status-badge status-warning"
                          }
                        >
                          {Number(product.currentStock) === 0
                            ? "Out of Stock"
                            : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-table-message">
                      No low stock products
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================
                    RECENT TRANSACTIONS
                ================================================= */}

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div className="dashboard-card-heading">
              <h2>Recent Transactions</h2>

              <p>Click a row → detail</p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="dashboard-table transactions-table">
              <colgroup>
                <col className="transaction-number-column" />
                <col className="transaction-type-column" />
                <col className="transaction-date-column" />
                <col className="transaction-total-column" />
              </colgroup>

              <thead>
                <tr>
                  <th>TRANSACTION</th>

                  <th className="center-header">TYPE</th>

                  <th>DATE</th>

                  <th className="right-header">TOTAL</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentTransactions &&
                dashboard.recentTransactions.length > 0 ? (
                  dashboard.recentTransactions.map((transaction) => {
                    const transactionType = String(
                      transaction.transactionType || "",
                    ).toLowerCase();

                    return (
                      <tr
                        key={transaction.transactionId}
                        className="clickable-row"
                        onClick={() =>
                          handleTransactionClick(transaction.transactionId)
                        }
                      >
                        {/* Transaction Number */}

                        <td>
                          <span className="transaction-number mono-text">
                            {transaction.transactionNumber}
                          </span>
                        </td>

                        {/* Transaction Type */}

                        <td className="center-cell">
                          <span
                            className={`transaction-chip transaction-${transactionType}`}
                          >
                            {transaction.transactionType}
                          </span>
                        </td>

                        {/* Date */}

                        <td>
                          <span className="transaction-date">
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </td>

                        {/* Total */}

                        <td className="right-cell">
                          <span className="transaction-total mono-text">
                            {formatCurrency(transaction.grandTotal)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="empty-table-message">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
