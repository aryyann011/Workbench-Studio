"use client";

import * as React from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Database, Server, Shield, Smartphone, Mail, Lock, ArrowRight, AlertCircle, KeyRound } from "lucide-react";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [pendingVerification, setPendingVerification] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle credentials form submit (creating the account)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification email code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to create account. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle confirmation code submit (verifying email code)
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/dashboard");
      } else {
        console.log("Unhandled verification status:", completeSignUp.status);
        setError("Verification succeeded but additional authentication steps are required.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth sign up
  const handleGoogleSignUp = async () => {
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Failed to sign up with Google.");
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Spotlight (Monochromatic) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.12),transparent_75%)] pointer-events-none z-0" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30 z-0 bg-[linear-gradient(to_right,#242426_1px,transparent_1px),linear-gradient(to_bottom,#242426_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Floating System Design Cards in Background */}
      <div className="absolute left-[8%] top-[20%] opacity-40 hidden xl:flex flex-col p-4 border border-neutral-800 rounded-xl bg-neutral-950/40 pointer-events-none select-none z-0 border-l-neutral-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Primary Database</div>
            <div className="text-neutral-500 text-[10px]">Database</div>
          </div>
        </div>
      </div>

      <div className="absolute right-[8%] top-[50%] opacity-40 hidden xl:flex flex-col p-4 border border-neutral-800 rounded-xl bg-neutral-950/40 pointer-events-none select-none z-0 border-r-neutral-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">API Gateway</div>
            <div className="text-neutral-500 text-[10px]">API Endpoint</div>
          </div>
        </div>
      </div>

      <div className="absolute left-[12%] bottom-[20%] opacity-35 hidden xl:flex flex-col p-4 border border-neutral-800 rounded-xl bg-neutral-950/40 pointer-events-none select-none z-0 border-b-neutral-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Client App</div>
            <div className="text-neutral-500 text-[10px]">Client</div>
          </div>
        </div>
      </div>

      <div className="absolute right-[15%] top-[15%] opacity-35 hidden xl:flex flex-col p-4 border border-neutral-800 rounded-xl bg-neutral-950/40 pointer-events-none select-none z-0 border-t-neutral-700/30">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-900 rounded-lg text-neutral-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-white text-sm font-semibold">Auth Service</div>
            <div className="text-neutral-500 text-[10px]">Service</div>
          </div>
        </div>
      </div>

      {/* Header back button */}
      <div className="absolute top-8 left-8 z-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
          ← Back to landing
        </Link>
      </div>

      {/* Auth Component Container */}
      <div className="relative z-10 w-full max-w-md p-4">
        <div className="bg-neutral-950/80 border border-neutral-900 rounded-2xl p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
          
          {!pendingVerification ? (
            // Sign Up Form Page
            <>
              {/* Headings */}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-black text-lg mb-2">
                  W
                </div>
                <h1 className="text-white font-serif text-2xl font-bold tracking-tight">
                  Create your account
                </h1>
                <p className="text-neutral-400 text-sm">
                  Get started with Workbench Studio
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-3 bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-white rounded-lg py-2.5 px-4 font-medium transition-all active:scale-[0.98] cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-neutral-900"></div>
                <span className="flex-shrink mx-4 text-neutral-600 text-[10px] uppercase font-bold tracking-wider">
                  OR
                </span>
                <div className="flex-grow border-t border-neutral-900"></div>
              </div>

              {/* Credentials signup form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-neutral-900/60 border border-neutral-850 hover:border-neutral-800 focus:border-neutral-500 focus:ring-0 text-white rounded-lg py-2 pl-9 pr-4 text-sm transition-colors outline-none font-sans"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-neutral-900/60 border border-neutral-850 hover:border-neutral-800 focus:border-neutral-500 focus:ring-0 text-white rounded-lg py-2 pl-9 pr-4 text-sm transition-colors outline-none font-sans"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Register <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Login redirection footer */}
              <div className="text-center pt-2">
                <p className="text-neutral-500 text-xs">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-white hover:text-neutral-200 font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : (
            // Custom Verification Code Form Page
            <>
              {/* Headings */}
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg mb-2 border border-blue-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h1 className="text-white font-serif text-2xl font-bold tracking-tight">
                  Verify email address
                </h1>
                <p className="text-neutral-400 text-sm max-w-[280px] leading-relaxed">
                  We sent a 6-digit confirmation code to <span className="text-white font-semibold font-mono">{email}</span>.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex gap-2 items-start bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-red-400 text-xs leading-normal">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Verification Code Form */}
              <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-neutral-400 text-xs font-semibold uppercase tracking-wider text-center mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full text-center bg-neutral-900/60 border border-neutral-850 hover:border-neutral-800 focus:border-neutral-500 focus:ring-0 text-white rounded-lg py-3 text-lg font-mono tracking-[0.6em] pl-[0.6em] transition-colors outline-none"
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-neutral-200 transition-all font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-neutral-800 disabled:text-neutral-500"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Verify Code"
                  )}
                </button>
              </form>

              {/* Back to sign up */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setPendingVerification(false)}
                  className="text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  ← Go back & update email
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
