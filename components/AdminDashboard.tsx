import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, ArrowLeft, DollarSign, Settings, Key, Globe } from 'lucide-react';
import { Product } from '../types';

interface AdminDashboardProps {
  products: Product[];
  onAdd: (product: Product) => void;
  onUpdate: (product: Product) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  products, 
  onAdd, 
  onUpdate, 
  onDelete, 
  onClose 
}) => {
  const [view, setView] = useState<'list' | 'form' | 'settings'>('list');
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  
  // Settings State
  const [settingsApiKey, setSettingsApiKey] = useState('');
  const [settingsClientId, setSettingsClientId] = useState('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing keys from storage or env on mount
    setSettingsApiKey(localStorage.getItem('GLAZE_API_KEY') || process.env.API_KEY || '');
    setSettingsClientId(localStorage.getItem('GLAZE_GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID || '');
  }, []);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setView('form');
  };

  const handleAddNew = () => {
    setEditingProduct({
      id: `p${Date.now()}`,
      name: '',
      price: 0,
      shade: '',
      description: '',
      image: '',
      hex: '#FFC0CB'
    });
    setView('form');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingProduct(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.name || !editingProduct.price) return;

    if (products.some(p => p.id === editingProduct.id)) {
      onUpdate(editingProduct as Product);
    } else {
      onAdd(editingProduct as Product);
    }
    setView('list');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('GLAZE_API_KEY', settingsApiKey);
    localStorage.setItem('GLAZE_GOOGLE_CLIENT_ID', settingsClientId);
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {view !== 'list' && (
              <button 
                onClick={() => setView('list')}
                className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                {view === 'list' ? 'Product Dashboard' : view === 'settings' ? 'Site Settings' : editingProduct.name || 'New Product'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {view === 'list' ? 'Manage your inventory and shades' : view === 'settings' ? 'Configure API keys and integrations' : 'Enter product details below'}
              </p>
            </div>
          </div>
          
          {view === 'list' ? (
            <div className="flex gap-3">
              <button
                onClick={() => setView('settings')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Settings className="w-4 h-4 mr-2" /> Settings
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Exit Dashboard
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </button>
            </div>
          ) : (
             <button
                type="button"
                onClick={() => setView('list')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back to List
              </button>
          )}
        </div>

        {view === 'list' && (
          /* List View */
          <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img className="h-10 w-10 rounded-full object-cover border border-gray-100" src={product.image} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: product.hex }}></div>
                           <span className="text-sm text-gray-900">{product.shade}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">${product.price}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'form' && (
          /* Form View */
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              
              {/* Image Uploader */}
              <div className="p-8 bg-gray-50 border-r border-gray-100 flex flex-col items-center justify-center text-center">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-full aspect-square bg-white rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer overflow-hidden flex flex-col items-center justify-center transition-all"
                >
                  {editingProduct.image ? (
                    <>
                      <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">Change Image</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Upload Image</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="mt-4 text-xs text-gray-500">Click to upload product photo</p>
              </div>

              {/* Form Fields */}
              <div className="md:col-span-2 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
                      placeholder="e.g. Berry Bite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={editingProduct.price || ''}
                        onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})}
                        className="w-full pl-9 rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shade Name</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.shade || ''}
                      onChange={e => setEditingProduct({...editingProduct, shade: e.target.value})}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
                      placeholder="e.g. Deep Raspberry"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shade Color (Hex)</label>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={editingProduct.hex || '#000000'}
                        onChange={e => setEditingProduct({...editingProduct, hex: e.target.value})}
                        className="h-10 w-10 rounded p-1 border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={editingProduct.hex || ''}
                        onChange={e => setEditingProduct({...editingProduct, hex: e.target.value})}
                        className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
                    placeholder="Describe the finish, feel, and look..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="submit"
                    className="flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Product
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="p-3 bg-pink-50 rounded-full">
                    <Settings className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Site Configuration</h2>
                    <p className="text-sm text-gray-500">Manage your API keys without redeploying.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  
                  {/* Gemini Key */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gemini API Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={settingsApiKey}
                        onChange={(e) => setSettingsApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full pl-9 rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-3 border text-sm font-mono"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">Required for the AI Shade Consultant to work.</p>
                  </div>

                  {/* Google Client ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Google Client ID</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={settingsClientId}
                        onChange={(e) => setSettingsClientId(e.target.value)}
                        placeholder="123456...apps.googleusercontent.com"
                        className="w-full pl-9 rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-3 border text-sm font-mono"
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">Required for "Sign in with Google". Find this in Google Cloud Console.</p>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                     {showSaveMessage ? (
                       <span className="text-green-600 font-medium text-sm flex items-center">
                         <Save className="w-4 h-4 mr-1" /> Saved to browser! Reloading...
                       </span>
                     ) : <span></span>}
                     
                     <button
                        type="submit"
                        className="flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-black hover:bg-gray-900 transition-all"
                      >
                        Save Configuration
                      </button>
                  </div>
                </form>
             </div>
             
             <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
               <p className="font-semibold mb-1">Tip:</p>
               <p>These keys are saved in your browser's Local Storage. If you clear your cache, you will need to enter them again.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;