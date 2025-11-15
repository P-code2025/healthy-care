import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // LƯU EMAIL VÀO localStorage TRƯỚC KHI ĐĂNG NHẬP
    localStorage.setItem("userEmail", email.trim());

    login(); // Lưu trạng thái đăng nhập
    navigate("/onboarding");
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1>Chào mừng trở lại!</h1>
        <p>Đăng nhập để tiếp tục hành trình khỏe mạnh.</p>

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

          <button type="submit" className={styles.submitBtn}>
            Đăng nhập
          </button>
        </form>

        <p className={styles.switchText}>
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}