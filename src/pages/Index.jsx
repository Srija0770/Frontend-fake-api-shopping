import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: 'default'
  });
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // Define all available categories
  const categories = [
    { id: 'all', label: 'All Products' },
    { id: "men's clothing", label: "Men's Clothing" },
    { id: "women's clothing", label: "Women's Clothing" },
    { id: 'jewelery', label: 'Jewelery' },
    { id: 'electronics', label: 'Electronics' },
    { id: 'cakes', label: 'Cakes' }
  ];

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      console.log('Loaded cart from localStorage:', savedCart); // Debug log
      setCart(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Initial fetch of all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        console.log('Fetching initial products...');
        const response = await fetch('https://backend-fake-api-shopping.onrender.com/api/products');
        const data = await response.json();
        console.log('Initial products API response:', data);
        
        let productsArray;
        if (data.success && data.product) {
          productsArray = data.product;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          console.error('Unexpected API response format:', data);
          return;
        }
        
        console.log('Number of products fetched:', productsArray.length);
        console.log('Categories in initial fetch:', [...new Set(productsArray.map(p => p.category))]);
        
        const productsWithIds = productsArray.map(product => ({
          ...product,
          id: product._id || product.id
        }));
        
        // Calculate initial price range
        const prices = productsWithIds.map(p => p.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        console.log(`Initial price range: ${minPrice} - ${maxPrice}`);
        
        // Update both products and filters
        setProducts(productsWithIds);
        setFiltered(productsWithIds);
        setFilters(prev => ({
          ...prev,
          priceRange: { min: minPrice, max: maxPrice }
        }));
        
        // Log any cake products specifically
        const cakeProducts = productsWithIds.filter(p => p.category === 'cakes');
        console.log('Cake products in initial fetch:', cakeProducts);
      } catch (error) {
        console.error('Error fetching initial products:', error);
      }
    };

    fetchAllProducts();
  }, []); // Empty dependency array for initial fetch

  // Fetch products when category changes
  useEffect(() => {
    if (activeCategory === 'all') {
      // For 'all' category, we already have the products from initial fetch
      return;
    }

    const fetchProductsByCategory = async () => {
      try {
        const url = `https://backend-fake-api-shopping.onrender.com/api/products/category/${activeCategory}`;
        console.log('Fetching products from:', url);
        
        const response = await fetch(url);
        const data = await response.json();
        console.log(`Raw API response for category ${activeCategory}:`, data);
        
        let productsArray;
        if (data.success && data.product) {
          productsArray = data.product;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          console.error('Unexpected API response format:', data);
          return;
        }
        
        console.log(`Processed products array for ${activeCategory}:`, productsArray);
        
        const productsWithIds = productsArray.map(product => ({
          ...product,
          id: product._id || product.id
        }));
        
        console.log(`Final processed products for ${activeCategory}:`, productsWithIds);
        setProducts(productsWithIds);
        setFiltered(productsWithIds);
      } catch (error) {
        console.error(`Error fetching products for category ${activeCategory}:`, error);
      }
    };

    fetchProductsByCategory();
  }, [activeCategory]); // Now this is safe because activeCategory is always initialized

  // Simplified filtering approach
  useEffect(() => {
    console.log('Current filters:', filters);
    console.log('Current products:', products);
    
    let result = [...products];
    
    // Price range filter
    const beforePrice = result.length;
    result = result.filter(p => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max);
    console.log(`Price filter: ${beforePrice} -> ${result.length} products`);
    
    // Rating filter
    if (filters.rating > 0) {
      const beforeRating = result.length;
      result = result.filter(p => p.rating?.rate >= filters.rating);
      console.log(`Rating filter: ${beforeRating} -> ${result.length} products`);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const beforeSearch = result.length;
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
      console.log(`Search filter: ${beforeSearch} -> ${result.length} products`);
    }
    
    // Sorting
    if (filters.sortBy !== 'default') {
      switch (filters.sortBy) {
        case 'price-low-high':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-high-low':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
          break;
      }
    }
    
    console.log('Final filtered products:', result);
    setFiltered(result);
  }, [products, filters, searchQuery]);

  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product); // Debug log
    
    setCart(prevCart => {
      // Ensure product has a unique id
      const productId = product._id || product.id;
      if (!productId) {
        console.error('Product has no ID:', product);
        return prevCart;
      }

      const existingItem = prevCart.find(item => item.id === productId);
      let newCart;
      
      if (existingItem) {
        // If item exists, increase quantity
        newCart = prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // If item doesn't exist, add it with quantity 1
        newCart = [...prevCart, { 
          ...product, 
          id: productId,
          quantity: 1 
        }];
      }
      
      console.log('New cart state:', newCart); // Debug log
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleFilterChange = (filterType, value) => {
    console.log('Filter change:', filterType, value);
    
    if (filterType === 'category') {
      // When changing category, first fetch the products
      const fetchAndUpdateFilters = async () => {
        try {
          let productsArray;
          
          if (value === 'all') {
            // For 'all' category, fetch all products
            const response = await fetch('https://backend-fake-api-shopping.onrender.com/api/products');
            const data = await response.json();
            console.log('All products response:', data);
            
            if (data.success && data.product) {
              productsArray = data.product;
            } else if (Array.isArray(data)) {
              productsArray = data;
            } else {
              console.error('Unexpected API response format:', data);
              return;
            }
          } else {
            // For specific categories, fetch by category
            const response = await fetch(`https://backend-fake-api-shopping.onrender.com/api/products/category/${value}`);
            const data = await response.json();
            console.log(`Category ${value} response:`, data);
            
            if (data.success && data.product) {
              productsArray = data.product;
            } else if (Array.isArray(data)) {
              productsArray = data;
            } else {
              console.error('Unexpected API response format:', data);
              return;
            }
          }

          // Calculate min and max prices for the products
          const prices = productsArray.map(p => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          
          console.log(`Price range for ${value}: ${minPrice} - ${maxPrice}`);
          console.log(`Number of products for ${value}:`, productsArray.length);

          // Update filters with new price range
          setFilters({
            category: value,
            priceRange: { 
              min: minPrice,
              max: maxPrice
            },
            rating: 0,
            sortBy: 'default'
          });
          
          // Update products and filtered products
          const productsWithIds = productsArray.map(product => ({
            ...product,
            id: product._id || product.id
          }));
          
          setProducts(productsWithIds);
          setFiltered(productsWithIds);
          setActiveCategory(value);
          setSearchQuery(''); // Clear search when changing category
        } catch (error) {
          console.error(`Error fetching products for category ${value}:`, error);
        }
      };

      fetchAndUpdateFilters();
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
    }
  };

  const resetFilters = () => {
    // When resetting, fetch all products to get the global price range
    const fetchAndResetFilters = async () => {
      try {
        const response = await fetch('https://backend-fake-api-shopping.onrender.com/api/products');
        const data = await response.json();
        
        let productsArray;
        if (data.success && data.product) {
          productsArray = data.product;
        } else if (Array.isArray(data)) {
          productsArray = data;
        } else {
          console.error('Unexpected API response format:', data);
          return;
        }

        // Calculate global min and max prices
        const prices = productsArray.map(p => p.price);
        const minPrice = Math.floor(Math.min(...prices));
        const maxPrice = Math.ceil(Math.max(...prices));
        
        console.log(`Global price range: ${minPrice} - ${maxPrice}`);

        setFilters({
          category: 'all',
          priceRange: { 
            min: minPrice,
            max: maxPrice
          },
          rating: 0,
          sortBy: 'default'
        });
        
        setActiveCategory('all');
        setSearchQuery('');
      } catch (error) {
        console.error('Error fetching products for reset:', error);
      }
    };

    fetchAndResetFilters();
  };

  const goToCartPage = () => {
    navigate('/cart');
  };

  // Debug log for render
  console.log('Current state:', {
    productsCount: products.length,
    filteredCount: filtered.length,
    activeCategory: activeCategory,
    filters: filters,
    searchQuery: searchQuery
  });

  return (
    <>
      <Navbar 
        user={user} 
        cartCount={cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} 
        onCartClick={goToCartPage} 
      />
      
      <div className="home-container">
        <div className="search-filter-container">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="clear-search-button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          
          <button 
            className="filter-toggle-button"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filters-section">
              <h3>Sort By</h3>
              <select 
                className="filter-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <option value="default">Default</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Rating</option>
              </select>
            </div>

            <div className="filters-section">
              <h3>Price Range</h3>
              <div className="price-range-inputs">
                <input
                  type="number"
                  className="price-input"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  className="price-input"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handleFilterChange('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                  min="0"
                />
              </div>
            </div>

            <div className="filters-section">
              <h3>Rating</h3>
              <div className="rating-buttons">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    className={`rating-button ${filters.rating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rating', rating)}
                  >
                    {rating}★ & Up
                  </button>
                ))}
              </div>
            </div>

            <button 
              className="reset-filters-button"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-button ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleFilterChange('category', category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filtered.length === 0 ? (
            <div className="no-products">
              <p>
                {searchQuery 
                  ? `No products found matching "${searchQuery}"`
                  : 'No products found with the current filters.'}
              </p>
            </div>
          ) : (
            filtered.map((product) => (
              <div key={product._id || product.id} className="product-card">
                <h4>{product.title}</h4>
                <img src={product.image} alt={product.title} />
                <p><strong>${product.price}</strong></p>
                {product.rating && (
                  <p className="product-rating">
                    Rating: {product.rating.rate} ★ ({product.rating.count} reviews)
                  </p>
                )}
                <p style={{ fontSize: '13px', flexGrow: 1 }}>{product.description.slice(0, 60)}...</p>
                <button 
                  className="add-button" 
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Home;