import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { authService } from "../api/authService";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  TriangleAlert,
} from "lucide-react";

interface RegistrationForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const setAuthView = useSaaSStore((s) => s.setAuthView);
  const setAuth = useSaaSStore((s) => s.setAuth);
  const pushToast = useSaaSStore((s) => s.pushToast);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registrationPassword = registrationForm.password;
  const passwordStrengthChecks = {
    minLength: registrationPassword.length >= 8,
    hasUpper: /[A-Z]/.test(registrationPassword),
    hasLower: /[a-z]/.test(registrationPassword),
    hasNumber: /[0-9]/.test(registrationPassword),
  };
  const isPasswordStrong = Object.values(passwordStrengthChecks).every(Boolean);
  const passwordStrengthScore = Object.values(passwordStrengthChecks).filter(Boolean).length;
  const passwordStrengthMeta =
    passwordStrengthScore <= 1
      ? { color: "var(--danger)", label: "Weak" }
      : passwordStrengthScore === 2
        ? { color: "var(--warning)", label: "Fair" }
        : passwordStrengthScore === 3
          ? { color: "var(--warning)", label: "Good" }
          : { color: "var(--success)", label: "Strong" };
  const doPasswordsMatch =
    !!registrationForm.confirmPassword && registrationForm.password === registrationForm.confirmPassword;
  const isRegistrationFormValid = !!registrationForm.name && !!registrationForm.email && isPasswordStrong && doPasswordsMatch;

  const handleRegistrationFieldChange = (fieldChangeEvent: ChangeEvent<HTMLInputElement>) => {
    const { name: fieldName, value: fieldValue } = fieldChangeEvent.target;
    setRegistrationForm((previousForm) => ({ ...previousForm, [fieldName]: fieldValue }));
  };

  async function handleRegistrationSubmit(registrationEvent: FormEvent) {
    registrationEvent.preventDefault();
    setRegistrationError("");
    if (!isRegistrationFormValid) {
      if (registrationForm.password !== registrationForm.confirmPassword)
        setRegistrationError("Passwords do not match");
      else if (!passwordStrengthChecks.minLength)
        setRegistrationError("Password must be at least 8 characters");
      else if (!isPasswordStrong)
        setRegistrationError("Password needs upper- & lower-case letters and a number");
      else setRegistrationError("Please complete all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      const authResponse = await authService.register(registrationForm.name, registrationForm.email, registrationForm.password);
      // The register endpoint already authenticates: it returns an access
      // token + user and sets the HttpOnly refresh cookie (same _auth_response
      // as login). Establish the session, then go straight to /dashboard —
      // the login page must never appear in between.
      setAuth(authResponse.access_token, authResponse.user);
      pushToast({
        kind: "success",
        title: `Welcome, ${authResponse.user.name.split(" ")[0]}`,
        msg: "Account created — you are signed in.",
      });
      navigate("/dashboard", { replace: true });
    } catch (registrationFailure: unknown) {
      const errorMessage =
        registrationFailure instanceof Error
          ? registrationFailure.message
          : "Unable to reach the server. Is the API running?";
      setRegistrationError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Get started</p>
        <h1 className="mt-1.5 text-[24px] font-bold tracking-tight text-[var(--text-h)]">Create account</h1>
        <p className="mt-1.5 text-sm text-[var(--text)]">Register to access your SaaS workspace</p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="reg-name" className="field-label">Full name</label>
          <div className="relative flex items-center">
            <User size={17} className="pointer-events-none absolute left-3.5 text-[var(--text-muted)]" aria-hidden />
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              maxLength={100}
              value={registrationForm.name}
              onChange={handleRegistrationFieldChange}
              placeholder="Jane Doe"
              className="input !pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="field-label">Email address</label>
          <div className="relative flex items-center">
            <Mail size={17} className="pointer-events-none absolute left-3.5 text-[var(--text-muted)]" aria-hidden />
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              value={registrationForm.email}
              onChange={handleRegistrationFieldChange}
              placeholder="you@company.com"
              className="input !pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-password" className="field-label">Password</label>
          <div className="relative flex items-center">
            <Lock size={17} className="pointer-events-none absolute left-3.5 text-[var(--text-muted)]" aria-hidden />
            <input
              id="reg-password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.password}
              onChange={handleRegistrationFieldChange}
              placeholder="Min. 8 characters"
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
          {registrationPassword && (
            <>
              <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((strengthSegment) => (
                  <span
                    key={strengthSegment}
                    style={{
                      background: strengthSegment <= passwordStrengthScore ? passwordStrengthMeta.color : "var(--bg-4)",
                    }}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                  />
                ))}
              </div>
              <span className="mt-1.5 inline-block text-xs font-bold" style={{ color: passwordStrengthMeta.color }}>
                {passwordStrengthMeta.label} password
              </span>
            </>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirm" className="field-label">Confirm password</label>
          <div className="relative flex items-center">
            <Lock size={17} className="pointer-events-none absolute left-3.5 text-[var(--text-muted)]" aria-hidden />
            <input
              id="reg-confirm"
              name="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.confirmPassword}
              onChange={handleRegistrationFieldChange}
              placeholder="Re-enter password"
              className="input !pl-10 !pr-11"
            />
            <button
              type="button"
              className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text-h)]"
              onClick={() => setIsConfirmPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label={isConfirmPasswordVisible ? "Hide password" : "Show password"}
            >
              {isConfirmPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {registrationForm.confirmPassword && !doPasswordsMatch && (
            <span className="mt-1.5 block text-xs font-semibold text-[var(--danger)]">Passwords do not match</span>
          )}
          {doPasswordsMatch && (
            <span className="mt-1.5 block text-xs font-semibold text-[var(--success)]">Passwords match</span>
          )}
        </div>

        {registrationError && (
          <div
            className="anim-fade flex items-start gap-2.5 rounded-xl border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] p-3 text-[13px] font-medium text-[var(--auth-error-text)]"
            role="alert"
          >
            <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span>{registrationError}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary mt-1 w-full !py-3 text-[15px]" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="divider my-5" aria-hidden="true" />

      <p className="text-center text-sm text-[var(--text)]">
        Already have an account?{" "}
        <button
          type="button"
          className="font-bold text-[var(--accent)] transition hover:opacity-80 hover:underline"
          onClick={() => {
            setAuthView("login");
            navigate("/login");
          }}
        >
          Sign in
        </button>
      </p>
    </>
  );
}
