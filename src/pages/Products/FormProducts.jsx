import { useEffect, useState } from "react";

import { getCategories } from "../../services/categoryService";
import { getSuppliers } from "../../services/supplierService";
import {
  getProductById,
  createProduct,
  updateProduct,
} from "../../services/productService";

function FormProducts({ mode, productId, onClose, onSuccess }) {
  // mode: "add" | "edit" | "view"

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [formData, setFormData] = useState({
    productCode: "",
    productName: "",
    categoryId: "",
    supplierId: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    reorderLevel: "",
  });

  const [viewProduct, setViewProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const title =
    isAdd
      ? "Add Product"
      : isEdit
      ? "Edit Product"
      : "View Product";

  // ==================================================
  // LOAD DATA BASED ON MODE
  // ==================================================

  useEffect(() => {
    loadData();
  }, [mode, productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      setFieldErrors({});

      // ------------------------------------------
      // VIEW MODE
      // ------------------------------------------

      if (isView) {
        const response = await getProductById(productId);

        if (response.data.success) {
          setViewProduct(response.data.data);
        } else {
          setError(
            response.data.message || "Unable to load product."
          );
        }

        return;
      }

      // ------------------------------------------
      // ADD / EDIT MODE
      // ------------------------------------------

      const requests = [getCategories(), getSuppliers()];

      if (isEdit) {
        requests.push(getProductById(productId));
      }

      const responses = await Promise.all(requests);

      const categoryResponse = responses[0];
      const supplierResponse = responses[1];
      const productResponse = isEdit ? responses[2] : null;

      if (categoryResponse.data.success) {
        setCategories(categoryResponse.data.data);
      }

      if (supplierResponse.data.success) {
        setSuppliers(supplierResponse.data.data);
      }

      // ------------------------------------------
      // EDIT MODE
      // ------------------------------------------

      if (isEdit) {
        if (!productResponse.data.success) {
          setError(
            productResponse.data.message ||
              "Unable to load product."
          );
          return;
        }

        const product = productResponse.data.data;

        // Find existing category
        const selectedCategory =
          categoryResponse.data.data.find(
            (category) =>
              String(category.categoryId) ===
                String(product.categoryId) ||
              category.categoryName ===
                product.categoryName
          );

        // Find existing supplier
        const selectedSupplier =
          supplierResponse.data.data.find(
            (supplier) =>
              String(supplier.supplierId) ===
                String(product.supplierId) ||
              supplier.supplierName ===
                product.supplierName
          );

        setFormData({
          productCode: product.productCode || "",
          productName: product.productName || "",

          categoryId: selectedCategory
            ? String(selectedCategory.categoryId)
            : "",

          supplierId: selectedSupplier
            ? String(selectedSupplier.supplierId)
            : "",

          unit: product.unit || "",
          purchasePrice: product.purchasePrice ?? "",
          sellingPrice: product.sellingPrice ?? "",
          reorderLevel: product.reorderLevel ?? "",
        });
      }

      // ------------------------------------------
      // ADD MODE
      // ------------------------------------------

      else {
        setFormData({
          productCode: "",
          productName: "",
          categoryId: "",
          supplierId: "",
          unit: "",
          purchasePrice: "",
          sellingPrice: "",
          reorderLevel: "",
        });

        setFieldErrors({});
      }
    } catch (error) {
      console.error("Error loading data:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // FORM HANDLERS
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    // Clear only the error for the field being changed
    setFieldErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    // Clear top-level error
    setError("");
  };

  // ==================================================
  // FORM SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // ------------------------------------------
    // VALIDATION
    // ------------------------------------------

    const validationErrors = {};

    if (!formData.productCode.trim()) {
      validationErrors.productCode =
        "Product code is required.";
    }

    if (!formData.productName.trim()) {
      validationErrors.productName =
        "Product name is required.";
    }

    if (!formData.categoryId) {
      validationErrors.categoryId =
        "Category is required.";
    }

    if (!formData.supplierId) {
      validationErrors.supplierId =
        "Supplier is required.";
    }

    if (!formData.unit.trim()) {
      validationErrors.unit =
        "Unit is required.";
    }

    if (
      formData.purchasePrice === "" ||
      Number(formData.purchasePrice) <= 0
    ) {
      validationErrors.purchasePrice =
        "Purchase price must be greater than 0.";
    }

    if (
      formData.sellingPrice === "" ||
      Number(formData.sellingPrice) <= 0
    ) {
      validationErrors.sellingPrice =
        "Selling price must be greater than 0.";
    }

    if (
      formData.reorderLevel === "" ||
      Number(formData.reorderLevel) < 0
    ) {
      validationErrors.reorderLevel =
        "Reorder level cannot be negative.";
    }

    // Display all validation errors
    setFieldErrors(validationErrors);

    // Stop submit if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // ------------------------------------------
    // CREATE / UPDATE
    // ------------------------------------------

    try {
      setSaving(true);

      const productData = {
        productCode: formData.productCode.trim(),
        productName: formData.productName.trim(),
        categoryId: formData.categoryId,
        supplierId: formData.supplierId,
        unit: formData.unit.trim(),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        reorderLevel: Number(formData.reorderLevel),
      };

      const response = isEdit
        ? await updateProduct(productId, productData)
        : await createProduct(productData);

      if (response.data.success) {
        onSuccess(
          isEdit
            ? "Product updated successfully."
            : "Product created successfully."
        );
      } else {
        setError(
          response.data.message ||
            `Failed to ${
              isEdit ? "update" : "create"
            } product.`
        );
      }
    } catch (error) {
      console.error(
        `Error ${
          isEdit ? "updating" : "creating"
        } product:`,
        error
      );

      setError(
        error.response?.data?.message ||
          `Unable to ${
            isEdit ? "update" : "create"
          } product.`
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // VIEW STATUS
  // ==================================================

  let viewStatus = "In Stock";

  if (viewProduct) {
    if (viewProduct.currentStock === 0) {
      viewStatus = "Out";
    } else if (
      viewProduct.currentStock <=
      viewProduct.reorderLevel
    ) {
      viewStatus = "Low";
    }
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>

          {isView && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>

        <div className="modal-body">

          {loading && <p>Loading...</p>}

          {!loading && error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {/* ---------------------------------- */}
          {/* VIEW MODE */}
          {/* ---------------------------------- */}

          {!loading &&
            !error &&
            isView &&
            viewProduct && (
              <div className="view-product-grid">

                <div className="view-product-field">
                  <label>Product Code</label>
                  <div>
                    {viewProduct.productCode}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Product Name</label>
                  <div>
                    {viewProduct.productName}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Category</label>
                  <div>
                    {viewProduct.categoryName}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Supplier</label>
                  <div>
                    {viewProduct.supplierName || "-"}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Unit</label>
                  <div>
                    {viewProduct.unit}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Purchase Price</label>
                  <div>
                    ₹
                    {Number(
                      viewProduct.purchasePrice
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Selling Price</label>
                  <div>
                    ₹
                    {Number(
                      viewProduct.sellingPrice
                    ).toFixed(2)}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Current Stock</label>
                  <div>
                    {viewProduct.currentStock}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Reorder Level</label>
                  <div>
                    {viewProduct.reorderLevel}
                  </div>
                </div>

                <div className="view-product-field">
                  <label>Status</label>

                  <div>
                    <span
                      className={`status-badge ${
                        viewStatus === "In Stock"
                          ? "status-in-stock"
                          : viewStatus === "Low"
                          ? "status-low"
                          : "status-out"
                      }`}
                    >
                      {viewStatus}
                    </span>
                  </div>
                </div>

              </div>
            )}

          {/* ---------------------------------- */}
          {/* ADD / EDIT MODE */}
          {/* ---------------------------------- */}

          {!loading &&
            (isAdd || isEdit) && (
              <form onSubmit={handleSubmit}>

                <div className="form-grid">

                  {/* PRODUCT CODE */}
                  <div className="form-group">
                    <label>Product Code</label>

                    <input
                      type="text"
                      name="productCode"
                      value={formData.productCode}
                      onChange={handleChange}
                      maxLength="18"
                      placeholder="Enter product code"
                    />

                    {fieldErrors.productCode && (
                      <span className="field-error">
                        {fieldErrors.productCode}
                      </span>
                    )}
                  </div>

                  {/* PRODUCT NAME */}
                  <div className="form-group">
                    <label>Product Name</label>

                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                      maxLength="150"
                      placeholder="Enter product name"
                    />

                    {fieldErrors.productName && (
                      <span className="field-error">
                        {fieldErrors.productName}
                      </span>
                    )}
                  </div>

                  {/* CATEGORY */}
                  <div className="form-group">
                    <label>Category</label>

                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.categoryId}
                          value={category.categoryId}
                        >
                          {category.categoryName}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.categoryId && (
                      <span className="field-error">
                        {fieldErrors.categoryId}
                      </span>
                    )}
                  </div>

                  {/* SUPPLIER */}
                  <div className="form-group">
                    <label>Supplier</label>

                    <select
                      name="supplierId"
                      value={formData.supplierId}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Supplier
                      </option>

                      {suppliers.map((supplier) => (
                        <option
                          key={supplier.supplierId}
                          value={supplier.supplierId}
                        >
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>

                    {fieldErrors.supplierId && (
                      <span className="field-error">
                        {fieldErrors.supplierId}
                      </span>
                    )}
                  </div>

                  {/* UNIT */}
                  <div className="form-group">
                    <label>Unit</label>

                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      maxLength="20"
                      placeholder="e.g. PCS, Box"
                    />

                    {fieldErrors.unit && (
                      <span className="field-error">
                        {fieldErrors.unit}
                      </span>
                    )}
                  </div>

                  {/* PURCHASE PRICE */}
                  <div className="form-group">
                    <label>Purchase Price</label>

                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      placeholder="Enter purchase price"
                    />

                    {fieldErrors.purchasePrice && (
                      <span className="field-error">
                        {fieldErrors.purchasePrice}
                      </span>
                    )}
                  </div>

                  {/* SELLING PRICE */}
                  <div className="form-group">
                    <label>Selling Price</label>

                    <input
                      type="number"
                      name="sellingPrice"
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      placeholder="Enter selling price"
                    />

                    {fieldErrors.sellingPrice && (
                      <span className="field-error">
                        {fieldErrors.sellingPrice}
                      </span>
                    )}
                  </div>

                  {/* REORDER LEVEL */}
                  <div className="form-group">
                    <label>Reorder Level</label>

                    <input
                      type="number"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleChange}
                      min="0"
                      step="1"
                      placeholder="Enter reorder level"
                    />

                    {fieldErrors.reorderLevel && (
                      <span className="field-error">
                        {fieldErrors.reorderLevel}
                      </span>
                    )}
                  </div>

                </div>

                {/* FORM ACTIONS */}
                <div className="form-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={onClose}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-product-btn"
                    disabled={saving}
                  >
                    {saving
                      ? isEdit
                        ? "Updating..."
                        : "Saving..."
                      : isEdit
                      ? "Update Product"
                      : "Save Product"}
                  </button>

                </div>

              </form>
            )}

        </div>
      </div>
    </div>
  );
}

export default FormProducts;