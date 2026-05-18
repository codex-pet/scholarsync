"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, limit, getDocs, deleteDoc } from "firebase/firestore";

/* ─── Reusable Input Field ───────────────────────────────────────── */
function InputField({ label, id, type = "text", value, onChange, error, icon: Icon, suffix }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className={`relative flex items-center overflow-hidden rounded-2xl border bg-slate-50/80 transition-all duration-200 focus-within:bg-white focus-within:shadow-md ${error ? "border-rose-400 focus-within:border-rose-400 focus-within:shadow-rose-100" : "border-slate-200 focus-within:border-indigo-400 focus-within:shadow-indigo-100"}`}>
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
  const [loading, setLoading] = useState(false);
  const isLoggingIn = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !isLoggingIn.current) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } catch (e) {
          console.error("Error checking role on auto-login:", e);
          router.push("/dashboard");
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

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

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      isLoggingIn.current = true;
      setLoading(true);
      let redirectPath = "/dashboard";
      try {
        const emailQuery = form.email.trim().toLowerCase();

        if (mode === "login") {
          try {
            const userCredential = await signInWithEmailAndPassword(auth, form.email, form.password);
            const userDocRef = doc(db, "users", userCredential.user.uid);
            const existingSnap = await getDoc(userDocRef);
            
            if (existingSnap.exists() && existingSnap.data().role === "admin") {
              redirectPath = "/admin";
            }
            
            if (!existingSnap.exists() || !existingSnap.data().status) {
              // Legacy user (pre-admin-panel) — grant full approved access
              await setDoc(userDocRef, {
                uid: userCredential.user.uid,
                email: userCredential.user.email || form.email,
                displayName: userCredential.user.displayName || form.email.split('@')[0],
                role: existingSnap.exists() ? (existingSnap.data().role || 'user') : 'user',
                status: 'approved',
                ...(!existingSnap.exists() ? { createdAt: serverTimestamp() } : {}),
                lastLogin: serverTimestamp(),
              }, { merge: true });
            } else {
              await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
            }
          } catch (loginErr) {
            const code = loginErr.code || "";
            const expectedLoginCodes = ["auth/user-not-found", "auth/invalid-credential", "auth/wrong-password"];
            if (!expectedLoginCodes.includes(code)) {
              console.error("Login Error:", loginErr);
            }
            
            if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
              // Double check in Firestore — the account may not exist at all
              const q = query(
                collection(db, "users"),
                where("email", "==", emailQuery),
                limit(1)
              );
              const snap = await getDocs(q);
              
              if (snap.empty) {
                setErrors({ email: "No account found with this email. Please register first." });
              } else {
                setErrors({ password: "Incorrect password. Please try again." });
              }
              isLoggingIn.current = false;
              setLoading(false);
              return;
            } else if (code === "auth/wrong-password") {
              setErrors({ password: "Incorrect password. Please try again." });
              isLoggingIn.current = false;
              setLoading(false);
              return;
            } else {
              throw loginErr;
            }
          }
        } else {
          // Register Mode
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            
            // Clean up any legacy Firestore documents for this email with a different UID
            const q = query(
              collection(db, "users"),
              where("email", "==", emailQuery)
            );
            const snap = await getDocs(q);
            
            // If any duplicate doc exists with a different UID, delete them to maintain database purity
            const batchPromises = [];
            snap.forEach((docSnap) => {
              if (docSnap.id !== userCredential.user.uid) {
                batchPromises.push(deleteDoc(docSnap.ref));
              }
            });
            if (batchPromises.length > 0) {
              await Promise.all(batchPromises);
            }

            await updateProfile(userCredential.user, {
              displayName: `${form.firstName.trim()} ${form.lastName.trim()}`
            });
            
            await setDoc(doc(db, "users", userCredential.user.uid), {
              uid: userCredential.user.uid,
              email: emailQuery, // Always store lowercase for consistent querying
              displayName: `${form.firstName.trim()} ${form.lastName.trim()}`,
              role: 'user',
              status: 'pending',
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp()
            });

            // Dispatch event so Profile component knows to re-render with the new displayName
            window.dispatchEvent(new Event('profileUpdated'));
          } catch (regErr) {
            const code = regErr.code || "";
            if (code !== "auth/email-already-in-use") {
              console.error("Registration Error:", regErr);
            }
            if (code === "auth/email-already-in-use") {
              // Check Firestore — if no document exists, this is an orphaned Firebase Auth account
              // (user deleted Firestore doc but didn't delete the Auth account)
              const checkQ = query(
                collection(db, "users"),
                where("email", "==", emailQuery),
                limit(1)
              );
              const checkSnap = await getDocs(checkQ);

              if (checkSnap.empty) {
                // Orphaned Auth account — Firestore doc was deleted but Auth account remains
                setErrors({
                  email: "This email is linked to an old deleted account. To re-register, go to Firebase Console → Authentication → Users and delete this email first, then try again."
                });
              } else {
                // Genuine existing account — both Auth and Firestore exist
                setErrors({ email: "An account with this email already exists. Please login instead." });
              }
              isLoggingIn.current = false;
              setLoading(false);
              return;
            } else {
              throw regErr;
            }
          }
        }
        setSubmitted(true);
        setLoading(false);
        setTimeout(() => router.push(redirectPath), 1200);
      } catch (err) {
        isLoggingIn.current = false;
        setLoading(false);
        
        const code = err.code || "";
        const expectedCodes = [
          "auth/wrong-password",
          "auth/invalid-credential",
          "auth/email-already-in-use",
          "auth/weak-password",
          "auth/invalid-email",
          "auth/user-not-found"
        ];
        if (!expectedCodes.includes(code)) {
          console.error("Authentication Error:", err);
        }
        
        let customMsg = "An unexpected error occurred. Please try again.";
        
        if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
          customMsg = "Incorrect password. Please try again.";
          setErrors({ password: customMsg });
          return;
        } else if (code === "auth/email-already-in-use") {
          customMsg = "This email is already in use. Please sign in instead.";
        } else if (code === "auth/weak-password") {
          customMsg = "Password should be at least 6 characters long.";
          setErrors({ password: customMsg });
          return;
        } else if (code === "auth/invalid-email") {
          customMsg = "Please enter a valid email address.";
        } else {
          customMsg = err.message.replace('Firebase: ', '').replace(/\(auth.*\)\./, '');
        }

        setErrors({ email: customMsg });
      }
    }
  }

  async function handleGoogleAuth() {
    isLoggingIn.current = true;
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let redirectPath = "/dashboard";
      if (userDoc.exists() && userDoc.data().role === "admin") {
        redirectPath = "/admin";
      }

      if (!userDoc.exists()) {
        // Brand new Google user — pending approval
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          avatar: userCredential.user.photoURL || null,
          role: 'user',
          status: 'pending',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } else if (!userDoc.data().status) {
        // Legacy Google user — no status yet, grant approved access
        await setDoc(userDocRef, {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          avatar: userCredential.user.photoURL || null,
          role: userDoc.data().role || 'user',
          status: 'approved',
          lastLogin: serverTimestamp()
        }, { merge: true });
      } else {
        await setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true });
      }

      setSubmitted(true);
      setLoading(false);
      window.dispatchEvent(new Event('profileUpdated'));
      setTimeout(() => router.push(redirectPath), 1200);
    } catch (err) {
      isLoggingIn.current = false;
      setLoading(false);
      
      const code = err.code || "";
      if (code !== "auth/popup-closed-by-user") {
        console.error("Google Auth Error:", err);
      }
      
      let cleanError = err.message;
      if (code === 'auth/popup-closed-by-user') {
        cleanError = "Sign-in cancelled.";
      } else if (code === 'auth/operation-not-allowed') {
        cleanError = "Google Sign-In is not enabled in Firebase Console.";
      } else {
        cleanError = err.message.replace('Firebase: ', '').replace(/\(auth.*\)\./, '').trim();
      }
      setErrors({ email: cleanError || "An error occurred with Google Sign-In." });
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
        <div className="bg-white/80 backdrop-blur-xl border border-white/90 rounded-3xl shadow-2xl shadow-slate-200/70 p-8 sm:p-10 relative overflow-hidden">

          {loading && (
            <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-[6px] rounded-3xl flex flex-col items-center justify-center transition-all duration-300">
              <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-pulse" />
                  <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                </div>
                <p className="font-bold text-slate-800 text-sm animate-pulse tracking-wide uppercase font-sans">
                  {mode === "login" ? "Signing In..." : "Creating Account..."}
                </p>
              </div>
            </div>
          )}

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
                onClick={handleGoogleAuth}
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