import { Link } from 'react-router-dom';
import { Star, Download, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem(product);
    toast.success(`${product.name} added to cart!`, {
      icon: '🔒',
    });
  };

  const formatPrice = (price) => `€${price.toFixed(2)}`;

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Image */}
          <div className="w-full md:w-48 h-32 bg-cyber-dark rounded flex items-center justify-center flex-shrink-0">
            <img
              src={product.image || '/images/default-product.jpg'}
              alt={product.name}
              className="w-full h-full object-cover rounded"
              onError={(e) => {
                e.target.src = '/images/default-product.jpg';
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-xl font-bold text-cyber-green font-mono hover:text-cyber-blue transition-colors mb-2">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-gray-400 font-mono text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  {product.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="bg-cyber-green/10 text-cyber-green px-2 py-1 text-xs font-mono rounded border border-cyber-green/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center space-x-4 text-sm font-mono text-gray-500">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-cyber-accent fill-current mr-1" />
                    {product.rating}
                  </div>
                  <div className="flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    {product.downloads} downloads
                  </div>
                  <span className="capitalize">{product.category}</span>
                  <span>{product.fileSize}</span>
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex flex-col items-end space-y-3">
                <div className="text-right">
                  <div className="text-2xl font-bold text-cyber-blue font-mono">
                    {formatPrice(product.price)}
                  </div>
                  {product.featured && (
                    <span className="bg-cyber-accent text-black px-2 py-1 text-xs font-bold rounded">
                      FEATURED
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Link
                    to={`/product/${product.id}`}
                    className="border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black px-4 py-2 font-mono text-sm transition-all duration-300"
                  >
                    <Eye className="w-4 h-4 mr-2 inline" />
                    View
                  </Link>
                  <button
                    onClick={handleAddToCart}
                    className="cyber-btn px-4 py-2 text-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2 inline" />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="cyber-card p-6 group"
    >
      {/* Image */}
      <div className="relative aspect-video bg-cyber-dark rounded mb-4 overflow-hidden">
        <img
          src={product.image || '/images/default-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/images/default-product.jpg';
          }}
        />
        
        {product.featured && (
          <div className="absolute top-2 right-2 bg-cyber-accent text-black px-2 py-1 text-xs font-bold rounded">
            FEATURED
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/product/${product.id}`}
            className="cyber-btn"
          >
            <Eye className="w-4 h-4 mr-2" />
            Quick View
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-bold text-cyber-green font-mono hover:text-cyber-blue transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-400 font-mono text-sm line-clamp-2">
          {product.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {product.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-cyber-green/10 text-cyber-green px-2 py-1 text-xs font-mono rounded border border-cyber-green/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs font-mono text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-cyber-accent fill-current mr-1" />
              {product.rating}
            </div>
            <div className="flex items-center">
              <Download className="w-3 h-3 mr-1" />
              {product.downloads}
            </div>
          </div>
          <span className="capitalize">{product.category}</span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xl font-bold text-cyber-blue font-mono">
            {formatPrice(product.price)}
          </div>
          <button
            onClick={handleAddToCart}
            className="cyber-btn px-3 py-2 text-sm"
          >
            <ShoppingCart className="w-4 h-4 mr-1 inline" />
            Add
          </button>
        </div>

        {/* File Size */}
        <div className="text-xs text-gray-500 font-mono">
          Size: {product.fileSize}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;