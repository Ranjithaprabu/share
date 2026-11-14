
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginUser,
  clearAuthError,
} from "../features/auth/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await dispatch(
        loginUser({
          email: email.trim(),
          password,
        })
      ).unwrap();

      navigate("/chat");
    } catch (err) {
      // Error is stored in Redux.
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-showcase">
        <div className="brand brand-light">
          <span className="brand-mark">
            <MessageCircle size={21} />
          </span>
          connectly
        </div>

        <div className="showcase-copy">
          <span className="eyebrow">YOUR SPACE TO CONNECT</span>
          <h1>
            Good conversations
            <br />
            start here.
          </h1>
          <p>
            Bring your people together. Share ideas, moments, and everything
            in between.
          </p>
          <div className="showcase-bubbles">
            <span>AM</span>
            <span>PS</span>
            <span>RV</span>
            <span>+12</span>
          </div>
          <small>A little closer, wherever you are.</small>
        </div>

        <div className="showcase-footer">
          A simpler way to stay connected.
        </div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <MessageCircle size={20} />
            </span>
            connectly
          </div>

          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to Connectly</h2>
          <p className="muted">
            Enter your details to continue your conversations.
          </p>

          <label>Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) dispatch(clearAuthError());
            }}
            required
          />

          <label>Password</label>
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) dispatch(clearAuthError());
              }}
              required
            />

            <button
              type="button"
              className="icon-button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <span>→</span>}
          </button>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
