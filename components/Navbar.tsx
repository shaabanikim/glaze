import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Sparkles, LogIn, LogOut, LayoutDashboard, Package, UserPlus } from 'lucide-react';
import { APP_NAME } from '../constants';
import { User } from '../types';

interface NavbarProps {
  cartCount: number;
  user: User | null;
  onOpenCart: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
  onLogoutClick: () => void;
  onScrollToSection: (id: string) => void;
  onNavigateToAdmin?: () => void;
  onOpenOrders?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  user,
  onOpenCart, 
  onLoginClick,
  onSignupClick,
  onLogoutClick,
  onScrollToSection,
  onNavigateToAdmin,
  onOpenOrders
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Shop', id: 'products' },
    { label: 'Consultant', id: 'consultant' },
    { label: 'About', id: 'about' },
  ];

  const handleLinkClick = (id: string) => {
    onScrollToSection(id);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleLinkClick('hero')}>
            <Sparkles className="h-6 w-6 text-pink-500 mr-2" />
            <span className="font-serif text-2xl font-bold tracking-widest text-gray-900">{APP_NAME}</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.id)}
                className="text-gray-600 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors uppercase tracking-wider"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Actions: Cart, Login, Mobile Menu */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* User Login/Profile */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="h-8 w-8 rounded-full border border-pink-200 object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700">{user.name.split(' ')[0]}</span>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-gray-900">{user.email}</p>
                      </div>
                      
                      {user.isAdmin && onNavigateToAdmin && (
                        <button
                          onClick={() => {
                            onNavigateToAdmin();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        >
                          <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                        </button>
                      )}

                      {onOpenOrders && (
                        <button
                          onClick={() => {
                            onOpenOrders();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                        >
                          <Package className="w-4 h-4 mr-2" /> My Orders
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onLogoutClick();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="flex items-center space-x-1 text-gray-600 hover:text-pink-600 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Log In</span>
                  </button>
                  <button
                    onClick={onSignupClick}
                    className="flex items-center space-x-1 bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </>
              )}
            </div>

            {/* Cart Button */}
            <button 
              className="relative p-2 text-gray-600 hover:text-pink-600 transition-colors"
              onClick={onOpenCart}
            >
              <ShoppingBag className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-pink-500 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-pink-600 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLinkClick(link.id)}
                className="text-gray-600 hover:text-pink-600 block px-3 py-2 rounded-md text-base font-medium w-full text-left"
              >
                {link.label}
              </button>
            ))}
            
            <div className="border-t border-gray-200 my-2 pt-2">
              {user ? (
                <div className="px-3 py-2">
                  <div className="flex items-center mb-3">
                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  {user.isAdmin && onNavigateToAdmin && (
                    <button 
                      onClick={() => {
                        onNavigateToAdmin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-gray-600 hover:text-pink-600 px-2 py-2 text-base font-medium"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                    </button>
                  )}

                  {onOpenOrders && (
                    <button 
                      onClick={() => {
                        onOpenOrders();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-gray-600 hover:text-pink-600 px-2 py-2 text-base font-medium"
                    >
                      <Package className="w-4 h-4 mr-2" /> My Orders
                    </button>
                  )}

                  <button 
                    onClick={onLogoutClick}
                    className="flex items-center w-full text-gray-600 hover:text-pink-600 px-2 py-2 text-base font-medium"
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  <button
                    onClick={() => {
                      onLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-gray-600 hover:text-pink-600 px-3 py-2 rounded-md text-base font-medium"
                  >
                    <LogIn className="w-4 h-4 mr-2" /> Log In
                  </button>
                  <button
                    onClick={() => {
                      onSignupClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full bg-black text-white hover:bg-gray-800 px-3 py-2 rounded-lg text-base font-medium"
                  >
                    <UserPlus className="w-4 h-4 mr-2" /> Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;