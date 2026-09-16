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
  CheckCircle2,
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
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  const registrationPassword = registrationForm.password;
  const passwordStrengthChecks = {
    minLength: registrationPassword.length >= 8,
    hasUpper: /[A-Z]/.test(registrationPassword),
    hasLower: /[a-z]/.test(registrationPassword),
    hasNumber: /[0-9]/.test(registrationPassword),
  };
  const isPasswordStrong = Object.values(passwordStrengthChecks).every(Boolean);
  const passwordStrengthScore = Object.values(passwordStrengthChecks).filter(Boolean).length;
  const passwordStrengthColor =
    passwordStrengthScore <= 1
      ? "var(--red)"
      : passwordStrengthScore <= 3
        ? "var(--amber)"
        : "var(--nv-green)";
  const passwordStrengthLabel =
    passwordStrengthScore <= 1
      ? "Weak"
      : passwordStrengthScore === 2
        ? "Fair"
        : passwordStrengthScore === 3
          ? "Good"
          : "Strong";
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
      setAuth(authResponse.access_token, authResponse.user);
      setIsRegistrationComplete(true);
      pushToast({
        kind: "success",
        title: "Account created",
        msg: "Signed in — your account is persisted in PostgreSQL.",
      });
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

  if (isRegistrationComplete) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--auth-heading)]">Account created</h1>
          <p className="mt-1.5 text-base text-[var(--auth-text)]">Your account has been registered successfully.</p>
        </div>
        <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input-bg)] p-6 text-center">
          <CheckCircle2 size={48} className="text-[var(--nv-green)]" strokeWidth={1.8} />
          <span className="text-sm text-[var(--auth-text)]">You can now sign in with your credentials.</span>
        </div>
        <button
          type="button"
          className="mt-1 flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--auth-primary-from)] to-[var(--auth-primary-to)] py-3 text-[15px] font-bold text-white shadow-[var(--shadow)] transition hover:opacity-90"
          onClick={() => {
            setAuthView("login");
            navigate("/login");
          }}
        >
          Sign in
        </button>
        <div className="mt-6 text-center text-sm font-semibold text-[var(--auth-text-muted)]">
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-[var(--auth-primary-from)] transition hover:opacity-80"
            onClick={() => setIsRegistrationComplete(false)}
          >
            Register another account
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--auth-heading)]">Create account</h1>
        <p className="mt-1.5 text-base text-[var(--auth-text)]">Register to access the SaaS platform</p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--auth-text)]">Full name</label>
          <div className="relative flex items-center">
            <User size={18} className="pointer-events-none absolute left-[14px] text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="name"
              type="text"
              required
              maxLength={100}
              value={registrationForm.name}
              onChange={handleRegistrationFieldChange}
              placeholder="Jane Doe"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-3 text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--auth-text)]">Email address</label>
          <div className="relative flex items-center">
            <Mail size={18} className="pointer-events-none absolute left-[14px] text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="email"
              type="email"
              required
              value={registrationForm.email}
              onChange={handleRegistrationFieldChange}
              placeholder="you@company.com"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-3 text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--auth-text)]">Password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="pointer-events-none absolute left-[14px] text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.password}
              onChange={handleRegistrationFieldChange}
              placeholder="Min. 8 characters"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-[42px] text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
            <button
              type="button"
              className="absolute right-[6px] flex h-8 w-8 items-center justify-center rounded-[7px] bg-transparent text-[var(--auth-text-muted)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
              onClick={() => setIsPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label="Toggle password"
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {registrationPassword && (
            <>
              <div className="mt-2.5 flex gap-1.5">
                {[1, 2, 3, 4].map((strengthSegment) => (
                  <span
                    key={strengthSegment}
                    style={{
                      background: strengthSegment <= passwordStrengthScore ? passwordStrengthColor : "var(--bg-4)",
                    }}
                    className="h-1 flex-1 rounded-full transition"
                  />
                ))}
              </div>
              <span className="mt-1.5 inline-block text-xs font-bold" style={{ color: passwordStrengthColor }}>
                {passwordStrengthLabel}
              </span>
            </>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--auth-text)]">Confirm password</label>
          <div className="relative flex items-center">
            <Lock size={18} className="pointer-events-none absolute left-[14px] text-[var(--auth-text-muted)]" aria-hidden />
            <input
              name="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.confirmPassword}
              onChange={handleRegistrationFieldChange}
              placeholder="Re-enter password"
              className="w-full rounded-[10px] border border-[var(--auth-border)] bg-[var(--auth-input-bg)] py-3 pl-[42px] pr-[42px] text-[15px] text-[var(--text-h)] placeholder:text-[var(--auth-text-muted)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-bg)]"
            />
            <button
              type="button"
              className="absolute right-[6px] flex h-8 w-8 items-center justify-center rounded-[7px] bg-transparent text-[var(--auth-text-muted)] hover:bg-[var(--code-bg)] hover:text-[var(--text-h)]"
              onClick={() => setIsConfirmPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label="Toggle password"
            >
              {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {registrationForm.confirmPassword && !doPasswordsMatch && (
            <span className="mt-1.5 block text-xs font-semibold text-[var(--red)]">Passwords do not match</span>
          )}
        </div>

        {registrationError && (
          <div className="flex items-center gap-2 rounded-[10px] border border-[var(--auth-error-border)] bg-[var(--auth-error-bg)] p-3 text-sm font-semibold text-[var(--auth-error-text)]">
            <TriangleAlert size={16} className="shrink-0" aria-hidden />
            {registrationError}
          </div>
        )}

        <button type="submit" className="flex w-full items-center justify-center rounded-[10px] bg-gradient-to-br from-[var(--auth-primary-from)] to-[var(--auth-primary-to)] py-3 text-[15px] font-bold text-white shadow-[var(--shadow)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-65" disabled={isSubmitting}>
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

      <div className="mt-6 text-center text-sm font-semibold text-[var(--auth-text-muted)]">
        Already have an account?{" "}
        <button
          type="button"
          className="cursor-pointer border-none bg-transparent p-0 text-sm font-semibold text-[var(--auth-primary-from)] transition hover:opacity-80"
          onClick={() => {
            setAuthView("login");
            navigate("/login");
          }}
        >
          Sign in
        </button>
      </div>
    </>
  );
}
