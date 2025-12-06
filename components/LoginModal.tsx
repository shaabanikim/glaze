import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, AlertCircle, Settings, User as UserIcon, KeyRound, CheckCircle } from 'lucide-react';
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Google State
  const [googleError, setGoogleError] = useState('');
  const [clientId, setClientId] = useState('');

  // Check for Client ID sources
  useEffect(() => {
    const envId = process.env.GOOGLE_CLIENT_ID;
    const storageId = localStorage.getItem('GLAZE_GOOGLE_CLIENT_ID');
    setClientId(envId || storageId || '');
  }, [isOpen]);

  // Reset form when switching modes
  useEffect(() => {
    setAuthError('');
    setGoogleError('');
    if (!isOpen) {
        // Reset inputs on close
        setEmail('');
        setPassword('');
        setName('');
        setOtp('');
        setGeneratedOtp('');
        setIsSignUp(false);
        setVerificationStep(false);
    }
  }, [isSignUp, isOpen]);

  // Initialize Google Sign In
  useEffect(() => {
    if (!isOpen || !clientId || verificationStep) return;
    
    // Check if google script is loaded
    if (typeof (window as any).google !== 'undefined') {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback
        });
        
        const btnDiv = document.getElementById("googleButtonDiv");
        if (btnDiv) {
          (window as any).google.accounts.id.renderButton(
            btnDiv,
            { theme: "outline", size: "large", width: "100%" } 
          );
        }
      } catch (err) {
        console.error("Google Sign-In Error", err);
      }
    }
  }, [isOpen, clientId, verificationStep]);

  const handleGoogleCallback = (response: any) => {
    const payload = decodeJwt(response.credential);
    
    if (payload) {
      const newUser: User = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isAdmin: false // Real users start as non-admin
      };
      onLogin(newUser);
      onClose();
    } else {
      setGoogleError('Failed to verify Google account.');
    }
  };

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // --- VERIFICATION STEP ---
    if (verificationStep) {
        if (!otp) {
            setAuthError('Please enter the verification code.');
            return;
        }

        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            if (otp === generatedOtp) {
                try {
                    const users = JSON.parse(localStorage.getItem('GLAZE_USERS') || '{}');
                    const newUser = {
                        name,
                        email,
                        password,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fce7f3&color=db2777&bold=true`,
                        isAdmin: false
                    };
                    
                    // Save to "DB"
                    users[email] = newUser;
                    localStorage.setItem('GLAZE_USERS', JSON.stringify(users));
                    
                    // Auto login
                    const { password: _, ...userProfile } = newUser;
                    onLogin(userProfile);
                    onClose();
                } catch(e) {
                    setAuthError('Failed to create account. Please try again.');
                }
            } else {
                setAuthError('Invalid verification code. Please check your "email".');
            }
            setIsLoading(false);
        }, 800);
        return;
    }

    // --- LOGIN / SIGNUP INIT ---
    if (!email || !password) return;
    if (isSignUp && !name) return;

    setIsLoading(true);

    setTimeout(() => {
      try {
          const users = JSON.parse(localStorage.getItem('GLAZE_USERS') || '{}');
          
          if (isSignUp) {
             if (users[email]) {
                 setAuthError('An account with this email already exists.');
                 setIsLoading(false);
                 return;
             }

             // Generate OTP for Verification
             const code = Math.floor(100000 + Math.random() * 900000).toString();
             setGeneratedOtp(code);
             setVerificationStep(true);
             
             // SIMULATE EMAIL SENDING
             setTimeout(() => {
                 alert(`[DEMO EMAIL SERVER]\n\nTo: ${email}\nFrom: Glaze Cosmetics\nSubject: Verify your account\n\nYour verification code is: ${code}`);
             }, 500);

          } else {
             // LOGIN LOGIC
             const user = users[email];
             
             if (user && user.password === password) {
                 const { password: _, ...userProfile } = user;
                 onLogin(userProfile);
                 onClose();
             } else {
                 setAuthError('Invalid email or password.');
             }
          }
      } catch (err) {
          setAuthError('Something went wrong. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  // Quick Demo Admin Login
  const handleDemoLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
        const mockUser: User = {
            name: 'Demo Admin',
            email: 'admin@glaze.com',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            isAdmin: true
        };
        onLogin(mockUser);
        onClose();
      }, 800);
  };

  const handleResendCode = () => {
     const code = Math.floor(100000 + Math.random() * 900000).toString();
     setGeneratedOtp(code);
     alert(`[DEMO EMAIL SERVER]\n\n(Resent) Your verification code is: ${code}`);
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
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            <div className="text-center mb-8">
              <span className="text-pink-500 font-semibold tracking-widest uppercase text-xs mb-2 block">
                {verificationStep ? 'Verify Email' : (isSignUp ? 'Join the Club' : 'Welcome Back')}
              </span>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {verificationStep ? 'Check Your Inbox' : (isSignUp ? 'Create Account' : 'Sign In')}
              </h3>
              <p className="text-gray-500 text-sm">
                {verificationStep 
                   ? `We've sent a code to ${email}. Please enter it below.`
                   : (isSignUp 
                     ? 'Sign up to unlock exclusive shades and track your orders.' 
                     : 'Access your wishlist and order history.')}
              </p>
            </div>

            {/* Google Login Container - Only show if not in verification */}
            {!verificationStep && (
                <>
                    <div className="min-h-[50px] mb-4">
                    {clientId ? (
                        <div id="googleButtonDiv" className="w-full flex justify-center"></div>
                    ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center text-xs text-gray-600">
                        <Settings className="w-4 h-4 text-gray-400 mb-1" />
                        <p>Google Sign-In is not configured.</p>
                        </div>
                    )}
                    </div>

                    {googleError && (
                    <p className="text-red-500 text-xs text-center mb-4 bg-red-50 p-2 rounded">{googleError}</p>
                    )}

                    {/* Divider */}
                    <div className="relative flex py-6 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or with email</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                </>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {!verificationStep ? (
                  /* STANDARD FORM */
                  <>
                    {isSignUp && (
                        <div className="animate-fadeIn">
                            <label className="sr-only">Full Name</label>
                            <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none transition-all"
                                required={isSignUp}
                            />
                            </div>
                        </div>
                    )}

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
                            minLength={6}
                        />
                        </div>
                    </div>
                  </>
              ) : (
                  /* VERIFICATION FORM */
                  <div className="animate-fadeIn">
                     <label className="sr-only">Verification Code</label>
                     <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit code"
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none transition-all tracking-widest"
                            required
                            maxLength={6}
                        />
                     </div>
                     <div className="flex justify-between items-center mt-2 text-xs">
                         <button type="button" onClick={() => setVerificationStep(false)} className="text-gray-500 hover:text-gray-800">Change Email</button>
                         <button type="button" onClick={handleResendCode} className="text-pink-600 font-medium hover:underline">Resend Code</button>
                     </div>
                  </div>
              )}

              {authError && (
                 <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                 </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full px-6 py-3 font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>
                        {verificationStep ? 'Verify & Create Account' : (isSignUp ? 'Create Account' : 'Log In')}
                    </span>
                    {verificationStep ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {!verificationStep && (
                  <p>
                    {isSignUp ? "Already have an account?" : "Don't have an account?"}
                    <button 
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 font-semibold text-pink-600 hover:text-pink-700 underline"
                    >
                    {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                  </p>
              )}
            </div>

            {!isSignUp && !verificationStep && (
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <button 
                        onClick={handleDemoLogin}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Demo: Log in as Admin
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;