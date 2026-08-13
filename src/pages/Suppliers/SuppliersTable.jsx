function SupplierTable({ suppliers = [], onEdit, onDelete, onActivate }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover master-table">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th>Supplier Name</th>
            <th>Contact Person</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Address</th>
            <th>Status</th>
            <th width="180">Actions</th>
          </tr>
        </thead>

        <tbody>
          {suppliers.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                <div className="py-4">
                  <i className="bi bi-truck fs-1 text-secondary"></i>

                  <div className="mt-2">No Suppliers Found</div>
                </div>
              </td>
            </tr>
          ) : (
            suppliers.map((supplier, index) => (
              <tr key={supplier.supplierId}>
                <td className="text-center">{index + 1}</td>

                <td>{supplier.supplierName}</td>

                <td>{supplier.contactPerson}</td>

                <td>{supplier.phone}</td>

                <td>{supplier.email}</td>

                <td>{supplier.address}</td>

                <td className="text-center">
                  {supplier.isActive ? (
                    <span className="status-active">Active</span>
                  ) : (
                    <span className="status-inactive">Inactive</span>
                  )}
                </td>

                <td>
                  <div className="actions-column">
                    <button
                      className="btn btn-outline-secondary btn-sm btn-action"
                      onClick={() => onEdit(supplier)}
                    >
                      Edit
                    </button>

                    {supplier.isActive ? (
                      <button
                        className="btn btn-outline-danger btn-sm btn-action"
                        onClick={() => onDelete(supplier.supplierId)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-success btn-sm btn-action"
                        onClick={() => onActivate(supplier.supplierId)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SupplierTable;
