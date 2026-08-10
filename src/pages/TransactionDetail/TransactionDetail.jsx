import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./TransactionDetail.css";

function TransactionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://localhost:7288/api/stock/transactions/${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Transaction not found.");
        return;
      }

      setTransaction(result.data);
    } catch (error) {
      console.error("Transaction detail error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
       Loading
    ========================= */

  if (loading) {
    return (
      <div className="transaction-detail-page">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Loading Transaction...</h2>
              <p>Please wait while transaction details are loaded.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================
       Error
    ========================= */

  if (error || !transaction) {
    return (
      <div className="transaction-detail-page">
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h2>Transaction Not Found</h2>
              <p>{error || "The requested transaction does not exist."}</p>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = transaction.items || [];

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const transactionType = String(transaction.transactionType || "")
    .trim()
    .toUpperCase();

  const transactionTypeClass =
    transactionType === "IN"
      ? "transaction-type-in"
      : transactionType === "OUT"
        ? "transaction-type-out"
        : transactionType === "ADJ" ||
            transactionType === "ADJUST" ||
            transactionType === "ADJUSTMENT"
          ? "transaction-type-adj"
          : "";

  return (
    <div className="transaction-detail-page">
      {/* =========================
                Transaction Information
            ========================= */}

      <section className="transaction-info-card">
        <div className="transaction-info-header">
          {/* Left */}

          <div className="transaction-header-left">
            <span className="transaction-label">Transaction Number</span>

            <h2 className="transaction-number">
              {transaction.transactionNumber}
            </h2>
          </div>

          {/* Center */}

          <div className="transaction-type-container">
            <span className={`transaction-type-badge ${transactionTypeClass}`}>
              {transactionType}
            </span>
          </div>

          {/* Right */}

          <div className="transaction-header-right">
            <button
              type="button"
              className="back-button"
              onClick={() => navigate("/dashboard")}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* =========================
                    Transaction Information
                ========================= */}

        <div className="transaction-info-grid">
          {/* Date - All transaction types */}
          <div className="transaction-info-item">
            <span className="transaction-label">Date</span>

            <span className="transaction-info-value">
              {formatDate(transaction.transactionDate)}
            </span>
          </div>

          {/* Reference Number - Stock In and Stock Out only */}
          {(transactionType === "IN" || transactionType === "OUT") && (
            <div className="transaction-info-item">
              <span className="transaction-label">Reference Number</span>

              <span className="transaction-info-value mono-text">
                {transaction.referenceNo || "-"}
              </span>
            </div>
          )}

          {/* Supplier - Stock In only */}
          {transactionType === "IN" && (
            <div className="transaction-info-item">
              <span className="transaction-label">Supplier</span>

              <span className="transaction-info-value">
                {transaction.supplierName || "-"}
              </span>
            </div>
          )}

          {/* Created By - All transaction types */}
          <div className="transaction-info-item">
            <span className="transaction-label">Created By</span>

            <span className="transaction-info-value">
              {transaction.createdBy || "Unknown User"}
            </span>
          </div>
        </div>
      </section>

      {/* =========================
                Transaction Items
            ========================= */}

      <section className="transaction-items-card">
        <div className="transaction-card-header">
          <div>
            <h2>Transaction Items</h2>

            <p>{items.length} products</p>
          </div>
        </div>

        <div className="transaction-table-wrapper">
          <table className="transaction-detail-table">
            <colgroup>
              <col className="detail-product-column" />
              <col className="detail-code-column" />
              <col className="detail-quantity-column" />
              <col className="detail-price-column" />
              <col className="detail-total-column" />
            </colgroup>

            <thead>
              <tr>
                <th>Product</th>

                <th>Code</th>

                <th className="detail-number-header">Quantity</th>

                <th className="detail-number-header">Unit Price</th>

                <th className="detail-number-header">Line Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={item.productId || index}>
                  <td>
                    <span className="detail-product-name">
                      {item.productName}
                    </span>
                  </td>

                  <td>
                    <span className="mono-text detail-code">
                      {item.productCode}
                    </span>
                  </td>

                  <td className="detail-number-cell mono-text">
                    {item.quantity}
                  </td>

                  <td className="detail-number-cell mono-text">
                    {formatCurrency(item.unitPrice)}
                  </td>

                  <td className="detail-number-cell mono-text detail-line-total">
                    {formatCurrency(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td className="grand-total-label">Grand Total</td>

                <td></td>

                <td className="detail-number-cell mono-text grand-total-quantity">
                  {totalQuantity}
                </td>

                <td className="detail-number-cell mono-text grand-total-unit-price">
                  —
                </td>

                <td className="detail-number-cell mono-text grand-total-value">
                  {formatCurrency(transaction.grandTotal)}
                </td>
              </tr>

              <tr className="transaction-readonly-row">
                <td colSpan="5">
                  Transactions are read-only. Corrections must be made via Stock
                  Adjustment.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

export default TransactionDetail;
