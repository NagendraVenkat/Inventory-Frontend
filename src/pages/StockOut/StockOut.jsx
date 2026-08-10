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

      setError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load products.",
      );
    } finally {
      setLoading(false);
    }
  };

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
       Product Change
    ========================= */

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
  };

  /* =========================
       Get Selected Product
    ========================= */

  const getSelectedProduct = (productId) => {
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

    if (!lastItem.unitPrice || Number(lastItem.unitPrice) <= 0) {
      setError(
        "Unit Price should be greater than zero before adding another row.",
      );
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: "",
        unitPrice: "",
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

    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  /* =========================
       Line Total
    ========================= */

  const getLineTotal = (item) => {
    const quantity = Number(item.quantity) || 0;

    const unitPrice = Number(item.unitPrice) || 0;

    return quantity * unitPrice;
  };

  /* =========================
       Grand Quantity
    ========================= */

  const grandQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0,
  );

  /* =========================
       Grand Total
    ========================= */

  const grandTotal = items.reduce(
    (total, item) => total + getLineTotal(item),
    0,
  );

  /* =========================
       Currency
    ========================= */

  const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /* =========================
       Save Stock Out
    ========================= */

  const handleSave = async () => {
    try {
      setError("");
      setSuccess("");

      /* -------------------------
         Date Validation
      ------------------------- */

      if (!transactionDate) {
        setError("Transaction Date is required.");
        return;
      }

      if (new Date(transactionDate) > new Date()) {
        setError("Transaction Date cannot be in the future.");
        return;
      }

      /* -------------------------
         At Least One Product
      ------------------------- */

      if (items.length === 0) {
        setError("Please add at least one product.");
        return;
      }

      /* -------------------------
         Duplicate Product Check
      ------------------------- */

      const productIds = items.map((item) => item.productId);

      const duplicateProductId = productIds.find(
        (id, index) => id && productIds.indexOf(id) !== index,
      );

      if (duplicateProductId) {
        const duplicateProduct = getSelectedProduct(duplicateProductId);

        setError(
          duplicateProduct
            ? `Product '${duplicateProduct.productName}' is added more than once.`
            : "The same product cannot be added more than once.",
        );

        return;
      }

      /* -------------------------
         Validate EVERY Row
      ------------------------- */

      for (let index = 0; index < items.length; index++) {
        const item = items[index];

        /* Product */

        if (!item.productId) {
          setError(`Please select a product for row ${index + 1}.`);
          return;
        }

        /* Quantity */

        if (!item.quantity || Number(item.quantity) <= 0) {
          setError(
            `Quantity should be greater than zero for row ${index + 1}.`,
          );
          return;
        }

        /* Unit Price */

        if (!item.unitPrice || Number(item.unitPrice) <= 0) {
          setError(
            `Unit Price should be greater than zero for row ${index + 1}.`,
          );
          return;
        }

        /* -------------------------
           Product Validation
        ------------------------- */

        const product = getSelectedProduct(item.productId);

        if (!product) {
          setError(`Product in row ${index + 1} was not found.`);
          return;
        }

        if (!product.isActive) {
          setError(`Product '${product.productName}' is inactive.`);
          return;
        }

        /* -------------------------
           Available Stock Check
        ------------------------- */

        if (Number(item.quantity) > Number(product.currentStock)) {
          setError(
            `Cannot issue ${item.quantity} units of '${product.productName}'. Available stock is ${product.currentStock}.`,
          );
          return;
        }
      }

      /* -------------------------
         Payload
      ------------------------- */

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

      /* -------------------------
         Save
      ------------------------- */

      setSaving(true);

      const result = await createStockOut(payload);

      if (!result.success) {
        setError(result.message || "Unable to save Stock Out.");
        return;
      }

      /* -------------------------
         Success
      ------------------------- */

      setSuccess(
        `Stock Out completed successfully. Transaction: ${result.data.transactionNumber}`,
      );

      /* -------------------------
         Reset Form
      ------------------------- */

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

      /* -------------------------
         Refresh Products
      ------------------------- */

      await loadProducts();
    } catch (error) {
      console.error("Stock Out save error:", error);

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
      <div className="stockout-page">
        <div className="stockout-card">
          <div className="stockout-loading">Loading Stock Out...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stockout-page">
      <div className="stockout-card">
        {/* =========================
                    HEADER
                ========================= */}

        <div className="stockout-card-header">
          <div>
            <h2>New Stock Out</h2>

            <p>Issue products from inventory</p>
          </div>
        </div>

        {/* =========================
                    MESSAGES
                ========================= */}

        {error && (
          <div className="stockout-message stockout-error">{error}</div>
        )}

        {success && (
          <div className="stockout-message stockout-success">{success}</div>
        )}

        {/* =========================
                    BASIC INFORMATION
                ========================= */}

        <div className="stockout-basic-info">
          {/* Reference */}

          <div className="stockout-field">
            <label>Issued To / Reference</label>

            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="Enter reference"
              maxLength={50}
            />
          </div>

          {/* Date */}

          <div className="stockout-field">
            <label>
              Date
              <span>*</span>
            </label>

            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Remarks */}

          <div className="stockout-field">
            <label>Remarks</label>

            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional"
              maxLength={300}
            />
          </div>
        </div>

        {/* =========================
                    TABLE
                ========================= */}

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

            {/* TABLE HEADER */}

            <thead>
              <tr>
                <th>PRODUCT</th>

                <th className="center-header">AVAILABLE</th>

                <th className="center-header">QTY</th>

                <th className="right-header">UNIT PRICE ₹</th>

                <th className="right-header">LINE TOTAL ₹</th>

                <th></th>
              </tr>
            </thead>

            {/* TABLE BODY */}

            <tbody>
              {items.map((item, index) => {
                const selectedProduct = getSelectedProduct(item.productId);

                return (
                  <tr key={index}>
                    {/* Product */}

                    <td>
                      <select
                        className="stockout-product-select"
                        value={item.productId}
                        onChange={(e) =>
                          handleProductChange(index, e.target.value)
                        }
                      >
                        <option value="">Select Product</option>

                        {products.map((product) => (
                          <option
                            key={product.productId}
                            value={product.productId}
                            disabled={items.some(
                              (existingItem, existingIndex) =>
                                existingIndex !== index &&
                                existingItem.productId === product.productId,
                            )}
                          >
                            {product.productCode}
                            {" — "}
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Available */}

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

                    {/* Quantity */}

                    <td>
                      <input
                        className="stockout-number-input quantity-input"
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
                    </td>

                    {/* Unit Price */}

                    <td>
                      <input
                        className="stockout-number-input price-input"
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
                );
              })}
            </tbody>

            {/* TABLE FOOTER */}

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

        {/* =========================
                    ACTIONS
                ========================= */}

        <div className="stockout-actions">
          <button
            type="button"
            className="add-row-button"
            onClick={addRow}
            disabled={saving}
          >
            <span>+</span>
            Add Row
          </button>

          <div className="stockout-right-actions">
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
