import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TAGLINE } from '../constants';

interface HeroProps {
  onShopNow: () => void;
}

const Hero: React.FC<HeroProps> = ({ onShopNow }) => {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Video Placeholder */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542452255191-c85fe9892f01?q=80&w=2938&auto=format&fit=crop" 
          alt="Glossy lips background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Overlay */}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto text-white">
        <span className="block text-sm md:text-base tracking-[0.2em] mb-4 uppercase font-medium animate-pulse">
          New Collection Drop
        </span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight drop-shadow-lg">
          {TAGLINE}
        </h1>
        <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto font-light text-white/90">
          High-shine, non-sticky formulas infused with hydrating oils for the perfect pout. 
          Discover your signature shade today.
        </p>
        <button 
          onClick={onShopNow}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-medium text-black bg-white/90 backdrop-blur-sm rounded-full overflow-hidden transition-all duration-300 hover:bg-white hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
        >
          <span className="mr-2">Shop Collection</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
      
      {/* Decorative floating elements */}
      <div className="absolute bottom-10 left-10 md:left-20 animate-bounce delay-700">
        <div className="w-4 h-4 bg-pink-400 rounded-full blur-[2px] opacity-80"></div>
      </div>
      <div className="absolute top-1/4 right-10 md:right-20 animate-pulse delay-300">
        <div className="w-6 h-6 bg-white rounded-full blur-[4px] opacity-60"></div>
      </div>
    </section>
  );
};

export default Hero;