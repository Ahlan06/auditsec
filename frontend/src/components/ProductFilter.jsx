import { Filter, X } from 'lucide-react';

const ProductFilter = ({ categories, selectedCategory, onCategoryChange }) => {
  const priceRanges = [
    { id: 'all', name: 'All Prices', min: 0, max: Infinity },
    { id: 'under-25', name: 'Under €25', min: 0, max: 25 },
    { id: '25-50', name: '€25 - €50', min: 25, max: 50 },
    { id: '50-100', name: '€50 - €100', min: 50, max: 100 },
    { id: 'over-100', name: 'Over €100', min: 100, max: Infinity }
  ];

  const productTypes = [
    { id: 'script', name: 'Scripts', icon: '📜' },
    { id: 'tool', name: 'Tools', icon: '🔧' },
    { id: 'pack', name: 'Tool Packs', icon: '📦' },
    { id: 'pdf', name: 'PDF Guides', icon: '📚' },
    { id: 'video', name: 'Videos', icon: '🎥' },
    { id: 'course', name: 'Courses', icon: '🎓' }
  ];

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="cyber-card p-4">
        <h3 className="flex items-center text-cyber-green font-bold font-mono mb-4">
          <Filter className="w-4 h-4 mr-2" />
          Categories
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left px-3 py-2 rounded transition-all duration-300 font-mono text-sm ${
                selectedCategory === category.id
                  ? 'bg-cyber-green text-black font-bold'
                  : 'text-gray-400 hover:text-cyber-green hover:bg-cyber-green/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{category.name}</span>
                <span className="text-xs opacity-70">
                  {category.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Product Types */}
      <div className="cyber-card p-4">
        <h3 className="text-cyber-green font-bold font-mono mb-4">
          Product Types
        </h3>
        <div className="space-y-2">
          {productTypes.map((type) => (
            <label
              key={type.id}
              className="flex items-center space-x-3 cursor-pointer text-gray-400 hover:text-cyber-green transition-colors font-mono text-sm"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-cyber-green bg-transparent border-cyber-green rounded focus:ring-cyber-green focus:ring-2"
              />
              <span className="text-lg">{type.icon}</span>
              <span>{type.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="cyber-card p-4">
        <h3 className="text-cyber-green font-bold font-mono mb-4">
          Price Range
        </h3>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.id}
              className="flex items-center space-x-3 cursor-pointer text-gray-400 hover:text-cyber-green transition-colors font-mono text-sm"
            >
              <input
                type="radio"
                name="priceRange"
                className="w-4 h-4 text-cyber-green bg-transparent border-cyber-green focus:ring-cyber-green focus:ring-2"
                defaultChecked={range.id === 'all'}
              />
              <span>{range.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="cyber-card p-4">
        <h3 className="text-cyber-green font-bold font-mono mb-4">
          Features
        </h3>
        <div className="space-y-2">
          {[
            { id: 'featured', name: 'Featured Products', icon: '⭐' },
            { id: 'new', name: 'New Releases', icon: '🆕' },
            { id: 'popular', name: 'Most Popular', icon: '🔥' },
            { id: 'updated', name: 'Recently Updated', icon: '🔄' }
          ].map((feature) => (
            <label
              key={feature.id}
              className="flex items-center space-x-3 cursor-pointer text-gray-400 hover:text-cyber-green transition-colors font-mono text-sm"
            >
              <input
                type="checkbox"
                className="w-4 h-4 text-cyber-green bg-transparent border-cyber-green rounded focus:ring-cyber-green focus:ring-2"
              />
              <span className="text-lg">{feature.icon}</span>
              <span>{feature.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <button className="w-full cyber-btn flex items-center justify-center">
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </button>

      {/* Featured Info Box */}
      <div className="cyber-card p-4 border-cyber-blue">
        <h4 className="text-cyber-blue font-bold font-mono mb-2 text-sm">
          💡 Pro Tip
        </h4>
        <p className="text-gray-400 text-xs font-mono leading-relaxed">
          All our tools come with detailed documentation and 
          are regularly updated to ensure compatibility with 
          the latest security frameworks.
        </p>
      </div>
    </div>
  );
};

export default ProductFilter;