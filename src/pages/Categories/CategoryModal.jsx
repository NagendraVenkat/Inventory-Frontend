function CategoryModal({
  show,
  title,
  category,
  setCategory,
  onSave,
  onClose,
}) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog">

          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>

              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">
                  Category Name
                </label>

                <input
                  type="text"
                  className="form-control"
                  value={category.categoryName}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      categoryName: e.target.value,
                    })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Description
                </label>

                <textarea
                  className="form-control"
                  rows="3"
                  value={category.description}
                  onChange={(e) =>
                    setCategory({
                      ...category,
                      description: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary"
                onClick={onSave}
              >
                Save
              </button>

            </div>

          </div>

        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default CategoryModal;