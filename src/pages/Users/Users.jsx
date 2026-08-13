import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Users.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editUserId, setEditUserId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
  });

  // =========================
  // CHANGE PASSWORD
  // =========================

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // =========================
  // GET ALL USERS
  // =========================

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
  // HANDLE USER FORM CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================
  // CREATE USER
  // =========================

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    try {
      const response = await api.post("/User", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: formData.role,
      });

      console.log("User created:", response.data);

      alert("User created successfully!");

      resetForm();

      await getUsers();
    } catch (error) {
      console.error("Failed to create user:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create user."
      );
    }
  };

  // =========================
  // EDIT USER
  // =========================

  const handleEdit = (user) => {
    console.log("EDIT CLICKED");
    console.log("USER OBJECT:", user);

    setEditUserId(user.userId);

    setFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
      role: user.role || "User",
    });

    setShowForm(true);
  };

  // =========================
  // UPDATE USER
  // =========================

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
      };

      console.log("Updating user:", editUserId);
      console.log("Update data:", updateData);

      const response = await api.put(
        `/User/${editUserId}`,
        updateData
      );

      console.log("User updated:", response.data);

      alert("User updated successfully!");

      resetForm();

      await getUsers();
    } catch (error) {
      console.error("Failed to update user:", error);

      alert(
        error.response?.data?.message ||
          "Failed to update user."
      );
    }
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

      alert(`${user.fullName || user.email} activated successfully.`);

      await getUsers();
    } catch (error) {
      console.error("Failed to activate user:", error);

      alert(
        error.response?.data?.message ||
          "Failed to activate user."
      );
    }
  };

  // =========================
  // DEACTIVATE USER
  // =========================

  const handleDeactivate = async (user) => {
    const loggedInUserId = localStorage.getItem("userId");

    if (String(user.userId) === String(loggedInUserId)) {
      alert("You cannot deactivate your own account.");
      return;
    }

    const confirmDeactivate = window.confirm(
      `Are you sure you want to deactivate ${
        user.fullName || user.email
      }?`
    );

    if (!confirmDeactivate) {
      return;
    }

    try {
      await api.put(`/User/${user.userId}`, {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: false,
      });

      alert(
        `${user.fullName || user.email} deactivated successfully.`
      );

      await getUsers();
    } catch (error) {
      console.error("Failed to deactivate user:", error);

      alert(
        error.response?.data?.message ||
          "Failed to deactivate user."
      );
    }
  };

  // =========================
  // RESET USER FORM
  // =========================

  const resetForm = () => {
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "User",
    });

    setEditUserId(null);
    setShowForm(false);
  };

  // =========================
  // CHANGE PASSWORD INPUT
  // =========================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // =========================
  // CHANGE PASSWORD
  // =========================

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

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
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        }
      );

      if (response.data.success) {
        setPasswordMessage(
          "Password changed successfully."
        );

        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
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
  };

  // =========================
  // PAGE UI
  // =========================

  return (
    <div className="users-page">

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

              setFormData({
                fullName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "User",
              });

              setShowForm(true);
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
            onSubmit={
              editUserId
                ? handleUpdateUser
                : handleCreateUser
            }
          >

            {/* Full Name */}

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Email */}

            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            {/* Password - Only Create */}

            {!editUserId && (
              <>
                <div className="form-group">
                  <label>Password</label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
              </>
            )}

            {/* Role */}

            <div className="form-group">
              <label>Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
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
                onClick={resetForm}
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
              users.map((user) => (
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
                            handleDeactivate(user)
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
          onSubmit={handleChangePassword}
        >

          <div className="password-fields">

            <div className="form-group">
              <label>Current Password</label>

              <input
                type="password"
                name="oldPassword"
                value={
                  passwordData.oldPassword
                }
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>

              <input
                type="password"
                name="newPassword"
                value={
                  passwordData.newPassword
                }
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  passwordData.confirmPassword
                }
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                minLength="6"
                required
              />
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