import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StockOut.css";

import {
  getStockOutProducts,
  createStockOut,
} from "../../services/stockOutService";

function StockOut() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);

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

  const [errors, setErrors] = useState({
    referenceNo: "",
    transactionDate: "",
    items: {},
    form: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      setErrors({
        referenceNo: "",
        transactionDate: "",
        items: {},
        form: "",
      });

      const result = await getStockOutProducts();

      if (!result.success) {
        throw new Error(result.message || "Unable to load products.");
      }

      const productData = result.data?.products || [];

      setProducts(
        Array.isArray(productData)
          ? productData.filter((product) => product.isActive)
          : [],
      );
    } catch (error) {
      console.error("Stock Out product load error:", error);

      setErrors((currentErrors) => ({
        ...currentErrors,
        form:
          error.response?.data?.message ||
          error.message ||
          "Unable to load products.",
      }));
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET SELECTED PRODUCT
  // =========================================================

  const getSelectedProduct = (productId) => {
    return products.find((product) => product.productId === productId);
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
  // PRODUCT CHANGE
  // =========================================================

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find(
      (product) => product.productId === productId,
    );

    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              quantity: "",
              unitPrice: selectedProduct ? selectedProduct.sellingPrice : "",
            }
          : item,
      ),
    );

    setErrors((currentErrors) => {
      const updatedErrors = { ...currentErrors };

      if (updatedErrors.items?.[index]) {
        updatedErrors.items = {
          ...updatedErrors.items,
          [index]: {
            ...updatedErrors.items[index],
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
  // VALIDATE COMPLETE FORM
  // =========================================================

  const validateForm = () => {
    const validationErrors = {
      referenceNo: "",
      transactionDate: "",
      items: {},
      form: "",
    };

    // -------------------------------------------------------
    // REFERENCE VALIDATION
    // MANDATORY FIELD
    // -------------------------------------------------------

    const trimmedReferenceNo = referenceNo.trim();

    if (!trimmedReferenceNo) {
      validationErrors.referenceNo = "Issued To / Reference is required.";
    } else if (trimmedReferenceNo.length < 3) {
      validationErrors.referenceNo =
        "Issued To / Reference must contain at least 3 characters.";
    } else if (!/^[A-Za-z0-9][A-Za-z0-9\/\-_ ]*$/.test(trimmedReferenceNo)) {
      validationErrors.referenceNo =
        "Use letters, numbers, spaces, hyphen (-), underscore (_) or slash (/).";
    }

    // -------------------------------------------------------
    // DATE VALIDATION
    // MANDATORY FIELD
    // -------------------------------------------------------

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

      // -----------------------------------------------------
      // PRODUCT
      // -----------------------------------------------------

      if (!item.productId) {
        itemErrors.productId = "Please select a product.";
      } else {
        if (selectedProductIds.includes(item.productId)) {
          itemErrors.productId =
            "This product is already added in another row.";
        }

        selectedProductIds.push(item.productId);

        const product = getSelectedProduct(item.productId);

        if (!product) {
          itemErrors.productId = "Selected product was not found.";
        } else if (!product.isActive) {
          itemErrors.productId = "This product is inactive.";
        }
      }

      // -----------------------------------------------------
      // QUANTITY
      // -----------------------------------------------------

      const quantity = Number(item.quantity);

      if (item.quantity === "") {
        itemErrors.quantity = "Quantity is required.";
      } else if (!Number.isInteger(quantity) || quantity <= 0) {
        itemErrors.quantity =
          "Quantity must be a whole number greater than zero.";
      } else {
        const product = getSelectedProduct(item.productId);

        if (product && quantity > Number(product.currentStock)) {
          itemErrors.quantity = `Available stock is ${product.currentStock}.`;
        }
      }

      // -----------------------------------------------------
      // UNIT PRICE
      // -----------------------------------------------------

      const unitPrice = Number(item.unitPrice);

      if (item.unitPrice === "") {
        itemErrors.unitPrice = "Unit Price is required.";
      } else if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
        itemErrors.unitPrice = "Unit Price must be greater than zero.";
      }

      validationErrors.items[index] = itemErrors;
    });

    // -------------------------------------------------------
    // CHECK HEADER ERRORS
    // -------------------------------------------------------

    const hasHeaderErrors =
      validationErrors.referenceNo || validationErrors.transactionDate;

    // -------------------------------------------------------
    // CHECK ITEM ERRORS
    // -------------------------------------------------------

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
    /*
      Validate the complete current form before adding
      another row.

      This means:
      - Reference No is validated only if entered.
      - Date is validated.
      - Every existing item row is validated.
      - Remarks is ignored because it is optional.
    */

    const validationErrors = validateForm();

    if (validationErrors) {
      setErrors(validationErrors);
      setSuccess("");
      return;
    }

    // Current rows are valid.
    // Now add a new empty row.
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
        unitPrice: "",
      },
    ]);

    setErrors({
      referenceNo: "",
      transactionDate: "",
      items: {},
      form: "",
    });

    setSuccess("");
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

  // =========================================================
  // GRAND QUANTITY
  // =========================================================

  const grandQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  // =========================================================
  // GRAND TOTAL
  // =========================================================

  const grandTotal = items.reduce(
    (total, item) => total + getLineTotal(item),
    0,
  );

  // =========================================================
  // CURRENCY
  // =========================================================

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================================
  // SAVE STOCK OUT
  // =========================================================

  const handleSave = async () => {
    setErrors({
      referenceNo: "",
      transactionDate: "",
      items: {},
      form: "",
    });

    setSuccess("");

    const validationErrors = validateForm();

    if (validationErrors) {
      setErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        transactionDate: `${transactionDate}T00:00:00`,

        referenceNo: referenceNo.trim() || null,

        remarks: remarks.trim() || null,

        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),
      };

      const result = await createStockOut(payload);

      // =====================================================
      // BACKEND VALIDATION
      // =====================================================

      if (!result.success) {
        const message = result.message || "Unable to save Stock Out.";

        if (
          message.toLowerCase().includes("reference") &&
          message.toLowerCase().includes("already")
        ) {
          setErrors({
            referenceNo: message,
            transactionDate: "",
            items: {},
            form: "",
          });
        } else {
          setErrors({
            referenceNo: "",
            transactionDate: "",
            items: {},
            form: message,
          });
        }

        return;
      }

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        `Stock Out completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      // =====================================================
      // RESET FORM
      // =====================================================

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

      setErrors({
        referenceNo: "",
        transactionDate: "",
        items: {},
        form: "",
      });

      // =====================================================
      // REFRESH PRODUCTS
      // =====================================================

      await loadProducts();
    } catch (error) {
      console.error("Stock Out save error:", error);

      const message =
        error.response?.data?.message || "Unable to connect to the server.";

      if (
        message.toLowerCase().includes("reference") &&
        message.toLowerCase().includes("already")
      ) {
        setErrors({
          referenceNo: message,
          transactionDate: "",
          items: {},
          form: "",
        });
      } else {
        setErrors({
          referenceNo: "",
          transactionDate: "",
          items: {},
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
    if (saving) {
      return;
    }

    navigate("/dashboard");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="stockout-page">
        <div className="stockout-card">
          <div className="stockout-loading">Loading Stock Out...</div>
        </div>
      </div>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="stockout-page">
      <div className="stockout-card">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="stockout-card-header">
          <h2>New Stock Out (Issue Entry)</h2>
        </div>

        {/* =====================================================
            FORM LEVEL ERROR
        ===================================================== */}

        {errors.form && (
          <div className="stockout-message stockout-error">
            <i className="bi bi-exclamation-circle-fill"></i>

            <span>{errors.form}</span>
          </div>
        )}

        {/* =====================================================
            BASIC INFORMATION
        ===================================================== */}

        <div className="stockout-basic-info">
          {/* REFERENCE */}

          <div className="stockout-field">
            <label>
              Issued To / Reference <span className="required-star">*</span>
            </label>
            <input
              type="text"
              className={errors.referenceNo ? "stockout-invalid" : ""}
              value={referenceNo}
              onChange={(e) => {
                setReferenceNo(e.target.value);

                setErrors((currentErrors) => ({
                  ...currentErrors,
                  referenceNo: "",
                }));

                setSuccess("");
              }}
              placeholder="Example: DEPT-2026-001"
              maxLength={50}
            />

            <span className="field-hint">
              Example: DEPT-2026-001 or ISSUE/2026/001
            </span>

            {errors.referenceNo && (
              <span className="validation-message">{errors.referenceNo}</span>
            )}
          </div>

          {/* DATE */}

          <div className="stockout-field">
            <label>
              Date <span className="required-star">*</span>
            </label>

            <input
              type="date"
              className={errors.transactionDate ? "stockout-invalid" : ""}
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

        <div className="stockout-table-wrapper">
          <table className="stockout-table">
            <colgroup>
              <col className="stockout-product-column" />
              <col className="stockout-available-column" />
              <col className="stockout-quantity-column" />
              <col className="stockout-price-column" />
              <col className="stockout-total-column" />
              <col className="stockout-action-column" />
            </colgroup>

            <thead>
              <tr>
                <th>
                  PRODUCT <span className="required-star">*</span>
                </th>

                <th className="center-header">AVAILABLE</th>

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
                const selectedProduct = getSelectedProduct(item.productId);

                const itemErrors = errors.items?.[index] || {};

                return (
                  <tr key={index}>
                    {/* PRODUCT */}

                    <td>
                      <select
                        className={`stockout-product-select ${
                          itemErrors.productId ? "stockout-invalid" : ""
                        }`}
                        value={item.productId}
                        onChange={(e) =>
                          handleProductChange(index, e.target.value)
                        }
                      >
                        <option value="">Select Product</option>

                        {products.map((product) => {
                          const alreadySelected = items.some(
                            (existingItem, existingIndex) =>
                              existingIndex !== index &&
                              existingItem.productId === product.productId,
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

                    {/* AVAILABLE */}

                    <td className="available-cell">
                      <span
                        className={
                          selectedProduct &&
                          selectedProduct.currentStock <=
                            selectedProduct.reorderLevel
                            ? "stock-low"
                            : ""
                        }
                      >
                        {selectedProduct ? selectedProduct.currentStock : "—"}
                      </span>
                    </td>

                    {/* QUANTITY */}

                    <td>
                      <input
                        className={`stockout-number-input quantity-input ${
                          itemErrors.quantity ? "stockout-invalid" : ""
                        }`}
                        type="number"
                        min="1"
                        max={
                          selectedProduct
                            ? selectedProduct.currentStock
                            : undefined
                        }
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
                        className={`stockout-number-input price-input ${
                          itemErrors.unitPrice ? "stockout-invalid" : ""
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

                    {/* ACTIONS */}

                    <td className="action-cell">
                      <div className="row-actions">
                        {/* PLUS ONLY ON FIRST ROW */}

                        {index === 0 && (
                          <button
                            type="button"
                            className="add-row-icon-button"
                            onClick={addRow}
                            disabled={saving}
                            title="Add another row"
                          >
                            +
                          </button>
                        )}

                        {/* REMOVE */}

                        <button
                          type="button"
                          className="remove-row-button"
                          onClick={() => removeRow(index)}
                          disabled={saving}
                          title={
                            items.length === 1 ? "Clear row" : "Remove row"
                          }
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

                <td></td>

                <td className="grand-total-quantity">{grandQuantity}</td>

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

        <div className="stockout-remarks">
          <div className="stockout-field">
            <label>Remarks</label>

            <textarea
              value={remarks}
              onChange={(e) => {
                setRemarks(e.target.value);
                setSuccess("");
              }}
              maxLength={300}
              placeholder="Enter remarks (optional)"
              rows={3}
            />
          </div>
        </div>

        {/* =====================================================
            SUCCESS MESSAGE
            BETWEEN REMARKS AND BUTTONS
        ===================================================== */}

        {success && (
          <div className="stockout-success-wrapper">
            <div className="stockout-success">
              <i className="bi bi-check-circle-fill"></i>

              <span>{success}</span>
            </div>
          </div>
        )}

        {/* =====================================================
            ACTION AREA
        ===================================================== */}

        <div className="stockout-actions">
          <div></div>

          <div className="stockout-right-actions">
            {/* CANCEL */}

            <button
              type="button"
              className="cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            {/* SAVE */}

            <button
              type="button"
              className="save-stockout-button"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Stock Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockOut;
