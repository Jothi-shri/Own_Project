import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { authService } from "../api/authService";
import { Eye, EyeOff, Lock, Mail, TriangleAlert, ArrowRight } from "lucide-react";

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
      setAuth(authResponse.access_token, authResponse.user, false);
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
      <div className="mb-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Welcome back</p>
        <h2 className="mt-1.5 text-[26px] font-bold tracking-tight text-[var(--text-h)]">Sign in</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text)]">
          Enter your credentials to access your workspace.
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
        <div>
          <label htmlFor="login-email" className="field-label">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail size={17} className="pointer-events-none absolute left-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginCredentials.email}
              onChange={handleLoginCredentialChange}
              placeholder="you@company.com"
              className="input !pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="field-label">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock size={17} className="pointer-events-none absolute left-3.5 shrink-0 text-[var(--text-muted)]" aria-hidden />
            <input
              id="login-password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              value={loginCredentials.password}
              onChange={handleLoginCredentialChange}
              placeholder="Enter your password"
              className="input !pl-10 !pr-11"
            />
            <button
              type="button"
              className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-h)]"
              onClick={() => setIsPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            >
              {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--text)]">
            <input
              type="checkbox"
              checked={shouldRememberSession}
              onChange={(sessionToggleEvent) => setShouldRememberSession(sessionToggleEvent.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-[var(--accent)]"
            />
            Keep me signed in
          </label>
          <button
            type="button"
            className="text-[13px] font-semibold text-[var(--accent)] transition hover:opacity-80 hover:underline"
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
          <div
            className="anim-fade flex items-start gap-2.5 rounded-xl border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] p-3 text-[13px] font-medium text-[var(--auth-error-text)]"
            role="alert"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{loginError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-1 w-full !py-3 text-[15px]" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              Sign in <ArrowRight size={16} aria-hidden />
            </span>
          )}
        </button>
      </form>

      <div className="divider my-6" aria-hidden="true" />

      <p className="text-center text-sm text-[var(--text)]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="font-bold text-[var(--accent)] transition hover:opacity-80 hover:underline"
          onClick={() => {
            setAuthView("register");
            navigate("/register");
          }}
        >
          Create one
        </button>
      </p>
    </>
  );
}
