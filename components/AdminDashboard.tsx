import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, ArrowLeft, DollarSign, Settings, Key, Globe, HelpCircle, Copy, Check, AlertTriangle, Mail } from 'lucide-react';
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
  
  // EmailJS Settings
  const [emailServiceId, setEmailServiceId] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailPublicKey, setEmailPublicKey] = useState('');

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing keys from storage or env on mount
    setSettingsApiKey(localStorage.getItem('GLAZE_API_KEY') || process.env.API_KEY || '');
    setSettingsClientId(localStorage.getItem('GLAZE_GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID || '');
    
    // Load EmailJS
    setEmailServiceId(localStorage.getItem('GLAZE_EMAIL_SERVICE_ID') || '');
    setEmailTemplateId(localStorage.getItem('GLAZE_EMAIL_TEMPLATE_ID') || '');
    setEmailPublicKey(localStorage.getItem('GLAZE_EMAIL_PUBLIC_KEY') || '');
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
    
    // Save EmailJS
    localStorage.setItem('GLAZE_EMAIL_SERVICE_ID', emailServiceId);
    localStorage.setItem('GLAZE_EMAIL_TEMPLATE_ID', emailTemplateId);
    localStorage.setItem('GLAZE_EMAIL_PUBLIC_KEY', emailPublicKey);
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
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
                
                {/* Instructions Box */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-5 mb-8">
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900 w-full">
                      <h4 className="font-bold mb-2">How to enable "Sign in with Google":</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-1 text-blue-800 mb-4">
                        <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="underline hover:text-blue-600">Google Cloud Console</a>.</li>
                        <li>Create a project and go to <b>APIs & Services {'>'} Credentials</b>.</li>
                        <li>Click <b>Create Credentials {'>'} OAuth client ID</b>.</li>
                        <li className="font-semibold text-pink-600">
                          Application type MUST be set to "Web application"
                          <span className="block text-xs font-normal text-blue-800 mt-1">If you choose Desktop/Mobile, the options won't appear!</span>
                        </li>
                        <li>Look for the section titled <b>"Authorized JavaScript origins"</b>.</li>
                        <li>Click "ADD URI" and paste the URL below:</li>
                      </ol>
                      
                      {/* Copy URL Helper */}
                      <div className="flex items-center gap-2 bg-blue-100/50 p-2 rounded-md border border-blue-200">
                        <code className="flex-1 font-mono text-xs text-blue-800 truncate">
                          {window.location.origin}
                        </code>
                        <button 
                          onClick={copyOrigin}
                          className="p-1.5 hover:bg-blue-200 rounded transition-colors text-blue-700"
                          title="Copy URL"
                        >
                          {copiedOrigin ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      <ol className="list-decimal list-inside space-y-1 ml-1 text-blue-800 mt-4" start={7}>
                        <li>Click Create. Copy the <b>Client ID</b> and paste it below.</li>
                      </ol>

                      {/* PUBLISH APP NOTICE */}
                      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs">
                         <div className="flex items-start gap-2">
                           <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                           <div>
                             <p className="font-bold">CRITICAL: Allow Anyone to Login</p>
                             <p className="mt-1">
                               By default, your Google App is in "Testing" mode and only approved emails can log in. 
                               To let <b>anyone</b> log in:
                             </p>
                             <ul className="list-disc list-inside mt-1 ml-1">
                               <li>Go to <b>"OAuth consent screen"</b> in Google Cloud.</li>
                               <li>Set User Type to <b>External</b>.</li>
                               <li>Click the <b>"PUBLISH APP"</b> button.</li>
                             </ul>
                           </div>
                         </div>
                      </div>
                    </div>
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
                    <p className="mt-1.5 text-xs text-gray-500">Enables the "Sign in with Google" button.</p>
                  </div>

                  {/* EMAILJS CONFIGURATION */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <h3 className="text-md font-bold text-gray-900">Email Verification Settings (EmailJS)</h3>
                    </div>
                    
                    {/* HELP BOX FOR EMAILJS KEYS */}
                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <HelpCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-purple-900 w-full">
                          <h4 className="font-bold mb-2">How to get these keys:</h4>
                          <ol className="list-decimal list-inside space-y-2 ml-1 text-purple-800">
                            <li>
                              <span className="font-semibold">Service ID:</span> Go to the <b>Email Services</b> tab. Click "Add Service" (e.g., Gmail). The ID (e.g., <code>service_xyz</code>) is shown there.
                            </li>
                            <li>
                              <span className="font-semibold">Template ID:</span> Go to <b>Email Templates</b>. Create a new template. Click "Settings" or look at the ID (e.g., <code>template_xyz</code>).
                              <br/>
                              <span className="text-xs opacity-80 pl-4 block mt-1">
                                Important: Add <code>{'{{to_name}}'}</code> and <code>{'{{otp}}'}</code> to your template content.
                              </span>
                            </li>
                            <li>
                              <span className="font-semibold">Public Key:</span> Click your name/avatar in the top right → <b>Account</b> → <b>API Keys</b>. Use the "Public Key".
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Service ID</label>
                        <input
                          type="text"
                          value={emailServiceId}
                          onChange={(e) => setEmailServiceId(e.target.value)}
                          placeholder="service_xxxxx"
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2.5 border text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Template ID</label>
                        <input
                          type="text"
                          value={emailTemplateId}
                          onChange={(e) => setEmailTemplateId(e.target.value)}
                          placeholder="template_xxxxx"
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2.5 border text-xs font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Public Key</label>
                        <input
                          type="password"
                          value={emailPublicKey}
                          onChange={(e) => setEmailPublicKey(e.target.value)}
                          placeholder="Public Key (not Private Key)"
                          className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-2.5 border text-xs font-mono"
                        />
                      </div>
                    </div>
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
             
             <div className="mt-6 text-center text-xs text-gray-400">
               <p>Keys are stored locally in your browser for convenience.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;