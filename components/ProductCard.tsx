import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  return (
    <div 
      onClick={() => onClick(product)}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-square w-full overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
        />
        {/* Quick Add Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur text-black rounded-full shadow-lg translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hover:bg-pink-500 hover:text-white z-10"
          aria-label="Add to cart"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.shade}</p>
          </div>
          <span className="text-lg font-medium text-gray-900">${product.price}</span>
        </div>
        
        {/* Color Swatch */}
        <div className="flex items-center mt-3 mb-4">
          <div 
            className="w-6 h-6 rounded-full border border-gray-200 shadow-inner" 
            style={{ backgroundColor: product.hex }}
            title={product.shade}
          />
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{product.description}</p>
        
        <p className="text-xs text-pink-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view details & reviews
        </p>
      </div>
    </div>
  );
};

export default ProductCard;