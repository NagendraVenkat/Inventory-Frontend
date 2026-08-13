import { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../services/api";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;


  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================
  // TOAST NOTIFICATIONS
  // =========================

  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  // =========================
  // DEACTIVATE CONFIRM DIALOG
  // =========================

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    user: null,
  });

  // =========================
  // REAL-TIME EMAIL DUPLICATE CHECK
  // =========================

  const [emailCheck, setEmailCheck] = useState({
    checking: false,
    exists: false,
  });

  const emailCheckTimer = useRef(null);

  const checkEmailAvailability = (email, currentUserId) => {
    if (emailCheckTimer.current) {
      clearTimeout(emailCheckTimer.current);
    }

    const trimmedEmail = (email || "").trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailCheck({ checking: false, exists: false });
      return;
    }

    setEmailCheck({ checking: true, exists: false });

    // Simulated real-time lookup against already-loaded users (~0.8s)
    emailCheckTimer.current = setTimeout(() => {
      const isDuplicate = users.some(
        (u) =>
          String(u.email || "").trim().toLowerCase() === trimmedEmail &&
          String(u.userId) !== String(currentUserId)
      );

      setEmailCheck({ checking: false, exists: isDuplicate });
    }, 800);
  };

  const resetEmailCheck = () => {
    if (emailCheckTimer.current) {
      clearTimeout(emailCheckTimer.current);
    }
    setEmailCheck({ checking: false, exists: false });
  };


  const getUsers = async () => {
    try {
      const response = await api.get("/User");

      console.log("Users:", response.data);

      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Failed to get users:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  // =========================
  // VALIDATION HELPER
  // =========================

  const showError = (form, field) =>
    (form.touched[field] || form.submitCount > 0) && form.errors[field];

  // =========================
  // USER FORM VALIDATION SCHEMAS
  // =========================

  const nameRules = Yup.string()
    .trim()
    .min(3, "Full name must be at least 3 characters")
    .max(50, "Full name must not exceed 50 characters")
    .matches(/^[A-Za-z\s'-]+$/, "Full name can only contain letters, spaces, - and '")
    .required("Full name is required");

  const emailRules = Yup.string()
    .trim()
    .email("Enter a valid email address")
    .max(100, "Email must not exceed 100 characters")
    .required("Email is required");

  const roleRules = Yup.string()
    .oneOf(["User", "Staff", "Admin"], "Select a valid role")
    .required("Role is required");

  const createUserSchema = Yup.object({
    fullName: nameRules,
    email: emailRules,
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .matches(/[A-Za-z]/, "Password must contain at least one letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords do not match")
      .required("Confirm password is required"),
    role: roleRules,
  });

  const editUserSchema = Yup.object({
    fullName: nameRules,
    email: emailRules,
    role: roleRules,
  });

  // =========================
  // CREATE USER
  // =========================

  const handleCreateUser = async (values, { resetForm, setFieldTouched }) => {
    if (emailCheck.checking || emailCheck.exists) {
      setFieldTouched("email", true);
      return;
    }

    try {
      const response = await api.post("/User", {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        role: values.role,
      });

      console.log("User created:", response.data);

      showToast("success", "User created successfully!");

      resetForm();
      setEditUserId(null);
      setShowForm(false);

      await getUsers();
    } catch (error) {
      console.error("Failed to create user:", error);

      showToast(
        "error",
        error.response?.data?.message || "Failed to create user."
      );
    }
  };

  // =========================
  // UPDATE USER
  // =========================

  const handleUpdateUser = async (values, { resetForm, setFieldTouched }) => {
    if (emailCheck.checking || emailCheck.exists) {
      setFieldTouched("email", true);
      return;
    }

    try {
      const updateData = {
        fullName: values.fullName,
        email: values.email,
        role: values.role,
      };

      console.log("Updating user:", editUserId);
      console.log("Update data:", updateData);

      const response = await api.put(
        `/User/${editUserId}`,
        updateData
      );

      console.log("User updated:", response.data);

      showToast("success", "User updated successfully!");

      resetForm();
      setEditUserId(null);
      setShowForm(false);

      await getUsers();
    } catch (error) {
      console.error("Failed to update user:", error);

      showToast(
        "error",
        error.response?.data?.message || "Failed to update user."
      );
    }
  };

  // =========================
  // USER FORM (FORMIK)
  // =========================

  const userForm = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "User",
    },
    validationSchema: editUserId ? editUserSchema : createUserSchema,
    onSubmit: editUserId ? handleUpdateUser : handleCreateUser,
  });

  // =========================
  // CLOSE / RESET USER FORM
  // =========================

  const closeForm = () => {
    userForm.resetForm();
    setEditUserId(null);
    setShowForm(false);
    resetEmailCheck();
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user) => {
    console.log("EDIT CLICKED");
    console.log("USER OBJECT:", user);

    setEditUserId(user.userId);

    userForm.resetForm({
      values: {
        fullName: user.fullName || "",
        email: user.email || "",
        password: "",
        confirmPassword: "",
        role: user.role || "User",
      },
    });

    setShowForm(true);
    resetEmailCheck();
  };

  // =========================
  // ACTIVATE USER
  // =========================

  const handleActivate = async (user) => {
    try {
      await api.put(`/User/${user.userId}`, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: true,
      });

      showToast(
        "success",
        `${user.fullName || user.email} activated successfully.`
      );

      await getUsers();
    } catch (error) {
      console.error("Failed to activate user:", error);

      showToast(
        "error",
        error.response?.data?.message || "Failed to activate user."
      );
    }
  };

  // =========================
  // DEACTIVATE USER
  // =========================

  const handleDeactivateClick = (user) => {
    const loggedInUserId = localStorage.getItem("userId");

    if (String(user.userId) === String(loggedInUserId)) {
      showToast("error", "You cannot deactivate your own account.");
      return;
    }

    setConfirmDialog({ open: true, user });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, user: null });
  };

  const confirmDeactivateUser = async () => {
    const user = confirmDialog.user;

    if (!user) {
      closeConfirmDialog();
      return;
    }

    closeConfirmDialog();

    try {
      await api.put(`/User/${user.userId}`, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: false,
      });

      showToast(
        "success",
        `${user.fullName || user.email} deactivated successfully.`
      );

      await getUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);

      showToast(
        "error",
        error.response?.data?.message || "Failed to deactivate user."
      );
    }
  };

  // =========================
  // CHANGE PASSWORD VALIDATION SCHEMA
  // =========================

  const changePasswordSchema = Yup.object({
    oldPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .min(6, "New password must be at least 6 characters")
      .matches(/[A-Za-z]/, "New password must contain at least one letter")
      .matches(/[0-9]/, "New password must contain at least one number")
      .required("New password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword")], "Passwords do not match")
      .required("Confirm password is required"),
  });

  // =========================
  // CHANGE PASSWORD (FORMIK)
  // =========================

  const passwordForm = useFormik({
    initialValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values, { resetForm }) => {
      setPasswordMessage("");
      setPasswordError("");

      const userId = localStorage.getItem("userId");

      if (!userId) {
        setPasswordError(
          "User information not found. Please login again."
        );
        return;
      }

      try {
        const response = await api.post(
          `/Auth/change-password?userId=${userId}`,
          {
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
          }
        );

        if (response.data.success) {
          setPasswordMessage(
            "Password changed successfully."
          );

          resetForm();
        } else {
          setPasswordError(
            response.data.message ||
              "Failed to change password."
          );
        }
      } catch (error) {
        console.error(
          "Failed to change password:",
          error
        );

        setPasswordError(
          error.response?.data?.message ||
            "Failed to change password."
        );
      }
    },
  });

  // =========================
  // PAGINATION DERIVED DATA
  // =========================

  const totalPages = Math.max(1, Math.ceil(users.length / usersPerPage));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [users, currentPage, totalPages]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const startIndex = users.length === 0 ? 0 : indexOfFirstUser + 1;
  const endIndex = Math.min(indexOfLastUser, users.length);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // =========================
  // PAGE UI
  // =========================

  return (
    <div className="users-page">

      {/* =========================
          TOAST NOTIFICATION
      ========================= */}

      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <span className="toast-message">{toast.message}</span>

          <button
            type="button"
            className="toast-close"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* =========================
          DEACTIVATE CONFIRM DIALOG
      ========================= */}

      {confirmDialog.open && (
        <div className="modal-overlay" onClick={closeConfirmDialog}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">Deactivate User</h3>

            <p className="modal-message">
              Are you sure you want to deactivate{" "}
              <strong>
                {confirmDialog.user?.fullName ||
                  confirmDialog.user?.email}
              </strong>
              ? They will lose access to their account until
              reactivated.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeConfirmDialog}
              >
                Cancel
              </button>

              <button
                type="button"
                className="deactivate-btn"
                onClick={confirmDeactivateUser}
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="users-header">

        <div>
          <h1>Users</h1>
          <p>Manage system users and their access</p>
        </div>

        {!showForm && (
          <button
            className="add-user-btn"
            onClick={() => {
              setEditUserId(null);

              userForm.resetForm({
                values: {
                  fullName: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                  role: "User",
                },
              });

              setShowForm(true);
              resetEmailCheck();
            }}
          >
            + Add User
          </button>
        )}

      </div>

      {/* =========================
          ADD / EDIT USER FORM
      ========================= */}

      {showForm && (
        <div className="user-form-card">

          <div className="form-header">
            <h2>
              {editUserId
                ? "Edit User"
                : "Add User"}
            </h2>
          </div>

          <form
            className="user-form"
            onSubmit={userForm.handleSubmit}
            noValidate
          >

            {/* Full Name */}

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                value={userForm.values.fullName}
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                placeholder="Enter full name"
                className={showError(userForm, "fullName") ? "input-error" : ""}
              />

              {showError(userForm, "fullName") && (
                <div className="field-error">{userForm.errors.fullName}</div>
              )}
            </div>

            {/* Email */}

            <div className="form-group">
              <label>Email</label>

              <div className="email-input-wrap">
                <input
                  type="email"
                  name="email"
                  value={userForm.values.email}
                  onChange={(e) => {
                    userForm.handleChange(e);
                    checkEmailAvailability(e.target.value, editUserId);
                  }}
                  onBlur={userForm.handleBlur}
                  placeholder="Enter email"
                  className={
                    showError(userForm, "email") || emailCheck.exists
                      ? "input-error"
                      : ""
                  }
                />

                {emailCheck.checking && (
                  <span className="email-check-spinner" aria-label="Checking email" />
                )}

                {!emailCheck.checking &&
                  !showError(userForm, "email") &&
                  !emailCheck.exists &&
                  userForm.values.email.trim() && (
                    <span className="email-check-ok">✓</span>
                  )}
              </div>

              {showError(userForm, "email") ? (
                <div className="field-error">{userForm.errors.email}</div>
              ) : emailCheck.checking ? (
                <div className="field-checking">Checking email availability…</div>
              ) : emailCheck.exists ? (
                <div className="field-error">This email is already registered.</div>
              ) : null}
            </div>

            {/* Password - Only Create */}

            {!editUserId && (
              <>
                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    value={userForm.values.password}
                    onChange={userForm.handleChange}
                    onBlur={userForm.handleBlur}
                    placeholder="Enter password"
                    className={showError(userForm, "password") ? "input-error" : ""}
                  />

                  {showError(userForm, "password") && (
                    <div className="field-error">{userForm.errors.password}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={userForm.values.confirmPassword}
                    onChange={userForm.handleChange}
                    onBlur={userForm.handleBlur}
                    placeholder="Confirm password"
                    className={showError(userForm, "confirmPassword") ? "input-error" : ""}
                  />

                  {showError(userForm, "confirmPassword") && (
                    <div className="field-error">{userForm.errors.confirmPassword}</div>
                  )}
                </div>
              </>
            )}

            {/* Role */}

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={userForm.values.role}
                onChange={userForm.handleChange}
                onBlur={userForm.handleBlur}
                className={showError(userForm, "role") ? "input-error" : ""}
              >
                <option value="User">
                  User
                </option>

                <option value="Staff">
                  Staff
                </option>

                <option value="Admin">
                  Admin
                </option>
              </select>

              {showError(userForm, "role") && (
                <div className="field-error">{userForm.errors.role}</div>
              )}
            </div>

            {/* Form Buttons */}

            <div className="form-actions">

              <button
                type="submit"
                className="primary-btn"
              >
                {editUserId
                  ? "Update User"
                  : "Create User"}
              </button>

              <button
                type="button"
                className="secondary-btn"
                onClick={closeForm}
              >
                Cancel
              </button>

            </div>

          </form>
        </div>
      )}

      {/* =========================
          USERS TABLE
      ========================= */}

      <div className="users-table-container">

        <h2 className="users-table-title">
          All Users
        </h2>

        <table className="users-table">

          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {users.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No users found.
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user.userId}>

                  {/* Name */}

                  <td>
                    {user.fullName || "-"}
                  </td>

                  {/* Email */}

                  <td>
                    {user.email}
                  </td>

                  {/* Role */}

                  <td>
                    <span
                      className={`role-badge ${
                        String(user.role).toLowerCase()
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>

                  {/* Status */}

                  <td>
                    <span
                      className={`status-badge ${
                        user.isActive
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  {/* Actions */}

                  <td>

                    <div className="user-actions">

                      <button
                        className="edit-btn"
                        onClick={() =>
                          handleEdit(user)
                        }
                      >
                        Edit
                      </button>

                      {user.isActive ? (
                        <button
                          className="deactivate-btn"
                          onClick={() =>
                            handleDeactivateClick(user)
                          }
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          className="activate-btn"
                          onClick={() =>
                            handleActivate(user)
                          }
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

        {/* =========================
            PAGINATION (5 PER PAGE)
        ========================= */}

        {users.length > 0 && (
          <div className="pagination">

            <div className="pagination-info">
              Showing {startIndex}-{endIndex} of {users.length} users
            </div>

            <div className="pagination-pages">

              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={`pagination-page ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>

            </div>

          </div>
        )}

      </div>

      {/* =========================
          MY PROFILE - CHANGE PASSWORD
      ========================= */}

      <div className="change-password-card">

        <div className="change-password-header">
          <h2>My Profile — Change Password</h2>
          <p>
            Update your current account password
          </p>
        </div>

        <form
          className="change-password-form"
          onSubmit={passwordForm.handleSubmit}
          noValidate
        >

          <div className="password-fields">

            <div className="form-group">
              <label>Current Password</label>

              <input
                type="password"
                name="oldPassword"
                value={passwordForm.values.oldPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                placeholder="Enter current password"
                className={showError(passwordForm, "oldPassword") ? "input-error" : ""}
              />

              {showError(passwordForm, "oldPassword") && (
                <div className="field-error">{passwordForm.errors.oldPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                name="newPassword"
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                placeholder="Enter new password"
                className={showError(passwordForm, "newPassword") ? "input-error" : ""}
              />

              {showError(passwordForm, "newPassword") && (
                <div className="field-error">{passwordForm.errors.newPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>

              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                placeholder="Confirm new password"
                className={showError(passwordForm, "confirmPassword") ? "input-error" : ""}
              />

              {showError(passwordForm, "confirmPassword") && (
                <div className="field-error">{passwordForm.errors.confirmPassword}</div>
              )}
            </div>

          </div>

          {passwordMessage && (
            <div className="password-success">
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="password-error">
              {passwordError}
            </div>
          )}

          <div className="password-actions">

            <button
              type="submit"
              className="primary-btn"
            >
              Update Password
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Users;