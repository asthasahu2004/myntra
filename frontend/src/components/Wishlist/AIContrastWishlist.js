import React, { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createbag, deletewish, getwishlist } from '../../action/orderaction'
import { getuser, clearErrors } from '../../action/useraction'
import { useAlert } from 'react-alert'
import { MdClear, MdCompareArrows, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'
import { FiZap, FiDollarSign, FiStar, FiTruck } from 'react-icons/fi'
import { BsTree } from 'react-icons/bs'
import { HiSparkles } from 'react-icons/hi'
import { FaRobot } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import wish from '../images/emptywish.PNG'
import Nowishlist from './Nowishlist'
import ProductComparisonCard from './ProductComparisonCard'
import AIRecommendations from './AIRecommendations'
import ComparisonTable from './ComparisonTable'

const AIContrastWishlist = () => {
    const Alert = useAlert()
    const dispatch = useDispatch()
    const { wishlist, loading } = useSelector(state => state.wishlist_data)
    const { isAuthentication, loading: userloading, error, user } = useSelector(state => state.user)
    const { deletewish: dellll } = useSelector(state => state.deletewish)
    
    // State management
    const [state, setstate] = useState(false)
    const [state1, setstate1] = useState(false)
    const [state2, setstate2] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [showComparison, setShowComparison] = useState(false)
    const [comparisonData, setComparisonData] = useState(null)
    const [aiRecommendations, setAiRecommendations] = useState(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Handle product selection
    const handleProductSelect = (productId, product) => {
        setSelectedProducts(prev => {
            const isSelected = prev.some(p => p._id === productId)
            if (isSelected) {
                return prev.filter(p => p._id !== productId)
            } else {
                return [...prev, product]
            }
        })
    }

    // Select all products
    const handleSelectAll = () => {
        if (!wishlist?.orderItems) return;
        
        if (selectedProducts.length === wishlist.orderItems.length) {
            setSelectedProducts([])
        } else {
            setSelectedProducts(wishlist.orderItems.map(item => item.product))
        }
    }

    // AI Comparison Analysis
    const analyzeWithAI = async () => {
        if (selectedProducts.length < 2) {
            Alert.error('Please select at least 2 products to compare')
            return
        }

        setIsAnalyzing(true)
        
        try {
            // Simulate AI analysis (replace with actual API call)
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            const analysis = generateComparisonAnalysis(selectedProducts)
            setComparisonData(analysis.comparison)
            setAiRecommendations(analysis.recommendations)
            setShowComparison(true)
            
            Alert.success('AI analysis complete!')
        } catch (error) {
            Alert.error('Failed to analyze products')
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Generate comparison analysis (mock AI function)
    const generateComparisonAnalysis = (products) => {
        const comparison = products.map(product => ({
            ...product,
            highlights: {
                cheapest: product.sellingPrice === Math.min(...products.map(p => p.sellingPrice)),
                mostExpensive: product.sellingPrice === Math.max(...products.map(p => p.sellingPrice)),
                bestDiscount: ((product.mrp - product.sellingPrice) / product.mrp * 100) === Math.max(...products.map(p => (p.mrp - p.sellingPrice) / p.mrp * 100)),
                premium: product.brand && ['Nike', 'Adidas', 'Puma', 'Levis'].includes(product.brand),
                sustainable: product.material && product.material.toLowerCase().includes('organic')
            }
        }))

        const recommendations = {
            budget: products.reduce((min, product) => 
                product.sellingPrice < min.sellingPrice ? product : min
            ),
            quality: products.find(p => p.brand && ['Nike', 'Adidas', 'Puma'].includes(p.brand)) || products[0],
            balanced: products.sort((a, b) => {
                const aScore = (a.sellingPrice / a.mrp) + (a.brand ? 0.2 : 0)
                const bScore = (b.sellingPrice / b.mrp) + (b.brand ? 0.2 : 0)
                return aScore - bScore
            })[0]
        }

        return { comparison, recommendations }
    }

    // Delete wishlist item
    function delwish(userId, productId) {
        const option = {
            product: productId,
            user: userId
        }
        dispatch(deletewish(option))
        Alert.success('Product removed from wishlist')
        if (userId) {
            dispatch(getwishlist(userId))
        }
        setstate2(false)
        setSelectedProducts(prev => prev.filter(p => p._id !== productId))
    }

    // Move to bag
    function movetobag(userId, productId) {
        if (!user || !userId) {
            Alert.error('Please login to add items to bag')
            return
        }
        
        // Find the product from wishlist
        const product = wishlist.find(item => item.product._id === productId)?.product
        if (!product) {
            Alert.error('Product not found')
            return
        }
        
        const option = {
            user: user,
            orderItems: [{ product: product, qty: 1 }]
        }
        dispatch(createbag(option))
        Alert.success('Product added successfully in Bag')
        
        // Remove from wishlist after adding to bag
        const deleteOption = {
            product: product,
            user: user
        }
        dispatch(deletewish(deleteOption))
        setstate2(false)
        setSelectedProducts(prev => prev.filter(p => p._id !== productId))
    }

    // Effects
    useEffect(() => {
        if (state2 === false && dellll === true) {
            if (user) {
                dispatch(getwishlist(user._id))
            }
            setstate2(true)
        }
    }, [dellll, dispatch, user, state2])

    useEffect(() => {
        if (state1 === false) {
            if (!user) {
                dispatch(getuser())
            }
            setstate1(true)
        }

        if (error) {
            dispatch(clearErrors())
        }
        
        if (state === false) {
            if (userloading === false) {
                if (isAuthentication === false) {
                    Alert.info('Log in to access wishlist')
                    setstate(true)
                } else {
                    if (user) {
                        dispatch(getwishlist(user._id))
                    }
                    setstate(true)
                }
            }
        }
    }, [dispatch, error, userloading, isAuthentication, user, state, state1])

    if (!isAuthentication) {
        return <Nowishlist />
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (!wishlist || !wishlist.orderItems || wishlist.orderItems.length === 0) {
        return (
            <div className='w-full h-screen'>
                <div className='mx-auto w-max text-center mt-[10.33%]'>
                    <h1 className='font1 font-semibold text-lg text-slate-700'>YOUR WISHLIST IS EMPTY</h1>
                    <p className='w-full mt-2 text-slate-400'>
                        Add items that you like to your wishlist. Review <br /> 
                        them anytime and easily move them to the bag.
                    </p>
                    <img src={wish} alt="" className='mt-10 mb-10 w-[130px] mx-auto min-h-[150px]' />
                    <Link to='/'>
                        <button className='py-4 px-14 text-[#3466e8] border-[1px] border-[#3466e8] font1 font-semibold hover:bg-[#3466e8] hover:text-white transition-colors'>
                            CONTINUE SHOPPING
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <Fragment>
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
                    <div>
                        <h1 className='font1 text-2xl font-bold text-gray-900 mb-2'>
                            My Wishlist 
                            <span className='font-sans font-normal text-lg text-gray-600 ml-2'>
                                {wishlist.orderItems?.length || 0} items
                            </span>
                        </h1>
                        <p className="text-gray-600">
                            Select products to compare with AI-powered insights
                        </p>
                    </div>
                    
                    {/* AI Features Badge */}
                    <div className="flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mt-4 lg:mt-0">
                        <FaRobot className="text-purple-600 mr-2" />
                        <span className="text-purple-800 font-medium text-sm">AI-Powered Comparison</span>
                        <HiSparkles className="text-pink-500 ml-2" />
                    </div>
                </div>

                {/* Selection Controls */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleSelectAll}
                                className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                            >
                                {selectedProducts.length === (wishlist.orderItems?.length || 0) ? 
                                    <MdCheckBox className="text-xl text-pink-500 mr-2" /> : 
                                    <MdCheckBoxOutlineBlank className="text-xl mr-2" />
                                }
                                <span className="font-medium">
                                    {selectedProducts.length === (wishlist.orderItems?.length || 0) ? 'Deselect All' : 'Select All'}
                                </span>
                            </button>
                            
                            {selectedProducts.length > 0 && (
                                <span className="text-sm text-gray-600">
                                    {selectedProducts.length} selected
                                </span>
                            )}
                        </div>

                        {/* Compare Button */}
                        <button
                            onClick={analyzeWithAI}
                            disabled={selectedProducts.length < 2 || isAnalyzing}
                            className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all ${
                                selectedProducts.length >= 2 && !isAnalyzing
                                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <MdCompareArrows className="mr-2" />
                                    Compare with AI
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Products Grid */}
                {!showComparison ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {wishlist.orderItems?.map((item) => (
                            <ProductComparisonCard
                                key={item._id}
                                product={item.product}
                                isSelected={selectedProducts.some(p => p._id === item.product._id)}
                                onSelect={handleProductSelect}
                                onDelete={() => delwish(user?._id, item.product._id)}
                                onMoveToBag={() => movetobag(user?._id, item.product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    /* Comparison View */
                    <div className="space-y-8">
                        {/* Back Button */}
                        <button
                            onClick={() => setShowComparison(false)}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Back to Wishlist
                        </button>

                        {/* Comparison Table */}
                        <ComparisonTable 
                            products={comparisonData} 
                            selectedProducts={selectedProducts}
                        />

                        {/* AI Recommendations */}
                        <AIRecommendations 
                            recommendations={aiRecommendations}
                            onMoveToBag={movetobag}
                            userId={user?._id}
                        />
                    </div>
                )}
            </div>
        </Fragment>
    )
}

export default AIContrastWishlist