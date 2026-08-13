import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { login } from "../../services/authService";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await login({
  email,
  password,
});

if (response.success) {
  console.log("Login successful:", response);

  setMessage("Login successful!");

  setTimeout(() => {
    navigate("/dashboard");
  }, 300);
}
      const data = await login(email, password);

      // Save login information
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.userId);
      localStorage.setItem("fullName", data.data.fullName);
      localStorage.setItem("email", data.data.email);
      localStorage.setItem("role", data.data.role);

      // Save complete user object
      localStorage.setItem(
        "user",
        JSON.stringify(data.data)
      );

      console.log("Login successful:", data);

      setMessage("Login successful!");

      // Go to Dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 300);

    } catch (error) {
      console.error("Login failed:", error);

      setMessage(
        error.response?.data?.message ||
        "Invalid email or password"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-header">
          <h1>Inventory Manager</h1>

          <h2>Welcome Back</h2>

          <p>
            Login to manage your inventory
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            className="login-button"
            type="submit"
          >
            Login
          </button>

        </form>

        {message && (
          <p
            className={
              message === "Login successful!"
                ? "login-success"
                : "login-error"
            }
          >
            {message}
          </p>
        )}

        <div className="register-link">
          Don't have an account?{" "}
          <span
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </span>
        </div>

      </div>

    </div>
  );
}

export default Login;



