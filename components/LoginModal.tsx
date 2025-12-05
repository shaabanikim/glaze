import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
      onClose();
    }, 1500);
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-md border border-white/20">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <span className="text-pink-500 font-semibold tracking-widest uppercase text-xs mb-2 block">
                Join the Club
              </span>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Welcome to Glaze
              </h3>
              <p className="text-gray-500 text-sm">
                Sign in to save your favorite shades, track orders, and get exclusive access to new drops.
              </p>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-full px-6 py-3 text-gray-700 font-medium hover:bg-gray-50 hover:shadow-md transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading && !email ? (
                <div className="h-5 w-5 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex py-6 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or with email</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="sr-only">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="sr-only">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full px-6 py-3 font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading && email ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                By continuing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Trusted by 1M+ beauty lovers worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;