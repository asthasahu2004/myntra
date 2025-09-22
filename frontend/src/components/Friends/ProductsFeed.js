import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaHeart, FaShoppingBag, FaStar, FaFilter, FaSearch } from 'react-icons/fa'
import Papa from 'papaparse'

const ProductsFeed = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceRange, setPriceRange] = useState('all')
  const [sortBy, setSortBy] = useState('rating')

  // Load and parse CSV data
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        
        // Fetch the CSV file
        const response = await fetch('/myntra_sample_500.csv')
        if (!response.ok) {
          throw new Error('Failed to load products data')
        }
        
        const csvText = await response.text()
        
        // Parse CSV
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error('CSV parsing errors:', results.errors)
            }
            
            // Process and clean the data
            const processedProducts = results.data
                .filter(row => row.id && row.name && row.price)
                .slice(0, 35) // Limit to 35 products as requested
                .map(row => ({
                id: row.id,
                name: row.name?.trim() || 'Unknown Product',
                image: row.img?.split(';')[0] || '', // Take first image URL
                price: parseFloat(row.price) || 0,
                mrp: parseFloat(row.mrp) || 0,
                rating: parseFloat(row.rating) || 0,
                ratingTotal: parseInt(row.ratingTotal) || 0,
                discount: parseInt(row.discount) || 0,
                seller: row.seller?.trim() || 'Unknown Seller',
                category: extractCategory(row.name),
                url: row.purl || '#'
              }))
            
            setProducts(processedProducts)
            setFilteredProducts(processedProducts)
            setLoading(false)
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
            setError('Failed to parse products data')
            setLoading(false)
          }
        })
      } catch (err) {
        console.error('Error loading products:', err)
        setError('Failed to load products data')
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Extract category from product name
  const extractCategory = (name) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('shirt') || lowerName.includes('tshirt') || lowerName.includes('t-shirt')) return 'Shirts'
    if (lowerName.includes('dress')) return 'Dresses'
    if (lowerName.includes('jeans') || lowerName.includes('trouser')) return 'Bottoms'
    if (lowerName.includes('shoe') || lowerName.includes('sneaker')) return 'Footwear'
    if (lowerName.includes('bag') || lowerName.includes('wallet')) return 'Accessories'
    if (lowerName.includes('watch')) return 'Watches'
    return 'Fashion'
  }

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory)
    }

    // Price range filter
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(Number)
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max
        } else {
          return product.price >= min
        }
      })
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'discount':
          return b.discount - a.discount
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, priceRange, sortBy])

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading amazing products for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/friends')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaArrowLeft className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent">
                  Personalized Product Feed
                </h1>
                <p className="text-gray-600 text-sm">
                  Curated based on your friends' preferences • {filteredProducts.length} products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4 items-center">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>

              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">All Prices</option>
                <option value="0-500">Under ₹500</option>
                <option value="500-1000">₹500 - ₹1000</option>
                <option value="1000-2000">₹1000 - ₹2000</option>
                <option value="2000">Above ₹2000</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="rating">Best Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Product Card Component
const ProductCard = ({ product }) => {
  const [isLiked, setIsLiked] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {!imageError && product.image ? (
          <img
            src={product.image}
            alt={product.name}
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-4xl text-gray-400">👕</span>
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          <FaHeart className={`${isLiked ? 'text-red-500' : 'text-gray-400'} transition-colors`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2">{product.seller}</p>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-xs text-gray-500">({product.ratingTotal})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-800">
            {formatPrice(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Add to Bag Button */}
        <button className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2">
          <FaShoppingBag className="text-sm" />
          Add to Bag
        </button>
      </div>
    </div>
  )
}

export default ProductsFeed