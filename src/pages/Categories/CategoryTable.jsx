function CategoryTable({ categories, onEdit, onDelete }) {
  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-light">
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
                No Categories Found
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
                    <span className="badge bg-success">Active</span>
                  ) : (
                    <span className="badge bg-danger">Inactive</span>
                  )}
                </td>

                <td className="text-center">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => onEdit(category)}
                  >
                    <i className="bi bi-pencil-square"></i>
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(category.categoryId)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
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
