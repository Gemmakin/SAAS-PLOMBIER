import React, { useState, useEffect } from 'react';
import { FileText, Receipt, LayoutDashboard, LogOut, Settings, Plus, Eye, Download } from 'lucide-react';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showPreview, setShowPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  
  const [userProfile, setUserProfile] = useState({
    companyName: '',
    logo: '',
    address: '',
    phone: '',
    email: '',
    siret: ''
  });

  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [newDoc, setNewDoc] = useState({
    type: 'quote',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    date: new Date().toISOString().split('T')[0],
    validUntil: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('entrepreneurApp');
    if (saved) {
      const data = JSON.parse(saved);
      setUserProfile(data.profile || userProfile);
      setQuotes(data.quotes || []);
      setInvoices(data.invoices || []);
      setIsLoggedIn(data.isLoggedIn || false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('entrepreneurApp', JSON.stringify({
        profile: userProfile,
        quotes,
        invoices,
        isLoggedIn
      }));
    }
  }, [userProfile, quotes, invoices, isLoggedIn]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('dashboard');
  };

  const handleProfileUpdate = (field, value) => {
    if (field === 'logo' && value.startsWith('data:image')) {
      setUserProfile({ ...userProfile, [field]: value });
    } else if (field !== 'logo') {
      setUserProfile({ ...userProfile, [field]: value });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileUpdate('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    setNewDoc({
      ...newDoc,
      items: [...newDoc.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const items = [...newDoc.items];
    items[index][field] = value;
    setNewDoc({ ...newDoc, items });
  };

  const removeItem = (index) => {
    const items = newDoc.items.filter((_, i) => i !== index);
    setNewDoc({ ...newDoc, items });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const saveDocument = () => {
    const doc = {
      ...newDoc,
      id: Date.now(),
      number: newDoc.type === 'quote' ? `DEV-${quotes.length + 1}` : `FACT-${invoices.length + 1}`,
      total: calculateTotal(newDoc.items)
    };

    if (newDoc.type === 'quote') {
      setQuotes([...quotes, doc]);
    } else {
      setInvoices([...invoices, doc]);
    }

    setNewDoc({
      type: 'quote',
      clientName: '',
      clientAddress: '',
      clientEmail: '',
      items: [{ description: '', quantity: 1, price: 0 }],
      date: new Date().toISOString().split('T')[0],
      validUntil: ''
    });
    setCurrentView('dashboard');
  };

  const previewDocument = (doc) => {
    setPreviewDoc(doc);
    setShowPreview(true);
  };

  const downloadPDF = () => {
    window.print();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion Pro</h1>
            <p className="text-gray-600">Devis & Factures</p>
          </div>
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPreview && previewDoc) {
    const total = calculateTotal(previewDoc.items);
    const tva = total * 0.2;
    const totalTTC = total + tva;

    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between mb-4 print:hidden">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retour
            </button>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download size={18} />
              Télécharger PDF
            </button>
          </div>

          <div className="bg-white p-12 shadow-lg">
            <div className="flex justify-between items-start mb-12">
              <div>
                {userProfile.logo && (
                  <img src={userProfile.logo} alt="Logo" className="h-20 mb-4" />
                )}
                <h2 className="text-2xl font-bold text-gray-800">{userProfile.companyName}</h2>
                <p className="text-gray-600 text-sm mt-2">{userProfile.address}</p>
                <p className="text-gray-600 text-sm">{userProfile.phone}</p>
                <p className="text-gray-600 text-sm">{userProfile.email}</p>
                <p className="text-gray-600 text-sm">SIRET: {userProfile.siret}</p>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">
                  {previewDoc.type === 'quote' ? 'DEVIS' : 'FACTURE'}
                </h1>
                <p className="text-gray-600">N° {previewDoc.number}</p>
                <p className="text-gray-600">Date: {new Date(previewDoc.date).toLocaleDateString('fr-FR')}</p>
                {previewDoc.validUntil && (
                  <p className="text-gray-600">Valable jusqu'au: {new Date(previewDoc.validUntil).toLocaleDateString('fr-FR')}</p>
                )}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Client</h3>
              <div className="bg-gray-50 p-4 rounded">
                <p className="font-semibold">{previewDoc.clientName}</p>
                <p className="text-gray-600 text-sm">{previewDoc.clientAddress}</p>
                <p className="text-gray-600 text-sm">{previewDoc.clientEmail}</p>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="text-left p-3">Description</th>
                  <th className="text-center p-3">Quantité</th>
                  <th className="text-right p-3">Prix unitaire</th>
                  <th className="text-right p-3">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {previewDoc.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-3">{item.description}</td>
                    <td className="text-center p-3">{item.quantity}</td>
                    <td className="text-right p-3">{item.price.toFixed(2)} €</td>
                    <td className="text-right p-3">{(item.quantity * item.price).toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">Total HT:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-semibold">TVA (20%):</span>
                  <span>{tva.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 px-3 mt-2 rounded">
                  <span className="font-bold text-lg">Total TTC:</span>
                  <span className="font-bold text-lg text-blue-600">{totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {previewDoc.type === 'quote' && (
              <div className="mt-12 text-sm text-gray-600">
                <p>Ce devis est valable jusqu'au {new Date(previewDoc.validUntil).toLocaleDateString('fr-FR')}.</p>
                <p className="mt-2">En cas d'acceptation, merci de nous retourner ce devis signé avec la mention "Bon pour accord".</p>
              </div>
            )}

            {previewDoc.type === 'invoice' && (
              <div className="mt-12 text-sm text-gray-600">
                <p className="font-semibold">Conditions de paiement: 30 jours</p>
                <p className="mt-2">En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Gestion Pro</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  currentView === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings size={20} />
                Paramètres
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={20} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'dashboard' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Devis</p>
                    <p className="text-3xl font-bold text-blue-600">{quotes.length}</p>
                  </div>
                  <FileText size={40} className="text-blue-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Factures</p>
                    <p className="text-3xl font-bold text-green-600">{invoices.length}</p>
                  </div>
                  <Receipt size={40} className="text-green-600" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div>
                  <p className="text-gray-600 text-sm">Chiffre d'affaires</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {invoices.reduce((sum, inv) => sum + inv.total, 0).toFixed(2)} €
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => {
                  setNewDoc({ ...newDoc, type: 'quote' });
                  setCurrentView('newDoc');
                }}
                className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition flex items-center justify-center gap-3"
              >
                <Plus size={24} />
                <span className="text-xl font-semibold">Créer un Devis</span>
              </button>
              <button
                onClick={() => {
                  setNewDoc({ ...newDoc, type: 'invoice' });
                  setCurrentView('newDoc');
                }}
                className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition flex items-center justify-center gap-3"
              >
                <Plus size={24} />
                <span className="text-xl font-semibold">Créer une Facture</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Derniers Devis</h2>
                {quotes.length === 0 ? (
                  <p className="text-gray-500">Aucun devis</p>
                ) : (
                  <div className="space-y-2">
                    {quotes.slice(-5).reverse().map((quote) => (
                      <div key={quote.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                        <div>
                          <p className="font-semibold">{quote.number}</p>
                          <p className="text-sm text-gray-600">{quote.clientName}</p>
                        </div>
                        <button
                          onClick={() => previewDocument(quote)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Dernières Factures</h2>
                {invoices.length === 0 ? (
                  <p className="text-gray-500">Aucune facture</p>
                ) : (
                  <div className="space-y-2">
                    {invoices.slice(-5).reverse().map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center p-3 bg-gray-50 rounded hover:bg-gray-100">
                        <div>
                          <p className="font-semibold">{invoice.number}</p>
                          <p className="text-sm text-gray-600">{invoice.clientName}</p>
                        </div>
                        <button
                          onClick={() => previewDocument(invoice)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'settings' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Paramètres de l'entreprise</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de l'entreprise</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {userProfile.logo && (
                  <img src={userProfile.logo} alt="Logo" className="mt-4 h-20" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={userProfile.companyName}
                  onChange={(e) => handleProfileUpdate('companyName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mon Entreprise SARL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={userProfile.address}
                  onChange={(e) => handleProfileUpdate('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Rue de la Paix, 75001 Paris"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={userProfile.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="01 23 45 67 89"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={userProfile.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="contact@monentreprise.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
                <input
                  type="text"
                  value={userProfile.siret}
                  onChange={(e) => handleProfileUpdate('siret', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 456 789 00010"
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'newDoc' && (
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Créer {newDoc.type === 'quote' ? 'un Devis' : 'une Facture'}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
                  <input
                    type="text"
                    value={newDoc.clientName}
                    onChange={(e) => setNewDoc({ ...newDoc, clientName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nom du client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email du client</label>
                  <input
                    type="email"
                    value={newDoc.clientEmail}
                    onChange={(e) => setNewDoc({ ...newDoc, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="client@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse du client</label>
                <input
                  type="text"
                  value={newDoc.clientAddress}
                  onChange={(e) => setNewDoc({ ...newDoc, clientAddress: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse complète"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={newDoc.date}
                    onChange={(e) => setNewDoc({ ...newDoc, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {newDoc.type === 'quote' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valable jusqu'au</label>
                    <input
                      type="date"
                      value={newDoc.validUntil}
                      onChange={(e) => setNewDoc({ ...newDoc, validUntil: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Articles / Services</h3>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>
                {newDoc.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 mb-4 items-end">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Description du service"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix unitaire (€)</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        onClick={() => removeItem(index)}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Annuler
                </button>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    Total: {calculateTotal(newDoc.items).toFixed(2)} € HT
                  </p>
                  <p className="text-sm text-gray-600">
                    TTC: {(calculateTotal(newDoc.items) * 1.2).toFixed(2)} €
                  </p>
                </div>
                <button
                  onClick={saveDocument}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;