import { useFormik } from "formik";
import * as Yup from "yup";

function CategoryModal({ show, category, onSave, onClose, saving }) {
  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      categoryName: category.categoryName || "",
      description: category.description || "",
      isActive: category.isActive ?? true,
    },

    validationSchema: Yup.object({
      categoryName: Yup.string()
        .required("Category Name is required")
        .max(100, "Category Name cannot exceed 100 characters"),

      description: Yup.string().max(
        250,
        "Description cannot exceed 250 characters",
      ),
    }),

    onSubmit: (values) => {
      onSave(values);
    },
  });

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            {/* Header */}

            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                Add / Edit Category
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="modal-body">
                {/* Category Name */}

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Category Name
                    <span className="text-danger"> *</span>
                  </label>

                  <input
                    type="text"
                    name="categoryName"
                    className={`form-control ${
                      formik.touched.categoryName && formik.errors.categoryName
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="e.g. Furniture"
                    value={formik.values.categoryName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.categoryName &&
                    formik.errors.categoryName && (
                      <div className="invalid-feedback">
                        {formik.errors.categoryName}
                      </div>
                    )}
                </div>

                {/* Description */}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>

                  <input
                    type="text"
                    name="description"
                    className={`form-control ${
                      formik.touched.description && formik.errors.description
                        ? "is-invalid"
                        : ""
                    }`}
                    placeholder="Optional"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />

                  {formik.touched.description && formik.errors.description && (
                    <div className="invalid-feedback">
                      {formik.errors.description}
                    </div>
                  )}
                </div>

                {/* Active */}

                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                  />

                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
              </div>

              {/* Footer */}

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-save"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default CategoryModal;
