import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

// Helper to decode the Google JWT
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleError, setGoogleError] = useState('');

  // Initialize Google Sign In
  useEffect(() => {
    if (!isOpen) return;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    // Check if google script is loaded and client ID is present
    if (typeof (window as any).google !== 'undefined' && clientId) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback
        });
        
        (window as any).google.accounts.id.renderButton(
          document.getElementById("googleButtonDiv"),
          { theme: "outline", size: "large", width: "100%" } 
        );
      } catch (err) {
        console.error("Google Sign-In Error", err);
      }
    }
  }, [isOpen]);

  const handleGoogleCallback = (response: any) => {
    const payload = decodeJwt(response.credential);
    
    if (payload) {
      const newUser: User = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isAdmin: false // Default to false for real users
      };
      onLogin(newUser);
      onClose();
    } else {
      setGoogleError('Failed to verify Google account.');
    }
  };

  if (!isOpen) return null;

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    // Simulate network delay for email login
    setTimeout(() => {
      setIsLoading(false);
      // For email login, we still mock for now as we don't have a backend database
      const mockUser: User = {
        name: 'Demo User',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        isAdmin: false
      };
      onLogin(mockUser);
      onClose();
    }, 1500);
  };

  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;

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

            {/* Google Login Container */}
            <div className="min-h-[50px] mb-4">
              {hasClientId ? (
                <div id="googleButtonDiv" className="w-full flex justify-center"></div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start text-left text-xs text-yellow-800">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <p>
                    Google Sign-In is disabled. Please set <b>GOOGLE_CLIENT_ID</b> in Netlify environment variables.
                  </p>
                </div>
              )}
            </div>

            {googleError && (
              <p className="text-red-500 text-sm text-center mb-4">{googleError}</p>
            )}

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