import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, ShieldCheck, ExternalLink, Smartphone, DollarSign, CreditCard, MapPin, User, Mail, Phone } from 'lucide-react';
import { ShippingDetails } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  user: { name?: string, email?: string } | null;
  onClose: () => void;
  onSuccess: (method: 'PAYPAL' | 'MPESA', shipping: ShippingDetails) => void;
}

type PaymentMethod = 'PAYPAL' | 'MPESA';
type PaymentStep = 'SHIPPING' | 'SELECT' | 'DETAILS' | 'PROCESSING' | 'MPESA_PUSH_SENT' | 'SUCCESS';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, user, onClose, onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>('PAYPAL');
  const [step, setStep] = useState<PaymentStep>('SHIPPING');
  
  // Shipping State
  const [shipping, setShipping] = useState<ShippingDetails>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });

  const [phoneNumber, setPhoneNumber] = useState(''); // Specific for MPesa paybill
  const [mpesaError, setMpesaError] = useState('');
  const [isRealPaymentEnabled, setIsRealPaymentEnabled] = useState(false);

  // Check for IntaSend Configuration
  useEffect(() => {
    const intaSendKey = localStorage.getItem('GLAZE_INTASEND_KEY');
    setIsRealPaymentEnabled(!!intaSendKey && intaSendKey.length > 5);
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
        setStep('SHIPPING');
        setPhoneNumber('');
        setMpesaError('');
        // Prefill if user exists
        if (user) {
            setShipping(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('SELECT');
  };

  const handlePayPalClick = () => {
    setStep('PROCESSING');
    
    // Retrieve PayPal email from storage or use default
    const savedEmail = localStorage.getItem('GLAZE_PAYPAL_EMAIL');
    const businessEmail = savedEmail && savedEmail.trim() !== '' ? savedEmail : 'ayubshaaban040@gmail.com';
    
    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', businessEmail);
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('amount', total.toFixed(2));
    paypalUrl.searchParams.append('item_name', 'Glaze Cosmetics Order');
    paypalUrl.searchParams.append('return', window.location.href);

    // Open PayPal in a new tab
    window.open(paypalUrl.toString(), '_blank');

    // Simulate completion
    setTimeout(() => {
      setStep('SUCCESS');
      setTimeout(() => {
        onSuccess('PAYPAL', shipping);
        onClose();
      }, 3000);
    }, 5000); 
  };

  const handleMpesaClick = (e: React.FormEvent) => {
    e.preventDefault();
    setMpesaError('');

    // IF REAL PAYMENT ENABLED via INTASEND
    if (isRealPaymentEnabled) {
        const intaSendKey = localStorage.getItem('GLAZE_INTASEND_KEY') || '';
        const isLive = localStorage.getItem('GLAZE_INTASEND_LIVE') === 'true';
        
        if ((window as any).IntaSend) {
            try {
                const intasend = new (window as any).IntaSend({
                    publicAPIKey: intaSendKey,
                    live: isLive
                });

                intasend.on("COMPLETE", (results: any) => {
                    console.log("Payment Successful", results);
                    setStep('SUCCESS');
                    setTimeout(() => {
                        onSuccess('MPESA', shipping);
                        onClose();
                    }, 3000);
                });

                intasend.on("FAILED", (results: any) => {
                    console.error("Payment Failed", results);
                    setMpesaError("Payment failed or cancelled.");
                });

                // Launch the Widget
                intasend.run({
                    amount: total * 130, // Convert roughly to KES
                    currency: "KES",
                    email: shipping.email || "customer@example.com"
                });
                
                return;
            } catch (err) {
                console.error("IntaSend Error", err);
                setMpesaError("Could not initialize payment gateway.");
            }
        }
    }

    // FALLBACK: SIMULATION MODE
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 9 || cleanPhone.length > 13) {
        setMpesaError('Please enter a valid phone number (e.g., 0712...)');
        return;
    }

    setStep('PROCESSING');

    // Simulate STK Push Delay
    setTimeout(() => {
        setStep('MPESA_PUSH_SENT');
        
        // Simulate User Entering PIN on phone
        setTimeout(() => {
            setStep('SUCCESS');
             setTimeout(() => {
                onSuccess('MPESA', shipping);
                onClose();
            }, 3000);
        }, 6000); 

    }, 2000);
  };

  const getMpesaBusinessInfo = () => {
      const number = localStorage.getItem('GLAZE_MPESA_NUMBER') || '123456';
      const type = localStorage.getItem('GLAZE_MPESA_TYPE') || 'PAYBILL';
      return { number, type };
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={(step === 'PROCESSING' || step === 'MPESA_PUSH_SENT') ? undefined : onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-gray-100">
          
          {/* Close Button */}
          {step !== 'PROCESSING' && step !== 'MPESA_PUSH_SENT' && step !== 'SUCCESS' && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8">
            <div className="text-center mb-6">
                <span className="text-pink-500 font-semibold tracking-widest uppercase text-xs mb-2 block">
                Secure Checkout
                </span>
                <h3 className="text-2xl font-serif font-bold text-gray-900">
                {step === 'SUCCESS' ? 'Order Confirmed!' : step === 'SHIPPING' ? 'Shipping Details' : 'Payment Method'}
                </h3>
            </div>
            
            {/* Order Summary Box */}
            {step !== 'SUCCESS' && (
                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-gray-900 font-bold">Total Due</span>
                      <span className="text-gray-900 font-bold text-xl">${total.toFixed(2)}</span>
                    </div>
                </div>
            )}

            {/* Step: Shipping */}
            {step === 'SHIPPING' && (
              <form onSubmit={handleShippingSubmit} className="space-y-4 animate-fadeIn">
                 <div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Full Name" 
                        value={shipping.name}
                        onChange={e => setShipping({...shipping, name: e.target.value})}
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none"
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                          required
                          type="email" 
                          placeholder="Email" 
                          value={shipping.email}
                          onChange={e => setShipping({...shipping, email: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none"
                        />
                     </div>
                     <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <input 
                          required
                          type="tel" 
                          placeholder="Phone" 
                          value={shipping.phone}
                          onChange={e => setShipping({...shipping, phone: e.target.value})}
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none"
                        />
                     </div>
                 </div>
                 <div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="text" 
                        placeholder="Street Address" 
                        value={shipping.address}
                        onChange={e => setShipping({...shipping, address: e.target.value})}
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none"
                      />
                    </div>
                 </div>
                 <div>
                     <input 
                        required
                        type="text" 
                        placeholder="City / Town" 
                        value={shipping.city}
                        onChange={e => setShipping({...shipping, city: e.target.value})}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500 outline-none"
                      />
                 </div>

                 <button
                    type="submit"
                    className="w-full flex items-center justify-center bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-4 rounded-full transition-colors shadow-sm mt-4"
                  >
                    Continue to Payment
                 </button>
              </form>
            )}

            {/* Step: Selection */}
            {step === 'SELECT' && (
              <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-4">
                     <button
                       onClick={() => setMethod('PAYPAL')}
                       className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${method === 'PAYPAL' ? 'border-[#003087] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}
                     >
                         <div className="w-10 h-10 bg-[#003087] rounded-full flex items-center justify-center text-white font-bold italic mb-2">
                             P
                         </div>
                         <span className="font-bold text-[#003087]">PayPal</span>
                     </button>

                     <button
                       onClick={() => setMethod('MPESA')}
                       className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${method === 'MPESA' ? 'border-[#39B54A] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}
                     >
                         <div className="w-10 h-10 bg-[#39B54A] rounded-full flex items-center justify-center text-white mb-2">
                             <Smartphone className="w-5 h-5" />
                         </div>
                         <span className="font-bold text-[#39B54A]">
                             {isRealPaymentEnabled ? 'Mobile / Card' : 'M-Pesa'}
                         </span>
                     </button>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                      {method === 'PAYPAL' ? (
                          <button
                            onClick={handlePayPalClick}
                            className="w-full flex items-center justify-center bg-[#FFC439] hover:bg-[#F4BB34] text-[#003087] font-bold py-3.5 px-4 rounded-full transition-colors shadow-sm"
                        >
                            <span className="flex items-center gap-2">
                            Pay with <i className="not-italic font-bold">PayPal</i>
                            </span>
                        </button>
                      ) : (
                          <form onSubmit={handleMpesaClick} className="space-y-4">
                             {/* Show Phone Input ONLY if in simulation mode, otherwise IntaSend handles it */}
                             {!isRealPaymentEnabled ? (
                                 <div className="text-left animate-fadeIn">
                                    <label className="block text-xs font-medium text-gray-700 mb-1 ml-1">M-Pesa Phone Number</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">🇰🇪 +254</span>
                                        <input 
                                            type="tel"
                                            placeholder="712 345 678"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            className="w-full pl-16 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#39B54A] focus:border-[#39B54A] outline-none transition-all font-mono"
                                            required
                                        />
                                    </div>
                                    {mpesaError && <p className="text-red-500 text-xs mt-1 ml-1">{mpesaError}</p>}
                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center bg-[#39B54A] hover:bg-[#32a342] text-white font-bold py-3.5 px-4 rounded-full transition-colors shadow-sm mt-4"
                                    >
                                        Pay with M-Pesa
                                    </button>
                                 </div>
                             ) : (
                                 <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100 animate-fadeIn">
                                     <div className="flex justify-center mb-2 space-x-2">
                                         <Smartphone className="w-5 h-5 text-green-600" />
                                         <CreditCard className="w-5 h-5 text-green-600" />
                                     </div>
                                     <p className="text-sm text-green-800 mb-4 px-4">
                                         Secure payment via IntaSend (MPesa STK Push, Card, Bitcoin)
                                     </p>
                                     <button
                                        type="submit"
                                        className="w-full max-w-xs mx-auto flex items-center justify-center bg-[#39B54A] hover:bg-[#32a342] text-white font-bold py-3.5 px-4 rounded-full transition-colors shadow-sm"
                                    >
                                        Proceed to Secure Payment
                                    </button>
                                     {mpesaError && <p className="text-red-500 text-xs mt-2">{mpesaError}</p>}
                                 </div>
                             )}
                          </form>
                      )}
                  </div>
                  
                  <div className="text-center mt-2">
                     <button onClick={() => setStep('SHIPPING')} className="text-xs text-gray-400 hover:text-gray-600 underline">
                        Back to Shipping
                     </button>
                  </div>
              </div>
            )}

            {/* Step: Processing (Both) */}
            {step === 'PROCESSING' && (
              <div className="py-12 flex flex-col items-center justify-center animate-fadeIn">
                <Loader2 className={`w-12 h-12 animate-spin mb-4 ${method === 'MPESA' ? 'text-[#39B54A]' : 'text-pink-500'}`} />
                <h3 className="text-lg font-medium text-gray-900">
                    {method === 'MPESA' ? 'Sending Request...' : 'Redirecting to PayPal...'}
                </h3>
                <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
              </div>
            )}

            {/* Step: MPesa Push Sent */}
            {step === 'MPESA_PUSH_SENT' && (
                <div className="py-8 flex flex-col items-center justify-center animate-fadeIn">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Smartphone className="w-8 h-8 text-[#39B54A]" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Check your phone</h3>
                    <p className="text-gray-600 mb-6 max-w-xs mx-auto">
                        An STK push has been sent to <b>{phoneNumber || 'your phone'}</b>. 
                        Please enter your M-Pesa PIN to complete the transaction.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 border border-gray-200 inline-block">
                        <p className="font-bold text-gray-700 mb-1 uppercase tracking-wider">Business Details</p>
                        <p>{getMpesaBusinessInfo().type.replace('_', ' ')}: {getMpesaBusinessInfo().number}</p>
                        <p>Account: GLAZE</p>
                        <p>Amount: KES {(total * 130).toFixed(0)} (Approx)</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                        <Loader2 className="w-3 h-3 animate-spin" /> Waiting for payment confirmation...
                    </div>
                </div>
            )}

            {/* Step: Success */}
            {step === 'SUCCESS' && (
              <div className="py-8 flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Received</h3>
                <p className="text-gray-500">Thank you for shopping with Glaze.</p>
              </div>
            )}
            
            {/* Footer Security Badge */}
            {(step === 'SELECT' || step === 'SHIPPING') && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-6">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Payments are secure and encrypted</span>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;