import { useFormik } from "formik";
import * as Yup from "yup";

function SupplierModal({
  show,
  supplier,
  onSave,
  onClose,
  saving,
}) {
  const formik = useFormik({
    enableReinitialize: true,

    initialValues: {
      supplierName: supplier.supplierName || "",
      contactPerson: supplier.contactPerson || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      isActive: supplier.isActive ?? true,
    },

    validationSchema: Yup.object({
      supplierName: Yup.string()
        .required("Supplier Name is required")
        .max(100, "Supplier Name cannot exceed 100 characters"),

      contactPerson: Yup.string()
        .max(100, "Contact Person cannot exceed 100 characters"),

      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .nullable(),

      email: Yup.string()
        .email("Enter a valid email")
        .max(100, "Email cannot exceed 100 characters"),

      address: Yup.string()
        .max(250, "Address cannot exceed 250 characters"),
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
                {supplier.supplierId
                  ? "Edit Supplier"
                  : "Add Supplier"}
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={formik.handleSubmit}>

              <div className="modal-body">

                <div className="row">

                  {/* Supplier Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Supplier Name
                      <span className="text-danger"> *</span>
                    </label>

                    <input
                      type="text"
                      name="supplierName"
                      className={`form-control ${
                        formik.touched.supplierName &&
                        formik.errors.supplierName
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="e.g. ABC Traders"
                      value={formik.values.supplierName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    {formik.touched.supplierName &&
                      formik.errors.supplierName && (
                        <div className="invalid-feedback">
                          {formik.errors.supplierName}
                        </div>
                    )}
                  </div>

                  {/* Contact Person */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Contact Person
                    </label>

                    <input
                      type="text"
                      name="contactPerson"
                      className={`form-control ${
                        formik.touched.contactPerson &&
                        formik.errors.contactPerson
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="e.g. Suresh Kumar"
                      value={formik.values.contactPerson}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    {formik.touched.contactPerson &&
                      formik.errors.contactPerson && (
                        <div className="invalid-feedback">
                          {formik.errors.contactPerson}
                        </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Phone
                    </label>

                    <input
                      type="text"
                      name="phone"
                      className={`form-control ${
                        formik.touched.phone &&
                        formik.errors.phone
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="9876543210"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    {formik.touched.phone &&
                      formik.errors.phone && (
                        <div className="invalid-feedback">
                          {formik.errors.phone}
                        </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      className={`form-control ${
                        formik.touched.email &&
                        formik.errors.email
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="name@company.com"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    {formik.touched.email &&
                      formik.errors.email && (
                        <div className="invalid-feedback">
                          {formik.errors.email}
                        </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                      Address
                    </label>

                    <textarea
                      rows="2"
                      name="address"
                      className={`form-control ${
                        formik.touched.address &&
                        formik.errors.address
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter supplier address"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />

                    {formik.touched.address &&
                      formik.errors.address && (
                        <div className="invalid-feedback">
                          {formik.errors.address}
                        </div>
                    )}
                  </div>

                  {/* Active */}
                  <div className="col-12">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="isActive"
                      >
                        Active
                      </label>
                    </div>
                  </div>

                </div>

              </div>

              {/* Footer */}
              <div className="modal-footer">

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={onClose}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn btn-success px-4"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Supplier"}
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

export default SupplierModal;