import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./TransactionDetail.css";

import { getTransactionById } from "../../services/transactionService";

function TransactionDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD TRANSACTION
  // =========================================================

  useEffect(() => {
    loadTransaction();
  }, [id]);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getTransactionById(id);

      const result = response.data;

      if (!result.success) {
        setError(result.message || "Transaction not found.");
        return;
      }

      setTransaction(result.data);
    } catch (error) {
      console.error("Transaction detail error:", error);

      setError(
        error.response?.data?.message || "Unable to connect to the server.",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // BACK TO DASHBOARD
  // =========================================================

  const handleBackToDashboard = () => {
    navigate("/dashboard", {
      state: {
        transactionPage: location.state?.transactionPage || 1,
      },
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // ERROR
  // =========================================================

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
              onClick={handleBackToDashboard}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // TRANSACTION DATA
  // =========================================================

  const items = transaction.items || [];

  const totalQuantity = items.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );

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
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // TRANSACTION TYPE
  // =========================================================

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

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="transaction-detail-page">
      {/* =================================================
          TRANSACTION INFORMATION
      ================================================= */}

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
              onClick={handleBackToDashboard}
            >
              <i className="bi bi-arrow-left"></i>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* =================================================
            TRANSACTION INFORMATION
        ================================================= */}

        <div className="transaction-info-grid">
          {/* Date */}

          <div className="transaction-info-item">
            <span className="transaction-label">Date</span>

            <span className="transaction-info-value">
              {formatDate(transaction.transactionDate)}
            </span>
          </div>

          {/* Reference Number */}

          {(transactionType === "IN" || transactionType === "OUT") && (
            <div className="transaction-info-item">
              <span className="transaction-label">Reference Number</span>

              <span className="transaction-info-value mono-text">
                {transaction.referenceNo || "-"}
              </span>
            </div>
          )}

          {/* Supplier */}

          {transactionType === "IN" && (
            <div className="transaction-info-item">
              <span className="transaction-label">Supplier</span>

              <span className="transaction-info-value">
                {transaction.supplierName || "-"}
              </span>
            </div>
          )}

          {/* Created By */}

          <div className="transaction-info-item">
            <span className="transaction-label">Created By</span>

            <span className="transaction-info-value">
              {transaction.createdByRole} / {transaction.createdByName}
            </span>
          </div>
        </div>
      </section>

      {/* =================================================
          TRANSACTION ITEMS
      ================================================= */}

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
