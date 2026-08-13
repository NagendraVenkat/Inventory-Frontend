import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../services/api";
import "./Register.css";

// =========================
// VALIDATION SCHEMA
// (field-level, evaluated on change/blur via Formik)
// =========================
const validationSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required("Full name is required.")
    .min(3, "Full name must be at least 3 characters."),

  email: Yup.string()
    .trim()
    .email("Please enter a valid email address.")
    .required("Email is required."),

  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters."),

  confirmPassword: Yup.string()
    .required("Please confirm your password.")
    .oneOf([Yup.ref("password")], "Passwords do not match."),
});

// =========================
// SMALL HELPER
// =========================
function FieldError({ message }) {
  if (!message) return null;

  return (
    <span className="field-error">
      <svg viewBox="0 0 20 20" fill="currentColor" className="field-error-icon">
        <path
          fillRule="evenodd"
          d="M8.257 3.1c.765-1.361 2.722-1.361 3.486 0l6.28 11.2c.75 1.335-.213 3-1.743 3H3.72c-1.53 0-2.492-1.665-1.743-3l6.28-11.2ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25-6.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </span>
  );
}

function Register() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // =========================
  // FORMIK
  // =========================
  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      setMessage("");
      setError("");

      try {
        const response = await api.post("/Auth/register", {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
          role: "User",
        });

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
        setSubmitting(false);
      }
    },
  });

  // =========================
  // FIELD HELPERS
  // =========================
  const fieldError = (name) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : "";

  const fieldClass = (name) => {
    const hasError = Boolean(fieldError(name));
    const isValid =
      !hasError &&
      formik.touched[name] &&
      String(formik.values[name]).trim() !== "";

    return `form-group${hasError ? " has-error" : ""}${
      isValid ? " is-valid" : ""
    }`;
  };

  const showValidationSummary =
    formik.submitCount > 0 && Object.keys(formik.errors).length > 0;

  return (
    <div className="register-page">
      <div className="register-card">

        <div className="register-header">
          <h1>Create Account</h1>
          <p>Register your account</p>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate>

          {showValidationSummary && (
            <div className="form-validation-summary">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="form-validation-summary-icon"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.1c.765-1.361 2.722-1.361 3.486 0l6.28 11.2c.75 1.335-.213 3-1.743 3H3.72c-1.53 0-2.492-1.665-1.743-3l6.28-11.2ZM11 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm-.25-6.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5Z"
                  clipRule="evenodd"
                />
              </svg>
              Please fix the highlighted fields before continuing.
            </div>
          )}

          {/* Full Name */}
          <div className={fieldClass("fullName")}>
            <label>Full Name</label>

            <input
              type="text"
              name="fullName"
              value={formik.values.fullName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your full name"
            />

            <FieldError message={fieldError("fullName")} />
          </div>

          {/* Email */}
          <div className={fieldClass("email")}>
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
            />

            <FieldError message={fieldError("email")} />
          </div>

          {/* Password */}
          <div className={fieldClass("password")}>
            <label>Password</label>

            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
              </button>
            </div>

            <FieldError message={fieldError("password")} />
          </div>

          {/* Confirm Password */}
          <div className={fieldClass("confirmPassword")}>
            <label>Confirm Password</label>

            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Confirm your password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <i
                  className={
                    showConfirmPassword ? "bi bi-eye-slash" : "bi bi-eye"
                  }
                ></i>
              </button>
            </div>

            <FieldError message={fieldError("confirmPassword")} />
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
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting
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