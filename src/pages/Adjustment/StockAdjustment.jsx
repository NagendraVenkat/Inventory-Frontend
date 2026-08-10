import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StockAdjustment.css";

import {
  getAdjustmentProducts,
  createStockAdjustment,
} from "../../services/adjustmentService";

function StockAdjustment() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

  const [transactionDate, setTransactionDate] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [reason, setReason] = useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================
       Load Products
    ========================= */

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getAdjustmentProducts();

      const productData =
        result.data?.products || result.data?.items || result.data || [];

      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error("Stock Adjustment product load error:", error);

      setError(error.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };
  /* =========================
       Today
    ========================= */

  const today = new Date().toISOString().split("T")[0];

  /* =========================
       Update Item
    ========================= */

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

  /* =========================
       Selected Product IDs
    ========================= */

  const selectedProductIds = items
    .map((item) => item.productId)
    .filter(Boolean);

  /* =========================
       Get Product
    ========================= */

  const getProduct = (productId) => {
    return products.find((product) => product.productId === productId);
  };

  /* =========================
       Add Row
    ========================= */

  const addRow = () => {
    setError("");
    setSuccess("");

    const lastItem = items[items.length - 1];

    if (!lastItem.productId) {
      setError("Please select a product before adding another row.");
      return;
    }

    if (!lastItem.quantity || Number(lastItem.quantity) <= 0) {
      setError(
        "Quantity should be greater than zero before adding another row.",
      );
      return;
    }

    const product = getProduct(lastItem.productId);

    if (
      adjustmentType === "DECREASE" &&
      product &&
      Number(lastItem.quantity) > Number(product.currentStock)
    ) {
      setError(
        `Quantity cannot exceed available stock for '${product.productName}'. Available stock: ${product.currentStock}.`,
      );
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
      },
    ]);
  };

  /* =========================
       Remove Row
    ========================= */

  const removeRow = (index) => {
    if (items.length === 1) {
      return;
    }

    setError("");
    setSuccess("");

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  /* =========================
       Grand Quantity
    ========================= */

  const grandTotalQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  /* =========================
       Save Adjustment
    ========================= */

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      /* =========================
       Header Validation
    ========================= */

      if (!transactionDate) {
        setError("Transaction Date is required.");
        return;
      }

      if (new Date(transactionDate) > new Date()) {
        setError("Transaction Date cannot be in the future.");
        return;
      }

      if (!adjustmentType) {
        setError("Please select an adjustment type.");
        return;
      }

      if (!reason.trim()) {
        setError("Reason is required.");
        return;
      }

      if (reason.trim().length > 200) {
        setError("Reason cannot exceed 200 characters.");
        return;
      }

      /* =========================
       At Least One Row
    ========================= */

      if (items.length === 0) {
        setError("Please add at least one product.");
        return;
      }

      /* =========================
       Validate EVERY Row
    ========================= */

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        /* Product Validation */

        if (!item.productId) {
          setError(`Please select a product for row ${index + 1}.`);
          return;
        }

        /* Quantity Validation */

        if (!item.quantity || Number(item.quantity) <= 0) {
          setError(
            `Quantity should be greater than zero for row ${index + 1}.`,
          );
          return;
        }

        /* Product Exists */

        const product = getProduct(item.productId);

        if (!product) {
          setError(`Product in row ${index + 1} could not be found.`);
          return;
        }

        /* Active Product */

        if (product.isActive === false) {
          setError(`Product '${product.productName}' is inactive.`);
          return;
        }

        /* =========================
         Decrease Stock Validation
      ========================= */

        if (
          adjustmentType === "DECREASE" &&
          Number(item.quantity) > Number(product.currentStock)
        ) {
          setError(
            `Insufficient stock for '${product.productName}'. Available stock: ${product.currentStock}.`,
          );
          return;
        }
      }

      /* =========================
       Duplicate Product Validation
    ========================= */

      const productIds = items.map((item) => item.productId);

      const hasDuplicate = new Set(productIds).size !== productIds.length;

      if (hasDuplicate) {
        setError("The same product cannot be added more than once.");
        return;
      }

      /* =========================
       Payload
    ========================= */

      const payload = {
        transactionDate: `${transactionDate}T00:00:00`,

        adjustmentType,

        reason: reason.trim(),

        remarks: null,

        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
        })),
      };

      /* =========================
       Save
    ========================= */

      setSaving(true);

      const result = await createStockAdjustment(payload);

      if (!result.success) {
        setError(result.message || "Unable to save Stock Adjustment.");
        return;
      }

      /* =========================
       Success
    ========================= */

      setSuccess(
        `Stock Adjustment completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      /* =========================
       Reset Form
    ========================= */

      setTransactionDate("");
      setAdjustmentType("");
      setReason("");

      setItems([
        {
          productId: "",
          quantity: "",
        },
      ]);
    } catch (error) {
      console.error("Stock Adjustment save error:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to connect to the server.",
      );
    } finally {
      setSaving(false);
    }
  };
  /* =========================
       Cancel
    ========================= */

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/dashboard");
  };

  /* =========================
       Loading
    ========================= */

  if (loading) {
    return (
      <div className="stock-adjustment-page">
        <div className="stock-adjustment-card">
          <div className="stock-adjustment-loading">
            Loading Stock Adjustment...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stock-adjustment-page">
      <div className="stock-adjustment-card">
        {/* =========================
                    Header
                ========================= */}

        <div className="stock-adjustment-title-section">
          <div className="stock-adjustment-title">
            <h2>Stock Adjustment</h2>

            <span className="admin-only-badge">Admin only</span>
          </div>

          <p>Correct inventory stock manually</p>
        </div>

        {/* =========================
                    Messages
                ========================= */}

        {error && (
          <div className="stock-adjustment-message stock-adjustment-error">
            {error}
          </div>
        )}

        {success && (
          <div className="stock-adjustment-message stock-adjustment-success">
            {success}
          </div>
        )}

        {/* =========================
                    Transaction Date
                ========================= */}

        <div className="stock-adjustment-basic-info">
          <div className="form-group">
            <label>
              Transaction Date
              <span>*</span>
            </label>

            <input
              type="date"
              value={transactionDate}
              max={today}
              onChange={(e) => setTransactionDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              Adjustment Type
              <span>*</span>
            </label>

            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value)}
            >
              <option value="">Select Adjustment Type</option>

              <option value="INCREASE">Increase (+)</option>

              <option value="DECREASE">Decrease (-)</option>
            </select>
          </div>
        </div>

        {/* =========================
                    Reason
                ========================= */}

        <div className="stock-adjustment-reason">
          <div className="form-group">
            <label>
              Reason
              <span>*</span>
            </label>

            <input
              type="text"
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter adjustment reason"
            />

            <small>Reason is mandatory — adjustments are audited.</small>
          </div>
        </div>

        {/* =========================
                    Items Table
                ========================= */}

        <div className="adjustment-table-wrapper">
          <div className="adjustment-table">
            {/* Header */}

            <div className="adjustment-table-header">
              <div>Product</div>

              <div className="center-header">Current Stock</div>

              <div className="center-header">Quantity</div>

              <div className="action-header"></div>
            </div>

            {/* Rows */}

            {items.map((item, index) => {
              const product = getProduct(item.productId);

              return (
                <div className="adjustment-table-row" key={index}>
                  {/* Product */}

                  <div>
                    <select
                      value={item.productId}
                      onChange={(e) =>
                        updateItem(index, "productId", e.target.value)
                      }
                    >
                      <option value="">Select Product</option>

                      {products.map((productOption) => {
                        const alreadySelected = selectedProductIds.includes(
                          productOption.productId,
                        );

                        const selectedInCurrentRow =
                          item.productId === productOption.productId;

                        return (
                          <option
                            key={productOption.productId}
                            value={productOption.productId}
                            disabled={alreadySelected && !selectedInCurrentRow}
                          >
                            {productOption.productCode}
                            {" — "}
                            {productOption.productName}
                            {" (Stock: "}
                            {productOption.currentStock}
                            {")"}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Current Stock */}

                  <div className="current-stock-cell">
                    {product ? product.currentStock : "—"}
                  </div>

                  {/* Quantity */}

                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>

                  {/* Remove */}

                  <div className="adjustment-action-cell">
                    <button
                      type="button"
                      className="remove-adjustment-row-btn"
                      onClick={() => removeRow(index)}
                      disabled={items.length === 1}
                      title="Remove row"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Total */}

            <div className="adjustment-total-row">
              <div>Grand Total</div>

              <div></div>

              <div className="adjustment-total-quantity">
                {grandTotalQuantity}
              </div>

              <div></div>
            </div>
          </div>
        </div>

        {/* =========================
                    Footer
                ========================= */}

        <div className="stock-adjustment-footer">
          <button
            type="button"
            className="add-adjustment-row-btn"
            onClick={addRow}
            disabled={saving}
          >
            <span>+</span>
            Add Row
          </button>

          <div className="stock-adjustment-actions">
            <button
              type="button"
              className="cancel-adjustment-btn"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-adjustment-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Adjustment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockAdjustment;
