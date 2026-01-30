import { motion } from 'framer-motion';

const ModernProductCard = ({ 
  product, 
  onAddToCart, 
  className = '',
  variant = 'default'
}) => {
  const variants = {
    default: 'modern-card hover:scale-105',
    featured: 'modern-card border-2 border-blue-500 hover:scale-105',
    compact: 'modern-card p-4 hover:scale-102'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={`${variants[variant]} ${className} group`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <div className="aspect-video bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
          <div className="text-4xl text-white/80">🔐</div>
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-black/70 backdrop-blur-sm text-green-400 px-2 py-1 rounded text-xs font-semibold">
            ${product.price}
          </div>
        </div>
        {product.featured && (
          <div className="absolute top-3 left-3">
            <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
              FEATURED
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Rating & Downloads */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span className="text-gray-300">{product.rating}</span>
          </div>
          <div className="text-gray-400">
            {product.downloads} downloads
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded text-xs">
            {product.category}
          </span>
          {product.tags?.map((tag, index) => (
            <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onAddToCart(product)}
            className="modern-button flex-1 text-sm"
          >
            Add to Cart
          </button>
          <button className="modern-button bg-gray-800 hover:bg-gray-700 px-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const ModernStats = ({ stats }) => {
  return (
    <div className="modern-grid max-w-4xl mx-auto">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="modern-card text-center"
        >
          <div className="text-3xl font-bold gradient-text mb-2">
            {stat.value}
          </div>
          <div className="text-gray-400 text-sm">
            {stat.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const ModernFeatures = ({ features }) => {
  return (
    <div className="modern-grid">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="modern-card text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4">
            <feature.icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {feature.title}
          </h3>
          <p className="text-gray-400 text-sm">
            {feature.description}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

const ModernHero = ({ children, className = '' }) => {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className={`relative min-h-screen flex items-center ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/20 to-purple-900/30 pointer-events-none" />
      <div className="relative z-10 w-full">
        {children}
      </div>
    </motion.section>
  );
};

export {
  ModernProductCard,
  ModernStats,
  ModernFeatures,
  ModernHero
};