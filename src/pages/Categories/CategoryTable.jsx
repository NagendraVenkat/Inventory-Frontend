function CategoryTable({ categories = [], onEdit, onDelete, onActivate }) {
  return (
    <div className="table-responsive">
      <table className="table table-hover master-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th width="180">Actions</th>
          </tr>
        </thead>

        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center">
                <div className="py-4">
                  <i className="bi bi-folder2-open fs-1 text-secondary"></i>

                  <div className="mt-2">No Categories Found</div>
                </div>
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <tr key={category.categoryId}>
                <td className="text-center">{index + 1}</td>

                <td>{category.categoryName}</td>

                <td>{category.description}</td>

                <td className="text-center">
                  {category.isActive ? (
                    <span className="status-active">Active</span>
                  ) : (
                    <span className="status-inactive">Inactive</span>
                  )}
                </td>

                <td>
                  <div className="actions-column">
                    <button
                      className="btn btn-outline-secondary btn-sm btn-action me-2"
                      onClick={() => onEdit(category)}
                    >
                      Edit
                    </button>

                    {category.isActive ? (
                      <button
                        className="btn btn-outline-danger btn-sm btn-action"
                        onClick={() => onDelete(category.categoryId)}
                        title="Deactivate"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline-success btn-sm btn-action"
                        onClick={() => onActivate(category.categoryId)}
                        title="Activate"
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

export default CategoryTable;
