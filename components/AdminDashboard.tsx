import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, ArrowLeft, DollarSign, Settings, Key, Globe, HelpCircle, Copy, Check, AlertTriangle, Mail, Cloud, UploadCloud, Loader2, DownloadCloud, RefreshCw, ExternalLink, Smartphone, CreditCard } from 'lucide-react';
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
  
  // Payment Settings
  const [paypalEmail, setPaypalEmail] = useState('');
  const [mpesaBusinessNumber, setMpesaBusinessNumber] = useState('');
  const [mpesaType, setMpesaType] = useState('PAYBILL');
  const [intaSendKey, setIntaSendKey] = useState('');
  const [intaSendLive, setIntaSendLive] = useState(false);
  
  // EmailJS Settings
  const [emailServiceId, setEmailServiceId] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [emailPublicKey, setEmailPublicKey] = useState('');

  // Backup State
  const [backupStatus, setBackupStatus] = useState<'idle' | 'uploading' | 'restoring' | 'success' | 'success-restore' | 'error'>('idle');

  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [copiedOrigin, setCopiedOrigin] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load existing keys from storage or env on mount
    setSettingsApiKey(localStorage.getItem('GLAZE_API_KEY') || process.env.API_KEY || '');
    setSettingsClientId(localStorage.getItem('GLAZE_GOOGLE_CLIENT_ID') || process.env.GOOGLE_CLIENT_ID || '');
    setPaypalEmail(localStorage.getItem('GLAZE_PAYPAL_EMAIL') || 'ayubshaaban040@gmail.com');
    
    // Load MPesa / IntaSend
    setMpesaBusinessNumber(localStorage.getItem('GLAZE_MPESA_NUMBER') || '123456');
    setMpesaType(localStorage.getItem('GLAZE_MPESA_TYPE') || 'PAYBILL');
    setIntaSendKey(localStorage.getItem('GLAZE_INTASEND_KEY') || '');
    setIntaSendLive(localStorage.getItem('GLAZE_INTASEND_LIVE') === 'true');
    
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
    
    // Auto-trim whitespace to prevent common errors
    const cleanApiKey = settingsApiKey.trim();
    const cleanClientId = settingsClientId.trim();
    const cleanPaypalEmail = paypalEmail.trim();
    const cleanServiceId = emailServiceId.trim();
    const cleanTemplateId = emailTemplateId.trim();
    const cleanPublicKey = emailPublicKey.trim();
    const cleanMpesaNumber = mpesaBusinessNumber.trim();
    const cleanIntaSendKey = intaSendKey.trim();

    localStorage.setItem('GLAZE_API_KEY', cleanApiKey);
    localStorage.setItem('GLAZE_GOOGLE_CLIENT_ID', cleanClientId);
    localStorage.setItem('GLAZE_PAYPAL_EMAIL', cleanPaypalEmail);
    localStorage.setItem('GLAZE_MPESA_NUMBER', cleanMpesaNumber);
    localStorage.setItem('GLAZE_MPESA_TYPE', mpesaType);
    localStorage.setItem('GLAZE_INTASEND_KEY', cleanIntaSendKey);
    localStorage.setItem('GLAZE_INTASEND_LIVE', String(intaSendLive));
    
    // Save EmailJS
    localStorage.setItem('GLAZE_EMAIL_SERVICE_ID', cleanServiceId);
    localStorage.setItem('GLAZE_EMAIL_TEMPLATE_ID', cleanTemplateId);
    localStorage.setItem('GLAZE_EMAIL_PUBLIC_KEY', cleanPublicKey);
    
    // Update state to reflect trimmed values
    setSettingsApiKey(cleanApiKey);
    setSettingsClientId(cleanClientId);
    setPaypalEmail(cleanPaypalEmail);
    setMpesaBusinessNumber(cleanMpesaNumber);
    setIntaSendKey(cleanIntaSendKey);
    setEmailServiceId(cleanServiceId);
    setEmailTemplateId(cleanTemplateId);
    setEmailPublicKey(cleanPublicKey);

    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const copyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopiedOrigin(true);
    setTimeout(() => setCopiedOrigin(false), 2000);
  };

  // --- GOOGLE DRIVE INTEGRATION ---
  
  const initGoogleAuth = (callback: (token: string) => void) => {
    if (!settingsClientId) {
        alert("Please configure and save your Google Client ID first.");
        return;
    }
    
    const google = (window as any).google;
    if (!google) {
        alert("Google scripts not loaded. Please refresh the page.");
        setBackupStatus('error');
        return;
    }

    try {
        const client = google.accounts.oauth2.initTokenClient({
            client_id: settingsClientId,
            // 'drive.file' allows us to access only files created by this app
            scope: 'https://www.googleapis.com/auth/drive.file',
            callback: (tokenResponse: any) => {
                if (tokenResponse && tokenResponse.access_token) {
                    callback(tokenResponse.access_token);
                } else {
                    console.error("Token response error:", tokenResponse);
                    setBackupStatus('error');
                }
            },
        });

        // Add a small delay to ensure UI is ready
        setTimeout(() => {
            client.requestAccessToken();
        }, 100);
    } catch (err) {
        console.error("Google Auth Init Error:", err);
        alert("Failed to initialize Google Auth. Check your Client ID.");
        setBackupStatus('error');
    }
  };

  const handleBackupToDrive = () => {
    setBackupStatus('uploading');
    initGoogleAuth((token) => uploadDataToDrive(token));
  };

  const handleRestoreFromDrive = () => {
    setBackupStatus('restoring');
    initGoogleAuth((token) => restoreDataFromDrive(token));
  };

  const uploadDataToDrive = async (accessToken: string) => {
    try {
        // Gather Data
        const users = JSON.parse(localStorage.getItem('GLAZE_USERS') || '{}');
        const reviews = JSON.parse(localStorage.getItem('GLAZE_REVIEWS') || '[]');
        const storedProducts = JSON.parse(localStorage.getItem('GLAZE_PRODUCTS') || JSON.stringify(products));

        const backupData = {
            metadata: {
                appName: 'Glaze Cosmetics',
                backupDate: new Date().toISOString(),
                description: 'Full backup of users, products, and reviews.'
            },
            data: {
                products: storedProducts,
                users: users,
                reviews: reviews
            }
        };

        const fileContent = JSON.stringify(backupData, null, 2);
        const file = new Blob([fileContent], { type: 'application/json' });
        
        const metadata = {
            name: `glaze_backup_${new Date().toISOString().slice(0, 10)}.json`,
            mimeType: 'application/json',
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${accessToken}` },
            body: form
        });

        const data = await res.json();
        
        if (data.id) {
            setBackupStatus('success');
            setTimeout(() => setBackupStatus('idle'), 5000);
        } else {
            console.error('Drive upload failed', data);
            setBackupStatus('error');
        }
    } catch (e) {
        console.error('Backup error:', e);
        setBackupStatus('error');
    }
  };

  const restoreDataFromDrive = async (accessToken: string) => {
    try {
        // 1. Search for latest backup file created by this app
        const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name contains 'glaze_backup_' and trashed = false&orderBy=createdTime desc&pageSize=1`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const searchData = await searchRes.json();
        
        if (!searchData.files || searchData.files.length === 0) {
            alert("No backup files found in your Drive created by this app.");
            setBackupStatus('idle');
            return;
        }

        const fileId = searchData.files[0].id;

        // 2. Download file content
        const fileRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const backup = await fileRes.json();

        // 3. Restore to LocalStorage
        if (backup.data) {
            if (backup.data.users) localStorage.setItem('GLAZE_USERS', JSON.stringify(backup.data.users));
            if (backup.data.products) localStorage.setItem('GLAZE_PRODUCTS', JSON.stringify(backup.data.products));
            if (backup.data.reviews) localStorage.setItem('GLAZE_REVIEWS', JSON.stringify(backup.data.reviews));
            
            setBackupStatus('success-restore');
            // Reload page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            throw new Error("Invalid backup format");
        }
    } catch (e) {
        console.error("Restore failed", e);
        alert("Failed to restore data. See console for details.");
        setBackupStatus('error');
    }
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
              
              <div className="md:col-span-2 p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input type="text" required value={editingProduct.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border" />
                   </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input type="number" required value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border" />
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shade Name</label>
                    <input type="text" required value={editingProduct.shade || ''} onChange={e => setEditingProduct({...editingProduct, shade: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border" />
                   </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shade Color (Hex)</label>
                    <div className="flex gap-3">
                      <input type="color" value={editingProduct.hex || '#000000'} onChange={e => setEditingProduct({...editingProduct, hex: e.target.value})} className="h-10 w-10 rounded p-1 border border-gray-300" />
                      <input type="text" value={editingProduct.hex || ''} onChange={e => setEditingProduct({...editingProduct, hex: e.target.value})} className="flex-1 rounded-lg border-gray-300 shadow-sm p-2.5 border" />
                    </div>
                   </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={4} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full rounded-lg border-gray-300 shadow-sm p-2.5 border" />
                 </div>
                 <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button type="submit" className="flex items-center px-6 py-3 text-white bg-black rounded-full hover:bg-gray-900"><Save className="w-4 h-4 mr-2" />Save Product</button>
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
                  </div>

                  {/* Payment Settings */}
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <h3 className="text-md font-bold text-gray-900">Payment Settings</h3>
                    </div>
                    
                    {/* IntaSend REAL Payment Config */}
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="w-full">
                                <h4 className="font-bold text-sm text-green-900 mb-2">Enable Real MPesa & Card Payments</h4>
                                <p className="text-xs text-green-800 mb-3">
                                    To process real payments, create an account at <a href="https://intasend.com" target="_blank" className="underline font-bold">IntaSend.com</a> and get your Publishable Key.
                                </p>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-green-900 mb-1">IntaSend Public Key</label>
                                        <input
                                            type="text"
                                            value={intaSendKey}
                                            onChange={(e) => setIntaSendKey(e.target.value)}
                                            placeholder="ISPubKey_Live_..."
                                            className="w-full rounded border-green-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-xs p-2"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="live-mode"
                                            type="checkbox"
                                            checked={intaSendLive}
                                            onChange={(e) => setIntaSendLive(e.target.checked)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="live-mode" className="ml-2 block text-xs text-green-900">
                                            Enable Live Mode (Uncheck for Test Mode)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 opacity-80">
                        {/* PayPal */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">PayPal Business Email</label>
                            <input
                            type="email"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="your-business-email@example.com"
                            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 p-3 border text-sm"
                            />
                        </div>

                        {/* MPesa Manual Info (Fallback) */}
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-2">MPesa Paybill (Simulation Info)</label>
                             <div className="flex gap-2">
                                <input
                                type="text"
                                value={mpesaBusinessNumber}
                                onChange={(e) => setMpesaBusinessNumber(e.target.value)}
                                placeholder="e.g. 123456"
                                className="w-full flex-1 rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 p-3 border text-sm"
                                />
                                <select 
                                  value={mpesaType}
                                  onChange={(e) => setMpesaType(e.target.value)}
                                  className="rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border text-sm px-2"
                                >
                                    <option value="PAYBILL">Paybill</option>
                                    <option value="BUY_GOODS">Buy Goods</option>
                                </select>
                             </div>
                        </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-gray-100 mt-6">
                     {showSaveMessage ? (
                       <span className="text-green-600 font-medium text-sm flex items-center">
                         <Save className="w-4 h-4 mr-1" /> Settings Saved!
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
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;