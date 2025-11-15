import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Download, 
  Shield, 
  FileText,
  Tag,
  Clock,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await productsAPI.getProductById(id);
        setProduct(data.product);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🔒',
    });
  };

  const formatPrice = (price) => `€${price.toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-cyber-green font-mono">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyber-red font-mono mb-4">
            Product Not Found
          </h1>
          <Link to="/products" className="cyber-btn">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'description', name: 'Description', icon: FileText },
    { id: 'features', name: 'Features', icon: Star },
    { id: 'requirements', name: 'Requirements', icon: Shield },
    { id: 'changelog', name: 'Changelog', icon: Clock }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm font-mono mb-8">
          <Link to="/products" className="text-cyber-green hover:text-cyber-blue">
            Products
          </Link>
          <span className="text-gray-500">/</span>
          <Link 
            to={`/products?category=${product.category}`} 
            className="text-cyber-green hover:text-cyber-blue capitalize"
          >
            {product.category}
          </Link>
          <span className="text-gray-500">/</span>
          <span className="text-gray-400">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Product Images */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Main Image */}
              <div className="aspect-video bg-cyber-dark rounded-lg border border-cyber-border overflow-hidden">
                <img
                  src={product.image || '/images/default-product.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/default-product.jpg';
                  }}
                />
              </div>

              {/* Product Tabs */}
              <div className="cyber-card">
                {/* Tab Navigation */}
                <div className="border-b border-cyber-border">
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-2 border-b-2 font-mono font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-cyber-green text-cyber-green'
                            : 'border-transparent text-gray-400 hover:text-cyber-green'
                        }`}
                      >
                        <tab.icon className="w-4 h-4 inline mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'description' && (
                    <div className="space-y-4">
                      <p className="text-gray-300 font-mono leading-relaxed">
                        {product.longDescription}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                          <Download className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                          <div className="text-lg font-bold text-cyber-green">{product.downloads}</div>
                          <div className="text-xs text-gray-500">Downloads</div>
                        </div>
                        <div className="text-center">
                          <Star className="w-8 h-8 text-cyber-accent mx-auto mb-2" />
                          <div className="text-lg font-bold text-cyber-accent">{product.rating}</div>
                          <div className="text-xs text-gray-500">Rating</div>
                        </div>
                        <div className="text-center">
                          <FileText className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
                          <div className="text-lg font-bold text-cyber-blue">{product.fileSize}</div>
                          <div className="text-xs text-gray-500">File Size</div>
                        </div>
                        <div className="text-center">
                          <Users className="w-8 h-8 text-cyber-green mx-auto mb-2" />
                          <div className="text-lg font-bold text-cyber-green">1000+</div>
                          <div className="text-xs text-gray-500">Users</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'features' && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-cyber-green font-mono mb-4">
                        Key Features
                      </h3>
                      <div className="grid gap-3">
                        {product.features.map((feature, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-cyber-green/20 border border-cyber-green rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                              <div className="w-2 h-2 bg-cyber-green rounded-full"></div>
                            </div>
                            <span className="text-gray-300 font-mono text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'requirements' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-cyber-green font-mono mb-4">
                          System Requirements
                        </h3>
                        <div className="grid gap-2">
                          {product.requirements.map((req, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <Shield className="w-4 h-4 text-cyber-green" />
                              <span className="text-gray-300 font-mono text-sm">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-cyber-blue font-mono mb-4">
                          Compatible Platforms
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.compatibility.map((platform) => (
                            <span
                              key={platform}
                              className="bg-cyber-blue/10 text-cyber-blue px-3 py-1 text-sm font-mono rounded border border-cyber-blue/30"
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'changelog' && (
                    <div className="space-y-6">
                      {product.changelog.map((version, index) => (
                        <div key={index} className="border-l-2 border-cyber-green pl-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-lg font-bold text-cyber-green font-mono">
                              v{version.version}
                            </span>
                            <span className="text-gray-500 font-mono text-sm">
                              {version.date}
                            </span>
                          </div>
                          <ul className="space-y-1">
                            {version.changes.map((change, changeIndex) => (
                              <li key={changeIndex} className="text-gray-300 font-mono text-sm">
                                • {change}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Purchase Card */}
              <div className="cyber-card p-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold text-cyber-green font-mono mb-2">
                      {product.name}
                    </h1>
                    <p className="text-gray-400 font-mono text-sm">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-cyber-blue font-mono price-glow">
                      {formatPrice(product.price)}
                    </div>
                    {product.featured && (
                      <span className="bg-cyber-accent text-black px-2 py-1 text-xs font-bold rounded">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-cyber-green text-black hover:bg-cyber-blue hover:text-white transition-all duration-300 px-6 py-4 font-mono font-bold uppercase tracking-wider text-center rounded shadow-glow-green hover:shadow-glow-blue"
                  >
                    <ShoppingCart className="w-5 h-5 inline mr-2" />
                    Add to Cart
                  </button>

                  <div className="text-center text-xs text-gray-500 font-mono">
                    🔒 Instant download after purchase
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="cyber-card p-6">
                <h3 className="text-lg font-bold text-cyber-green font-mono mb-4">
                  Product Information
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="text-cyber-green capitalize">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-cyber-green capitalize">{product.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size:</span>
                    <span className="text-cyber-green">{product.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated:</span>
                    <span className="text-cyber-green">{product.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Downloads:</span>
                    <span className="text-cyber-green">{product.downloads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-cyber-accent fill-current mr-1" />
                      <span className="text-cyber-accent">{product.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="cyber-card p-6">
                <h3 className="text-lg font-bold text-cyber-green font-mono mb-4">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/products?search=${tag}`}
                      className="bg-cyber-green/10 text-cyber-green px-2 py-1 text-xs font-mono rounded border border-cyber-green/30 hover:bg-cyber-green hover:text-black transition-all"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Security Notice */}
              <div className="cyber-card p-6 border-cyber-accent">
                <h4 className="text-cyber-accent font-bold font-mono mb-2">
                  ⚠️ Security Notice
                </h4>
                <p className="text-gray-400 text-xs font-mono leading-relaxed">
                  This tool is intended for authorized security testing only. 
                  Users are responsible for compliance with all applicable laws.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;