import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearAuthError } from "../features/auth/authSlice";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.auth);

  async function handleSubmit(event) {
    event.preventDefault();

    if (name.trim().length < 2 || password.length < 8) {
      return;
    }

    try {
      await dispatch(
        registerUser({
          name: name.trim(),
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
          <span className="eyebrow">MAKE ROOM FOR MORE</span>
          <h1>
            Your people.
            <br />
            Your conversations.
          </h1>
          <p>Create your space and keep every important conversation close.</p>
          <div className="showcase-bubbles">
            <span>AM</span>
            <span>PS</span>
            <span>RV</span>
            <span>+12</span>
          </div>
          <small>Connection feels good.</small>
        </div>

        <div className="showcase-footer">A simpler way to stay connected.</div>
      </section>

      <section className="auth-panel">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <MessageCircle size={20} />
            </span>
            connectly
          </div>

          <span className="eyebrow">GET STARTED</span>
          <h2>Create your account</h2>
          <p className="muted">A few details and you're ready to connect.</p>

          <label>Full name</label>
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) dispatch(clearAuthError());
            }}
            required
            minLength={2}
          />

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
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) dispatch(clearAuthError());
            }}
            minLength={8}
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
            {!loading && <span>→</span>}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
