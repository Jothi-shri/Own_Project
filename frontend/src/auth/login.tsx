import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { authService } from "../api/authService";
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
      <div className="mb-10 select-none text-center">
        <h2 className="text-4xl font-extrabold tracking-tight text-[var(--auth-heading)]">Sign in</h2>
        <p className="mt-3 text-base text-[var(--auth-text)]">Enter your credentials to access the SaaS platform.</p>
      </div>

      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
        <div>
          <label className="mb-3 block text-xs font-extrabold uppercase tracking-widest text-[var(--auth-text-muted)]">Email address</label>
          <div className="relative flex items-center">
            <Mail size={18} className="pointer-events-none absolute left-[14px] shrink-0 text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              value={loginCredentials.email}
              onChange={handleLoginCredentialChange}
              placeholder="you@company.com"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-3 text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-xs font-extrabold uppercase tracking-widest text-[var(--auth-text-muted)]">Password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="pointer-events-none absolute left-[14px] shrink-0 text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              autoComplete="current-password"
              required
              value={loginCredentials.password}
              onChange={handleLoginCredentialChange}
              placeholder="Enter your password"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-[42px] text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
            <button
              type="button"
              className="absolute right-[6px] flex h-8 w-8 items-center justify-center rounded-[7px] bg-transparent text-[var(--auth-text-muted)] transition hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
              onClick={() => setIsPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label="Toggle password"
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-1 flex select-none items-center justify-between">
          <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-semibold text-[var(--auth-text)]">
            <input
              type="checkbox"
              checked={shouldRememberSession}
              onChange={(sessionToggleEvent) => setShouldRememberSession(sessionToggleEvent.target.checked)}
              className="h-4 w-4 cursor-pointer rounded accent-[var(--accent)]"
            />
            Keep me signed in for 30 days
          </label>
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-[var(--auth-primary-from)] transition hover:opacity-85"
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
          <div className="flex items-center gap-2 rounded-[10px] border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] p-3 text-sm font-semibold text-[var(--auth-error-text)]">
            <TriangleAlert size={16} className="shrink-0" aria-hidden />
            {loginError}
          </div>
        )}

        <button
          type="submit"
          className="mt-4 flex w-full items-center justify-center rounded-[10px] border border-transparent bg-gradient-to-br from-[var(--auth-primary-from)] to-[var(--auth-primary-to)] py-3 text-[15px] font-bold tracking-wide text-white shadow-[var(--shadow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </span>
          ) : (
            "Sign in →"
          )}
        </button>
      </form>

      <div className="mt-8 flex select-none items-center justify-center gap-4 text-sm font-semibold text-[var(--auth-text-muted)]">
        <span>
          Don&apos;t have an account?{" "}
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-extrabold text-[var(--auth-primary-from)] transition hover:opacity-85 hover:underline"
            onClick={() => {
              setAuthView("register");
              navigate("/register");
            }}
          >
            Create one
          </button>
        </span>
      </div>
    </>
  );
}
