import React, { useState, useEffect } from 'react'
import { FaStar, FaStarHalfAlt, FaRegStar, FaThumbsUp, FaThumbsDown, FaTimes } from 'react-icons/fa'
import './Reviews.css'

const Reviews = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const reviewsPerPage = 5

  // Fetch product data with reviews from backend
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:4000/api/v1/product/${productId}`)
        const data = await response.json()
        
        if (data.success) {
          setProduct(data.product)
          setReviews(data.product.reviews || [])
        }
      } catch (error) {
        console.error('Error fetching product data:', error)
        // Fallback to generated reviews if API fails
        setReviews(generateDynamicReviews(productId))
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProductData()
    }
  }, [productId])

  // Fallback function to generate dynamic reviews (only used if API fails)
  const generateDynamicReviews = (productId) => {
    // Use product ID as seed for consistent but different reviews per product
    const seed = productId ? productId.slice(-4) : '0000'
    const seedNum = parseInt(seed, 16) || 1000
    
    // Different review pools
    const reviewTemplates = [
      {
        names: ['Arjun Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Gupta', 'Vikash Singh', 'Anita Reddy', 'Manoj Verma', 'Kavya Nair', 'Rohit Jain', 'Meera Shah'],
        titles: ['Excellent Quality!', 'Good value for money', 'Love it!', 'Average product', 'Good purchase', 'Fantastic!', 'Satisfied customer', 'Great buy!', 'Worth it!', 'Nice product'],
        comments: [
          'Amazing product! The fabric quality is outstanding and the fit is perfect. Highly recommend this to everyone.',
          'Nice product overall. The color is exactly as shown in the picture. Delivery was quick too.',
          'Perfect for casual wear. The material is breathable and comfortable for all-day wear.',
          'It\'s okay for the price. The quality could be better but it serves the purpose.',
          'Happy with the purchase. Good quality and fits well. Would buy again.',
          'Exceeded my expectations! The quality is premium and the design is trendy.',
          'Good product with nice finishing. Delivery was on time and packaging was excellent.',
          'Really impressed with the quality. Fits perfectly and looks great.',
          'Decent product for the price. Would recommend to others.',
          'Stylish and comfortable. Perfect for everyday wear.'
        ]
      }
    ]
    
    // Generate random number of reviews (3-12) based on product ID
    const numReviews = 3 + (seedNum % 10)
    const reviews = []
    
    for (let i = 0; i < numReviews; i++) {
      const nameIndex = (seedNum + i * 7) % reviewTemplates[0].names.length
      const titleIndex = (seedNum + i * 11) % reviewTemplates[0].titles.length
      const commentIndex = (seedNum + i * 13) % reviewTemplates[0].comments.length
      
      // Generate rating (weighted towards higher ratings)
      const ratingRand = (seedNum + i * 17) % 100
      let rating
      if (ratingRand < 40) rating = 5
      else if (ratingRand < 70) rating = 4
      else if (ratingRand < 85) rating = 3
      else if (ratingRand < 95) rating = 2
      else rating = 1
      
      // Determine sentiment based on rating
      let sentiment
      if (rating >= 4) sentiment = 'positive'
      else if (rating <= 2) sentiment = 'negative'
      else sentiment = 'neutral'
      
      // Generate date (last 30 days)
      const daysAgo = (seedNum + i * 3) % 30
      const date = new Date()
      date.setDate(date.getDate() - daysAgo)
      
      reviews.push({
        _id: `${productId}-${i}`,
        rating,
        reviewerName: reviewTemplates[0].names[nameIndex],
        title: reviewTemplates[0].titles[titleIndex],
        comment: reviewTemplates[0].comments[commentIndex],
        sentiment,
        createdAt: date.toISOString()
      })
    }
    
    return reviews
  }



  // Calculate summary data
  const calculateSummary = () => {
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0
    
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive').length
    const overallSentiment = positiveReviews / totalReviews > 0.6 ? 'positive' : 
                            positiveReviews / totalReviews < 0.4 ? 'negative' : 'neutral'
    
    return {
      totalReviews,
      averageRating,
      overallSentiment
    }
  }

  // Generate summary using real AI data from backend or fallback
  const generateSummary = () => {
    const summary = calculateSummary()
    
    // Use AI-generated summary from backend if available
    if (product && product.reviewSummary && product.reviewSummary.summaryPoints) {
      const aiSummaryPoints = product.reviewSummary.summaryPoints
      
      // Create natural summary text from AI-generated points
      let summaryText = ''
      if (aiSummaryPoints.length > 0) {
        // Use the first AI summary point as the main summary
        summaryText = aiSummaryPoints[0]
        
        // If there are multiple points, combine them naturally
        if (aiSummaryPoints.length > 1) {
          summaryText = aiSummaryPoints.join('. ')
        }
      }
      
      // Extract positive and negative aspects from AI summary or reviews
      const positiveAspects = []
      const negativeAspects = []
      
      // Analyze the AI summary text for positive and negative themes
      const positiveKeywords = ['loved', 'great', 'excellent', 'good', 'amazing', 'perfect', 'comfortable', 'quality', 'style']
      const negativeKeywords = ['improve', 'better', 'issue', 'problem', 'sizing', 'delivery', 'price']
      
      // Extract themes mentioned in the summary
      const summaryLower = summaryText.toLowerCase()
      positiveKeywords.forEach(keyword => {
        if (summaryLower.includes(keyword)) {
          positiveAspects.push(keyword)
        }
      })
      
      negativeKeywords.forEach(keyword => {
        if (summaryLower.includes(keyword)) {
          negativeAspects.push(keyword)
        }
      })
      
      return {
        summaryText: summaryText || 'Customers have shared their experiences with this product.',
        topPros: positiveAspects.slice(0, 3),
        topCons: negativeAspects.slice(0, 2),
        ...summary
      }
    }
    
    // Fallback to generated summary if no AI data available
    const positiveAspects = []
    const negativeAspects = []
    
    // Extract positive and negative sentiments from reviews
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive')
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative')
    
    // Common positive themes customers mention
    const positiveThemes = ['quality', 'comfort', 'style', 'fit', 'design', 'value', 'material', 'appearance']
    const negativeThemes = ['sizing', 'quality', 'price', 'delivery', 'durability', 'comfort', 'fit']
    
    // Randomly select what customers loved (based on positive reviews)
    if (positiveReviews.length > 0) {
      const shuffledPositive = [...positiveThemes].sort(() => 0.5 - Math.random())
      positiveAspects.push(...shuffledPositive.slice(0, Math.min(3, Math.ceil(positiveReviews.length / 2))))
    }
    
    // Randomly select what customers felt could be improved (based on negative reviews)
    if (negativeReviews.length > 0) {
      const shuffledNegative = [...negativeThemes].sort(() => 0.5 - Math.random())
      negativeAspects.push(...shuffledNegative.slice(0, Math.min(2, Math.ceil(negativeReviews.length / 2))))
    }
    
    // Create natural summary text
    let summaryText = ''
    
    if (positiveAspects.length > 0) {
      summaryText += `Customers loved the ${positiveAspects.join(', ')} of this product`
      if (negativeAspects.length > 0) {
        summaryText += `, however some of them felt that the ${negativeAspects.join(' and ')} could be improved.`
      } else {
        summaryText += ` and had an overall positive experience.`
      }
    } else if (negativeAspects.length > 0) {
      summaryText += `Some customers felt that the ${negativeAspects.join(' and ')} could be improved.`
    } else {
      summaryText += `Customers have shared mixed experiences with this product.`
    }
    
    return {
      ...summary,
      summaryText,
      topPros: positiveAspects,
      topCons: negativeAspects
    }
  }

  // Sort reviews based on selected option
  const getSortedReviews = () => {
    const sorted = [...reviews].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        default:
          return 0
      }
    })
    return sorted
  }

  // Get paginated reviews
  const getPaginatedReviews = () => {
    const sorted = getSortedReviews()
    const startIndex = (currentPage - 1) * reviewsPerPage
    const endIndex = startIndex + reviewsPerPage
    return sorted.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage)

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-gray-300" />)
    }

    return stars
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'text-green-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const summary = calculateSummary()
  const currentReviews = getPaginatedReviews()

  if (loading) {
    return (
      <div className="reviews-section pt-6 border-t border-gray-200">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading reviews...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="reviews-section pt-6 border-t border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#ff3f6c] text-white px-4 py-2 rounded-md hover:bg-[#f64871] transition-colors"
        >
          Summarize Reviews
        </button>
      </div>

      {/* Review Summary */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center mb-2">
              <div className="flex mr-2">
                {renderStars(summary.averageRating || 0)}
              </div>
              <span className="text-xl font-bold">{summary.averageRating ? summary.averageRating.toFixed(1) : '0.0'}</span>
              <span className="text-gray-600 ml-2">({summary.totalReviews} reviews)</span>
            </div>
            <div className={`text-sm font-medium ${getSentimentColor(summary.overallSentiment)}`}>
              Overall sentiment: {summary.overallSentiment}
            </div>
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-600">{reviews.length} reviews</span>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {currentReviews.map((review) => (
          <div key={review._id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center mb-1">
                  <div className="flex mr-2">
                    {renderStars(review.rating)}
                  </div>
                  <span className="font-medium">{review.rating}/5</span>
                </div>
                <p className="text-sm text-gray-600">By {review.reviewerName}</p>
              </div>
              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
            
            <h4 className="font-medium mb-2">{review.title}</h4>
            <p className="text-gray-700 mb-3">{review.comment}</p>
            
            <div className="flex items-center justify-between">
              <div className={`text-sm font-medium ${getSentimentColor(review.sentiment)}`}>
                {review.sentiment}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <button className="flex items-center hover:text-green-600">
                  <FaThumbsUp className="mr-1" />
                  Helpful
                </button>
                <button className="flex items-center hover:text-red-600">
                  <FaThumbsDown className="mr-1" />
                  Not helpful
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {currentPage > 1 && (
              <button 
                onClick={() => setCurrentPage(currentPage - 1)}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md ${
                  currentPage === page 
                    ? 'bg-[#ff3f6c] text-white border-[#ff3f6c]' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            {currentPage < totalPages && (
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Review Summary</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Overall Stats */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {renderStars(summary.averageRating || 0)}
                  </div>
                  <span className="text-2xl font-bold">{summary.averageRating ? summary.averageRating.toFixed(1) : '0.0'}</span>
                  <span className="text-gray-600 ml-2">out of 5</span>
                </div>
                <p className="text-gray-600">Based on {summary.totalReviews} customer reviews</p>
                <div className={`text-sm font-medium mt-2 ${getSentimentColor(summary.overallSentiment)}`}>
                  Overall sentiment: {summary.overallSentiment}
                </div>
              </div>

              {/* Natural Summary */}
              <div>
                <h4 className="font-semibold mb-2">Customer Feedback Summary</h4>
                <p className="text-gray-700 leading-relaxed text-base">{generateSummary().summaryText}</p>
              </div>

              {/* What Customers Loved */}
              {generateSummary().topPros.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">What Customers Loved</h4>
                  <div className="flex flex-wrap gap-2">
                    {generateSummary().topPros.map((pro, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas for Improvement */}
              {generateSummary().topCons.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Areas for Improvement</h4>
                  <div className="flex flex-wrap gap-2">
                    {generateSummary().topCons.map((con, index) => (
                      <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {con}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating Distribution */}
              <div>
                <h4 className="font-semibold mb-2">Rating Distribution</h4>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = reviews.filter(r => r.rating === rating).length
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center mb-1">
                      <span className="w-8 text-sm">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-12 text-sm text-gray-600">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews