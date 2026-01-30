import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, Search, SortAsc } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductFilter from '../components/ProductFilter';
import useAppStore from '../store/appStore';
import { productsAPI } from '../services/api';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const {
    products,
    getFilteredProducts,
    setProducts,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    isLoading,
    setLoading
  } = useAppStore();

  const filteredProducts = getFilteredProducts();

  // Initialize from URL params
  useEffect(() => {
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (category) setSelectedCategory(category);
    if (search) setSearchQuery(search);
    if (sort) setSortBy(sort);
  }, [searchParams, setSelectedCategory, setSearchQuery, setSortBy]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true, 'Loading products...');
      
      try {
        const response = await productsAPI.getAllProducts();
        setProducts(response.products || []);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [setProducts, setLoading]);

  const categories = [
    { id: 'all', name: 'All Categories', count: filteredProducts.length },
    { id: 'pentest', name: 'Pentest Tools', count: products.filter(p => p.category === 'pentest').length },
    { id: 'osint', name: 'OSINT', count: products.filter(p => p.category === 'osint').length },
    { id: 'guides', name: 'Guides & PDFs', count: products.filter(p => p.category === 'guides').length },
    { id: 'videos', name: 'Video Training', count: products.filter(p => p.category === 'videos').length },
    { id: 'tools', name: 'Security Tools', count: products.filter(p => p.category === 'tools').length }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'price-asc', name: 'Price: Low to High' },
    { id: 'price-desc', name: 'Price: High to Low' },
    { id: 'name', name: 'Name (A-Z)' }
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === 'all') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
  };

  const handleSortChange = (sort) => {
    setSortBy(sort);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', sort);
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-cyber-green font-mono">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-cyber-green font-cyber mb-4">
            Security Arsenal
          </h1>
          <p className="text-gray-400 font-mono">
            Professional-grade tools for ethical hackers and security researchers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search tools and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input w-full pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-green" />
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`cyber-btn px-4 py-2 ${showFilters ? 'bg-cyber-green text-black' : ''}`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="cyber-input"
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id} className="bg-cyber-gray">
                    {option.name}
                  </option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex border border-cyber-green rounded">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-cyber-green text-black' : 'text-cyber-green'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-cyber-green text-black' : 'text-cyber-green'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className={`${showFilters ? 'block' : 'hidden lg:block'} w-full lg:w-64 flex-shrink-0`}>
            <ProductFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-400 mb-2 font-mono">
                  No products found
                </h3>
                <p className="text-gray-500 font-mono">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-gray-400 font-mono">
                    Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Products */}
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;