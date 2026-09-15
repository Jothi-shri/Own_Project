import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useSaaSStore } from "../store";
import { authService } from "../api/authService";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  User,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";

const ROLES = ["Analyst", "Technician", "Supervisor", "Admin"] as const;

interface RegistrationForm {
  name: string;
  email: string;
  role: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const setAuthView = useSaaSStore((s) => s.setAuthView);
  const pushToast = useSaaSStore((s) => s.pushToast);
  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    name: "",
    email: "",
    role: "Analyst",
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

  const handleRegistrationFieldChange = (fieldChangeEvent: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await authService.register(registrationForm.name, registrationForm.email, registrationForm.password, registrationForm.role);
      setIsRegistrationComplete(true);
      pushToast({
        kind: "success",
        title: "Account created",
        msg: "You can now sign in with your credentials.",
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
          <h1
            className="text-[28px] font-bold tracking-tight"
            style={{ color: "var(--auth-heading)" }}
          >
            Account created
          </h1>
          <p className="text-base mt-1.5" style={{ color: "var(--auth-text)" }}>
            Your account has been registered successfully.
          </p>
        </div>
        <div className="auth-glass-success">
          <CheckCircle2 size={48} style={{ color: "var(--nv-green)" }} strokeWidth={1.8} />
          <span
            style={{ color: "var(--auth-text)" }}
            className="text-sm text-center"
          >
            You can now sign in with your credentials.
          </span>
        </div>
        <button
          type="button"
          className="auth-glass-btn !mt-1"
          onClick={() => {
            setAuthView("login");
            navigate("/login");
          }}
        >
          Sign in
        </button>
        <div className="auth-glass-divider">
          <button
            type="button"
            className="bg-transparent border-none cursor-pointer text-sm font-semibold p-0 transition-opacity duration-150 hover:opacity-80"
            style={{ color: "var(--auth-primary-from)" }}
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
        <h1
          className="text-[28px] font-bold tracking-tight"
          style={{ color: "var(--auth-heading)" }}
        >
          Create account
        </h1>
        <p className="text-base mt-1.5" style={{ color: "var(--auth-text)" }}>
          Register to access the SaaS platform
        </p>
      </div>

      <form onSubmit={handleRegistrationSubmit} className="flex flex-col gap-5">
        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--auth-text)" }}
          >
            Full name
          </label>
          <div className="auth-glass-input-wrap">
            <User size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="name"
              type="text"
              required
              maxLength={100}
              value={registrationForm.name}
              onChange={handleRegistrationFieldChange}
              placeholder="Jane Doe"
              className="auth-glass-input"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--auth-text)" }}
          >
            Email address
          </label>
          <div className="auth-glass-input-wrap">
            <Mail size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="email"
              type="email"
              required
              value={registrationForm.email}
              onChange={handleRegistrationFieldChange}
              placeholder="you@company.com"
              className="auth-glass-input"
            />
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--auth-text)" }}
          >
            Role
          </label>
          <div className="auth-glass-input-wrap">
            <Shield size={18} className="auth-glass-icon" aria-hidden />
            <select
              name="role"
              value={registrationForm.role}
              onChange={handleRegistrationFieldChange}
              className="auth-glass-input"
              style={{
                paddingRight: "36px",
                appearance: "none",
                cursor: "pointer",
              }}
            >
              {ROLES.map((teamRole) => (
                <option key={teamRole} value={teamRole}>
                  {teamRole}
                </option>
              ))}
            </select>
            <span
              className="absolute right-2.5 pointer-events-none flex p-1"
              style={{ color: "var(--auth-text-muted)" }}
            >
              <ChevronDown size={18} aria-hidden />
            </span>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--auth-text)" }}
          >
            Password
          </label>
          <div className="auth-glass-input-wrap">
            <Lock size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.password}
              onChange={handleRegistrationFieldChange}
              placeholder="Min. 8 characters"
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
          {registrationPassword && (
            <>
              <div className="auth-strength">
                {[1, 2, 3, 4].map((strengthSegment) => (
                  <span
                    key={strengthSegment}
                    style={{
                      background: strengthSegment <= passwordStrengthScore ? passwordStrengthColor : "var(--bg-4)",
                    }}
                  />
                ))}
              </div>
              <span
                className="auth-strength-lbl"
                style={{ color: passwordStrengthColor }}
              >
                {passwordStrengthLabel}
              </span>
            </>
          )}
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--auth-text)" }}
          >
            Confirm password
          </label>
          <div className="auth-glass-input-wrap">
            <Lock size={18} className="auth-glass-icon" aria-hidden />
            <input
              name="confirmPassword"
              type={isConfirmPasswordVisible ? "text" : "password"}
              required
              value={registrationForm.confirmPassword}
              onChange={handleRegistrationFieldChange}
              placeholder="Re-enter password"
              className="auth-glass-input"
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              className="auth-glass-eye"
              onClick={() => setIsConfirmPasswordVisible((previousVisibility) => !previousVisibility)}
              aria-label="Toggle password"
            >
              {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {registrationForm.confirmPassword && !doPasswordsMatch && (
            <span className="auth-mismatch">Passwords do not match</span>
          )}
        </div>

        {registrationError && (
          <div className="auth-glass-error">
            <TriangleAlert size={16} className="shrink-0" aria-hidden />
            {registrationError}
          </div>
        )}

        <button type="submit" className="auth-glass-btn" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="inline-flex items-center justify-center gap-2">
              <span className="auth-glass-spinner" />
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="auth-glass-divider">
        Already have an account?{" "}
        <button
          type="button"
          className="bg-transparent border-none cursor-pointer text-sm font-semibold p-0 transition-opacity duration-150 hover:opacity-80"
          style={{ color: "var(--auth-primary-from)" }}
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
