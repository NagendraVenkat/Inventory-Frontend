import { useCallback, useEffect, useState } from "react";

import SearchBar from "./SearchBar";
import CategoryTable from "./CategoryTable";
import CategoryModal from "./CategoryModal";

import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  activateCategory,
} from "../../services/categoryService";

function Categories() {
  // Categories
  const [categories, setCategories] = useState([]);

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  // Selected Category
  const [selectedCategory, setSelectedCategory] = useState({
    categoryId: null,
    categoryName: "",
    description: "",
    isActive: true,
  });

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load Categories
  const loadCategories = useCallback(
    async (search = "") => {
      try {
        setLoading(true);

        const response = await getCategories(search, currentPage, pageSize);

        if (response.success) {
          setCategories(response.data?.items ?? []);
          setTotalPages(response.data?.totalPages ?? 1);
          setHasPreviousPage(response.data?.hasPreviousPage ?? false);
          setHasNextPage(response.data?.hasNextPage ?? false);
          setTotalCount(response.data?.totalCount ?? 0);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  // Load Categories
  useEffect(() => {
    loadCategories(debouncedSearch);
  }, [debouncedSearch, currentPage, loadCategories]);

  // Add Category
  const handleAddClick = () => {
    setSelectedCategory({
      categoryId: null,
      categoryName: "",
      description: "",
      isActive: true,
    });

    setShowModal(true);
  };

  // Edit Category
  const handleEdit = async (category) => {
    try {
      const response = await getCategoryById(category.categoryId);

      if (response.success) {
        setSelectedCategory(response.data);
        setShowModal(true);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load category.");
    }
  };

  // Delete Category
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteCategory(id);

      if (response.success) {
        await loadCategories(debouncedSearch);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to delete category.");
      }
    }
  };

  // Close Modal
  const handleClose = () => {
    setSelectedCategory({
      categoryId: null,
      categoryName: "",
      description: "",
      isActive: true,
    });

    setShowModal(false);
  };

  const handleActivate = async (id) => {
    try {
      const response = await activateCategory(id);

      if (response.success) {
        await loadCategories(debouncedSearch);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to activate category.");
      }
    }
  };

  // Save Category (Create / Update)
  const handleSave = async (values) => {
    // Trim inputs
    const categoryName = values.categoryName.trim();
    const description = values.description?.trim() ?? "";

    // Validation
    if (!categoryName) {
      alert("Category Name is required.");
      return;
    }

    if (categoryName.length > 100) {
      alert("Category Name cannot exceed 100 characters.");
      return;
    }

    if (description.length > 250) {
      alert("Description cannot exceed 250 characters.");
      return;
    }

    // Prepare request object
    const category = {
      categoryName,
      description,
      isActive: values.isActive,
    };

    setSaving(true);

    try {
      let response;

      if (selectedCategory.categoryId) {
        // Update Category
        response = await updateCategory(selectedCategory.categoryId, category);
      } else {
        // Create Category
        response = await createCategory(category);
      }

      if (response.success) {
        await loadCategories(debouncedSearch);

        setShowModal(false);

        // Reset Form
        setSelectedCategory({
          categoryId: null,
          categoryName: "",
          description: "",
          isActive: true,
        });
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Failed to save category.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Categories</h2>

      <div className="master-card p-4">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddClick={handleAddClick}
          placeholder="Search categories..."
          buttonText="Add Category"
        />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>

            <p className="mt-3">Loading categories...</p>
          </div>
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onActivate={handleActivate}
          />
        )}

        {/* Pagination */}
        <div className="d-flex justify-content-end align-items-center gap-3 mt-4">
          <div className="text-muted small">
            {totalCount === 0 ? (
              <>Showing 0–0 of 0</>
            ) : (
              <>
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, totalCount)} {" "} of {" "}  {totalCount}
              </>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Previous */}
            <button
              className="btn btn-light pagination-icon"
              disabled={!hasPreviousPage}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <i className="bi bi-chevron-left"></i>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                disabled={currentPage === index + 1}
                className={
                  currentPage === index + 1
                    ? "btn btn-primary pagination-number active-page"
                    : "btn btn-light pagination-number"
                }
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}

            {/* Next */}
            <button
              className="btn btn-light pagination-icon"
              disabled={!hasNextPage}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <CategoryModal
  show={showModal}
  title={selectedCategory.categoryId ? "Edit Category" : "Add Category"}
  category={selectedCategory}
  onSave={handleSave}
  onClose={handleClose}
  saving={saving}
/>
    </div>
  );
}

export default Categories;
