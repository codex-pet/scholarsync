"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle,
} from "lucide-react";

/* ─── Reusable Input Field ───────────────────────────────────────── */
function InputField({ label, id, type = "text", value, onChange, error, icon: Icon, suffix }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className={`relative flex items-center rounded-2xl border bg-slate-50/80 transition-all duration-200 focus-within:bg-white focus-within:shadow-md ${error ? "border-rose-400 focus-within:border-rose-400 focus-within:shadow-rose-100" : "border-slate-200 focus-within:border-indigo-400 focus-within:shadow-indigo-100"}`}>
        {Icon && (
          <span className="pl-4 text-slate-400 shrink-0">
            <Icon size={17} />
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent py-3.5 px-3 text-slate-800 text-sm outline-none placeholder:text-slate-400"
          placeholder=" "
        />
        {suffix && <span className="pr-3 shrink-0">{suffix}</span>}
      </div>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1 font-medium">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─── Main Auth Page ─────────────────────────────────────────────── */
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "", rememberMe: false, agreeTerms: false,
  });
  const [errors, setErrors] = useState({});

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  /* ── Validation ── */
  function validate() {
    const e = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "signup") {
      if (!form.firstName.trim()) e.firstName = "First name is required.";
      if (!form.lastName.trim()) e.lastName = "Last name is required.";
      if (!form.agreeTerms) e.agreeTerms = "You must accept the Terms of Service.";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    }
    if (!emailRx.test(form.email)) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters.";

    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
      // Simulate a brief delay then navigate to dashboard
      setTimeout(() => router.push("/dashboard"), 1200);
    }
  }

  /* ── Toggle between modes ── */
  function switchMode(m) {
    setMode(m);
    setErrors({});
    setSubmitted(false);
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#FAF9F6]">

      {/* Animated background blobs */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/40 to-purple-300/25 rounded-full blur-[130px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] bg-gradient-to-br from-pink-300/35 to-rose-200/25 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-gradient-to-br from-cyan-200/25 to-blue-300/15 rounded-full blur-[90px] animate-pulse-slow" style={{ animationDelay: "4s" }} />
      </div>

      <div className="w-full max-w-lg">

        {/* Logo link back to landing */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group w-fit mx-auto">
          <div className="flex items-center justify-center group-hover:scale-110 transition-transform">
            <img
              src="/scholarsync-logo.png"
              alt="ScholarSync Logo"
              className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
            />
          </div>
          <span className="font-bold text-slate-800 text-xl tracking-tight">ScholarSync</span>
        </Link>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl shadow-2xl shadow-slate-200/70 p-8 sm:p-10">

          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-200 ${mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-900">
              {isLogin ? "Welcome back 👋" : "Join ScholarSync ✨"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin
                ? "Sign in to continue your learning journey."
                : "Create your free account and start studying smarter."}
            </p>
          </div>

          {/* Success state */}
          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={36} className="text-emerald-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">
                  {isLogin ? "Signed in!" : "Account created!"}
                </p>
                <p className="text-slate-500 text-sm mt-1">Redirecting you to your dashboard…</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Signup-only: name row */}
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <InputField
                    label="First Name" id="firstName" value={form.firstName}
                    onChange={set("firstName")} error={errors.firstName}
                    icon={User}
                  />
                  <InputField
                    label="Last Name" id="lastName" value={form.lastName}
                    onChange={set("lastName")} error={errors.lastName}
                    icon={User}
                  />
                </div>
              )}

              {/* Email */}
              <InputField
                label="Email Address" id="email" type="email" value={form.email}
                onChange={set("email")} error={errors.email}
                icon={Mail}
              />

              {/* Password */}
              <InputField
                label="Password" id="password" type={showPass ? "text" : "password"}
                value={form.password} onChange={set("password")} error={errors.password}
                icon={Lock}
                suffix={
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />

              {/* Confirm password — signup only */}
              {!isLogin && (
                <InputField
                  label="Confirm Password" id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword} onChange={set("confirmPassword")}
                  error={errors.confirmPassword} icon={Lock}
                  suffix={
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="text-slate-400 hover:text-indigo-500 transition-colors p-1">
                      {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  }
                />
              )}

              {/* Login extras: remember me + forgot password */}
              {isLogin && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div
                      onClick={() => setForm((f) => ({ ...f, rememberMe: !f.rememberMe }))}
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all ${form.rememberMe ? "bg-indigo-500 border-indigo-500" : "border-slate-300 group-hover:border-indigo-400"}`}
                    >
                      {form.rememberMe && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-600 font-medium">Remember me</span>
                  </label>
                  <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Signup: Terms of Service */}
              {!isLogin && (
                <div className="space-y-1 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <div
                      onClick={() => setForm((f) => ({ ...f, agreeTerms: !f.agreeTerms }))}
                      className={`mt-0.5 w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 transition-all ${form.agreeTerms ? "bg-indigo-500 border-indigo-500" : "border-slate-300 group-hover:border-indigo-400"}`}
                    >
                      {form.agreeTerms && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm text-slate-600 font-medium leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-indigo-600 hover:underline font-semibold">Terms of Service</a>{" "}
                      and{" "}
                      <a href="#" className="text-indigo-600 hover:underline font-semibold">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-xs text-rose-500 flex items-center gap-1 font-medium pl-7">
                      <AlertCircle size={12} /> {errors.agreeTerms}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.02] active:scale-100 transition-all duration-200"
              >
                {isLogin ? "Sign In to Dashboard" : "Create My Account"}
                <ArrowRight size={16} />
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">or continue with</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Google OAuth placeholder */}
              <button
                type="button"
                className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>

            </form>
          )}

          {/* Footer toggle */}
          {!submitted && (
            <p className="text-center text-sm text-slate-500 mt-7">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => switchMode(isLogin ? "signup" : "login")}
                className="text-indigo-600 font-bold hover:underline transition-colors"
              >
                {isLogin ? "Sign up free" : "Sign in"}
              </button>
            </p>
          )}
        </div>

        {/* Back to landing */}
        <p className="text-center mt-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-indigo-600 transition-colors font-medium">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}