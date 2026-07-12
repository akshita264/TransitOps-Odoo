import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

// --- SUB-COMPONENTS ---
const GlassInputWrapper = ({ children }) => (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-md transition-all duration-200 focus-within:border-accent/80 focus-within:bg-zinc-900 focus-within:shadow-[0_0_20px_rgba(6,214,160,0.12)]">
    {children}
  </div>
);

// --- MAIN COMPONENT ---
export const SignInPage = ({
  title,
  description,
  isRegister = false,
  onToggleRegister,
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  emailValue,
  onEmailChange,
  passwordValue,
  onPasswordChange,
  nameValue,
  onNameChange,
  roleValue,
  onRoleChange,
  loading = false,
  error = "",
  demoLogins = [],
  onDemoClick,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const displayTitle = title || (
    isRegister ? (
      <span className="font-light tracking-tight text-white">
        Create <span className="font-bold text-accent">Account</span>
      </span>
    ) : (
      <span className="font-light tracking-tight text-white">
        Welcome <span className="font-bold text-accent">Back</span>
      </span>
    )
  );

  const displayDesc = description || (
    isRegister
      ? "Set up your credentials to access the TransitOps enterprise platform"
      : "Enter your credentials to sign in to your dashboard"
  );

  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-black text-gray-100 font-sans p-3 sm:p-4 relative overflow-hidden">
      {/* Subtle ambient black lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/[0.04] rounded-full blur-[140px]" />
      </div>

      {/* Single centered compact pitch-black card */}
      <div className="w-full max-w-md rounded-3xl bg-zinc-950 border border-zinc-800/80 p-5 sm:p-6 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative z-10 animate-element">
        {/* Sleek minimal branding without truck icon */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#06d6a0]" />
            <span className="text-base font-black tracking-tight text-white uppercase">TransitOps</span>
            <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-accent uppercase tracking-wider">
              PRO
            </span>
          </div>
          <span className="text-[0.62rem] font-mono text-zinc-500 uppercase tracking-widest">
            v2.4 Enterprise
          </span>
        </div>

        {/* Title / Description */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold leading-tight text-white">{displayTitle}</h1>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{displayDesc}</p>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2 shadow-lg">
            <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
            <div className="flex-1 truncate">{error}</div>
          </div>
        )}

        {/* Form */}
        <form className="space-y-2.5" onSubmit={onSignIn}>
          {isRegister && (
            <>
              <div>
                <label className="block text-[0.68rem] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <GlassInputWrapper>
                  <input
                    name="name"
                    type="text"
                    value={nameValue}
                    onChange={onNameChange}
                    placeholder="John Doe"
                    required
                    className="w-full bg-transparent text-xs p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="block text-[0.68rem] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Role
                </label>
                <GlassInputWrapper>
                  <select
                    name="role"
                    value={roleValue}
                    onChange={onRoleChange}
                    className="w-full bg-transparent text-xs p-3 rounded-xl text-white focus:outline-none cursor-pointer"
                  >
                    <option value="fleet_manager" className="bg-zinc-900 text-white">Fleet Manager</option>
                    <option value="dispatcher" className="bg-zinc-900 text-white">Dispatcher</option>
                    <option value="safety_officer" className="bg-zinc-900 text-white">Safety Officer</option>
                    <option value="financial_analyst" className="bg-zinc-900 text-white">Financial Analyst</option>
                  </select>
                </GlassInputWrapper>
              </div>
            </>
          )}

          <div>
            <label className="block text-[0.68rem] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <GlassInputWrapper>
              <input
                name="email"
                type="email"
                value={emailValue}
                onChange={onEmailChange}
                placeholder="you@company.com"
                required
                className="w-full bg-transparent text-xs p-3 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
              />
            </GlassInputWrapper>
          </div>

          <div>
            <label className="block text-[0.68rem] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <GlassInputWrapper>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordValue}
                  onChange={onPasswordChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-transparent text-xs p-3 pr-10 rounded-xl text-white placeholder-zinc-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-zinc-500 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </GlassInputWrapper>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                defaultChecked
                className="w-3.5 h-3.5 rounded border-zinc-700 bg-zinc-900 text-accent focus:ring-accent"
              />
              <span className="text-zinc-400 text-[0.72rem] font-medium">Keep me signed in</span>
            </label>
            {!isRegister && (
              <button
                type="button"
                onClick={onResetPassword}
                className="text-[0.72rem] font-semibold text-accent hover:underline transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent py-3 font-bold text-xs text-dark-950 hover:bg-accent-light hover:shadow-[0_0_20px_rgba(6,214,160,0.3)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading && <span className="spinner" />}
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Logins (Only show in Sign In mode) */}
        {!isRegister && demoLogins.length > 0 && (
          <div className="pt-3 mt-3 border-t border-zinc-900">
            <p className="text-[0.64rem] text-zinc-500 uppercase tracking-widest font-semibold mb-2 text-center">
              Quick Demo Role Shortcuts
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {demoLogins.map(({ label, email }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => onDemoClick?.(email)}
                  className="text-[0.72rem] px-2.5 py-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-300 hover:text-accent hover:border-accent/40 transition-all font-medium text-left flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{label}</span>
                  <ShieldCheck size={13} className="text-accent/70 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Toggle between Sign In and Sign Up on the one page */}
        <div className="mt-3.5 pt-3 border-t border-zinc-900 text-center">
          <button
            type="button"
            onClick={onToggleRegister}
            className="text-xs text-zinc-400 hover:text-accent transition-colors cursor-pointer font-medium"
          >
            {isRegister
              ? 'Already have an enterprise account? Sign In'
              : "Don't have an account yet? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
