import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3,
  Package,
  Users,
  Settings,
  LogOut,
  Plus,
  Edit3,
  Trash2,
  Shield,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Search,
  Filter,
  Download,
  Mail,
  MapPin,
  CreditCard,
  Globe,
  Lock,
  Save,
  Database,
  Zap
} from 'lucide-react';
import AddProductModal from '../components/AddProductModal';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [adminUser, setAdminUser] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [products, setProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const navigate = useNavigate();

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const user = localStorage.getItem('adminUser');
    
    if (!token || token !== 'authenticated') {
      navigate('/admin/login');
      return;
    }

    if (user) {
      setAdminUser(JSON.parse(user));
    }

    // Charger les statistiques (simulation)
    loadStats();
    loadProducts();
  }, [navigate]);

  const loadStats = () => {
    // Simulation des statistiques
    setTimeout(() => {
      setStats({
        totalProducts: 47,
        totalOrders: 234,
        totalRevenue: 12459.99,
        totalUsers: 892
      });
    }, 500);
  };

  const loadProducts = () => {
    // Simulation des produits
    setTimeout(() => {
      const mockProducts = [
        {
          id: 1,
          name: 'Advanced Nmap Scripts Pack',
          category: 'tools',
          price: 24.99,
          status: 'active',
          sales: 156,
          created: '2025-11-01'
        },
        {
          id: 2,
          name: 'Spotify Premium Account',
          category: 'comptes',
          price: 12.99,
          status: 'active',
          sales: 89,
          created: '2025-11-05'
        },
        {
          id: 3,
          name: 'Ethical Hacking Masterclass',
          category: 'formation',
          price: 89.99,
          status: 'active',
          sales: 45,
          created: '2025-10-28'
        }
      ];
      setProducts(mockProducts);
    }, 500);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'products', name: 'Produits', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'users', name: 'Utilisateurs', icon: Users },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400 matrix-bg">
      {/* Header */}
      <header className="glass border-b border-green-400/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-green-400" style={{filter: 'drop-shadow(0 0 10px currentColor)'}} />
              <div>
                <h1 className="text-2xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-400">AuditSec Administration</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {adminUser && (
                <div className="text-right">
                  <p className="text-sm text-green-400 font-mono">Connecté en tant que</p>
                  <p className="text-xs text-gray-400">{adminUser.username}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded border border-red-500/30 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : 'text-gray-400 hover:text-green-400 hover:bg-gray-900/50'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-mono">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
                  Vue d'ensemble
                </h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass glow-box p-6 rounded-lg border border-green-400/20">
                    <div className="flex items-center space-x-4">
                      <Package className="w-12 h-12 text-green-400" />
                      <div>
                        <p className="text-2xl font-bold text-green-400 neon-text">{stats.totalProducts}</p>
                        <p className="text-gray-400 text-sm">Produits</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass glow-box p-6 rounded-lg border border-blue-400/20">
                    <div className="flex items-center space-x-4">
                      <ShoppingCart className="w-12 h-12 text-blue-400" />
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{stats.totalOrders}</p>
                        <p className="text-gray-400 text-sm">Orders</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass glow-box p-6 rounded-lg border border-yellow-400/20">
                    <div className="flex items-center space-x-4">
                      <DollarSign className="w-12 h-12 text-yellow-400" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-400">€{stats.totalRevenue.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">Revenus</p>
                      </div>
                    </div>
                  </div>

                  <div className="glass glow-box p-6 rounded-lg border border-purple-400/20">
                    <div className="flex items-center space-x-4">
                      <Users className="w-12 h-12 text-purple-400" />
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{stats.totalUsers}</p>
                        <p className="text-gray-400 text-sm">Utilisateurs</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="glass glow-box p-6 rounded-lg border border-green-400/20">
                  <h3 className="text-xl font-bold text-green-400 mb-4" style={{fontFamily: 'Orbitron, monospace'}}>
                    Activité Récente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <p className="text-green-400 font-mono text-sm">New order #ZD-1731234567</p>
                        <p className="text-gray-400 text-xs">Spotify Premium Account - €12.99</p>
                      </div>
                      <span className="text-xs text-gray-500">Il y a 5 min</span>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded">
                      <Package className="w-5 h-5 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-blue-400 font-mono text-sm">Nouveau produit ajouté</p>
                        <p className="text-gray-400 text-xs">Netflix Premium 4K Account</p>
                      </div>
                      <span className="text-xs text-gray-500">Il y a 2h</span>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded">
                      <Users className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-purple-400 font-mono text-sm">Nouvel utilisateur inscrit</p>
                        <p className="text-gray-400 text-xs">user@example.com</p>
                      </div>
                      <span className="text-xs text-gray-500">Il y a 6h</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <ProductsManager 
                products={products}
                onProductUpdate={loadProducts}
                showAddProduct={showAddProduct}
                setShowAddProduct={setShowAddProduct}
                onProductAdd={(newProduct) => {
                  setProducts(prev => [...prev, newProduct]);
                  setStats(prev => ({ ...prev, totalProducts: prev.totalProducts + 1 }));
                }}
              />
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && <OrdersManager />}

            {/* Users Tab */}
            {activeTab === 'users' && <UsersManager />}

            {/* Settings Tab */}
            {activeTab === 'settings' && <SettingsManager />}
          </main>
        </div>
      </div>
    </div>
  );
};

// Composant de gestion des produits
const ProductsManager = ({ products, onProductAdd, showAddProduct, setShowAddProduct }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
          Gestion des Produits
        </h2>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center space-x-2 bg-green-400 text-black hover:bg-green-300 px-4 py-2 rounded font-bold transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter Produit</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="glass glow-box rounded-lg border border-green-400/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-green-400 font-mono">ID</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Nom</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Catégorie</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Prix</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Ventes</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Statut</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-gray-300 font-mono">#{product.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{product.name}</div>
                    <div className="text-gray-400 text-sm">Créé le {product.created}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-green-400/20 text-green-400 px-2 py-1 rounded text-xs font-mono">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-mono">€{product.price}</td>
                  <td className="px-6 py-4 text-blue-400 font-mono">{product.sales}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      product.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddProduct}
        onClose={() => setShowAddProduct(false)}
        onProductAdd={onProductAdd}
      />
    </div>
  );
};

// Orders management component
const OrdersManager = () => {
  const [orders] = useState([
    {
      id: 'ZD-1731234567',
      customer: 'john.doe@example.com',
      products: ['Spotify Premium Account'],
      total: 12.99,
      status: 'completed',
      date: '2025-11-10',
      payment: 'stripe'
    },
    {
      id: 'ZD-1731234566',
      customer: 'alice.hacker@proton.me',
      products: ['Advanced Nmap Scripts Pack', 'OSINT Toolkit'],
      total: 49.98,
      status: 'pending',
      date: '2025-11-10',
      payment: 'stripe'
    },
    {
      id: 'ZD-1731234565',
      customer: 'bob.pentest@gmail.com',
      products: ['Ethical Hacking Masterclass'],
      total: 89.99,
      status: 'completed',
      date: '2025-11-09',
      payment: 'stripe'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
          Orders Management
        </h2>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-4 py-2 rounded border border-blue-500/30 transition-all duration-300">
            <Filter className="w-4 h-4" />
            <span>Filtrer</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-400/20 text-green-400 hover:bg-green-400/30 px-4 py-2 rounded border border-green-400/30 transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass glow-box rounded-lg border border-green-400/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Order ID</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Date</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Products</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Amount</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Statut</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Date</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-blue-400 font-mono">{order.id}</td>
                  <td className="px-6 py-4 text-white">{order.customer}</td>
                  <td className="px-6 py-4">
                    {order.products.map((product, index) => (
                      <div key={index} className="text-gray-300 text-sm">
                        {product}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-yellow-400 font-mono">€{order.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      order.status === 'completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : order.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-mono">{order.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Composant de gestion des utilisateurs
const UsersManager = () => {
  const [users] = useState([
    {
      id: 1,
      email: 'john.doe@example.com',
      username: 'johndoe',
      joinDate: '2025-10-15',
      lastLogin: '2025-11-10',
      orders: 3,
      totalSpent: 142.97,
      status: 'active',
      country: 'France'
    },
    {
      id: 2,
      email: 'alice.hacker@proton.me',
      username: 'alice_h4ck3r',
      joinDate: '2025-10-20',
      lastLogin: '2025-11-09',
      orders: 5,
      totalSpent: 289.95,
      status: 'active',
      country: 'Germany'
    },
    {
      id: 3,
      email: 'bob.pentest@gmail.com',
      username: 'bob_pentest',
      joinDate: '2025-11-01',
      lastLogin: '2025-11-08',
      orders: 1,
      totalSpent: 89.99,
      status: 'active',
      country: 'Canada'
    },
    {
      id: 4,
      email: 'eve.security@outlook.com',
      username: 'eve_sec',
      joinDate: '2025-09-15',
      lastLogin: '2025-10-25',
      orders: 0,
      totalSpent: 0,
      status: 'inactive',
      country: 'USA'
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
          Users Management
        </h2>
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              className="bg-gray-900/50 border border-green-400/30 rounded pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-green-400 focus:outline-none"
            />
          </div>
          <button className="flex items-center space-x-2 bg-green-400/20 text-green-400 hover:bg-green-400/30 px-4 py-2 rounded border border-green-400/30 transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass glow-box p-4 rounded-lg border border-green-400/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400 neon-text">{users.length}</p>
            <p className="text-gray-400 text-sm">Total Utilisateurs</p>
          </div>
        </div>
        <div className="glass glow-box p-4 rounded-lg border border-blue-400/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-gray-400 text-sm">Actifs</p>
          </div>
        </div>
        <div className="glass glow-box p-4 rounded-lg border border-yellow-400/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{users.reduce((acc, u) => acc + u.orders, 0)}</p>
            <p className="text-gray-400 text-sm">Total Orders</p>
          </div>
        </div>
        <div className="glass glow-box p-4 rounded-lg border border-purple-400/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">€{users.reduce((acc, u) => acc + u.totalSpent, 0).toFixed(2)}</p>
            <p className="text-gray-400 text-sm">Revenus Total</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass glow-box rounded-lg border border-green-400/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-green-400 font-mono">ID</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Utilisateur</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Email</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Pays</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Orders</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Total Dépensé</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Dernière Connexion</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Statut</th>
                <th className="px-6 py-4 text-left text-green-400 font-mono">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-900/30">
                  <td className="px-6 py-4 text-gray-300 font-mono">#{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="text-white font-medium">{user.username}</div>
                    <div className="text-gray-400 text-sm">Inscrit le {user.joinDate}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-300">{user.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-blue-400 font-mono">{user.orders}</td>
                  <td className="px-6 py-4 text-yellow-400 font-mono">€{user.totalSpent.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-400 font-mono">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-mono ${
                      user.status === 'active' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-400 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-yellow-400 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Settings management component
const SettingsManagement = () => {
  const [settings, setSettings] = useState({
    siteName: 'AuditSec',
    siteDescription: 'E-commerce spécialisé en cybersécurité',
    currency: 'EUR',
    language: 'fr',
    timezone: 'Europe/Paris',
    stripeEnabled: true,
    stripePublicKey: 'pk_test_...',
    stripeSecretKey: '••••••••',
    emailProvider: 'SendGrid',
    emailApiKey: '••••••••',
    s3BucketName: 'auditsec-files',
    s3AccessKey: '••••••••',
    s3SecretKey: '••••••••',
    autoDelivery: true,
    downloadTokenExpiry: 24,
    maxDownloads: 5,
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save simulation
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
          Paramètres du Système
        </h2>
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-green-400 text-black hover:bg-green-300 px-6 py-2 rounded font-bold transition-all duration-300 hover:scale-105"
        >
          <Save className="w-4 h-4" />
          <span>Sauvegarder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paramètres Généraux */}
        <div className="glass glow-box p-6 rounded-lg border border-green-400/20">
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Paramètres Généraux
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom du site</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleSettingChange('siteName', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none h-20 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Devise</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Langue</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres Stripe */}
        <div className="glass glow-box p-6 rounded-lg border border-blue-400/20">
          <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Configuration Stripe
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Stripe activé</span>
              <button
                onClick={() => handleSettingChange('stripeEnabled', !settings.stripeEnabled)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.stripeEnabled ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  settings.stripeEnabled ? 'translate-x-7' : 'translate-x-1'
                } mt-1`} />
              </button>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clé publique Stripe</label>
              <input
                type="text"
                value={settings.stripePublicKey}
                onChange={(e) => handleSettingChange('stripePublicKey', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clé secrète Stripe</label>
              <input
                type="password"
                value={settings.stripeSecretKey}
                onChange={(e) => handleSettingChange('stripeSecretKey', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-400 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Paramètres Email */}
        <div className="glass glow-box p-6 rounded-lg border border-purple-400/20">
          <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Configuration Email
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Fournisseur Email</label>
              <select
                value={settings.emailProvider}
                onChange={(e) => handleSettingChange('emailProvider', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              >
                <option value="SendGrid">SendGrid</option>
                <option value="Mailgun">Mailgun</option>
                <option value="AWS SES">AWS SES</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clé API Email</label>
              <input
                type="password"
                value={settings.emailApiKey}
                onChange={(e) => handleSettingChange('emailApiKey', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Notifications email</span>
              <button
                onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                className={`w-12 h-6 rounded-full transition-all duration-300 ${
                  settings.emailNotifications ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                  settings.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                } mt-1`} />
              </button>
            </div>
          </div>
        </div>

        {/* Paramètres AWS S3 */}
        <div className="glass glow-box p-6 rounded-lg border border-yellow-400/20">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Configuration AWS S3
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nom du bucket S3</label>
              <input
                type="text"
                value={settings.s3BucketName}
                onChange={(e) => handleSettingChange('s3BucketName', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clé d'accès AWS</label>
              <input
                type="password"
                value={settings.s3AccessKey}
                onChange={(e) => handleSettingChange('s3AccessKey', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Clé secrète AWS</label>
              <input
                type="password"
                value={settings.s3SecretKey}
                onChange={(e) => handleSettingChange('s3SecretKey', e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paramètres de Livraison */}
      <div className="glass glow-box p-6 rounded-lg border border-green-400/20">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Paramètres de Livraison
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Livraison automatique</span>
            <button
              onClick={() => handleSettingChange('autoDelivery', !settings.autoDelivery)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                settings.autoDelivery ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                settings.autoDelivery ? 'translate-x-7' : 'translate-x-1'
              } mt-1`} />
            </button>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Expiration token (heures)</label>
            <input
              type="number"
              value={settings.downloadTokenExpiry}
              onChange={(e) => handleSettingChange('downloadTokenExpiry', parseInt(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Téléchargements max</label>
            <input
              type="number"
              value={settings.maxDownloads}
              onChange={(e) => handleSettingChange('maxDownloads', parseInt(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-green-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Paramètres Système */}
      <div className="glass glow-box p-6 rounded-lg border border-red-400/20">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2" />
          Paramètres Système
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-300 block">Mode maintenance</span>
              <span className="text-xs text-gray-500">Désactive l'accès public au site</span>
            </div>
            <button
              onClick={() => handleSettingChange('maintenanceMode', !settings.maintenanceMode)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                settings.maintenanceMode ? 'translate-x-7' : 'translate-x-1'
              } mt-1`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-gray-300 block">Inscriptions ouvertes</span>
              <span className="text-xs text-gray-500">Permet aux nouveaux utilisateurs de s'inscrire</span>
            </div>
            <button
              onClick={() => handleSettingChange('registrationEnabled', !settings.registrationEnabled)}
              className={`w-12 h-6 rounded-full transition-all duration-300 ${
                settings.registrationEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${
                settings.registrationEnabled ? 'translate-x-7' : 'translate-x-1'
              } mt-1`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;