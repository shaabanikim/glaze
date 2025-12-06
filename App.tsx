import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ShadeConsultant from './components/ShadeConsultant';
import LoginModal from './components/LoginModal';
import PaymentModal from './components/PaymentModal';
import AdminDashboard from './components/AdminDashboard';
import ProductDetailsModal from './components/ProductDetailsModal';
import { PRODUCTS } from './constants';
import { Product, CartItem, User, Review } from './types';
import { X, ShoppingBag, Instagram, Facebook, Twitter } from 'lucide-react';

// Initial Mock Reviews
const INITIAL_REVIEWS: Review[] = [
  { id: 'r1', productId: 'p1', userName: 'Jessica M.', rating: 5, comment: 'Absolutely obsessed! Not sticky at all.', date: '2024-02-15' },
  { id: 'r2', productId: 'p1', userName: 'Ashley K.', rating: 4, comment: 'Great shine, wish it lasted a bit longer.', date: '2024-02-10' },
  { id: 'r3', productId: 'p4', userName: 'Maria R.', rating: 5, comment: 'The color pay off is insane. Love it.', date: '2024-02-18' },
  { id: 'r4', productId: 'p2', userName: 'Sofia L.', rating: 5, comment: 'My everyday go-to. Looks so natural.', date: '2024-02-20' },
];

const App: React.FC = () => {
  // Product State (Source of Truth)
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [view, setView] = useState<'shop' | 'admin'>('shop');

  // Product Detail State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Payment State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth Handlers
  const handleLogin = (userData: User) => {
    setUser(userData);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]); // Optional: clear cart on logout
    setView('shop');
  };

  // Payment Handlers
  const handleCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsLoginModalOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setCart([]); // Clear cart
  };

  // Admin Handlers
  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, newProduct]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Review Handlers
  const handleAddReview = (productId: string, rating: number, comment: string, guestName?: string) => {
    const newReview: Review = {
      id: `r${Date.now()}`,
      productId,
      userName: user ? user.name : (guestName || 'Anonymous'),
      rating,
      comment,
      date: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (view === 'admin') {
    return (
      <AdminDashboard 
        products={products}
        onAdd={handleAddProduct}
        onUpdate={handleUpdateProduct}
        onDelete={handleDeleteProduct}
        onClose={() => setView('shop')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        cartCount={cartCount} 
        user={user}
        onOpenCart={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onScrollToSection={scrollToSection}
        onNavigateToAdmin={() => setView('admin')}
      />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin} 
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        total={cartTotal}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      <ProductDetailsModal
        product={selectedProduct}
        reviews={reviews}
        currentUser={user}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onAddReview={handleAddReview}
      />

      <main className="flex-grow">
        <Hero onShopNow={() => scrollToSection('products')} />

        {/* Product Grid */}
        <section id="products" className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-pink-500 font-semibold tracking-widest uppercase text-sm">The Collection</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mt-2">Drip With Shine</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                  onClick={setSelectedProduct}
                />
              ))}
            </div>
          </div>
        </section>

        {/* AI Consultant - now uses dynamic products */}
        <ShadeConsultant products={products} onAddToCart={addToCart} />

        {/* Brand Story / About */}
        <section id="about" className="py-24 bg-black text-white px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Clean. Vegan. Cruelty-Free.</h2>
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              At GLAZE, we believe your lips should do the talking. Our formula is engineered for maximum comfort 
              and extreme shine, without the sticky aftermath. Infused with hyaluronic acid and Vitamin E, 
              it's skincare disguised as makeup.
            </p>
            <div className="flex justify-center gap-8 text-sm tracking-widest uppercase text-gray-400">
              <span>Non-Sticky</span>
              <span>•</span>
              <span>Hydrating</span>
              <span>•</span>
              <span>Long-Lasting</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="font-serif text-2xl font-bold tracking-widest text-gray-900">GLAZE</span>
            <p className="text-xs text-gray-500 mt-2">© 2024 Glaze Cosmetics. All rights reserved.</p>
          </div>
          
          <div className="flex space-x-6">
             <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></a>
             <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Facebook className="w-5 h-5" /></a>
             <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors"><Twitter className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-xl flex flex-col h-full animate-slideInRight">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" /> Your Cart
                </h2>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">Your bag is empty.</p>
                    <button 
                      onClick={() => { setIsCartOpen(false); scrollToSection('products'); }}
                      className="mt-4 text-pink-500 font-medium hover:underline"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {cart.map((item) => (
                      <li key={item.id} className="flex py-2">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h3 className="font-serif">{item.name}</h3>
                              <p className="ml-4">${item.price * item.quantity}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.shade}</p>
                          </div>
                          <div className="flex flex-1 items-end justify-between text-sm">
                            <p className="text-gray-500">Qty {item.quantity}</p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="font-medium text-pink-500 hover:text-pink-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-100 px-6 py-6 bg-gray-50">
                  <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                    <p>Subtotal</p>
                    <p>${cartTotal}</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
                  <button
                    onClick={handleCheckout}
                    className="w-full flex items-center justify-center rounded-full border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-900 transition-colors"
                  >
                     {user ? 'Checkout' : 'Log in to Checkout'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;