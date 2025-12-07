import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, ArrowRight, AlertCircle, Settings, User as UserIcon, KeyRound, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { User } from '../types';
import emailjs from '@emailjs/browser';

interface LoginModalProps {
  isOpen: boolean;
  initialView?: 'LOGIN' | 'SIGNUP';
  onClose: () => void;
  onLogin: (user: User) => void;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'VERIFY_SIGNUP' | 'FORGOT_REQUEST' | 'FORGOT_RESET';

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

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, initialView = 'LOGIN', onClose, onLogin }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [authError, setAuthError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Google State
  const [googleError, setGoogleError] = useState('');
  const [clientId, setClientId] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempClientId, setTempClientId] = useState('');

  // Check for Client ID sources
  useEffect(() => {
    const envId = process.env.GOOGLE_CLIENT_ID;
    const storageId = localStorage.getItem('GLAZE_GOOGLE_CLIENT_ID');
    setClientId(envId || storageId || '');
  }, [isOpen]);

  // Reset form when opening/closing
  useEffect(() => {
    setAuthError('');
    setGoogleError('');
    setSuccessMessage('');
    setIsConfiguring(false);
    if (isOpen) {
        // Set view based on prop when opening
        setView(initialView);
    } else {
        // Reset inputs on close
        setEmail('');
        setPassword('');
        setName('');
        setOtp('');
        setGeneratedOtp('');
    }
  }, [isOpen, initialView]);

  // Clear errors/messages when view changes
  useEffect(() => {
    setAuthError('');
    setSuccessMessage('');
    setGoogleError('');
    // Clear specific fields based on transitions if needed
    if (view === 'LOGIN') setOtp('');
  }, [view]);

  // Initialize Google Sign In (Only for Login/Signup views)
  useEffect(() => {
    if (!isOpen || !clientId || (view !== 'LOGIN' && view !== 'SIGNUP')) return;
    
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
  }, [isOpen, clientId, view]);

  const handleGoogleCallback = (response: any) => {
    const payload = decodeJwt(response.credential);
    
    if (payload) {
      const newUser: User = {
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        isAdmin: false, 
        isVerified: true
      };
      onLogin(newUser);
      onClose();
    } else {
      setGoogleError('Failed to verify Google account.');
    }
  };

  const handleSaveClientId = () => {
      if (!tempClientId.trim()) return;
      localStorage.setItem('GLAZE_GOOGLE_CLIENT_ID', tempClientId);
      setClientId(tempClientId);
      setIsConfiguring(false);
  };

  if (!isOpen) return null;

  const sendVerificationEmail = async (userEmail: string, userName: string, code: string, subjectType: 'VERIFY' | 'RESET') => {
      const serviceId = localStorage.getItem('GLAZE_EMAIL_SERVICE_ID');
      const templateId = localStorage.getItem('GLAZE_EMAIL_TEMPLATE_ID');
      const publicKey = localStorage.getItem('GLAZE_EMAIL_PUBLIC_KEY');

      // If keys are configured, send real email
      if (serviceId && templateId && publicKey) {
          try {
              await emailjs.send(serviceId, templateId, {
                  to_name: userName || 'Beauty Lover',
                  to_email: userEmail,
                  otp: code,
              }, publicKey);
              return true;
          } catch (error) {
              console.error('EmailJS Error:', error);
              setAuthError('Failed to send email. Please check your internet or Admin configuration.');
              return false;
          }
      } else {
          // Fallback to simulation if no keys
          console.warn('EmailJS keys missing. Simulating email.');
          const subject = subjectType === 'VERIFY' ? 'Verify your account' : 'Reset your password';
          setTimeout(() => {
            alert(`[DEMO EMAIL SERVER]\n\nTo: ${userEmail}\nFrom: Glaze Cosmetics\nSubject: ${subject}\n\nYour verification code is: ${code}`);
          }, 500);
          return true;
      }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
        const users = JSON.parse(localStorage.getItem('GLAZE_USERS') || '{}');

        // --- LOGIN ---
        if (view === 'LOGIN') {
            setTimeout(() => {
                const user = users[email];
                if (user && user.password === password) {
                    const { password: _, ...userProfile } = user;
                    onLogin(userProfile);
                    onClose();
                } else {
                    setAuthError('Invalid email or password.');
                }
                setIsLoading(false);
            }, 800);
        }
        
        // --- SIGNUP INIT ---
        else if (view === 'SIGNUP') {
            if (users[email]) {
                setAuthError('An account with this email already exists.');
                setIsLoading(false);
                return;
            }
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(code);
            
            const sent = await sendVerificationEmail(email, name, code, 'VERIFY');
            if (sent) setView('VERIFY_SIGNUP');
            setIsLoading(false);
        }

        // --- VERIFY SIGNUP ---
        else if (view === 'VERIFY_SIGNUP') {
             setTimeout(() => {
                if (otp === generatedOtp) {
                    const newUser = {
                        name,
                        email,
                        password,
                        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=fce7f3&color=db2777&bold=true`,
                        isAdmin: false,
                        isVerified: true
                    };
                    users[email] = newUser;
                    localStorage.setItem('GLAZE_USERS', JSON.stringify(users));
                    
                    const { password: _, ...userProfile } = newUser;
                    onLogin(userProfile);
                    onClose();
                } else {
                    setAuthError('Invalid verification code.');
                }
                setIsLoading(false);
             }, 800);
        }

        // --- FORGOT PASSWORD REQUEST ---
        else if (view === 'FORGOT_REQUEST') {
            setTimeout(async () => {
                if (!users[email]) {
                    setAuthError('No account found with this email.');
                    setIsLoading(false);
                    return;
                }
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                setGeneratedOtp(code);
                
                // Get user name for email
                const userName = users[email].name;
                const sent = await sendVerificationEmail(email, userName, code, 'RESET');
                
                if (sent) setView('FORGOT_RESET');
                setIsLoading(false);
            }, 500);
        }

        // --- FORGOT PASSWORD RESET ---
        else if (view === 'FORGOT_RESET') {
             setTimeout(() => {
                if (otp === generatedOtp) {
                    if (users[email]) {
                        users[email].password = password; // Update password
                        localStorage.setItem('GLAZE_USERS', JSON.stringify(users));
                        setSuccessMessage('Password reset successfully! Please log in.');
                        
                        // Clear sensitive fields and go to login
                        setPassword('');
                        setOtp('');
                        setGeneratedOtp('');
                        setTimeout(() => setView('LOGIN'), 1500);
                    } else {
                         setAuthError('User not found.');
                    }
                } else {
                    setAuthError('Invalid verification code.');
                }
                setIsLoading(false);
             }, 800);
        }

    } catch (err) {
        setAuthError('Something went wrong. Please try again.');
        setIsLoading(false);
    }
  };

  // Quick Demo Admin Login
  const handleDemoLogin = () => {
      setIsLoading(true);
      setTimeout(() => {
        const mockUser: User = {
            name: 'Demo Admin',
            email: 'admin@glaze.com',
            avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
            isAdmin: true,
            isVerified: true
        };
        onLogin(mockUser);
        onClose();
      }, 800);
  };

  const handleResendCode = async () => {
     const code = Math.floor(100000 + Math.random() * 900000).toString();
     setGeneratedOtp(code);
     const users = JSON.parse(localStorage.getItem('GLAZE_USERS') || '{}');
     const userName = users[email]?.name || name;
     const type = view === 'FORGOT_RESET' ? 'RESET' : 'VERIFY';
     await sendVerificationEmail(email, userName, code, type);
  };

  // Dynamic Content based on View
  const getHeaderContent = () => {
      switch(view) {
          case 'LOGIN': return { subtitle: 'Welcome Back', title: 'Sign In', desc: 'Access your wishlist and order history.' };
          case 'SIGNUP': return { subtitle: 'Join the Club', title: 'Create Account', desc: 'Sign up to unlock exclusive shades.' };
          case 'VERIFY_SIGNUP': return { subtitle: 'Verify Email', title: 'Check Your Inbox', desc: `We've sent a code to ${email}.` };
          case 'FORGOT_REQUEST': return { subtitle: 'Recovery', title: 'Forgot Password?', desc: 'Enter your email to receive a reset code.' };
          case 'FORGOT_RESET': return { subtitle: 'Recovery', title: 'Reset Password', desc: 'Enter code and your new password.' };
          default: return { subtitle: '', title: '', desc: '' };
      }
  };

  const header = getHeaderContent();

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
                {header.subtitle}
              </span>
              <h3 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                {header.title}
              </h3>
              <p className="text-gray-500 text-sm">
                {header.desc}
              </p>
            </div>

            {/* Google Login Container - Only on Login/Signup */}
            {(view === 'LOGIN' || view === 'SIGNUP') && (
                <>
                    <div className="min-h-[50px] mb-4">
                    {clientId ? (
                        <div id="googleButtonDiv" className="w-full flex justify-center"></div>
                    ) : (
                        isConfiguring ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 animate-fadeIn">
                                <label className="block text-xs font-medium text-gray-700 mb-2 text-left">Enter Google Client ID</label>
                                <div className="flex gap-2 mb-2">
                                    <input 
                                        type="text" 
                                        value={tempClientId}
                                        onChange={(e) => setTempClientId(e.target.value)}
                                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-2 outline-none focus:border-pink-500"
                                        placeholder="123...apps.googleusercontent.com"
                                    />
                                    <button 
                                        onClick={handleSaveClientId}
                                        className="bg-black text-white text-xs px-3 py-1 rounded hover:bg-gray-800 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                                <div className="text-right mt-1">
                                    <button onClick={() => setIsConfiguring(false)} className="text-[10px] text-gray-400 hover:text-gray-600">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col items-center text-center text-xs text-amber-900">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertCircle className="w-4 h-4 text-amber-600" />
                                    <span className="font-semibold">Google Sign-In Disabled</span>
                                </div>
                                <p className="mb-2 opacity-80">Client ID is missing.</p>
                                <button 
                                    onClick={() => setIsConfiguring(true)}
                                    className="text-amber-700 underline hover:text-amber-900 font-medium"
                                >
                                    Configure Now
                                </button>
                            </div>
                        )
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
              
              {/* Full Name - Signup Only */}
              {view === 'SIGNUP' && (
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
                        required
                    />
                    </div>
                </div>
              )}

              {/* Email - Login, Signup, ForgotRequest */}
              {(view === 'LOGIN' || view === 'SIGNUP' || view === 'FORGOT_REQUEST') && (
                  <div className="animate-fadeIn">
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
              )}
              
              {/* Password - Login, Signup, ForgotReset (as new password) */}
              {(view === 'LOGIN' || view === 'SIGNUP' || view === 'FORGOT_RESET') && (
                 <div className="animate-fadeIn">
                    <label className="sr-only">
                        {view === 'FORGOT_RESET' ? 'New Password' : 'Password'}
                    </label>
                    <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={view === 'FORGOT_RESET' ? 'New Password' : 'Password'}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none transition-all"
                        required
                        minLength={6}
                    />
                    </div>
                    
                    {/* Forgot Password Link */}
                    {view === 'LOGIN' && (
                        <div className="text-right mt-1">
                            <button 
                                type="button"
                                onClick={() => setView('FORGOT_REQUEST')}
                                className="text-xs text-gray-500 hover:text-pink-600 transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}
                </div>
              )}

              {/* OTP - Verify Signup, Forgot Reset */}
              {(view === 'VERIFY_SIGNUP' || view === 'FORGOT_RESET') && (
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
                         {view === 'VERIFY_SIGNUP' && (
                             <button type="button" onClick={() => setView('SIGNUP')} className="text-gray-500 hover:text-gray-800">Change Email</button>
                         )}
                         <button type="button" onClick={handleResendCode} className="text-pink-600 font-medium hover:underline ml-auto">Resend Code</button>
                     </div>
                  </div>
              )}

              {authError && (
                 <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm animate-fadeIn">
                    <AlertCircle className="w-4 h-4" />
                    {authError}
                 </div>
              )}

              {successMessage && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg text-sm animate-fadeIn">
                    <CheckCircle className="w-4 h-4" />
                    {successMessage}
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
                        {view === 'LOGIN' && 'Log In'}
                        {view === 'SIGNUP' && 'Create Account'}
                        {view === 'VERIFY_SIGNUP' && 'Verify & Create'}
                        {view === 'FORGOT_REQUEST' && 'Send Reset Code'}
                        {view === 'FORGOT_RESET' && 'Reset Password'}
                    </span>
                    {(view === 'VERIFY_SIGNUP' || view === 'FORGOT_RESET') ? <CheckCircle className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </button>
              
              {/* Back Button for Forgot Password Flow */}
              {view === 'FORGOT_REQUEST' && (
                  <button
                    type="button"
                    onClick={() => setView('LOGIN')}
                    className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 py-2 text-sm"
                  >
                      <ArrowLeft className="w-3 h-3" /> Back to Login
                  </button>
              )}

            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {(view === 'LOGIN' || view === 'SIGNUP') && (
                  <p>
                    {view === 'SIGNUP' ? "Already have an account?" : "Don't have an account?"}
                    <button 
                    onClick={() => setView(view === 'SIGNUP' ? 'LOGIN' : 'SIGNUP')}
                    className="ml-2 font-semibold text-pink-600 hover:text-pink-700 underline"
                    >
                    {view === 'SIGNUP' ? 'Log In' : 'Sign Up'}
                    </button>
                  </p>
              )}
            </div>

            {view === 'LOGIN' && (
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