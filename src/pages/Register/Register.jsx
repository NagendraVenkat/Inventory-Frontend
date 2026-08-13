import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "User",
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
    setLoading(true);

    try {
      const response = await api.post("/Auth/register", formData);

      if (response.data.success) {
        setMessage("Registration successful!");

        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setError(
          response.data.message || "Registration failed."
        );
      }
    } catch (error) {
      console.error("Registration failed:", error);

      setError(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <h1>Create Account</h1>
          <p>Register your account</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
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
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label>Confirm Password</label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Public registration always creates User */}
          <input
            type="hidden"
            name="role"
            value="User"
          />

          {/* Messages */}
          {message && (
            <div className="success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Register */}
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </button>

        </form>

        <div className="login-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </div>

      </div>
    </div>
  );
}

export default Register;