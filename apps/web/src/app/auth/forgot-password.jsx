// apps/web/src/app/auth/forgot-password.jsx
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="auth-card">
      <div className="auth-header">
        <a href="/" className="brand-logo">
          SKILL<span>BRIDGE</span>
        </a>
        <h1>Recover Password</h1>
        <p>We'll send a link to your email.</p>
      </div>

      {sent ? (
        <div className="message success">
          Check your inbox. Reset instructions sent.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="name@dev.com"
                required
              />
            </div>
          </div>
          <button onClick={() => setSent(true)} className="btn-primary">
            Send Reset Link
          </button>
        </div>
      )}

      <div className="auth-footer">
        Remembered your password? <a href="/auth/login">Sign In</a>
      </div>
    </div>
  );
}
