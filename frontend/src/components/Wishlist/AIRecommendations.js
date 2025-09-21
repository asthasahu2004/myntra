import React, { useState, useEffect } from 'react'
import { FiDollarSign, FiStar, FiTrendingUp, FiShoppingBag, FiZap, FiHeart } from 'react-icons/fi'
import { BsLightning } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { FaRobot } from 'react-icons/fa'
import { MdRecommend, MdTrendingUp } from 'react-icons/md'

const AIRecommendations = ({ recommendations, onMoveToBag, userId }) => {
    const [animatedCards, setAnimatedCards] = useState({})
    const [typingText, setTypingText] = useState({})

    useEffect(() => {
        // Animate cards on mount
        const timer = setTimeout(() => {
            setAnimatedCards({
                budget: true,
                quality: true,
                balanced: true
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [])

    const generateRecommendationText = (type, product) => {
        const texts = {
            budget: [
                `💰 **Best Budget Pick!** Save big with ${product.brand || 'this'} at just ₹${product.sellingPrice?.toLocaleString()}`,
                `Perfect for budget-conscious shoppers who don't want to compromise on style.`,
                `You'll save ₹${product.mrp && product.sellingPrice ? (product.mrp - product.sellingPrice).toLocaleString() : 'XX'} compared to the original price!`
            ],
            quality: [
                `⭐ **Premium Quality Choice!** ${product.brand || 'This product'} represents the finest craftsmanship`,
                `Invest in quality that lasts. Premium materials and superior construction make this worth every penny.`,
                `Trusted brand with excellent reputation for durability and style.`
            ],
            balanced: [
                `⚖️ **Perfect Balance!** ${product.brand || 'This option'} offers the ideal mix of quality and value`,
                `Not too expensive, not too cheap - just right for smart shoppers who want the best of both worlds.`,
                `Great value proposition with solid quality at a reasonable price point.`
            ]
        }
        return texts[type] || []
    }

    const getRecommendationIcon = (type) => {
        const icons = {
            budget: <FiDollarSign className="text-2xl text-green-500" />,
            quality: <FiStar className="text-2xl text-yellow-500" />,
            balanced: <FiTrendingUp className="text-2xl text-blue-500" />
        }
        return icons[type]
    }

    const getRecommendationColor = (type) => {
        const colors = {
            budget: {
                bg: 'from-green-50 to-emerald-50',
                border: 'border-green-200',
                accent: 'text-green-700',
                button: 'bg-green-500 hover:bg-green-600'
            },
            quality: {
                bg: 'from-yellow-50 to-orange-50',
                border: 'border-yellow-200',
                accent: 'text-yellow-700',
                button: 'bg-yellow-500 hover:bg-yellow-600'
            },
            balanced: {
                bg: 'from-blue-50 to-indigo-50',
                border: 'border-blue-200',
                accent: 'text-blue-700',
                button: 'bg-blue-500 hover:bg-blue-600'
            }
        }
        return colors[type]
    }

    const RecommendationCard = ({ type, product, title, delay = 0 }) => {
        const [isVisible, setIsVisible] = useState(false)
        const [currentTextIndex, setCurrentTextIndex] = useState(0)
        const colors = getRecommendationColor(type)
        const texts = generateRecommendationText(type, product)

        useEffect(() => {
            const timer = setTimeout(() => setIsVisible(true), delay)
            return () => clearTimeout(timer)
        }, [delay])

        useEffect(() => {
            if (texts.length > 1) {
                const interval = setInterval(() => {
                    setCurrentTextIndex(prev => (prev + 1) % texts.length)
                }, 3000)
                return () => clearInterval(interval)
            }
        }, [texts.length])

        if (!product) return null

        const discountPercentage = product.mrp && product.sellingPrice 
            ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
            : 0

        return (
            <div className={`transform transition-all duration-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
                <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            {getRecommendationIcon(type)}
                            <h3 className={`text-xl font-bold ${colors.accent} ml-3`}>
                                {title}
                            </h3>
                        </div>
                        <div className="flex items-center text-purple-600">
                            <FaRobot className="mr-1" />
                            <span className="text-xs font-medium">AI Powered</span>
                        </div>
                    </div>

                    {/* Product Preview */}
                    <div className="flex items-start space-x-4 mb-4">
                        <div className="w-20 h-20 rounded-lg overflow-hidden shadow-md">
                            <img
                                src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                {product.title}
                            </h4>
                            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                                {product.brand}
                            </p>
                            <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                    ₹{product.sellingPrice?.toLocaleString()}
                                </span>
                                {product.mrp && product.mrp > product.sellingPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                        ₹{product.mrp.toLocaleString()}
                                    </span>
                                )}
                                {discountPercentage > 0 && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                        {discountPercentage}% OFF
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* AI Recommendation Text */}
                    <div className="bg-white/70 rounded-lg p-4 mb-4 min-h-[80px]">
                        <div className="flex items-start">
                            <HiSparkles className="text-purple-500 mt-1 mr-2 flex-shrink-0" />
                            <div className="space-y-2">
                                {texts.map((text, index) => (
                                    <p 
                                        key={index}
                                        className={`text-sm text-gray-700 leading-relaxed transition-opacity duration-500 ${
                                            index === currentTextIndex ? 'opacity-100' : 'opacity-0 absolute'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {type === 'budget' && (
                            <>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiDollarSign className="mr-1 text-green-500" />
                                    Best Price
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <BsLightning className="mr-1 text-yellow-500" />
                                    Great Savings
                                </div>
                            </>
                        )}
                        {type === 'quality' && (
                            <>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiStar className="mr-1 text-yellow-500" />
                                    Premium Brand
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <HiSparkles className="mr-1 text-purple-500" />
                                    Top Quality
                                </div>
                            </>
                        )}
                        {type === 'balanced' && (
                            <>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiTrendingUp className="mr-1 text-blue-500" />
                                    Best Value
                                </div>
                                <div className="flex items-center text-xs text-gray-600">
                                    <FiHeart className="mr-1 text-pink-500" />
                                    Smart Choice
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={() => onMoveToBag(userId, product._id)}
                        className={`w-full ${colors.button} text-white py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
                    >
                        <FiShoppingBag className="mr-2" />
                        ADD TO BAG
                    </button>
                </div>
            </div>
        )
    }

    if (!recommendations) {
        return (
            <div className="text-center py-12">
                <FaRobot className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recommendations available</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                        <FaRobot className="text-2xl text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    AI Recommendations
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Our AI has analyzed your selected products and generated personalized recommendations 
                    based on price, quality, and value. Here are the top picks tailored just for you.
                </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecommendationCard
                    type="budget"
                    product={recommendations.budget}
                    title="Best Budget Pick"
                    delay={0}
                />
                <RecommendationCard
                    type="quality"
                    product={recommendations.quality}
                    title="Premium Quality"
                    delay={200}
                />
                <RecommendationCard
                    type="balanced"
                    product={recommendations.balanced}
                    title="Balanced Choice"
                    delay={400}
                />
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-start">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg mr-4">
                        <MdRecommend className="text-white text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            AI Shopping Insights
                        </h3>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                • <strong>Price Range:</strong> Your selected products span from ₹{Math.min(...Object.values(recommendations).map(p => p.sellingPrice)).toLocaleString()} to ₹{Math.max(...Object.values(recommendations).map(p => p.sellingPrice)).toLocaleString()}
                            </p>
                            <p>
                                • <strong>Best Savings:</strong> You can save up to ₹{Math.max(...Object.values(recommendations).map(p => p.mrp - p.sellingPrice)).toLocaleString()} with the right choice
                            </p>
                            <p>
                                • <strong>Brand Diversity:</strong> {new Set(Object.values(recommendations).map(p => p.brand)).size} different brands in your selection
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AIRecommendations