import React from "react";
import AuthForm from "./AuthForm";

const Signup = () => {
  return (
  <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950 text-slate-900 dark:text-slate-100 transition-all duration-500 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-indigo-300/20 dark:from-blue-600/20 dark:to-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-300/30 to-pink-300/20 dark:from-purple-600/20 dark:to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Header removed as requested */}

      {/* Main Content */}
  <main className="flex items-center justify-center flex-1 px-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Render AuthForm directly; it now has the same glass card styling as login */}
          <AuthForm mode="signup" />

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-600 dark:text-slate-400">
            © {new Date().getFullYear()} Leave Management System. All rights reserved.
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
