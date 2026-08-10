import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StockIn.css";

import {
  getStockInInitialData,
  createStockIn,
} from "../../services/stockInService";

function StockIn() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
      unitPrice: "",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const { products: productsResult, suppliers: suppliersResult } =
        await getStockInInitialData();

      const productData = productsResult.data?.products || [];

      const supplierData =
        suppliersResult.data?.items || suppliersResult.data || [];

      setProducts(Array.isArray(productData) ? productData : []);

      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (error) {
      console.error("Stock In initial load error:", error);

      setError(
        error.response?.data?.message || "Unable to load Stock In data.",
      );
    } finally {
      setLoading(false);
    }
  };
  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const addRow = () => {
    const lastItem = items[items.length - 1];

    // Validate the current row before adding another row
    if (!lastItem.productId) {
      setError("Please select a product before adding another row.");
      return;
    }

    if (!lastItem.quantity || Number(lastItem.quantity) <= 0) {
      setError("Please enter a valid quantity before adding another row.");
      return;
    }

    if (!lastItem.unitPrice || Number(lastItem.unitPrice) <= 0) {
      setError("Please enter a valid unit price before adding another row.");
      return;
    }

    // Current row is valid, so allow a new row
    setError("");

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  const removeRow = (index) => {
    if (items.length === 1) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const getLineTotal = (item) => {
    const quantity = Number(item.quantity) || 0;

    const unitPrice = Number(item.unitPrice) || 0;

    return quantity * unitPrice;
  };

  const grandTotal = items.reduce(
    (total, item) => total + getLineTotal(item),
    0,
  );

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      /* =========================
       Header Validation
    ========================= */

      if (!supplierId) {
        setError("Please select a supplier.");
        return;
      }

      if (!referenceNo.trim()) {
        setError("Reference Number is required.");
        return;
      }

      if (!transactionDate) {
        setError("Transaction Date is required.");
        return;
      }

      if (new Date(transactionDate) > new Date()) {
        setError("Transaction Date cannot be in the future.");
        return;
      }

      /* =========================
       Validate EVERY Row
    ========================= */

      if (items.length === 0) {
        setError("Please add at least one product.");
        return;
      }

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        /* Product Validation */

        if (!item.productId) {
          setError(`Please select a product for row ${index + 1}.`);
          return;
        }

        /* Quantity Validation */

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity <= 0) {
          setError(
            `Quantity should be greater than zero for row ${index + 1}.`,
          );
          return;
        }

        /* Unit Price Validation */

        const unitPrice = Number(item.unitPrice);

        if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
          setError(
            `Unit Price should be greater than zero for row ${index + 1}.`,
          );
          return;
        }
      }

      /* =========================
       Duplicate Product Validation
    ========================= */

      const productIds = items.map((item) => item.productId);

      const hasDuplicateProduct =
        new Set(productIds).size !== productIds.length;

      if (hasDuplicateProduct) {
        setError("The same product cannot be added more than once.");
        return;
      }

      /* =========================
       Payload
    ========================= */

      const payload = {
        supplierId,

        referenceNo: referenceNo.trim(),

        transactionDate: `${transactionDate}T00:00:00`,

        remarks: remarks.trim() || null,

        items: items.map((item) => ({
          productId: item.productId,

          quantity: Number(item.quantity),

          unitPrice: Number(item.unitPrice),
        })),
      };

      /* =========================
       Save
    ========================= */

      setSaving(true);

      const result = await createStockIn(payload);

      /* =========================
       Backend Validation
    ========================= */

      if (!result.success) {
        setError(result.message || "Unable to save Stock In.");
        return;
      }

      /* =========================
       Success
    ========================= */

      setSuccess(
        `Stock In completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      /* =========================
       Reset Form
    ========================= */

      setSupplierId("");
      setReferenceNo("");
      setTransactionDate("");
      setRemarks("");

      setItems([
        {
          productId: "",
          quantity: "",
          unitPrice: "",
        },
      ]);
    } catch (error) {
      console.error("Stock In save error:", error);

      setError(
        error.response?.data?.message || "Unable to connect to the server.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <div className="stockin-page">
        <div className="stockin-card">
          <div className="stockin-loading">Loading Stock In...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stockin-page">
      <div className="stockin-card">
        {/* =========================
                    CARD HEADER
                ========================= */}

        <div className="stockin-card-header">
          <h2>New Stock In (Purchase Entry)</h2>
        </div>

        {/* =========================
                    MESSAGES
                ========================= */}

        {error && <div className="stockin-message stockin-error">{error}</div>}

        {success && (
          <div className="stockin-message stockin-success">{success}</div>
        )}

        {/* =========================
                    BASIC INFORMATION
                ========================= */}

        <div className="stockin-basic-info">
          {/* Supplier */}

          <div className="stockin-field">
            <label>
              Supplier <span>*</span>
            </label>

            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Select Supplier</option>

              {suppliers.map((supplier) => (
                <option key={supplier.supplierId} value={supplier.supplierId}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>
          </div>

          {/* Reference */}

          <div className="stockin-field">
            <label>Reference / Invoice No</label>

            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="Enter reference number"
              maxLength={50}
            />
          </div>

          {/* Date */}

          <div className="stockin-field">
            <label>Date</label>

            <input
              type="date"
              value={transactionDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>
        </div>

        {/* =========================
                    ITEMS TABLE
                ========================= */}

        <div className="stockin-table-wrapper">
          <table className="stockin-table">
            <colgroup>
              <col className="stockin-product-column" />

              <col className="stockin-quantity-column" />

              <col className="stockin-price-column" />

              <col className="stockin-total-column" />

              <col className="stockin-action-column" />
            </colgroup>

            <thead>
              <tr>
                <th>PRODUCT</th>

                <th className="center-header">QTY</th>

                <th className="right-header">UNIT PRICE ₹</th>

                <th className="right-header">LINE TOTAL ₹</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  {/* Product */}

                  <td>
                    <select
                      className="stockin-product-select"
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
                    >
                      <option value="">Select Product</option>
                      {products.map((product) => {
                        const alreadySelected = items.some(
                          (item, itemIndex) =>
                            itemIndex !== index &&
                            item.productId === product.productId,
                        );

                        return (
                          <option
                            key={product.productId}
                            value={product.productId}
                            disabled={alreadySelected}
                          >
                            {product.productCode} — {product.productName}
                            {alreadySelected ? " (Already selected)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </td>

                  {/* Quantity */}

                  <td>
                    <input
                      className="stockin-number-input quantity-input"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      placeholder="0"
                    />
                  </td>

                  {/* Unit Price */}

                  <td>
                    <input
                      className="stockin-number-input price-input"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", e.target.value)
                      }
                      placeholder="0.00"
                    />
                  </td>

                  {/* Line Total */}

                  <td className="line-total-cell">
                    <span className="mono-text">
                      {formatCurrency(getLineTotal(item))}
                    </span>
                  </td>

                  {/* Remove */}

                  <td className="action-cell">
                    <button
                      type="button"
                      className="remove-row-button"
                      onClick={() => removeRow(index)}
                      disabled={items.length === 1}
                      title="Remove row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* =========================
                            GRAND TOTAL
                        ========================= */}

            <tfoot>
              <tr>
                <td className="grand-total-label">Grand Total</td>

                <td className="grand-total-quantity">
                  {items.reduce(
                    (total, item) => total + (Number(item.quantity) || 0),
                    0,
                  )}
                </td>

                <td></td>

                <td className="grand-total-amount">
                  {formatCurrency(grandTotal)}
                </td>

                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* =========================
                    REMARKS
                ========================= */}

        <div className="stockin-remarks">
          <div className="stockin-field">
            <label>Remarks</label>

            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={300}
              placeholder="Enter remarks (optional)"
              rows={3}
            />
          </div>
        </div>

        {/* =========================
                    ACTIONS
                ========================= */}

        <div className="stockin-actions">
          <button type="button" className="add-row-button" onClick={addRow}>
            <span>+</span>
            Add Row
          </button>

          <div className="stockin-right-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-stockin-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Stock In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockIn;
