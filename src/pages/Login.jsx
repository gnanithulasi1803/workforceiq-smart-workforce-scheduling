import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [employeeCode, setEmployeeCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!employeeCode.trim() || !password) {
      setError("Please enter your employee code and password.");
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      const response = await fetch(
          "http://localhost:8080/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: employeeCode.trim(),
              password: password,
            }),
          }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Invalid employee code or password."
        );
      }

      if (!data.token) {
        throw new Error(
            "Login succeeded but no JWT token was returned."
        );
      }

      localStorage.setItem("token", data.token);

      localStorage.setItem(
          "username",
          data.username || employeeCode.trim()
      );

      localStorage.setItem(
          "role",
          data.role || "EMPLOYEE"
      );

      onLogin();
    } catch (error) {
      console.error("Login error:", error);

      setError(
          error.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    resetMessages();

    const code = employeeCode.trim().toUpperCase();

    if (!code) {
      setError("Please enter your Employee Code.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Find employee using employee code
      const employeeResponse = await fetch(
          `http://localhost:8080/api/auth/employee/${code}`
      );

      let employeeData = {};

      try {
        employeeData = await employeeResponse.json();
      } catch {
        employeeData = {};
      }

      if (!employeeResponse.ok) {
        throw new Error(
            employeeData.message ||
            employeeData.error ||
            "Employee Code not found."
        );
      }

      // Create employee login account
      const response = await fetch(
          "http://localhost:8080/api/auth/create-employee-account",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId: employeeData.id,
              password: password,
            }),
          }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            "Unable to create employee account."
        );
      }

      setSuccess(
          `Registration successful! Your login ID is ${code}. You can now sign in.`
      );

      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setIsRegistering(false);
        setSuccess("");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);

      setError(
          error.message ||
          "Unable to register employee. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    setIsRegistering(true);
  };

  const switchToLogin = () => {
    resetMessages();
    setPassword("");
    setConfirmPassword("");
    setIsRegistering(false);
  };

  return (
      <div className="login-screen">

        {/* LEFT SIDE */}
        <div className="login-left">

          <div className="login-brand">
            <div className="login-logo">W</div>

            <div>
              <h2>WorkforceIQ</h2>
              <span>SMART WORKFORCE PLATFORM</span>
            </div>
          </div>

          <div className="login-content">

          <span className="login-badge">
            SECURE WORKFORCE ACCESS
          </span>

            <h1>
              {isRegistering ? (
                  <>
                    Create your
                    <br />
                    <span>account.</span>
                  </>
              ) : (
                  <>
                    Welcome
                    <br />
                    <span>back.</span>
                  </>
              )}
            </h1>

            <p>
              {isRegistering
                  ? "Set your password to access the WorkforceIQ employee portal."
                  : "Sign in to manage employees, rosters, shifts, availability and workforce insights."}
            </p>

            <div className="login-features">

              <div>
                <strong>✓</strong>
                <span>Smart roster management</span>
              </div>

              <div>
                <strong>✓</strong>
                <span>Real-time conflict detection</span>
              </div>

              <div>
                <strong>✓</strong>
                <span>AI-powered workforce insights</span>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">

          <div className="login-card">

            <div className="mobile-logo">
              <div className="login-logo">W</div>
              <strong>WorkforceIQ</strong>
            </div>

            <h2>
              {isRegistering
                  ? "Employee Registration"
                  : "Sign in"}
            </h2>

            <p className="login-subtitle">
              {isRegistering
                  ? "Create your employee login credentials"
                  : "Enter your workforce credentials"}
            </p>

            {isRegistering ? (

                /* ========================= */
                /* EMPLOYEE REGISTRATION */
                /* ========================= */

                <form onSubmit={handleRegister}>

                  {/* EMPLOYEE CODE */}
                  <div className="login-field">

                    <label>Employee Code</label>

                    <div className="login-input">

                      <span>👤</span>

                      <input
                          type="text"
                          placeholder="e.g. EMP013"
                          value={employeeCode}
                          onChange={(e) =>
                              setEmployeeCode(
                                  e.target.value.toUpperCase()
                              )
                          }
                          autoComplete="username"
                          disabled={loading}
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}
                  <div className="login-field">

                    <label>Create Password</label>

                    <div className="login-input">

                      <span>🔒</span>

                      <input
                          type={
                            showPassword
                                ? "text"
                                : "password"
                          }
                          placeholder="Create your password"
                          value={password}
                          onChange={(e) =>
                              setPassword(e.target.value)
                          }
                          autoComplete="new-password"
                          disabled={loading}
                      />

                      <button
                          type="button"
                          className="show-password"
                          onClick={() =>
                              setShowPassword(!showPassword)
                          }
                          disabled={loading}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="login-field">

                    <label>Confirm Password</label>

                    <div className="login-input">

                      <span>🔒</span>

                      <input
                          type={
                            showConfirmPassword
                                ? "text"
                                : "password"
                          }
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) =>
                              setConfirmPassword(
                                  e.target.value
                              )
                          }
                          autoComplete="new-password"
                          disabled={loading}
                      />

                      <button
                          type="button"
                          className="show-password"
                          onClick={() =>
                              setShowConfirmPassword(
                                  !showConfirmPassword
                              )
                          }
                          disabled={loading}
                      >
                        {showConfirmPassword
                            ? "Hide"
                            : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* ERROR */}
                  {error && (
                      <div className="login-error">
                        {error}
                      </div>
                  )}

                  {/* SUCCESS */}
                  {success && (
                      <div className="login-success">
                        {success}
                      </div>
                  )}

                  {/* REGISTER */}
                  <button
                      type="submit"
                      className="login-submit"
                      disabled={loading}
                  >
                    {loading
                        ? "Creating Account..."
                        : "Create Employee Account"}

                    {!loading && <span>→</span>}
                  </button>

                  {/* BACK TO LOGIN */}
                  <button
                      type="button"
                      className="login-register-link"
                      onClick={switchToLogin}
                      disabled={loading}
                  >
                    Already have an account?
                    <strong> Sign In</strong>
                  </button>

                </form>

            ) : (

                /* ========================= */
                /* LOGIN */
                /* ========================= */

                <form onSubmit={handleLogin}>

                  {/* EMPLOYEE CODE */}
                  <div className="login-field">

                    <label>Employee Code</label>

                    <div className="login-input">

                      <span>👤</span>

                      <input
                          type="text"
                          placeholder="e.g. EMP002"
                          value={employeeCode}
                          onChange={(e) =>
                              setEmployeeCode(e.target.value)
                          }
                          autoComplete="username"
                          disabled={loading}
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}
                  <div className="login-field">

                    <label>Password</label>

                    <div className="login-input">

                      <span>🔒</span>

                      <input
                          type={
                            showPassword
                                ? "text"
                                : "password"
                          }
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) =>
                              setPassword(e.target.value)
                          }
                          autoComplete="current-password"
                          disabled={loading}
                      />

                      <button
                          type="button"
                          className="show-password"
                          onClick={() =>
                              setShowPassword(!showPassword)
                          }
                          disabled={loading}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>

                    </div>

                  </div>

                  {/* ERROR */}
                  {error && (
                      <div className="login-error">
                        {error}
                      </div>
                  )}

                  {/* OPTIONS */}
                  <div className="login-options">

                    <label>
                      <input type="checkbox" />
                      Remember me
                    </label>

                    <button
                        type="button"
                        onClick={() =>
                            alert(
                                "Please contact your administrator to reset your password."
                            )
                        }
                        disabled={loading}
                    >
                      Forgot password?
                    </button>

                  </div>

                  {/* SIGN IN */}
                  <button
                      type="submit"
                      className="login-submit"
                      disabled={loading}
                  >
                    {loading
                        ? "Signing in..."
                        : "Sign In"}

                    {!loading && <span>→</span>}
                  </button>

                  {/* REGISTER LINK */}
                  <div className="login-register">

                    <span>New employee?</span>

                    <button
                        type="button"
                        onClick={switchToRegister}
                        disabled={loading}
                    >
                      Register / Set Password
                    </button>

                  </div>

                </form>

            )}

            <div className="login-security">
              🔐 Secure authentication powered by
              Spring Security + JWT
            </div>

          </div>

        </div>

      </div>
  );
}