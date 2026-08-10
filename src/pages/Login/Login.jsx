import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email || !password) {
            setError("Email and password are required.");
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                "https://localhost:7288/api/Auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                }
            );

            const result = await response.json();

            console.log("Login response:", result);

            if (!response.ok || !result.success) {
                setError(
                    result.message || "Invalid email or password."
                );
                return;
            }

            const loginData = result.data;

                          // Store JWT token
              localStorage.setItem("token", loginData.token);

              localStorage.setItem("userId", loginData.userId);
              localStorage.setItem("fullName", loginData.fullName);
              localStorage.setItem("email", loginData.email);
              localStorage.setItem("role", loginData.role);

              localStorage.setItem(
                  "user",
                  JSON.stringify({
                      userId: loginData.userId,
                      fullName: loginData.fullName,
                      email: loginData.email,
                      role: loginData.role
                  })
              );

            // Navigate to Dashboard
            navigate("/dashboard");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-header">
                    <h1>Inventory Management</h1>
                    <p>Sign in to continue</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>

                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                    </div>

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Signing in..."
                            : "Login"}
                    </button>

                </form>

            </div>

        </div>
    );
}

export default Login;