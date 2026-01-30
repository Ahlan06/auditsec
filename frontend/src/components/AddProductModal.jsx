import { useState } from 'react';
import { X, Upload, Save, Package } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onProductAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    longDescription: '',
    price: '',
    category: 'tools',
    type: 'script',
    tags: '',
    featured: false,
    fileUrl: '',
    fileSize: '',
    // Champs spéciaux pour les comptes
    serviceName: '',
    accountType: '',
    validity: '',
    region: 'Global',
    features: ''
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'tools', label: 'Tools' },
    { value: 'formation', label: 'Formation' },
    { value: 'database', label: 'Database' },
    { value: 'comptes', label: 'Comptes' }
  ];

  const types = [
    { value: 'script', label: 'Script' },
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Video' },
    { value: 'pack', label: 'Pack' },
    { value: 'tool', label: 'Tool' },
    { value: 'course', label: 'Course' },
    { value: 'account', label: 'Account' },
    { value: 'database', label: 'Database' },
    { value: 'wordlist', label: 'Wordlist' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulation d'ajout de produit
    setTimeout(() => {
      const newProduct = {
        id: Date.now(),
        ...formData,
        price: parseFloat(formData.price),
        tags: formData.tags.split(',').map(tag => tag.trim()),
        features: formData.features.split(',').map(feature => feature.trim()),
        created: new Date().toISOString().split('T')[0],
        status: 'active',
        sales: 0
      };

      onProductAdd(newProduct);
      onClose();
      setLoading(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        longDescription: '',
        price: '',
        category: 'tools',
        type: 'script',
        tags: '',
        featured: false,
        fileUrl: '',
        fileSize: '',
        serviceName: '',
        accountType: '',
        validity: '',
        region: 'Global',
        features: ''
      });
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass glow-box rounded-lg border border-green-400/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-green-400 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
              Ajouter un Nouveau Produit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-400 border-b border-green-400/20 pb-2">
                Informations de Base
              </h3>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Nom du produit *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                  placeholder="Ex: Advanced Nmap Scripts Pack"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Description courte *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                  placeholder="Description courte du produit"
                  required
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Description longue</label>
                <textarea
                  name="longDescription"
                  value={formData.longDescription}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                  placeholder="Description détaillée du produit"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-green-400 font-mono mb-2 text-sm">Prix (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                    placeholder="19.99"
                    required
                  />
                </div>
                <div>
                  <label className="block text-green-400 font-mono mb-2 text-sm">Taille fichier</label>
                  <input
                    type="text"
                    name="fileSize"
                    value={formData.fileSize}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                    placeholder="45 MB"
                  />
                </div>
              </div>
            </div>

            {/* Catégorie et Type */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-green-400 border-b border-green-400/20 pb-2">
                Catégorisation
              </h3>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Catégorie *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 focus:outline-none focus:border-green-400"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value} className="bg-black text-green-400">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 focus:outline-none focus:border-green-400"
                  required
                >
                  {types.map(type => (
                    <option key={type.value} value={type.value} className="bg-black text-green-400">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                  placeholder="nmap, reconnaissance, automation"
                />
              </div>

              <div>
                <label className="block text-green-400 font-mono mb-2 text-sm">URL du fichier *</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    name="fileUrl"
                    value={formData.fileUrl}
                    onChange={handleInputChange}
                    className="flex-1 glass bg-black/30 border border-green-400/30 rounded px-4 py-2 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400"
                    placeholder="https://aws.s3.bucket/file.zip"
                    required
                  />
                  <button
                    type="button"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-green-400 bg-transparent border-green-400 rounded focus:ring-green-400"
                />
                <label htmlFor="featured" className="text-green-400 font-mono text-sm">
                  Produit en vedette
                </label>
              </div>
            </div>
          </div>

          {/* Champs spéciaux pour les comptes */}
          {formData.category === 'comptes' && (
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">
                Informations Spécifiques aux Comptes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-yellow-400 font-mono mb-2 text-sm">Nom du service</label>
                  <input
                    type="text"
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    placeholder="Spotify, Netflix, etc."
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-mono mb-2 text-sm">Type de compte</label>
                  <input
                    type="text"
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    placeholder="Premium, Premium 4K, etc."
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-mono mb-2 text-sm">Validité</label>
                  <input
                    type="text"
                    name="validity"
                    value={formData.validity}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    placeholder="12 mois, 6 mois, etc."
                  />
                </div>
                <div>
                  <label className="block text-yellow-400 font-mono mb-2 text-sm">Région</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    placeholder="Global, EU, US, etc."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-yellow-400 font-mono mb-2 text-sm">Fonctionnalités (séparées par des virgules)</label>
                  <input
                    type="text"
                    name="features"
                    value={formData.features}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-yellow-400/30 rounded px-4 py-2 text-yellow-400 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                    placeholder="Sans publicité, Qualité haute définition, Téléchargement offline"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-400 border border-gray-600 rounded hover:text-white hover:border-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded font-bold transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Ajout en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Ajouter le produit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;