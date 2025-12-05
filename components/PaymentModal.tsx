import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  total: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, total, onClose, onSuccess }) => {
  const [step, setStep] = useState<'summary' | 'processing' | 'success'>('summary');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) setStep('summary');
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePayPalClick = () => {
    setStep('processing');
    
    // Construct PayPal URL for the specific business email
    const businessEmail = 'ayubshaaban040@gmail.com';
    const paypalUrl = new URL('https://www.paypal.com/cgi-bin/webscr');
    paypalUrl.searchParams.append('cmd', '_xclick');
    paypalUrl.searchParams.append('business', businessEmail);
    paypalUrl.searchParams.append('currency_code', 'USD');
    paypalUrl.searchParams.append('amount', total.toFixed(2));
    paypalUrl.searchParams.append('item_name', 'Glaze Cosmetics Order');
    paypalUrl.searchParams.append('return', window.location.href); // Return to site after payment

    // Open PayPal in a new tab
    window.open(paypalUrl.toString(), '_blank');

    // Simulate completion flow in the app (since we can't track the external tab perfectly without a backend)
    setTimeout(() => {
      setStep('success');
      // Close modal after showing success message
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    }, 5000); // Give user time to see the processing screen
  };

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={step === 'processing' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:w-full sm:max-w-md border border-gray-100">
          
          {/* Close Button */}
          {step !== 'processing' && step !== 'success' && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="p-8">
            {step === 'summary' && (
              <>
                <div className="text-center mb-8">
                  <span className="text-pink-500 font-semibold tracking-widest uppercase text-xs mb-2 block">
                    Secure Checkout
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-gray-900">
                    Complete Your Order
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="text-gray-900 font-bold">Total</span>
                    <span className="text-gray-900 font-bold text-xl">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* PayPal Button */}
                  <button
                    onClick={handlePayPalClick}
                    className="w-full flex items-center justify-center bg-[#FFC439] hover:bg-[#F4BB34] text-[#003087] font-bold py-3.5 px-4 rounded-full transition-colors shadow-sm group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <i className="not-italic text-lg italic font-bold">Pay</i>
                      <span className="italic">Pal</span>
                    </span>
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-4">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Payments are secure and encrypted</span>
                  </div>
                </div>
              </>
            )}

            {step === 'processing' && (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Opening PayPal...</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <ExternalLink className="w-4 h-4" />
                  Please complete payment in the new tab
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="py-8 flex flex-col items-center justify-center animate-fadeIn">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-500">Thank you for shopping with Glaze.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;