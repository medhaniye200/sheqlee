import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/settings-alt2.png";
import { auth } from "../services/authService";

export default function AuthPage({ user, onUserChange, mode = "login" }) {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  if (user && mode === "login") return <Navigate to={location.state?.from || "/dashboard"} replace />;

  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "login") {
        auth.signIn(data.email, data.password);
        onUserChange();
      } else if (mode === "request") {
        navigate("/new-password", { state: { email: data.email } });
      } else {
        auth.reset(data.email, data.code, data.password, data.confirmation);
        navigate("/", { state: { reset: true } });
      }
    } catch (failure) {
      setError(failure.message);
    }
  }

  const login = mode === "login";
  const request = mode === "request";
  return <main className="auth-page">
    <img src={logo} alt="" />
    <h1>Control Board</h1>
    <section>
      <h2>{login ? "Log in" : request ? "Forgot password?" : mode === "activate" ? "Activate demo account" : "Reset demo password"}</h2>
      {location.state?.reset && <p role="status">Demo password updated for this page session.</p>}
      <form className="record-form" onSubmit={submit}>
        <label>Email<input name="email" type="email" required autoComplete="username" defaultValue={location.state?.email || ""} /></label>
        {!login && !request && <label>Demo code<input name="code" required inputMode="numeric" /></label>}
        {!request && <label>Password<input name="password" type="password" required autoComplete={login ? "current-password" : "new-password"} /></label>}
        {!login && !request && <label>Confirm password<input name="confirmation" type="password" required autoComplete="new-password" /></label>}
        {error && <p role="alert">{error}</p>}
        <button className="primary">{login ? "Log in" : request ? "Continue" : "Set demo password"}</button>
      </form>
      {login ? <>
        <p>Demo account <code>admin@example.com</code> / <code>password123</code></p>
        <div className="actions"><Link to="/reset-password">Reset password</Link><Link to="/one-time-code">Activate demo account</Link></div>
      </> : <>
        <p>{request ? "Continue to use the built-in demo code." : "Use code 272025 and a fictional password. The change lasts until reload."}</p>
        <Link to="/">Back to login</Link>
      </>}
    </section>
  </main>;
}
