import { useEffect } from "react";
import { useSaaSStore } from "../../store";
import Login from "../../auth/login";
import Register from "../../auth/register";

export function AuthLayout() {
  const selectedAuthView = useSaaSStore((s) => s.authView);
  const isRegisterView = selectedAuthView === "register";
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-8">
      <div className="w-full max-w-[440px] text-left">{isRegisterView ? <Register /> : <Login />}</div>
    </div>
  );
}

export function RegisterPage() {
  const setSelectedAuthView = useSaaSStore((s) => s.setAuthView);
  useEffect(() => {
    setSelectedAuthView("register");
  }, [setSelectedAuthView]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-8">
      <div className="w-full max-w-[440px] text-left">
        <Register />
      </div>
    </div>
  );
}

export function LoginPage() {
  const setSelectedAuthView = useSaaSStore((s) => s.setAuthView);
  useEffect(() => {
    setSelectedAuthView("login");
  }, [setSelectedAuthView]);
  return <AuthLayout />;
}
