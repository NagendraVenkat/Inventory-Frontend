import { useCallback, useEffect, useState } from "react";

import SearchBar from "../Categories/SearchBar";
import SupplierTable from "../Suppliers/SuppliersTable"
import SupplierModal from "../Suppliers/SupplierModal";

import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  activateSupplier,
} from "../../services/supplierService";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);

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


  const [selectedSupplier, setSelectedSupplier] = useState({
  supplierId: null,
  supplierName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
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


  const loadSuppliers = useCallback(
    async (search = "") => {
      try {
        setLoading(true);

        const response = await getSuppliers(search, currentPage, pageSize);

        console.log("Response:", response);
        console.log("Response Data:", response.data);
        console.log("Items:", response.data?.items);

        if (response.success) {
          setSuppliers(response.data?.items ?? []);
          setTotalPages(response.data?.totalPages ?? 1);
          setHasPreviousPage(response.data?.hasPreviousPage ?? false);
          setHasNextPage(response.data?.hasNextPage ?? false);
          setTotalCount(response.data?.totalCount ?? 0);
        }
      } catch (error) {
        console.error("Failed to load suppliers:", error);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize],
  );

  useEffect(() => {
    loadSuppliers(debouncedSearch);
  }, [debouncedSearch, currentPage, loadSuppliers]);


  const handleAddClick = () => {
    setSelectedSupplier({
  supplierId: null,
  supplierName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
});

    setShowModal(true);
  };

  const handleEdit = async (supplier) => {
  try {
    const response = await getSupplierById(supplier.supplierId);

    if (response.success) {
      setSelectedSupplier(response.data);
      setShowModal(true);
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);
    alert("Failed to load supplier.");
  }
};


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this supplier?",
    );

    if (!confirmDelete) return;

    try {
      const response = await deleteSupplier(id);

      if (response.success) {
        await loadSuppliers(debouncedSearch);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
      if (error.response?.data?.message) {
    alert(error.response.data.message);
  } else {
    alert("Failed to delete supplier.");
  }
    }
  };

  const handleActivate = async (id) => {
  try {
    const response = await activateSupplier(id);

    if (response.success) {
      await loadSuppliers(debouncedSearch);
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      alert(error.response.data.message);
    } else {
      alert("Failed to activate supplier.");
    }
  }
};

  // Close Modal
  const handleClose = () => {
    setSelectedSupplier({
  supplierId: null,
  supplierName: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  isActive: true,
});

    setShowModal(false);
  };

  
  const handleSave = async (values) => {
  const supplierName = values.supplierName.trim();
const contactPerson = values.contactPerson?.trim() ?? "";
const phone = values.phone?.trim() ?? "";
const email = values.email?.trim() ?? "";
const address = values.address?.trim() ?? "";

  const supplier = {
    supplierName,
    contactPerson,
    phone,
    email,
    address,
    isActive: values.isActive,
  };

  setSaving(true);

  try {
    let response;

    if (selectedSupplier.supplierId) {
      response = await updateSupplier(
        selectedSupplier.supplierId,
        supplier
      );
    } else {
      response = await createSupplier(supplier);
    }

    if (response.success) {
      await loadSuppliers(debouncedSearch);

      setShowModal(false);

      setSelectedSupplier({
        supplierId: null,
        supplierName: "",
        contactPerson: "",
        phone: "",
        email: "",
        address: "",
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
    alert("Failed to save supplier.");
  }
} finally {
    setSaving(false);
  }
};

  return (
    <div className="container-fluid py-4">
      <h2 className="fw-bold mb-4">Suppliers</h2>

      <div className = "master-card p-4">

      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddClick={handleAddClick}
         placeholder="Search suppliers..."
  buttonText="Add Supplier"
      />

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-3">Loading suppliers...</p>
        </div>
      ) : (
        <SupplierTable
  suppliers={suppliers}
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
        Showing {(currentPage - 1) * pageSize + 1}
        –
        {Math.min(currentPage * pageSize, totalCount)}
        {" "}of{" "}
        {totalCount}
      </>
    )}
  </div>

  <div className="d-flex align-items-center gap-2">

    <button
      className="btn btn-light pagination-icon"
      disabled={!hasPreviousPage}
      onClick={() => setCurrentPage((prev) => prev - 1)}
    >
      <i className="bi bi-chevron-left"></i>
    </button>

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

    <button
      className="btn btn-light pagination-icon"
      disabled={!hasNextPage}
      onClick={() => setCurrentPage((prev) => prev + 1)}
    >
      <i className="bi bi-chevron-right"></i>
    </button>

  </div>

</div>

      <SupplierModal
        show={showModal}
        title={
  selectedSupplier.supplierId ? "Edit Supplier" : "Add Supplier"}
        supplier={selectedSupplier}
        setSupplier={setSelectedSupplier}
        onSave={handleSave}
        onClose={handleClose}
        saving={saving}
      />
    </div>
    </div>
  );
}

export default Suppliers;
