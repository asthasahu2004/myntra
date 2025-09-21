import React, { useState } from 'react'
import { MdClear, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'
import { FiHeart, FiShoppingBag, FiStar, FiTruck } from 'react-icons/fi'
import { HiSparkles } from 'react-icons/hi'

const ProductComparisonCard = ({ product, isSelected, onSelect, onDelete, onMoveToBag }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const discountPercentage = product.mrp && product.sellingPrice 
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0

    const isPremiumBrand = product.brand && ['Nike', 'Adidas', 'Puma', 'Levis', 'H&M', 'Zara'].includes(product.brand)
    const isHighDiscount = discountPercentage > 50

    return (
        <div 
            className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden group ${
                isSelected 
                    ? 'border-pink-500 shadow-lg ring-2 ring-pink-200 transform scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Selection Overlay */}
            <div 
                className={`absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 transition-opacity duration-300 ${
                    isSelected ? 'opacity-100' : 'opacity-0'
                }`}
            />

            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
                <button
                    onClick={() => onSelect(product._id, product)}
                    className={`p-1 rounded-full transition-all duration-200 ${
                        isSelected 
                            ? 'bg-pink-500 text-white shadow-lg' 
                            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-pink-500'
                    }`}
                >
                    {isSelected ? 
                        <MdCheckBox className="text-lg" /> : 
                        <MdCheckBoxOutlineBlank className="text-lg" />
                    }
                </button>
            </div>

            {/* Delete Button */}
            <div className="absolute top-3 right-3 z-10">
                <button
                    onClick={onDelete}
                    className="p-1 bg-white/80 hover:bg-red-500 hover:text-white text-gray-600 rounded-full transition-all duration-200 shadow-sm"
                >
                    <MdClear className="text-lg" />
                </button>
            </div>

            {/* Premium Badge */}
            {isPremiumBrand && (
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center">
                        <HiSparkles className="mr-1" />
                        PREMIUM
                    </div>
                </div>
            )}

            {/* Discount Badge */}
            {isHighDiscount && (
                <div className="absolute top-12 right-3 z-10">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        {discountPercentage}% OFF
                    </div>
                </div>
            )}

            {/* Product Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
                {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin"></div>
                    </div>
                )}
                <img
                    src={product.images && product.images[0] ? product.images[0].url : '/placeholder-image.jpg'}
                    alt={product.title}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                    } ${isHovered ? 'scale-110' : 'scale-100'}`}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                        e.target.src = '/placeholder-image.jpg'
                        setImageLoaded(true)
                    }}
                />
                
                {/* Hover Overlay */}
                <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                }`} />
            </div>

            {/* Product Details */}
            <div className="p-4 space-y-3">
                {/* Brand */}
                {product.brand && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                            {product.brand}
                        </span>
                        {isPremiumBrand && (
                            <div className="flex items-center text-yellow-500">
                                <FiStar className="text-xs" />
                            </div>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-sm text-gray-800 line-clamp-2 leading-tight">
                    {product.title}
                </h3>

                {/* Price Section */}
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{product.sellingPrice?.toLocaleString()}
                        </span>
                        {product.mrp && product.mrp > product.sellingPrice && (
                            <span className="text-sm text-gray-500 line-through">
                                ₹{product.mrp.toLocaleString()}
                            </span>
                        )}
                    </div>
                    {discountPercentage > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                            You save ₹{(product.mrp - product.sellingPrice).toLocaleString()} ({discountPercentage}% off)
                        </div>
                    )}
                </div>

                {/* Product Features */}
                <div className="flex flex-wrap gap-1">
                    {product.material && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {product.material}
                        </span>
                    )}
                    {product.color && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {product.color}
                        </span>
                    )}
                    {product.size && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                            Size {product.size}
                        </span>
                    )}
                </div>

                {/* Stock Status */}
                {product.stock !== undefined && (
                    <div className="flex items-center text-xs">
                        {product.stock > 0 ? (
                            <span className="text-green-600 flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                In Stock ({product.stock} left)
                            </span>
                        ) : (
                            <span className="text-red-600 flex items-center">
                                <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                                Out of Stock
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 pt-0 space-y-2">
                <button
                    onClick={onMoveToBag}
                    disabled={product.stock === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center ${
                        product.stock === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                >
                    <FiShoppingBag className="mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'MOVE TO BAG'}
                </button>

                {/* Quick Info */}
                <div className="flex items-center justify-center text-xs text-gray-500 space-x-4">
                    <div className="flex items-center">
                        <FiTruck className="mr-1" />
                        Fast Delivery
                    </div>
                    <div className="flex items-center">
                        <FiHeart className="mr-1" />
                        Wishlist
                    </div>
                </div>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-purple-500"></div>
            )}
        </div>
    )
}

export default ProductComparisonCard