import { useEffect, useState } from "react";

import "./Products.css";

import {
  getProducts,
  deactivateProduct,
} from "../../services/productService";

import { getCategories } from "../../services/categoryService";
import { getSuppliers } from "../../services/supplierService";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import FormProducts from "./FormProducts";

function Products() {
  // --------------------------------------------------
  // Products
  // --------------------------------------------------

  const [products, setProducts] = useState([]);

  // --------------------------------------------------
  // Search and Category
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // --------------------------------------------------
  // Categories / Suppliers
  // Loaded once here and shared with the Add/Edit/View
  // modal via props, instead of FormProducts re-fetching
  // them on every open.
  // --------------------------------------------------

  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // --------------------------------------------------
  // Loading and Messages
  // --------------------------------------------------

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // --------------------------------------------------
  // Pagination
  // --------------------------------------------------

  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // --------------------------------------------------
  // Row Selection
  // --------------------------------------------------

  const [selectedProductId, setSelectedProductId] =
    useState(null);

  // --------------------------------------------------
  // Add / View / Edit Modal
  // --------------------------------------------------

  const [modalMode, setModalMode] = useState(null);
  // null | "add" | "view" | "edit"

  // --------------------------------------------------
  // Deactivate Confirmation
  // --------------------------------------------------

  const [showConfirm, setShowConfirm] = useState(false);
  const [actionLoading, setActionLoading] =
    useState(false);

  // ==================================================
  // LOAD CATEGORIES + SUPPLIERS (once)
  // ==================================================

  useEffect(() => {
    loadCategories();
    loadSuppliers();
  }, []);

  // ==================================================
  // LOAD PRODUCTS
  // ==================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search, categoryId, currentPage]);

  // ==================================================
  // GET CATEGORIES
  // ==================================================

  const loadCategories = async () => {
    try {
      const response = await getCategories();

      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error(
        "Error loading categories:",
        error
      );
    }
  };

  // ==================================================
  // GET SUPPLIERS
  // ==================================================

  const loadSuppliers = async () => {
    try {
      const response = await getSuppliers();

      if (response.data.success) {
        setSuppliers(response.data.data);
      }
    } catch (error) {
      console.error(
        "Error loading suppliers:",
        error
      );
    }
  };

  // ==================================================
  // GET PRODUCTS
  // ==================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts({
        search: search,
        categoryId: categoryId,
        page: currentPage,
        pageSize: pageSize,
      });

      if (response.data.success) {
        setProducts(
          response.data.data.products
        );

        setTotalRecords(
          response.data.data.totalRecords
        );
      } else {
        setProducts([]);
        setTotalRecords(0);

        setError(
          response.data.message ||
            "Failed to load products."
        );
      }
    } catch (error) {
      console.error(
        "Error loading products:",
        error
      );

      setProducts([]);
      setTotalRecords(0);

      setError(
        error.response?.data?.message ||
          "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SELECTION
  // ==================================================

  const handleSelectProduct = (productId) => {
  if (selectedProductId === productId) {
    setSelectedProductId(null);
  } else {
    setSelectedProductId(productId);
  }
};

  const handleClearSelection = () => {
    setSelectedProductId(null);
  };

  // ==================================================
  // MODAL OPEN / CLOSE
  // ==================================================

  const openAddModal = () => {
    setModalMode("add");
  };

  const openViewModal = () => {
    if (selectedProductId) {
      setModalMode("view");
    }
  };

  const openEditModal = () => {
    if (selectedProductId) {
      setModalMode("edit");
    }
  };

  const closeModal = () => {
    setModalMode(null);
  };

  // ==================================================
  // ADD / EDIT SUCCESS
  // ==================================================

  const handleFormSuccess = (message) => {
    setModalMode(null);
    setSelectedProductId(null);

    setSuccess(message);
    loadProducts();

    setTimeout(() => {
      setSuccess("");
    }, 2000);
  };

  // ==================================================
  // OPEN DEACTIVATE CONFIRMATION
  // ==================================================

  const handleDeactivateClick = () => {
    if (!selectedProductId) {
      return;
    }

    setShowConfirm(true);

    setActionError("");
    setSuccess("");
  };

  // ==================================================
  // CONFIRM DEACTIVATE
  // ==================================================

  const confirmDeactivate = async () => {
    if (!selectedProductId) {
      return;
    }

    try {
      setActionLoading(true);

      setActionError("");
      setSuccess("");

      const response =
        await deactivateProduct(
          selectedProductId
        );

      // ----------------------------------------------
      // SUCCESS
      // ----------------------------------------------

      if (response.data.success) {
        setShowConfirm(false);
        setSelectedProductId(null);

        setSuccess(
          "Product deactivated successfully."
        );

        await loadProducts();

        setTimeout(() => {
          setSuccess("");
        }, 2000);
      }

      // ----------------------------------------------
      // BACKEND REJECTED DEACTIVATION
      // ----------------------------------------------

      else {
        setShowConfirm(false);

        const backendMessage =
          response.data.message;

        if (
          backendMessage ===
          "Product cannot be deleted because stock transactions exist."
        ) {
          setActionError(
            "This product cannot be deactivated because stock transactions exist."
          );
        } else {
          setActionError(
            backendMessage ||
              "Unable to deactivate product."
          );
        }

        setTimeout(() => {
          setActionError("");
        }, 2000);
      }
    }

    // ----------------------------------------------
    // API / NETWORK ERROR
    // ----------------------------------------------

    catch (error) {
      console.error(
        "Error deactivating product:",
        error
      );

      setShowConfirm(false);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.title;

      if (
        backendMessage ===
        "Product cannot be deleted because stock transactions exist."
      ) {
        setActionError(
          "This product cannot be deactivated because stock transactions exist."
        );
      } else {
        setActionError(
          backendMessage ||
            "Unable to deactivate product."
        );
      }

      setTimeout(() => {
        setActionError("");
      }, 2000);
    }

    finally {
      setActionLoading(false);
    }
  };

  // ==================================================
  // CANCEL DEACTIVATE
  // ==================================================

  const cancelDeactivate = () => {
    setShowConfirm(false);
    setActionError("");
  };

  // ==================================================
  // PAGINATION
  // ==================================================

  const totalPages = Math.ceil(
    totalRecords / pageSize
  );

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="products-page">
    <h2 className="products-title">Product Management</h2>

      {/* ------------------------------------------ */}
      {/* Success Message */}
      {/* ------------------------------------------ */}

      {success && (
        <div className="form-success">
          {success}
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Product Loading Error */}
      {/* ------------------------------------------ */}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Deactivate Error */}
      {/* ------------------------------------------ */}

      {actionError && (
        <div className="form-error">
          {actionError}
        </div>
      )}

      {/* ------------------------------------------ */}
      {/* Toolbar */}
      {/* ------------------------------------------ */}

      <div className="products-toolbar">

        {/* Search */}

        <input
          type="text"
          className="products-search"
          placeholder="Search code or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
            setSelectedProductId(null);
          }}
        />

        {/* Category */}

        <select
          className="products-category"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setCurrentPage(1);
            setSelectedProductId(null);
          }}
        >
          <option value="">
            All Categories
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

        {/* Toolbar Actions */}

        <div className="products-toolbar-actions">

          {!selectedProductId && (
            <button
              className="add-product-btn"
              onClick={openAddModal}
            >
              + Add Product
            </button>
          )}

          {selectedProductId && (
            <>
              <button
                type="button"
                className="view-btn"
                onClick={openViewModal}
              >
                View
              </button>

              <button
                type="button"
                className="edit-btn"
                onClick={openEditModal}
              >
                Edit
              </button>

              <button
                type="button"
                className="deactivate-btn"
                onClick={handleDeactivateClick}
              >
                Deactivate
              </button>
            </>
          )}

        </div>

      </div>

      {/* ------------------------------------------ */}
      {/* Products Table */}
      {/* ------------------------------------------ */}

      <div className="products-table-container">

        <table className="products-table">

          <thead>
            <tr>
              <th>CODE</th>
              <th>NAME</th>
              <th>CATEGORY</th>
              <th>UNIT</th>
              <th>PURCHASE ₹</th>
              <th>SELLING ₹</th>
              <th>STOCK</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>

            {/* Loading */}

            {loading && (
              <tr>
                <td
                  colSpan="8"
                  className="no-products"
                >
                  Loading products...
                </td>
              </tr>
            )}

            {/* No Products */}

            {!loading &&
              !error &&
              products.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="no-products"
                  >
                    No products found
                  </td>
                </tr>
              )}

            {/* Products */}

            {!loading &&
              products.map((product) => {

                let status = "In Stock";

                if (
                  product.currentStock === 0
                ) {
                  status = "Out";
                } else if (
                  product.currentStock <=
                  product.reorderLevel
                ) {
                  status = "Low";
                }

                const isSelected =
                  selectedProductId ===
                  product.productId;

                return (
                  <tr
                    key={product.productId}
                    className={
                      isSelected
                        ? "selected-product-row"
                        : ""
                    }
                    onClick={() =>
                      handleSelectProduct(
                        product.productId
                      )
                    }
                  >

                    {/* Product Code */}

                    <td>
                      {product.productCode}
                    </td>

                    {/* Product Name */}

                    <td>
                      {product.productName}
                    </td>

                    {/* Category */}

                    <td>
                      {product.categoryName}
                    </td>

                    {/* Unit */}

                    <td>
                      {product.unit}
                    </td>

                    {/* Purchase Price */}

                    <td>
                      {Number(
                        product.purchasePrice
                      ).toFixed(2)}
                    </td>

                    {/* Selling Price */}

                    <td>
                      {Number(
                        product.sellingPrice
                      ).toFixed(2)}
                    </td>

                    {/* Stock */}

                    <td>
                      {product.currentStock}
                    </td>

                    {/* Status */}

                    <td>
                      <span
                        className={`status-badge status-${status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {status}
                      </span>
                    </td>

                  </tr>
                );
              })}

          </tbody>

        </table>

      </div>

      {/* ------------------------------------------ */}
      {/* Pagination */}
      {/* ------------------------------------------ */}

      {!loading &&
        !error &&
        products.length > 0 && (
          <div className="products-pagination">

            {/* Showing Count */}

            <span className="pagination-info">
              Showing{" "}
              {(currentPage - 1) * pageSize + 1}
              –
              {Math.min(
                currentPage * pageSize,
                totalRecords
              )}{" "}
              of {totalRecords}
            </span>

            {/* Pagination Buttons */}

            <div className="pagination-buttons">

              {/* Previous */}

              <button
                type="button"
                className="pagination-arrow"
                disabled={currentPage === 1}
                onClick={() => {
                  setCurrentPage(
                    currentPage - 1
                  );
                  setSelectedProductId(null);
                }}
              >
                ‹
              </button>

              {/* Page Numbers */}

              {Array.from(
                {
                  length: totalPages,
                },
                (_, index) => index + 1
              )
                .filter((page) => {
                  if (totalPages <= 3) {
                    return true;
                  }

                  if (currentPage === 1) {
                    return page <= 3;
                  }

                  if (
                    currentPage === totalPages
                  ) {
                    return (
                      page >=
                      totalPages - 2
                    );
                  }

                  return (
                    page >= currentPage - 1 &&
                    page <= currentPage + 1
                  );
                })
                .map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={
                      currentPage === page
                        ? "pagination-number active"
                        : "pagination-number"
                    }
                    onClick={() => {
                      setCurrentPage(page);
                      setSelectedProductId(null);
                    }}
                  >
                    {page}
                  </button>
                ))}

              {/* Next */}

              <button
                type="button"
                className="pagination-arrow"
                disabled={
                  currentPage === totalPages
                }
                onClick={() => {
                  setCurrentPage(
                    currentPage + 1
                  );
                  setSelectedProductId(null);
                }}
              >
                ›
              </button>

            </div>

          </div>
        )}

      {/* ------------------------------------------ */}
      {/* Add / View / Edit Modal */}
      {/* ------------------------------------------ */}

      {modalMode && (
        <FormProducts
          mode={modalMode}
          productId={selectedProductId}
          categories={categories}
          suppliers={suppliers}
          onClose={closeModal}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* ------------------------------------------ */}
      {/* Confirmation Dialog */}
      {/* ------------------------------------------ */}

      <ConfirmDialog
        isOpen={showConfirm}
        onConfirm={confirmDeactivate}
        onCancel={cancelDeactivate}
        loading={actionLoading}
        message="Are you sure you want to deactivate this product?"
      />

    </div>
  );
}

export default Products;