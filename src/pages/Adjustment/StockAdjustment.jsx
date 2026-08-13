import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./StockAdjustment.css";

import {
  getAdjustmentProducts,
  createStockAdjustment,
} from "../../services/adjustmentService";

function StockAdjustment() {
  const navigate = useNavigate();

  // =========================================================
  // Products
  // =========================================================

  const [products, setProducts] = useState([]);

  // =========================================================
  // Header fields
  // =========================================================

  const [transactionDate, setTransactionDate] = useState("");
  const [adjustmentType, setAdjustmentType] = useState("");
  const [reason, setReason] = useState("");

  // =========================================================
  // Items
  // =========================================================

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: "",
    },
  ]);

  // =========================================================
  // Loading / Saving
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =========================================================
  // Validation errors
  // =========================================================

  const [errors, setErrors] = useState({
    transactionDate: "",
    adjustmentType: "",
    reason: "",
    items: [
      {
        productId: "",
        quantity: "",
      },
    ],
  });

  // =========================================================
  // Success message
  // =========================================================

  const [success, setSuccess] = useState("");

  // =========================================================
  // Load Products
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const result = await getAdjustmentProducts();

      const productData =
        result.data?.products || result.data?.items || result.data || [];

      setProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error("Stock Adjustment product load error:", error);

      setErrors((currentErrors) => ({
        ...currentErrors,
        items: [
          {
            productId:
              error.response?.data?.message || "Unable to load products.",
            quantity: "",
          },
        ],
      }));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // Today
  // =========================================================

  const today = new Date().toISOString().split("T")[0];

  // =========================================================
  // Get Product
  // =========================================================

  const getProduct = (productId) => {
    return products.find((product) => product.productId === productId);
  };

  // =========================================================
  // Update Header Errors
  // =========================================================

  const clearHeaderError = (field) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: "",
    }));

    setSuccess("");
  };

  // =========================================================
  // Update Item
  // =========================================================

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

    // Clear only this particular field's error
    setErrors((currentErrors) => {
      const updatedItems = [...currentErrors.items];

      if (!updatedItems[index]) {
        updatedItems[index] = {
          productId: "",
          quantity: "",
        };
      }

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: "",
      };

      return {
        ...currentErrors,
        items: updatedItems,
      };
    });

    setSuccess("");
  };

  // =========================================================
  // Selected Product IDs
  // =========================================================

  const selectedProductIds = items
    .map((item) => item.productId)
    .filter(Boolean);

  // =========================================================
  // Validate Form
  // =========================================================

  const validateForm = () => {
    const newErrors = {
      transactionDate: "",
      adjustmentType: "",
      reason: "",
      items: items.map(() => ({
        productId: "",
        quantity: "",
      })),
    };

    // =======================================================
    // Transaction Date
    // =======================================================

    if (!transactionDate) {
      newErrors.transactionDate = "Transaction Date is required.";
    } else if (new Date(transactionDate) > new Date()) {
      newErrors.transactionDate = "Transaction Date cannot be in the future.";
    }

    // =======================================================
    // Adjustment Type
    // =======================================================

    if (!adjustmentType) {
      newErrors.adjustmentType = "Adjustment Type is required.";
    }

    // =======================================================
    // Reason
    // =======================================================

    if (!reason.trim()) {
      newErrors.reason = "Reason is required.";
    } else if (reason.trim().length > 200) {
      newErrors.reason = "Reason cannot exceed 200 characters.";
    }

    // =======================================================
    // Duplicate Products
    // =======================================================

    const productIdOccurrences = {};

    items.forEach((item) => {
      if (item.productId) {
        productIdOccurrences[item.productId] =
          (productIdOccurrences[item.productId] || 0) + 1;
      }
    });

    // =======================================================
    // Item Validation
    // =======================================================

    items.forEach((item, index) => {
      const rowErrors = {
        productId: "",
        quantity: "",
      };

      // Product required
      if (!item.productId) {
        rowErrors.productId = "Product is required.";
      }

      // Quantity required
      if (item.quantity === "" || item.quantity === null) {
        rowErrors.quantity = "Quantity is required.";
      } else if (Number(item.quantity) <= 0) {
        rowErrors.quantity = "Quantity should be greater than zero.";
      }

      // Product exists
      const product = getProduct(item.productId);

      if (item.productId && !product) {
        rowErrors.productId = "Selected product could not be found.";
      }

      // Active product
      if (product && product.isActive === false) {
        rowErrors.productId = `Product '${product.productName}' is inactive.`;
      }

      // Duplicate product
      if (item.productId && productIdOccurrences[item.productId] > 1) {
        rowErrors.productId =
          "The same product cannot be added more than once.";
      }

      // Decrease stock validation
      if (
        product &&
        adjustmentType === "DECREASE" &&
        item.quantity !== "" &&
        Number(item.quantity) > Number(product.currentStock)
      ) {
        rowErrors.quantity = `Insufficient stock. Available stock: ${product.currentStock}.`;
      }

      newErrors.items[index] = rowErrors;
    });

    setErrors(newErrors);

    // =======================================================
    // Check Header Errors
    // =======================================================

    const hasHeaderErrors =
      Boolean(newErrors.transactionDate) ||
      Boolean(newErrors.adjustmentType) ||
      Boolean(newErrors.reason);

    // =======================================================
    // Check Item Errors
    // =======================================================

    const hasRowErrors = newErrors.items.some(
      (item) => item.productId || item.quantity,
    );

    return !hasHeaderErrors && !hasRowErrors;
  };

  // =========================================================
  // ADD ROW
  //
  // IMPORTANT:
  // + button is ALWAYS rendered on index 0.
  //
  // New rows are appended.
  // They receive ONLY ×.
  // =========================================================

  const addRow = () => {
    setSuccess("");

    // Validate the COMPLETE form
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
      },
    ]);

    setErrors((currentErrors) => ({
      ...currentErrors,
      items: [
        ...currentErrors.items,
        {
          productId: "",
          quantity: "",
        },
      ],
    }));
  };

  // =========================================================
  // CLEAR ONLY ROW
  //
  // Used when only ONE row exists.
  // The row itself must remain.
  // =========================================================

  const clearOnlyRow = () => {
    setItems([
      {
        productId: "",
        quantity: "",
      },
    ]);

    setErrors({
      transactionDate: errors.transactionDate,
      adjustmentType: errors.adjustmentType,
      reason: errors.reason,
      items: [
        {
          productId: "",
          quantity: "",
        },
      ],
    });

    setSuccess("");
  };

  // =========================================================
  // REMOVE / CANCEL ROW
  //
  // IMPORTANT BEHAVIOR:
  //
  // If only one row exists:
  //     × = clear data only
  //
  // If multiple rows exist and first row is clicked:
  //     × = REMOVE first row
  //
  // Then second row becomes index 0 automatically.
  // Therefore it automatically gets + and ×.
  //
  // If any other row is clicked:
  //     × = remove that row.
  // =========================================================

  const removeRow = (index) => {
    if (saving) {
      return;
    }

    setSuccess("");

    // -------------------------------------------------------
    // Only one row exists
    // -------------------------------------------------------

    if (items.length === 1) {
      clearOnlyRow();
      return;
    }

    // -------------------------------------------------------
    // Multiple rows exist
    //
    // Remove whichever row was clicked.
    // -------------------------------------------------------

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );

    setErrors((currentErrors) => ({
      ...currentErrors,
      items: currentErrors.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  // =========================================================
  // Grand Total Quantity
  // =========================================================

  const grandTotalQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  // =========================================================
  // Save Adjustment
  // =========================================================

  const handleSave = async () => {
    setSuccess("");

    // Validate COMPLETE form
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setSaving(true);

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

      const result = await createStockAdjustment(payload);

      if (!result.success) {
        setErrors({
          transactionDate: "",
          adjustmentType: "",
          reason: "",
          items: [
            {
              productId: result.message || "Unable to save Stock Adjustment.",
              quantity: "",
            },
          ],
        });

        return;
      }

      // =====================================================
      // SUCCESS MESSAGE
      // =====================================================

      setSuccess(
        `Stock Adjustment completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      // =====================================================
      // RESET FORM
      // =====================================================

      setTransactionDate("");
      setAdjustmentType("");
      setReason("");

      setItems([
        {
          productId: "",
          quantity: "",
        },
      ]);

      setErrors({
        transactionDate: "",
        adjustmentType: "",
        reason: "",
        items: [
          {
            productId: "",
            quantity: "",
          },
        ],
      });
    } catch (error) {
      console.error("Stock Adjustment save error:", error);

      setErrors({
        transactionDate: "",
        adjustmentType: "",
        reason: "",
        items: [
          {
            productId:
              error.response?.data?.message ||
              error.message ||
              "Unable to connect to the server.",
            quantity: "",
          },
        ],
      });
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // Cancel Page
  // =========================================================

  const handleCancel = () => {
    if (saving) {
      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // Loading
  // =========================================================

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

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="stock-adjustment-page">
      <div className="stock-adjustment-card">
        {/* =================================================
            TITLE
        ================================================= */}

        <div className="stock-adjustment-title-section">
          <div className="stock-adjustment-title">
            <h2>Stock Adjustment</h2>

            <span className="admin-only-badge">Admin only</span>
          </div>

          <p>Correct inventory stock manually</p>
        </div>

        {/* =================================================
            TRANSACTION DATE + ADJUSTMENT TYPE
        ================================================= */}

        <div className="stock-adjustment-basic-info">
          {/* Transaction Date */}

          <div className="form-group">
            <label>
              Transaction Date
              <span>*</span>
            </label>

            <input
              type="date"
              value={transactionDate}
              max={today}
              className={errors.transactionDate ? "input-error" : ""}
              onChange={(e) => {
                setTransactionDate(e.target.value);

                clearHeaderError("transactionDate");
              }}
            />

            {errors.transactionDate && (
              <span className="validation-error">{errors.transactionDate}</span>
            )}
          </div>

          {/* Adjustment Type */}

          <div className="form-group">
            <label>
              Adjustment Type
              <span>*</span>
            </label>

            <select
              value={adjustmentType}
              className={errors.adjustmentType ? "input-error" : ""}
              onChange={(e) => {
                setAdjustmentType(e.target.value);

                clearHeaderError("adjustmentType");
              }}
            >
              <option value="">Select Adjustment Type</option>

              <option value="INCREASE">Increase (+)</option>

              <option value="DECREASE">Decrease (-)</option>
            </select>

            {errors.adjustmentType && (
              <span className="validation-error">{errors.adjustmentType}</span>
            )}
          </div>
        </div>

        {/* =================================================
            REASON
        ================================================= */}

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
              placeholder="Enter adjustment reason"
              className={errors.reason ? "input-error" : ""}
              onChange={(e) => {
                setReason(e.target.value);

                clearHeaderError("reason");
              }}
            />

            {errors.reason ? (
              <span className="validation-error">{errors.reason}</span>
            ) : (
              <small>Reason is mandatory — adjustments are audited.</small>
            )}
          </div>
        </div>

        {/* =================================================
            ITEMS TABLE
        ================================================= */}

        <div className="adjustment-table-wrapper">
          <div className="adjustment-table">
            {/* Table Header */}

            <div className="adjustment-table-header">
              <div>
                Product <span>*</span>
              </div>

              <div className="center-header">Current Stock</div>

              <div className="center-header">
                Quantity <span>*</span>
              </div>

              <div className="action-header">Action</div>
            </div>

            {/* =================================================
                ROWS
            ================================================= */}

            {items.map((item, index) => {
              const product = getProduct(item.productId);

              const rowErrors = errors.items[index] || {
                productId: "",
                quantity: "",
              };

              return (
                <div
                  className={`adjustment-table-row ${
                    rowErrors.productId || rowErrors.quantity
                      ? "row-has-error"
                      : ""
                  }`}
                  key={index}
                >
                  {/* PRODUCT */}

                  <div className="adjustment-product-cell">
                    <select
                      value={item.productId}
                      className={rowErrors.productId ? "input-error" : ""}
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

                    {rowErrors.productId && (
                      <span className="validation-error">
                        {rowErrors.productId}
                      </span>
                    )}
                  </div>

                  {/* CURRENT STOCK */}

                  <div className="current-stock-cell">
                    {product ? product.currentStock : "—"}
                  </div>

                  {/* QUANTITY */}

                  <div className="adjustment-quantity-cell">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      placeholder="0"
                      className={rowErrors.quantity ? "input-error" : ""}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />

                    {rowErrors.quantity && (
                      <span className="validation-error">
                        {rowErrors.quantity}
                      </span>
                    )}
                  </div>

                  {/* =================================================
                      ACTIONS

                      FIRST DISPLAYED ROW:
                      + and ×

                      OTHER ROWS:
                      × only
                  ================================================= */}

                  <div className="adjustment-action-cell">
                    {index === 0 && (
                      <button
                        type="button"
                        className="add-adjustment-icon-btn"
                        onClick={addRow}
                        disabled={saving}
                        title="Add Row"
                      >
                        +
                      </button>
                    )}

                    <button
                      type="button"
                      className="remove-adjustment-row-btn"
                      onClick={() => removeRow(index)}
                      disabled={saving}
                      title={items.length === 1 ? "Clear Row" : "Remove Row"}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}

            {/* =================================================
                GRAND TOTAL
            ================================================= */}

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

        {/* =================================================
            SUCCESS MESSAGE

            IMPORTANT:
            This is intentionally AFTER the Grand Total
            and BEFORE the footer buttons.
        ================================================= */}

        {success && (
          <div className="stock-adjustment-message stock-adjustment-success">
            <span className="success-icon">✓</span>

            <span>{success}</span>
          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="stock-adjustment-footer">
          <div></div>

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
