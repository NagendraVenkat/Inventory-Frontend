import { useState } from "react";

import SearchBar from "./SearchBar";
import CategoryTable from "./CategoryTable";
import CategoryModal from "./CategoryModal";

function Categories() {
  const [searchTerm, setSearchTerm] = useState("");

  const [categories] = useState([
    {
      categoryId: 1,
      categoryName: "Furniture",
      description: "Office Furniture",
      isActive: true,
    },
    {
      categoryId: 2,
      categoryName: "Electronics",
      description: "Electronic Items",
      isActive: true,
    },
    {
      categoryId: 3,
      categoryName: "Stationery",
      description: "Office Stationery",
      isActive: false,
    },
  ]);

  const [showModal, setShowModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState({
    categoryId: null,
    categoryName: "",
    description: "",
    isActive: true,
  });

  const handleAddClick = () => {
    setSelectedCategory({
      categoryId: null,
      categoryName: "",
      description: "",
      isActive: true,
    });

    setShowModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    console.log("Delete Category:", id);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleSave = () => {
    console.log("Category Saved:", selectedCategory);

    setShowModal(false);
  };

  return (
    <div className="container-fluid">
      <h2 className="fw-bold mb-4">Categories</h2>

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={handleAddClick}
      />

      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <CategoryModal
        show={showModal}
        title={
          selectedCategory.categoryId
            ? "Edit Category"
            : "Add Category"
        }
        category={selectedCategory}
        setCategory={setSelectedCategory}
        onSave={handleSave}
        onClose={handleClose}
      />
    </div>
  );
}

export default Categories;