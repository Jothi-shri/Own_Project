import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { authService } from "./authService";
import { Eye, EyeOff, Lock, Mail, TriangleAlert } from "lucide-react";

interface LoginCredentials {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useSaaSStore((s) => s.setAuth);
  const setAuthView = useSaaSStore((s) => s.setAuthView);
  const pushToast = useSaaSStore((s) => s.pushToast);

  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>({ email: "", password: "" });
  const [shouldRememberSession, setShouldRememberSession] = useState(true);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginCredentialChange = (credentialChangeEvent: ChangeEvent<HTMLInputElement>) => {
    const { name: credentialFieldName, value: credentialFieldValue } = credentialChangeEvent.target;
    setLoginCredentials((previousCredentials) => ({ ...previousCredentials, [credentialFieldName]: credentialFieldValue }));
  };

  async function handleLoginSubmit(loginFormEvent: FormEvent) {
    loginFormEvent.preventDefault();
    setLoginError("");
    setIsSubmitting(true);
    try {
      const authResponse = await authService.login(loginCredentials.email, loginCredentials.password);
      if (shouldRememberSession) localStorage.setItem("rememberMe", "true");
      setAuth(authResponse.access_token, authResponse.refresh_token, authResponse.user, false);
      pushToast({
        kind: "success",
        title: `Welcome back, ${authResponse.user.name.split(" ")[0]}`,
        msg: "Signed in to the control center",
      });
      navigate("/dashboard");
    } catch (authenticationError: unknown) {
      const errorMessage =
        authenticationError instanceof Error
          ? authenticationError.message
          : "Unable to reach the server. Is the API running?";
      setLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-10 select-none text-center">
        <h2
          className="text-4xl font-extrabold tracking-tight"
          style={{ color: "var(--auth-heading)" }}
        >
          Sign in
        </h2>
        <p className="text-base mt-3" style={{ color: "var(--auth-text)" }}>
          Enter your credentials to access the SaaS platform.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
        <div>
          <label
            className="block text-xs font-extrabold tracking-widest uppercase mb-3"
            style={{ color: "var(--auth-text-muted)" }}
          >
            Email address
          </label>
          <div className="auth-glass-input-wrap">
            <Mail size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginCredentials.email}
              onChange={handleLoginCredentialChange}
              placeholder="you@company.com"
              className="auth-glass-input"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-extrabold tracking-widest uppercase mb-3"
            style={{ color: "var(--auth-text-muted)" }}
          >
            Password
          </label>
          <div className="auth-glass-input-wrap">
            <Lock size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              value={loginCredentials.password}
              onChange={handleLoginCredentialChange}
              placeholder="Enter your password"
              className="auth-glass-input"
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              className="auth-glass-eye"
              onClick={() => setIsPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label="Toggle password"
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 select-none">
          <label
            className="flex items-center gap-2.5 text-sm font-semibold cursor-pointer select-none"
            style={{ color: "var(--auth-text)" }}
          >
            <input
              type="checkbox"
              checked={shouldRememberSession}
              onChange={(sessionToggleEvent) => setShouldRememberSession(sessionToggleEvent.target.checked)}
              className="auth-glass-checkbox cursor-pointer"
            />
            Keep me signed in for 30 days
          </label>
          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-sm font-semibold p-0 transition-all duration-150 hover:opacity-85"
            style={{ color: "var(--auth-primary-from)" }}
            onClick={() =>
              pushToast({
                kind: "info",
                title: "Password Reset",
                msg: "Contact your administrator to reset your password.",
              })
            }
          >
            Forgot password?
          </button>
        </div>

        {loginError && (
          <div className="auth-glass-error">
            <TriangleAlert size={16} className="shrink-0" aria-hidden />
            {loginError}
          </div>
        )}

        <button
          type="submit"
          className="auth-glass-btn flex items-center justify-center font-bold tracking-wide mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="auth-glass-spinner" />
              Signing in…
            </span>
          ) : (
            "Sign in →"
          )}
        </button>
      </form>

      <div
        className="flex items-center justify-center gap-4 mt-8 text-sm font-semibold select-none"
        style={{ color: "var(--auth-text-muted)" }}
      >
        <span>
          Don't have an account?{" "}
          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-sm font-extrabold p-0 transition-all duration-150 hover:opacity-85 hover:underline"
            style={{ color: "var(--auth-primary-from)" }}
            onClick={() => {
              setAuthView("register");
              navigate("/register");
            }}
          >
            Create one
          </button>
        </span>
        <span className="text-xs" style={{ color: "var(--auth-text-muted)" }}>
          |
        </span>
        <button
          type="button"
          className="bg-transparent border-none cursor-pointer text-sm font-extrabold p-0 transition-all duration-150 hover:opacity-85 hover:underline"
          style={{ color: "var(--auth-primary-from)" }}
          onClick={() => setAuthView("admin")}
        >
          Admin Login
        </button>
      </div>
    </>
  );
}
