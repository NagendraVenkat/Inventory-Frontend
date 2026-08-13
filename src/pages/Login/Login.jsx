import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import useAuth from "../../hooks/useAuth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  // =========================
  // VALIDATION SCHEMA
  // =========================
  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Please enter a valid email address")
      .required("Email is required"),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password must be at least 6 characters"),
  });

  // =========================
  // FORMIK
  // =========================
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },

    validationSchema,

    onSubmit: async (values, { setSubmitting }) => {
      try {
        setServerError("");

        const response = await login({
          email: values.email,
          password: values.password,
        });

        console.log("Login successful:", response);

        if (response.success) {
          // Navigate to Dashboard
          navigate("/dashboard", { replace: true });
        } else {
          setServerError(
            response.message || "Login failed"
          );
        }
      } catch (error) {
        console.error("Login failed:", error);

        // Handle backend error
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Invalid email or password";

        setServerError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-page">
      <div className="login-card">

        {/* =========================
            HEADER
        ========================= */}
        <div className="login-header">
          <h1>IM</h1>

          <h2>Inventory Manager</h2>

          <p>
            Login to manage your inventory
          </p>
        </div>

        {/* =========================
            SERVER ERROR
        ========================= */}
        {serverError && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {serverError}
          </div>
        )}

        {/* =========================
            LOGIN FORM
        ========================= */}
        <form onSubmit={formik.handleSubmit}>

          {/* EMAIL */}
          <div className="login-form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email"
              autoComplete="email"
              className={
                formik.touched.email && formik.errors.email
                  ? "input-error"
                  : ""
              }
            />

            {formik.touched.email && formik.errors.email && (
              <div className="validation-error">
                <i className="bi bi-exclamation-circle me-1"></i>
                {formik.errors.email}
              </div>
            )}

          </div>

          {/* PASSWORD */}
          <div className="login-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={
                  formik.touched.password && formik.errors.password
                    ? "input-error"
                    : ""
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                <i
                  className={
                    showPassword
                      ? "bi bi-eye-slash"
                      : "bi bi-eye"
                  }
                ></i>
              </button>

            </div>

            {formik.touched.password && formik.errors.password && (
              <div className="validation-error">
                <i className="bi bi-exclamation-circle me-1"></i>
                {formik.errors.password}
              </div>
            )}

          </div>

          {/* LOGIN BUTTON */}
          <button
            className="login-button"
            type="submit"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>

                Logging in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </>
            )}
          </button>

        </form>

        {/* =========================
            REGISTER
        ========================= */}
        <div className="register-link">
          Don't have an account?{" "}

          <span
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;