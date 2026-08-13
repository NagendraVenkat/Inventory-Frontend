import { getDashboardSummary } from "../../services/dashboardService";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [transactionsLoading, setTransactionsLoading] = useState(false);

  const [error, setError] = useState("");

  const [transactionPage, setTransactionPage] = useState(
    location.state?.transactionPage || 1,
  );

  const transactionPageSize = 5;

  // =========================================================
  // INITIAL DASHBOARD LOAD
  // =========================================================

  useEffect(() => {
    loadInitialDashboard();
  }, []);

  // =========================================================
  // LOAD TRANSACTIONS WHEN PAGE CHANGES
  // =========================================================

  useEffect(() => {
    if (dashboard !== null) {
      loadTransactions(transactionPage);
    }
  }, [transactionPage]);

  // =========================================================
  // INITIAL DASHBOARD
  // =========================================================

  const loadInitialDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      // IMPORTANT:
      // Load the page that the user was previously viewing.
      //
      // If the user came back from page 3,
      // page 3 transactions will be loaded directly.
      const result = await getDashboardSummary(
        transactionPage,
        transactionPageSize,
      );

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

  // =========================================================
  // LOAD ONLY RECENT TRANSACTIONS
  // =========================================================

  const loadTransactions = async (pageNumber) => {
    try {
      setTransactionsLoading(true);

      const result = await getDashboardSummary(pageNumber, transactionPageSize);

      if (!result.success) {
        console.error(result.message || "Failed to load transactions.");
        return;
      }

      // Keep the existing dashboard data.
      // Replace ONLY recentTransactions.
      setDashboard((previousDashboard) => ({
        ...previousDashboard,
        recentTransactions: result.data.recentTransactions,
      }));
    } catch (error) {
      console.error("Recent transactions error:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  // =========================================================
  // TRANSACTION CLICK
  // =========================================================

  const handleTransactionClick = (transactionId) => {
    navigate(`/transactions/${transactionId}`, {
      state: {
        transactionPage: transactionPage,
      },
    });
  };

  // =========================================================
  // PREVIOUS PAGE
  // =========================================================

  const handlePreviousPage = () => {
    if (transactionPage > 1) {
      setTransactionPage((previousPage) => previousPage - 1);
    }
  };

  // =========================================================
  // NEXT PAGE
  // =========================================================

  const handleNextPage = () => {
    if (
      dashboard?.recentTransactions &&
      transactionPage < dashboard.recentTransactions.totalPages
    ) {
      setTransactionPage((previousPage) => previousPage + 1);
    }
  };

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (loading) {
    return <div className="dashboard-state">Loading dashboard...</div>;
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return <div className="dashboard-state dashboard-state-error">{error}</div>;
  }

  if (!dashboard) {
    return null;
  }

  const recentTransactions = dashboard.recentTransactions;

  const transactions = recentTransactions?.items || [];

  return (
    <div className="dashboard-page">
      {/* =====================================================
        DASHBOARD HEADER
    ===================================================== */}

      <div className="dashboard-header">
        <h1>Inventory Dashboard</h1>

        <p>
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>

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

            {dashboard.todayTransactions > 0 && (
              <p className="summary-card-subtitle today-transaction-breakdown">
                <span className="today-in">{dashboard.todayStockIn} IN</span>

                {" | "}

                <span className="today-out">{dashboard.todayStockOut} OUT</span>

                {" | "}

                <span className="today-adjust">
                  {dashboard.todayAdjustments} ADJ
                </span>
              </p>
            )}
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
                      <td>
                        <span className="mono-text product-code">
                          {product.productCode}
                        </span>
                      </td>

                      <td>
                        <span className="product-name">
                          {product.productName}
                        </span>
                      </td>

                      <td className="number-cell mono-text">
                        {product.currentStock}
                      </td>

                      <td className="number-cell mono-text">
                        {product.reorderLevel}
                      </td>

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
                {transactionsLoading ? (
                  <tr>
                    <td colSpan="4" className="transaction-loading-message">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => {
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
                        <td>
                          <span className="transaction-number mono-text">
                            {transaction.transactionNumber}
                          </span>
                        </td>

                        <td className="center-cell">
                          <span
                            className={`transaction-chip transaction-${transactionType}`}
                          >
                            {transaction.transactionType}
                          </span>
                        </td>

                        <td>
                          <span className="transaction-date">
                            {formatDate(transaction.transactionDate)}
                          </span>
                        </td>

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

          {/* =================================================
              PAGINATION
          ================================================= */}

          {recentTransactions && recentTransactions.totalPages > 1 && (
            <div className="transaction-pagination">
              <span className="transaction-pagination-info">
                Page <strong>{transactionPage}</strong> of{" "}
                <strong>{recentTransactions.totalPages}</strong>
              </span>

              <div className="transaction-pagination-buttons">
                <button
                  type="button"
                  className="transaction-pagination-button"
                  onClick={handlePreviousPage}
                  disabled={transactionPage === 1 || transactionsLoading}
                >
                  ← Previous
                </button>

                <span className="transaction-pagination-page">
                  {transactionPage}
                </span>

                <button
                  type="button"
                  className="transaction-pagination-button"
                  onClick={handleNextPage}
                  disabled={
                    transactionPage === recentTransactions.totalPages ||
                    transactionsLoading
                  }
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
