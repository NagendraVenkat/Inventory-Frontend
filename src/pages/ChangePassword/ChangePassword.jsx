import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./ChangePassword.css";

function ChangePassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      // Temporary: get userId from localStorage
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setError("User information not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await api.post(
        `/Auth/change-password?userId=${userId}`,
        {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );

      if (response.data.success) {
        setMessage("Password changed successfully.");

        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(
          response.data.message || "Unable to change password."
        );
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-card">

        <div className="change-password-header">
          <h1>Change Password</h1>
          <p>Update your account password</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="password-form-group">
            <label>Old Password</label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter old password"
              required
            />
          </div>

          <div className="password-form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength="6"
              required
            />
          </div>

          <div className="password-form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              minLength="6"
              required
            />
          </div>

          {message && (
            <div className="password-success">
              {message}
            </div>
          )}

          {error && (
            <div className="password-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="change-password-button"
            disabled={loading}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          <button
            type="button"
            className="cancel-password-button"
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>

        </form>

      </div>
    </div>
  );
}

export default ChangePassword;