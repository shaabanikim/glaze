import React, { useState, useRef } from 'react';
import { Sparkles, Camera, Loader2, Send } from 'lucide-react';
import { getRecommendation } from '../services/geminiService';
import { Product, ConsultantState, Recommendation } from '../types';

interface ShadeConsultantProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ShadeConsultant: React.FC<ShadeConsultantProps> = ({ products, onAddToCart }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [state, setState] = useState<ConsultantState>(ConsultantState.IDLE);
  const [result, setResult] = useState<Recommendation | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input && !selectedImage) return;

    setState(ConsultantState.ANALYZING);
    setResult(null);

    try {
      // Remove data URL prefix for API
      const base64Image = selectedImage ? selectedImage.split(',')[1] : undefined;
      const recommendation = await getRecommendation(input, products, base64Image);
      
      setResult(recommendation);
      setState(ConsultantState.RECOMMENDING);
    } catch (error) {
      console.error(error);
      setState(ConsultantState.ERROR);
    }
  };

  const resetConsultant = () => {
    setInput('');
    setSelectedImage(null);
    setState(ConsultantState.IDLE);
    setResult(null);
  };

  const recommendedProduct = result ? products.find(p => p.id === result.productId) : null;

  return (
    <div id="consultant" className="py-24 px-4 bg-gradient-to-b from-white to-pink-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-pink-100 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-pink-600 mr-2" />
            <span className="text-pink-800 font-semibold text-sm tracking-wide uppercase">AI Powered</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Find Your Perfect Match</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Not sure which shade to pick? Upload a selfie or describe your vibe, and our AI beauty consultant "GlowBot" will curate the perfect gloss for you.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-pink-100">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side: Interaction */}
            <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
              {state === ConsultantState.IDLE || state === ConsultantState.ANALYZING || state === ConsultantState.ERROR ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Image Upload Area */}
                  <div 
                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${selectedImage ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    
                    {selectedImage ? (
                      <div className="relative h-48 w-full">
                        <img src={selectedImage} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                          <p className="text-white font-medium">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8">
                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-700">Upload a selfie</p>
                        <p className="text-xs text-gray-500 mt-1">We'll analyze your skin tone</p>
                      </div>
                    )}
                  </div>

                  {/* Text Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Or describe your vibe</label>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="e.g., I have warm skin tone and want something for a date night..."
                      className="w-full rounded-xl border-gray-200 shadow-sm focus:border-pink-500 focus:ring focus:ring-pink-200 transition-all p-3 text-sm"
                      rows={3}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={state === ConsultantState.ANALYZING || (!input && !selectedImage)}
                    className="w-full flex items-center justify-center py-4 px-6 rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                  >
                    {state === ConsultantState.ANALYZING ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Analyzing your glow...
                      </>
                    ) : (
                      <>
                        Find My Shade <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                  
                  {state === ConsultantState.ERROR && (
                    <p className="text-red-500 text-sm text-center">Oops! Something went wrong. Try again.</p>
                  )}
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6 inline-flex p-4 rounded-full bg-green-100">
                    <Sparkles className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Analysis Complete!</h3>
                  <p className="text-gray-600 mb-8">Based on your input, we've found a match made in heaven.</p>
                  <button 
                    onClick={resetConsultant}
                    className="text-sm text-gray-500 underline hover:text-pink-600"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>

            {/* Right Side: Result Display */}
            <div className="bg-pink-50 p-8 md:p-10 flex flex-col justify-center items-center border-l border-pink-100">
              {state === ConsultantState.RECOMMENDING && recommendedProduct ? (
                <div className="text-center animate-fadeIn w-full">
                  <p className="text-pink-600 font-semibold uppercase tracking-wider text-xs mb-4">Top Recommendation</p>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-lg mb-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                    <img 
                      src={recommendedProduct.image} 
                      alt={recommendedProduct.name} 
                      className="w-48 h-48 object-cover rounded-xl mx-auto"
                    />
                  </div>
                  
                  <h3 className="text-3xl font-serif font-bold text-gray-900 mb-1">{recommendedProduct.name}</h3>
                  <p className="text-gray-500 mb-4">{recommendedProduct.shade}</p>
                  
                  <div className="bg-white/50 p-4 rounded-xl mb-6 text-sm text-gray-700 italic border border-pink-100">
                    "{result?.reasoning}"
                  </div>
                  
                  <button
                    onClick={() => onAddToCart(recommendedProduct)}
                    className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors"
                  >
                    Add to Cart - ${recommendedProduct.price}
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-400 opacity-50">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" />
                  <p className="font-serif italic text-lg">Your perfect shade is waiting...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShadeConsultant;