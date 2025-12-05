import React, { useState } from 'react';
import { X, Star, ShoppingBag, Send, User as UserIcon } from 'lucide-react';
import { Product, Review, User } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  reviews: Review[];
  currentUser: User | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddReview: (productId: string, rating: number, comment: string, guestName?: string) => void;
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ 
  product, 
  reviews, 
  currentUser,
  onClose, 
  onAddToCart,
  onAddReview 
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');

  if (!product) return null;

  const productReviews = reviews.filter(r => r.productId === product.id);
  const averageRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : 0;

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    if (!currentUser && !guestName.trim()) return;

    onAddReview(product.id, rating, comment, guestName);
    
    // Reset form
    setRating(0);
    setComment('');
    setGuestName('');
  };

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md text-gray-900 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image */}
          <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6 text-white md:hidden">
              <h2 className="text-2xl font-serif font-bold">{product.name}</h2>
              <p className="opacity-90">{product.shade}</p>
            </div>
          </div>

          {/* Right: Content */}
          <div className="w-full md:w-1/2 flex flex-col bg-white h-full max-h-[90vh] md:max-h-[90vh]">
            
            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 md:p-10 hide-scrollbar">
              
              {/* Product Info Header (Desktop) */}
              <div className="hidden md:block mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-1">{product.name}</h2>
                    <p className="text-lg text-gray-500 flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: product.hex }}></span>
                      {product.shade}
                    </p>
                  </div>
                  <span className="text-2xl font-medium text-gray-900">${product.price}</span>
                </div>
              </div>

              {/* Mobile Price */}
              <div className="md:hidden mb-6 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: product.hex }}></span>
                    <span className="text-gray-600">{product.shade}</span>
                 </div>
                 <span className="text-xl font-bold">${product.price}</span>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {averageRating.toFixed(1)} ({productReviews.length} reviews)
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed mb-8">
                {product.description}
              </p>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 bg-black text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors mb-12 shadow-lg shadow-gray-200"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart - ${product.price}
              </button>

              {/* Reviews Section */}
              <div className="border-t border-gray-100 pt-8">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Customer Reviews</h3>
                
                {/* Review List */}
                <div className="space-y-6 mb-10">
                  {productReviews.length === 0 ? (
                    <p className="text-gray-400 italic">No reviews yet. Be the first to share your glow!</p>
                  ) : (
                    productReviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                              {review.userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 text-sm">{review.userName}</span>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                  <form onSubmit={handleSubmitReview}>
                    
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= (hoverRating || rating) 
                                  ? 'text-yellow-400 fill-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {!currentUser && (
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Name</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="text"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500"
                            placeholder="Your Name"
                            required
                          />
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Review</label>
                      <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-pink-500 focus:ring-pink-500"
                        rows={3}
                        placeholder="What did you think about the shade and texture?"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={rating === 0 || (!currentUser && !guestName.trim())}
                      className="flex items-center justify-center px-6 py-2 bg-pink-500 text-white text-sm font-medium rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Review <Send className="w-3 h-3 ml-2" />
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;