// src/pages/auth/Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext"; // Đúng đường dẫn

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPass) {
      alert("Mật khẩu không khớp!");
      return;
    }

    // TODO: Gọi API đăng ký
    // if (success) {
    login(); // Đánh dấu đã đăng nhập
    navigate("/onboarding"); // Chuyển sang onboarding
    // }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Tạo tài khoản mới</h1>
        <p>Chỉ cần vài bước để bắt đầu!</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.submitBtn}>
            Đăng ký
          </button>
        </form>

        <p className={styles.switchText}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}