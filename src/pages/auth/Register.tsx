import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
  getErrorMessage,
} from "../../utils/errorMessages";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassError, setConfirmPassError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const passwordStrength = getPasswordStrength(password);

  const handleEmailBlur = () => {
    const validationError = validateEmail(email);
    setEmailError(validationError);
  };

  const handlePasswordBlur = () => {
    const validationError = validatePassword(password);
    setPasswordError(validationError);
  };

  const handleConfirmPassBlur = () => {
    if (confirmPass) {
      const validationError = validatePasswordMatch(password, confirmPass);
      setConfirmPassError(validationError);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    const confirmPassValidation = validatePasswordMatch(password, confirmPass);

    if (emailValidation || passwordValidation || confirmPassValidation) {
      setEmailError(emailValidation);
      setPasswordError(passwordValidation);
      setConfirmPassError(confirmPassValidation);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await register({ email: email.trim(), password });
      // Navigate to onboarding for new users instead of dashboard
      // This prevents a navigation loop since new users haven't completed onboarding
      navigate("/onboarding");
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
        <h1>Create an account</h1>
        <p>Just a few steps to get started.</p>

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
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(null);
              }}
              onBlur={handlePasswordBlur}
              required
              className={`${styles.input} ${passwordError ? styles.inputError : ""}`}
              disabled={submitting}
            />
            {passwordError && <div className={styles.fieldError}>{passwordError}</div>}
            {password && !passwordError && (
              <div className={styles.passwordStrength}>
                <div className={styles.strengthLabel}>
                  Password strength: <strong>{passwordStrength.strength}</strong>
                </div>
                <div className={styles.strengthBar}>
                  <div className={`${styles.strengthProgress} ${styles[passwordStrength.strength]}`} />
                </div>
              </div>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPass}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                if (confirmPassError) setConfirmPassError(null);
              }}
              onBlur={handleConfirmPassBlur}
              required
              className={`${styles.input} ${confirmPassError ? styles.inputError : ""}`}
              disabled={submitting}
            />
            {confirmPassError && (
              <div className={styles.fieldError}>{confirmPassError}</div>
            )}
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
