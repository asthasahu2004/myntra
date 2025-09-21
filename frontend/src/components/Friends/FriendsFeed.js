import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaFilter, FaHeart, FaShoppingCart, FaArrowLeft, FaSync, FaTh, FaList } from 'react-icons/fa'
import axios from 'axios'

// Add at top of file 
axios.defaults.withCredentials = true;

// Utility function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const FriendsFeed = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [similarProducts, setSimilarProducts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    priceRange: { min: '', max: '' },
    sortBy: 'relevance' // relevance, price_low, price_high, newest
  })
  
  const [showFilters, setShowFilters] = useState(false)
  const [feedMetadata, setFeedMetadata] = useState(null)

  const productsPerPage = 20

  // Generate friends feed using backend API
  const generateFriendsFeed = async (contactIds) => {
    try {
      console.log('Generating friends feed for contacts:', contactIds)
      
      const token = getCookie('token') || localStorage.getItem('token')
      const response = await axios.post('/api/v1/friends/feed/generate', {
        contactIds,
        filters
      }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        withCredentials: true
      })
      
      console.log('Feed generation response:', response.data)
      return response.data.feed
    } catch (error) {
      console.error('Error generating friends feed:', error)
      throw error
    }
  }
  
  // Fetch friends feed from backend
  const fetchFriendsFeed = async (page = 1, limit = 20) => {
    try {
      const token = getCookie('token') || localStorage.getItem('token')
      const response = await axios.get('/api/v1/friends/feed', {
        params: {
          page,
          limit,
          sortBy: filters.sortBy,
          category: filters.category,
          brand: filters.brand,
          minPrice: filters.priceRange.min,
          maxPrice: filters.priceRange.max
        },
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        withCredentials: true
      })
      
      console.log('Friends feed response:', response.data)
      return response.data
    } catch (error) {
      console.error('Error fetching friends feed:', error)
      throw error
    }
  }



  // Fetch friends feed data
  useEffect(() => {
    fetchFeedData()
  }, [currentPage, filters])

  const fetchFeedData = async () => {
    try {
        setLoading(true)
        setError('')

        const selectedContactsData = JSON.parse(localStorage.getItem('selectedFriendsContacts') || '[]')
        
        if (!selectedContactsData.length) {
            setError('No friends selected. Please go back and select at least 10 friends.')
            setLoading(false)
            return
        }

        const contactIds = selectedContactsData.map(contact => contact._id)
        
        let feedData
        try {
            feedData = await fetchFriendsFeed(currentPage, productsPerPage)
        } catch (error) {
            if (error.response?.status === 404 || error.response?.data?.message?.includes('No active feed')) {
                console.log('No active feed found, generating new feed...')
                await generateFriendsFeed(contactIds)
                feedData = await fetchFriendsFeed(currentPage, productsPerPage)
            } else {
                throw error
            }
        }
        
        // Updated to match new response structure
        const { products: feedProducts, pagination, feed } = feedData
        
        if (!feedProducts || feedProducts.length === 0) {
            setError('No products found in your friends feed. Try selecting different friends.')
            setLoading(false)
            return
        }
        
        // Transform products to match expected format
        const transformedProducts = feedProducts.map(product => ({
            ...product,
            images: [], // Add default empty images array
            originalPrice: product.price * 1.2, // Simulate original price
        }))
        
        setProducts(transformedProducts)
        setTotalPages(pagination?.total || 1)
        setFeedMetadata({
            contactsCount: feed?.metadata?.totalContacts || contactIds.length,
            totalProducts: feed?.metadata?.totalProducts || 0,
            generatedAt: feed?.metadata?.generatedAt
        })
        
    } catch (err) {
        setError('Failed to load feed data. Please try again.')
        console.error('Error fetching feed:', err)
    } finally {
        setLoading(false)
    }
}



  // Fetch similar products for a specific product
  const fetchSimilarProducts = async (productId) => {
    try {
      const token = getCookie('token') || localStorage.getItem('token')
      const response = await axios.get(`/api/v1/friends/products/${productId}/similar`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        withCredentials: true
      })
      const similar = response.data.products || []
      
      setSimilarProducts(prev => ({
        ...prev,
        [productId]: similar
      }))
    } catch (err) {
      console.error('Error fetching similar products:', err)
    }
  }

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setCurrentPage(1) // Reset to first page when filtering
  }

  // Handle price range filter
  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }))
    setCurrentPage(1)
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      priceRange: { min: '', max: '' },
      sortBy: 'relevance'
    })
    setCurrentPage(1)
  }

  // Handle product click
  const handleProductClick = (product) => {
    setSelectedProduct(product)
    if (!similarProducts[product._id]) {
      fetchSimilarProducts(product._id)
    }
  }

  // Regenerate feed
  const handleRegenerateFeed = () => {
    navigate('/friends/selector')
  }

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Get unique categories and brands for filters
  const getFilterOptions = () => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]
    return { categories, brands }
  }

  const { categories, brands } = getFilterOptions()

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/friends/selector')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <FaArrowLeft />
                <span>Back to Selector</span>
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Friends Feed</h1>
                {feedMetadata && (
                  <p className="text-sm text-gray-600">
                    Based on {feedMetadata.contactsCount} friends • {feedMetadata.totalProducts} products
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRegenerateFeed}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                <FaSync />
                Regenerate
              </button>
              
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <FaTh />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                >
                  <FaList />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-64 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-600 hover:text-pink-700"
                >
                  Clear All
                </button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaFilter />
                Filters
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <p className="mt-2 text-gray-600">Loading your friends feed...</p>
              </div>
            ) : (
              <>
                {/* Products Grid/List */}
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
                    : 'space-y-4'
                } mb-8`}>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product)}
                      className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                        viewMode === 'list' ? 'flex gap-4 p-4' : 'overflow-hidden'
                      }`}
                    >
                      {/* Product Image */}
                      <div className={`${viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'} bg-gray-200 rounded-lg overflow-hidden`}>
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {product.name}
                        </h3>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {product.brand}
                        </p>
                        
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.originalPrice)}
                            </span>
                          )}
                        </div>

                        {/* Relevance Score */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-pink-500 h-2 rounded-full"
                              style={{ width: `${(product.relevanceScore || 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">
                            {Math.round((product.relevanceScore || 0) * 100)}% match
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600">
                            <FaShoppingCart />
                            Add to Bag
                          </button>
                          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                            <FaHeart className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <span className="px-4 py-2 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Similar Products Sidebar */}
          {selectedProduct && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Similar to "{selectedProduct.name}"
                </h3>
                
                {similarProducts[selectedProduct._id] ? (
                  <div className="space-y-4">
                    {similarProducts[selectedProduct._id].slice(0, 5).map((similar) => (
                      <div key={similar._id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {similar.images && similar.images[0] ? (
                            <img
                              src={similar.images[0]}
                              alt={similar.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              No Image
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {similar.name}
                          </h4>
                          <p className="text-xs text-gray-600 mb-1">
                            {similar.brand}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(similar.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading similar products...</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsFeed