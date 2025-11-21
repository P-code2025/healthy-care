import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext";
import { validateEmail, getErrorMessage } from "../../utils/errorMessages";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleEmailBlur = () => {
    const validationError = validateEmail(email);
    setEmailError(validationError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submit
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setEmailError(null);
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      const errorConfig = getErrorMessage(err);
      setError(errorConfig.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Welcome back!</h1>
        <p>Sign in to continue your wellness journey.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={handleEmailBlur}
              required
              className={`${styles.input} ${emailError ? styles.inputError : ""}`}
              disabled={submitting}
            />
            {emailError && <div className={styles.fieldError}>{emailError}</div>}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              disabled={submitting}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Working..." : "Sign in"}
          </button>
        </form>

        <p className={styles.switchText}>
          No account yet? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
