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

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setErrors({});

      const { products: productsResult, suppliers: suppliersResult } =
        await getStockInInitialData();

      const productData = productsResult.data?.products || [];

      const supplierData =
        suppliersResult.data?.items || suppliersResult.data || [];

      setProducts(Array.isArray(productData) ? productData : []);
      setSuppliers(Array.isArray(supplierData) ? supplierData : []);
    } catch (error) {
      console.error("Stock In initial load error:", error);

      setErrors({
        form: error.response?.data?.message || "Unable to load Stock In data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UPDATE ITEM
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

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (updatedErrors.items?.[index]?.[field]) {
        updatedErrors.items = {
          ...updatedErrors.items,
          [index]: {
            ...updatedErrors.items[index],
            [field]: "",
          },
        };
      }

      return updatedErrors;
    });

    setSuccess("");
  };

  // =========================================================
  // VALIDATE COMPLETE FORM
  // =========================================================

  const validateForm = () => {
    const validationErrors = {
      supplierId: "",
      referenceNo: "",
      transactionDate: "",
      items: {},
    };

    // -------------------------------------------------------
    // HEADER VALIDATION
    // -------------------------------------------------------

    if (!supplierId) {
      validationErrors.supplierId = "Please select a supplier.";
    }

    if (!referenceNo.trim()) {
      validationErrors.referenceNo = "Reference / Invoice Number is required.";
    } else if (referenceNo.trim().length < 3) {
      validationErrors.referenceNo =
        "Reference / Invoice Number must contain at least 3 characters.";
    } else if (!/^[A-Za-z0-9][A-Za-z0-9\/\-_]*$/.test(referenceNo.trim())) {
      validationErrors.referenceNo =
        "Use letters, numbers, hyphen (-), underscore (_) or slash (/).";
    }

    if (!transactionDate) {
      validationErrors.transactionDate = "Transaction Date is required.";
    } else {
      const selectedDate = new Date(`${transactionDate}T00:00:00`);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (selectedDate > today) {
        validationErrors.transactionDate =
          "Transaction Date cannot be a future date.";
      }
    }

    // -------------------------------------------------------
    // ITEM VALIDATION
    // -------------------------------------------------------

    if (items.length === 0) {
      validationErrors.items[0] = {
        productId: "Please add at least one product.",
        quantity: "",
        unitPrice: "",
      };
    }

    const selectedProductIds = [];

    items.forEach((item, index) => {
      const itemErrors = {
        productId: "",
        quantity: "",
        unitPrice: "",
      };

      // Product
      if (!item.productId) {
        itemErrors.productId = "Please select a product.";
      } else {
        if (selectedProductIds.includes(item.productId)) {
          itemErrors.productId =
            "This product is already added in another row.";
        }

        selectedProductIds.push(item.productId);
      }

      // Quantity
      const quantity = Number(item.quantity);

      if (item.quantity === "") {
        itemErrors.quantity = "Quantity is required.";
      } else if (!Number.isInteger(quantity) || quantity <= 0) {
        itemErrors.quantity =
          "Quantity must be a whole number greater than zero.";
      }

      // Unit Price
      const unitPrice = Number(item.unitPrice);

      if (item.unitPrice === "") {
        itemErrors.unitPrice = "Unit Price is required.";
      } else if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        itemErrors.unitPrice = "Unit Price must be greater than zero.";
      }

      validationErrors.items[index] = itemErrors;
    });

    // -------------------------------------------------------
    // CHECK WHETHER ANY ERROR EXISTS
    // -------------------------------------------------------

    const hasHeaderErrors =
      validationErrors.supplierId ||
      validationErrors.referenceNo ||
      validationErrors.transactionDate;

    const hasItemErrors = Object.values(validationErrors.items).some(
      (itemError) =>
        itemError.productId || itemError.quantity || itemError.unitPrice,
    );

    if (!hasHeaderErrors && !hasItemErrors) {
      return null;
    }

    return validationErrors;
  };

  // =========================================================
  // ADD ROW
  // =========================================================

  const addRow = () => {
    const validationErrors = validateForm();

    if (validationErrors) {
      setErrors(validationErrors);
      setSuccess("");
      return;
    }

    setErrors({});

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
        unitPrice: "",
      },
    ]);
  };

  // =========================================================
  // CLEAR ROW
  // =========================================================

  const clearRow = (index) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              productId: "",
              quantity: "",
              unitPrice: "",
            }
          : item,
      ),
    );

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (updatedErrors.items) {
        updatedErrors.items = {
          ...updatedErrors.items,
          [index]: {
            productId: "",
            quantity: "",
            unitPrice: "",
          },
        };
      }

      return updatedErrors;
    });

    setSuccess("");
  };

  // =========================================================
  // REMOVE ROW
  // =========================================================

  const removeRow = (index) => {
    // If only one row exists,
    // clear the row instead of deleting it.
    if (items.length === 1) {
      clearRow(index);
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );

    setErrors((currentErrors) => {
      if (!currentErrors.items) {
        return currentErrors;
      }

      const updatedItemErrors = {};

      Object.entries(currentErrors.items).forEach(([itemIndex, itemError]) => {
        const oldIndex = Number(itemIndex);

        if (oldIndex < index) {
          updatedItemErrors[oldIndex] = itemError;
        } else if (oldIndex > index) {
          updatedItemErrors[oldIndex - 1] = itemError;
        }
      });

      return {
        ...currentErrors,
        items: updatedItemErrors,
      };
    });

    setSuccess("");
  };

  // =========================================================
  // LINE TOTAL
  // =========================================================

  const getLineTotal = (item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;

    return quantity * unitPrice;
  };

  const grandTotal = items.reduce(
    (total, item) => total + getLineTotal(item),
    0,
  );

  // =========================================================
  // FORMAT CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // SAVE STOCK IN
  // =========================================================

  const handleSave = async () => {
    setErrors({});
    setSuccess("");

    const validationErrors = validateForm();

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

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

      const result = await createStockIn(payload);

      // =====================================================
      // BACKEND VALIDATION
      // =====================================================

      if (!result.success) {
        const message = result.message || "Unable to save Stock In.";

        if (
          message.toLowerCase().includes("reference") &&
          message.toLowerCase().includes("already")
        ) {
          setErrors({
            referenceNo: message,
          });
        } else {
          setErrors({
            form: message,
          });
        }

        return;
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        `Stock In completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      // =====================================================
      // RESET FORM
      // =====================================================

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

      setErrors({});
    } catch (error) {
      console.error("Stock In save error:", error);

      const message =
        error.response?.data?.message || "Unable to connect to the server.";

      if (
        message.toLowerCase().includes("reference") &&
        message.toLowerCase().includes("already")
      ) {
        setErrors({
          referenceNo: message,
        });
      } else {
        setErrors({
          form: message,
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // CANCEL
  // =========================================================

  const handleCancel = () => {
    navigate("/dashboard");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="stockin-page">
        <div className="stockin-card">
          <div className="stockin-loading">Loading Stock In...</div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="stockin-page">
      <div className="stockin-card">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="stockin-card-header">
          <h2>New Stock In (Purchase Entry)</h2>
        </div>

        {/* =====================================================
            FORM LEVEL ERROR
        ===================================================== */}

        {errors.form && (
          <div className="stockin-message stockin-error">
            <i className="bi bi-exclamation-circle-fill"></i>
            <span>{errors.form}</span>
          </div>
        )}

        {/* =====================================================
            BASIC INFORMATION
        ===================================================== */}

        <div className="stockin-basic-info">
          {/* SUPPLIER */}

          <div className="stockin-field">
            <label>
              Supplier <span className="required-star">*</span>
            </label>

            <select
              className={errors.supplierId ? "stockin-invalid" : ""}
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);

                setErrors((currentErrors) => ({
                  ...currentErrors,
                  supplierId: "",
                }));

                setSuccess("");
              }}
            >
              <option value="">Select Supplier</option>

              {suppliers.map((supplier) => (
                <option key={supplier.supplierId} value={supplier.supplierId}>
                  {supplier.supplierName}
                </option>
              ))}
            </select>

            {errors.supplierId && (
              <span className="validation-message">{errors.supplierId}</span>
            )}
          </div>

          {/* REFERENCE */}

          <div className="stockin-field">
            <label>
              Reference / Invoice No <span className="required-star">*</span>
            </label>

            <input
              type="text"
              className={errors.referenceNo ? "stockin-invalid" : ""}
              value={referenceNo}
              onChange={(e) => {
                setReferenceNo(e.target.value);

                setErrors((currentErrors) => ({
                  ...currentErrors,
                  referenceNo: "",
                }));

                setSuccess("");
              }}
              placeholder="Example: INV-2026-001"
              maxLength={50}
            />

            <span className="field-hint">
              Example: INV-2026-001 or PO/2026/001
            </span>

            {errors.referenceNo && (
              <span className="validation-message">{errors.referenceNo}</span>
            )}
          </div>

          {/* DATE */}

          <div className="stockin-field">
            <label>
              Date <span className="required-star">*</span>
            </label>

            <input
              type="date"
              className={errors.transactionDate ? "stockin-invalid" : ""}
              value={transactionDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setTransactionDate(e.target.value);

                setErrors((currentErrors) => ({
                  ...currentErrors,
                  transactionDate: "",
                }));

                setSuccess("");
              }}
            />

            {errors.transactionDate && (
              <span className="validation-message">
                {errors.transactionDate}
              </span>
            )}
          </div>
        </div>

        {/* =====================================================
            ITEMS TABLE
        ===================================================== */}

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
                <th>
                  PRODUCT <span className="required-star">*</span>
                </th>

                <th className="center-header">
                  QTY <span className="required-star">*</span>
                </th>

                <th className="right-header">
                  UNIT PRICE ₹ <span className="required-star">*</span>
                </th>

                <th className="right-header">LINE TOTAL ₹</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const itemErrors = errors.items?.[index] || {};

                return (
                  <tr key={index}>
                    {/* PRODUCT */}

                    <td>
                      <select
                        className={`stockin-product-select ${
                          itemErrors.productId ? "stockin-invalid" : ""
                        }`}
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
                      >
                        <option value="">Select Product</option>

                        {products.map((product) => {
                          const alreadySelected = items.some(
                            (currentItem, itemIndex) =>
                              itemIndex !== index &&
                              currentItem.productId === product.productId,
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

                      {itemErrors.productId && (
                        <span className="validation-message table-validation">
                          {itemErrors.productId}
                        </span>
                      )}
                    </td>

                    {/* QUANTITY */}

                    <td>
                      <input
                        className={`stockin-number-input quantity-input ${
                          itemErrors.quantity ? "stockin-invalid" : ""
                        }`}
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        placeholder="0"
                      />

                      {itemErrors.quantity && (
                        <span className="validation-message table-validation">
                          {itemErrors.quantity}
                        </span>
                      )}
                    </td>

                    {/* UNIT PRICE */}

                    <td>
                      <input
                        className={`stockin-number-input price-input ${
                          itemErrors.unitPrice ? "stockin-invalid" : ""
                        }`}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(index, "unitPrice", e.target.value)
                        }
                        placeholder="0.00"
                      />

                      {itemErrors.unitPrice && (
                        <span className="validation-message table-validation">
                          {itemErrors.unitPrice}
                        </span>
                      )}
                    </td>

                    {/* LINE TOTAL */}

                    <td className="line-total-cell">
                      <span className="mono-text">
                        {formatCurrency(getLineTotal(item))}
                      </span>
                    </td>

                    {/* =================================================
                        ROW ACTIONS
                        + ONLY ON FIRST / DEFAULT ROW
                    ================================================= */}

                    <td className="action-cell">
                      <div className="row-actions">
                        {/* PLUS ONLY FOR FIRST ROW */}

                        {index === 0 && (
                          <button
                            type="button"
                            className="add-row-icon-button"
                            onClick={addRow}
                            title="Add another row"
                          >
                            +
                          </button>
                        )}

                        {/* REMOVE / CLEAR */}

                        <button
                          type="button"
                          className="remove-row-button"
                          onClick={() => removeRow(index)}
                          title={
                            items.length === 1 ? "Clear row" : "Remove row"
                          }
                          disabled={saving}
                        >
                          ×
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* GRAND TOTAL */}

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

        {/* =====================================================
            REMARKS
        ===================================================== */}

        <div className="stockin-remarks">
          <div className="stockin-field">
            <label>Remarks</label>

            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              maxLength={300}
              placeholder="Enter remarks (optional)"
              rows={4}
            />
          </div>
        </div>

        {/* =====================================================
            SUCCESS MESSAGE
            ABOVE SAVE BUTTONS
        ===================================================== */}

        {success && (
          <div className="stockin-success">
            <i className="bi bi-check-circle-fill"></i>

            <span>{success}</span>
          </div>
        )}

        {/* =====================================================
            ACTION BUTTONS
        ===================================================== */}

        <div className="stockin-actions">
          <div></div>

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
