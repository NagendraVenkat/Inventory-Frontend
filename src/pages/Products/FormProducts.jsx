import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import {
  getProductById,
  createProduct,
  updateProduct,
  getProducts,
} from "../../services/productService";

const EMPTY_FORM = {
  productCode: "",
  productName: "",
  categoryId: "",
  supplierId: "",
  unit: "",
  purchasePrice: "",
  sellingPrice: "",
  reorderLevel: "",
};

// Empty-string-safe number field: shows "required" instead of
// "must be a number" when the field is simply left blank.
const numberField = (label, { allowZero = false } = {}) =>
  Yup.number()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? undefined : value
    )
    .typeError(`${label} must be a number.`)
    .required(`${label} is required.`)
    [allowZero ? "min" : "moreThan"](
      0,
      allowZero
        ? `${label} cannot be negative.`
        : `${label} must be greater than 0.`
    );

const validationSchema = Yup.object({
  productCode: Yup.string().trim().required("Product code is required."),
  productName: Yup.string().trim().required("Product name is required."),
  categoryId: Yup.string().required("Category is required."),
  supplierId: Yup.string().required("Supplier is required."),
  unit: Yup.string().trim().required("Unit is required."),
  purchasePrice: numberField("Purchase price"),
  sellingPrice: numberField("Selling price"),
  reorderLevel: numberField("Reorder level", { allowZero: true }),
});

// ==================================================
// SMALL HELPERS
// ==================================================

function FieldError({ message }) {
  if (!message) return null;

  return (
    <span className="field-error">
      <svg viewBox="0 0 20 20" fill="currentColor" className="field-error-icon">
        <path
          fillRule="evenodd"
          d="M8.257 3.1c.765-1.361 2.722-1.361 3.486 0l6.28 11.2c.75 1.335-.213 3-1.743 3H3.72c-1.53 0-2.492-1.665-1.743-3l6.28-11.2ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25-6.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </span>
  );
}

function FormProducts({
  mode,
  productId,
  categories = [],
  suppliers = [],
  onClose,
  onSuccess,
}) {
  // mode: "add" | "edit" | "view"
  // categories / suppliers are passed down from Products.jsx,
  // which loads them once on mount.

  const isAdd = mode === "add";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const title =
    isAdd ? "Add Product" : isEdit ? "Edit Product" : "View Product";

  const [viewProduct, setViewProduct] = useState(null);
  const [initialValues, setInitialValues] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Live "does this product code already exist" check
  const [codeCheck, setCodeCheck] = useState({
    checking: false,
    duplicate: false,
  });
  const codeCheckTimer = useRef(null);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: handleFormSubmit,
  });

  // ==================================================
  // LOAD DATA BASED ON MODE
  // ==================================================

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, productId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

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
      // EDIT MODE
      // ------------------------------------------

      if (isEdit) {
        const productResponse = await getProductById(productId);

        if (!productResponse.data.success) {
          setError(
            productResponse.data.message ||
              "Unable to load product."
          );
          return;
        }

        const product = productResponse.data.data;

        const selectedCategory = categories.find(
          (category) =>
            String(category.categoryId) ===
              String(product.categoryId) ||
            category.categoryName === product.categoryName
        );

        const selectedSupplier = suppliers.find(
          (supplier) =>
            String(supplier.supplierId) ===
              String(product.supplierId) ||
            supplier.supplierName === product.supplierName
        );

        setInitialValues({
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

        return;
      }

      // ------------------------------------------
      // ADD MODE
      // ------------------------------------------

      setInitialValues(EMPTY_FORM);
    } catch (err) {
      console.error("Error loading data:", err);

      setError(
        err.response?.data?.message || "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LIVE PRODUCT-CODE DUPLICATE CHECK (debounced)
  // Kept outside the Yup schema on purpose — this is an
  // async lookup and shouldn't refire on every keystroke,
  // and its result shouldn't get clobbered by the normal
  // synchronous validation cycle.
  // ==================================================

  useEffect(() => {
    if (isView) return;

    const code = formik.values.productCode.trim();

    if (codeCheckTimer.current) clearTimeout(codeCheckTimer.current);

    if (!code) {
      setCodeCheck({ checking: false, duplicate: false });
      return;
    }

    codeCheckTimer.current = setTimeout(async () => {
      try {
        setCodeCheck({ checking: true, duplicate: false });

        const response = await getProducts({
          search: code,
          page: 1,
          pageSize: 10,
        });

        const products = response.data?.data?.products || [];

        const duplicate = products.some(
          (product) =>
            product.productCode?.toLowerCase() === code.toLowerCase() &&
            product.productId !== productId
        );

        setCodeCheck({ checking: false, duplicate });
      } catch (err) {
        // If the lookup fails, don't block the user — the
        // backend still enforces uniqueness on submit.
        setCodeCheck({ checking: false, duplicate: false });
      }
    }, 500);

    return () => clearTimeout(codeCheckTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.productCode]);

  // ==================================================
  // SUBMIT
  // ==================================================

  async function handleFormSubmit(values, { setSubmitting, setFieldError }) {
    if (codeCheck.duplicate) {
      setFieldError("productCode", "This product code already exists.");
      setSubmitting(false);
      return;
    }

    setError("");

    try {
      const productData = {
        productCode: values.productCode.trim(),
        productName: values.productName.trim(),
        categoryId: values.categoryId,
        supplierId: values.supplierId,
        unit: values.unit.trim(),
        purchasePrice: Number(values.purchasePrice),
        sellingPrice: Number(values.sellingPrice),
        reorderLevel: Number(values.reorderLevel),
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
        const message =
          response.data.message ||
          `Failed to ${isEdit ? "update" : "create"} product.`;

        if (message.toLowerCase().includes("code")) {
          setFieldError("productCode", message);
        } else {
          setError(message);
        }
      }
    } catch (err) {
      console.error(
        `Error ${isEdit ? "updating" : "creating"} product:`,
        err
      );

      const message =
        err.response?.data?.message ||
        `Unable to ${isEdit ? "update" : "create"} product.`;

      if (message.toLowerCase().includes("code")) {
        setFieldError("productCode", message);
      } else {
        setError(message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==================================================
  // VIEW STATUS
  // ==================================================

  let viewStatus = "In Stock";

  if (viewProduct) {
    if (viewProduct.currentStock === 0) {
      viewStatus = "Out";
    } else if (
      viewProduct.currentStock <= viewProduct.reorderLevel
    ) {
      viewStatus = "Low";
    }
  }

  // ==================================================
  // FIELD HELPERS
  // ==================================================

  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

  const productCodeError =
    fieldError("productCode") ||
    (codeCheck.duplicate ? "This product code already exists." : "");

  const fieldClass = (name, forceError = false) => {
    const hasError = Boolean(fieldError(name)) || forceError;
    const isValid =
      !hasError &&
      formik.touched[name] &&
      String(formik.values[name]).trim() !== "";

    return `form-group${hasError ? " has-error" : ""}${
      isValid ? " is-valid" : ""
    }`;
  };

  const showValidationSummary =
    formik.submitCount > 0 &&
    (Object.keys(formik.errors).length > 0 || codeCheck.duplicate);

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
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
            <div className="form-error">{error}</div>
          )}

          {/* ---------------------------------- */}
          {/* VIEW MODE */}
          {/* ---------------------------------- */}

          {!loading && !error && isView && viewProduct && (
            <div className="view-product-grid">

              <div className="view-product-field">
                <label>Product Code</label>
                <div>{viewProduct.productCode}</div>
              </div>

              <div className="view-product-field">
                <label>Product Name</label>
                <div>{viewProduct.productName}</div>
              </div>

              <div className="view-product-field">
                <label>Category</label>
                <div>{viewProduct.categoryName}</div>
              </div>

              <div className="view-product-field">
                <label>Supplier</label>
                <div>{viewProduct.supplierName || "-"}</div>
              </div>

              <div className="view-product-field">
                <label>Unit</label>
                <div>{viewProduct.unit}</div>
              </div>

              <div className="view-product-field">
                <label>Purchase Price</label>
                <div>₹{Number(viewProduct.purchasePrice).toFixed(2)}</div>
              </div>

              <div className="view-product-field">
                <label>Selling Price</label>
                <div>₹{Number(viewProduct.sellingPrice).toFixed(2)}</div>
              </div>

              <div className="view-product-field">
                <label>Current Stock</label>
                <div>{viewProduct.currentStock}</div>
              </div>

              <div className="view-product-field">
                <label>Reorder Level</label>
                <div>{viewProduct.reorderLevel}</div>
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

          {!loading && (isAdd || isEdit) && (
            <form onSubmit={formik.handleSubmit} noValidate>

              {showValidationSummary && (
                <div className="form-validation-summary">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="form-validation-summary-icon"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.1c.765-1.361 2.722-1.361 3.486 0l6.28 11.2c.75 1.335-.213 3-1.743 3H3.72c-1.53 0-2.492-1.665-1.743-3l6.28-11.2ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25-6.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Please fix the highlighted fields before saving.
                </div>
              )}

              <div className="form-grid">

                {/* PRODUCT CODE */}
                <div className={fieldClass("productCode", codeCheck.duplicate)}>
                  <label htmlFor="productCode">Product Code</label>

                  <div className="input-status-wrap">
                    <input
                      id="productCode"
                      type="text"
                      name="productCode"
                      value={formik.values.productCode}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      maxLength="18"
                      placeholder="Enter product code"
                    />

                    {codeCheck.checking && (
                      <span className="input-status-spinner" />
                    )}

                    {!codeCheck.checking &&
                      !productCodeError &&
                      formik.touched.productCode &&
                      formik.values.productCode && (
                        <span className="input-status-ok">✓</span>
                      )}
                  </div>

                  <FieldError message={productCodeError} />
                </div>

                {/* PRODUCT NAME */}
                <div className={fieldClass("productName")}>
                  <label htmlFor="productName">Product Name</label>

                  <input
                    id="productName"
                    type="text"
                    name="productName"
                    value={formik.values.productName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength="150"
                    placeholder="Enter product name"
                  />

                  <FieldError message={fieldError("productName")} />
                </div>

                {/* CATEGORY */}
                <div className={fieldClass("categoryId")}>
                  <label htmlFor="categoryId">Category</label>

                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formik.values.categoryId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select Category</option>

                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.categoryName}
                      </option>
                    ))}
                  </select>

                  <FieldError message={fieldError("categoryId")} />
                </div>

                {/* SUPPLIER */}
                <div className={fieldClass("supplierId")}>
                  <label htmlFor="supplierId">Supplier</label>

                  <select
                    id="supplierId"
                    name="supplierId"
                    value={formik.values.supplierId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="">Select Supplier</option>

                    {suppliers.map((supplier) => (
                      <option
                        key={supplier.supplierId}
                        value={supplier.supplierId}
                      >
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>

                  <FieldError message={fieldError("supplierId")} />
                </div>

                {/* UNIT */}
                <div className={fieldClass("unit")}>
                  <label htmlFor="unit">Unit</label>

                  <input
                    id="unit"
                    type="text"
                    name="unit"
                    value={formik.values.unit}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength="20"
                    placeholder="e.g. PCS, Box"
                  />

                  <FieldError message={fieldError("unit")} />
                </div>

                {/* PURCHASE PRICE */}
                <div className={fieldClass("purchasePrice")}>
                  <label htmlFor="purchasePrice">Purchase Price</label>

                  <input
                    id="purchasePrice"
                    type="number"
                    name="purchasePrice"
                    value={formik.values.purchasePrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter purchase price"
                  />

                  <FieldError message={fieldError("purchasePrice")} />
                </div>

                {/* SELLING PRICE */}
                <div className={fieldClass("sellingPrice")}>
                  <label htmlFor="sellingPrice">Selling Price</label>

                  <input
                    id="sellingPrice"
                    type="number"
                    name="sellingPrice"
                    value={formik.values.sellingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter selling price"
                  />

                  <FieldError message={fieldError("sellingPrice")} />
                </div>

                {/* REORDER LEVEL */}
                <div className={fieldClass("reorderLevel")}>
                  <label htmlFor="reorderLevel">Reorder Level</label>

                  <input
                    id="reorderLevel"
                    type="number"
                    name="reorderLevel"
                    value={formik.values.reorderLevel}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min="0"
                    step="1"
                    placeholder="Enter reorder level"
                  />

                  <FieldError message={fieldError("reorderLevel")} />
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
                  disabled={formik.isSubmitting || codeCheck.checking}
                >
                  {formik.isSubmitting
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