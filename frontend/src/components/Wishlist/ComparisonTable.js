import React, { useState } from 'react'
import { FiDollarSign, FiStar, FiAward, FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { BsTree } from 'react-icons/bs'
import { MdCompareArrows, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { BsShield } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'

const ComparisonTable = ({ products, selectedProducts }) => {
    const [expandedSections, setExpandedSections] = useState({
        basic: false,
        pricing: false,
        features: false,
        details: false
    })

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const getHighlightClass = (isHighlighted, type = 'default') => {
        if (!isHighlighted) return ''
        
        const highlightTypes = {
            cheapest: 'bg-orange-100 border-orange-500 text-orange-900',
            expensive: 'bg-red-100 border-red-500 text-red-900',
            discount: 'bg-pink-100 border-pink-500 text-pink-900',
            premium: 'bg-white border-orange-500 text-orange-900 shadow-lg',
            sustainable: 'bg-red-50 border-red-400 text-red-800',
            default: 'bg-pink-50 border-pink-400 text-pink-800'
        }
        
        return highlightTypes[type] || highlightTypes.default
    }

    const getContrastIcon = (type) => {
        const icons = {
            cheapest: <FiTrendingDown className="text-orange-700" />,
            expensive: <FiTrendingUp className="text-red-700" />,
            discount: <FiDollarSign className="text-pink-700" />,
            premium: <HiSparkles className="text-orange-700" />,
            sustainable: <BsTree className="text-red-700" />
        }
        return icons[type]
    }

    const ComparisonSection = ({ title, icon, sectionKey, children }) => (
        <div className="bg-white rounded-lg shadow-lg border-2 border-orange-200 overflow-hidden">
            <button
                onClick={() => toggleSection(sectionKey)}
                className={`w-full px-6 py-4 transition-all duration-300 flex items-center justify-between ${
                    expandedSections[sectionKey] 
                        ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                        : 'bg-gradient-to-r from-red-50 to-orange-50 hover:from-orange-100 hover:to-pink-100 text-gray-800'
                }`}
            >
                <div className="flex items-center">
                    {icon}
                    <h3 className="text-lg font-semibold ml-3">{title}</h3>
                </div>
                {expandedSections[sectionKey] ? 
                    <MdExpandLess className="text-xl" /> : 
                    <MdExpandMore className="text-xl" />
                }
            </button>
            
            {expandedSections[sectionKey] && (
                <div className="p-6 bg-gradient-to-br from-white to-orange-25">
                    {children}
                </div>
            )}
        </div>
    )

    const ProductColumn = ({ product, index }) => (
        <div className="min-w-[280px] space-y-4">
            {/* Product Header */}
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <div className="aspect-square w-full mb-4 rounded-lg overflow-hidden">
                    <img
                        src={product.images?.[0]?.url || '/placeholder-image.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {product.title}
                </h4>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                    {product.brand}
                </p>
            </div>
        </div>
    )

    const ComparisonRow = ({ label, values, highlightType }) => (
        <div className="grid grid-cols-1 gap-4 py-3 border-b border-gray-100 last:border-b-0">
            <div className="font-medium text-gray-700 mb-2">{label}</div>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${products.length}, 1fr)` }}>
                {values.map((value, index) => {
                    const product = products[index]
                    const isHighlighted = product.highlights?.[highlightType]
                    
                    return (
                        <div
                            key={index}
                            className={`p-3 rounded-lg border-2 transition-all ${
                                isHighlighted 
                                    ? getHighlightClass(true, highlightType)
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{value}</span>
                                {isHighlighted && getContrastIcon(highlightType)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <MdCompareArrows className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products to compare</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
                    <MdCompareArrows className="mr-3 text-orange-600" />
                    Product Comparison
                </h2>
                <p className="text-red-600 font-medium">
                    AI-powered analysis highlighting key differences between your selected products
                </p>
            </div>

            {/* Product Headers */}
            <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4" style={{ minWidth: `${products.length * 280}px` }}>
                    {products.map((product, index) => (
                        <ProductColumn key={product._id} product={product} index={index} />
                    ))}
                </div>
            </div>

            {/* Comparison Sections */}
            <div className="space-y-4">
                {/* Basic Information */}
                <ComparisonSection
                    title="Basic Information"
                    icon={<FiStar className="text-orange-600" />}
                    sectionKey="basic"
                >
                    <div className="space-y-4">
                        <ComparisonRow
                            label="Brand"
                            values={products.map(p => p.brand || 'N/A')}
                            highlightType="premium"
                        />
                        <ComparisonRow
                            label="Category"
                            values={products.map(p => p.category || 'N/A')}
                        />
                        <ComparisonRow
                            label="Color"
                            values={products.map(p => p.color || 'N/A')}
                        />
                        <ComparisonRow
                            label="Size"
                            values={products.map(p => p.size || 'N/A')}
                        />
                    </div>
                </ComparisonSection>

                {/* Pricing */}
                <ComparisonSection
                    title="Pricing & Value"
                    icon={<FiDollarSign className="text-pink-600" />}
                    sectionKey="pricing"
                >
                    <div className="space-y-4">
                        <ComparisonRow
                            label="Selling Price"
                            values={products.map(p => `₹${p.sellingPrice?.toLocaleString() || 'N/A'}`)}
                            highlightType="cheapest"
                        />
                        <ComparisonRow
                            label="MRP"
                            values={products.map(p => `₹${p.mrp?.toLocaleString() || 'N/A'}`)}
                        />
                        <ComparisonRow
                            label="Discount"
                            values={products.map(p => {
                                if (p.mrp && p.sellingPrice) {
                                    const discount = Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100)
                                    return `${discount}%`
                                }
                                return 'N/A'
                            })}
                            highlightType="discount"
                        />
                        <ComparisonRow
                            label="You Save"
                            values={products.map(p => {
                                if (p.mrp && p.sellingPrice) {
                                    return `₹${(p.mrp - p.sellingPrice).toLocaleString()}`
                                }
                                return 'N/A'
                            })}
                        />
                    </div>
                </ComparisonSection>

                {/* Features & Quality */}
                <ComparisonSection
                    title="Features & Quality"
                    icon={<BsShield className="text-red-600" />}
                    sectionKey="features"
                >
                    <div className="space-y-4">
                        <ComparisonRow
                            label="Material"
                            values={products.map(p => p.material || 'N/A')}
                            highlightType="sustainable"
                        />
                        <ComparisonRow
                            label="Stock Status"
                            values={products.map(p => {
                                if (p.stock === undefined) return 'N/A'
                                return p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'
                            })}
                        />
                        <ComparisonRow
                            label="Style Number"
                            values={products.map(p => p.style_no || 'N/A')}
                        />
                    </div>
                </ComparisonSection>

                {/* Detailed Information */}
                <ComparisonSection
                    title="Detailed Information"
                    icon={<FiAward className="text-orange-600" />}
                    sectionKey="details"
                >
                    <div className="space-y-4">
                        <ComparisonRow
                            label="Product Details"
                            values={products.map(p => p.productDetails || 'N/A')}
                        />
                        <ComparisonRow
                            label="Gender"
                            values={products.map(p => p.gender || 'N/A')}
                        />
                        <ComparisonRow
                            label="Bullet Points"
                            values={products.map(p => 
                                p.bulletPoints?.length > 0 
                                    ? `${p.bulletPoints.length} features` 
                                    : 'N/A'
                            )}
                        />
                    </div>
                </ComparisonSection>
            </div>

            {/* Legend */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-6 border-2 border-orange-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <HiSparkles className="mr-2 text-pink-600" />
                    Highlight Legend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-200 border border-orange-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-800 font-medium">Best Price</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-pink-200 border border-pink-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-800 font-medium">Best Discount</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-white border border-orange-500 rounded mr-2 shadow-sm"></div>
                        <span className="text-sm text-gray-800 font-medium">Premium Brand</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 border border-red-400 rounded mr-2"></div>
                        <span className="text-sm text-gray-800 font-medium">Sustainable</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-200 border border-red-500 rounded mr-2"></div>
                        <span className="text-sm text-gray-800 font-medium">Most Expensive</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComparisonTable