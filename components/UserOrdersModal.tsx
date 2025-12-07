import React from 'react';
import { X, Package, ShoppingBag, Calendar, Clock, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { Order, User, OrderStatus } from '../types';

interface UserOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  currentUser: User | null;
}

const UserOrdersModal: React.FC<UserOrdersModalProps> = ({ isOpen, onClose, orders, currentUser }) => {
  if (!isOpen || !currentUser) return null;

  // Filter orders for the logged-in user (by email)
  const myOrders = orders.filter(
    order => order.customer.email.toLowerCase() === currentUser.email.toLowerCase()
  ).reverse(); // Newest first

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-200';
        case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
      switch(status) {
          case 'PENDING': return <Clock className="w-3 h-3 mr-1" />;
          case 'PROCESSING': return <Package className="w-3 h-3 mr-1" />;
          case 'SHIPPED': return <Truck className="w-3 h-3 mr-1" />;
          case 'DELIVERED': return <CheckCircle className="w-3 h-3 mr-1" />;
          case 'CANCELLED': return <AlertCircle className="w-3 h-3 mr-1" />;
          default: return null;
      }
  };

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl font-serif font-bold text-gray-900">My Orders</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-6 flex-1 bg-gray-50/30">
            {myOrders.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                    <p className="text-gray-500 text-sm mb-6">Looks like you haven't indulged in any shine yet.</p>
                    <button 
                        onClick={onClose}
                        className="text-pink-600 font-medium hover:underline text-sm"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {myOrders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-gray-50 gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</p>
                                    <p className="text-xs text-gray-400">{order.items.length} item(s)</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <div key={`${order.id}-${idx}`} className="flex items-center gap-3">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-md border border-gray-100 overflow-hidden bg-gray-50">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{item.shade}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
          
          <div className="bg-white border-t border-gray-100 p-4 text-center">
             <p className="text-xs text-gray-400">
                Need help with an order? Contact <a href="mailto:support@glaze.com" className="text-pink-500 hover:underline">support@glaze.com</a>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrdersModal;