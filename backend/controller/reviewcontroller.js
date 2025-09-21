const Product = require('../model/productmodel');
const reviewSummarizer = require('../services/reviewSummarizer');
const { generateReviewsForSpecificProduct, generateSingleReview, calculateReviewSummary } = require('../scripts/generateReviews');
const ErrorHandler = require('../utilis/errorhandel');
const catchAsyncErrors = require('../Middelwares/resolveandcatch');

// Generate reviews for a specific product
exports.generateProductReviews = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        // Check if product already has reviews
        if (product.reviews && product.reviews.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Product already has reviews. Use regenerate endpoint to replace them.'
            });
        }
        
        const result = await generateReviewsForSpecificProduct(productId);
        
        if (!result) {
            return next(new ErrorHandler('Failed to generate reviews', 500));
        }
        
        // Generate AI summary
        const aiSummary = await reviewSummarizer.summarizeReviews(result.reviews);
        
        // Update product with AI-generated summary
        await Product.findByIdAndUpdate(productId, {
            'reviewSummary.summaryPoints': aiSummary.summaryPoints,
            'reviewSummary.overallSentiment': aiSummary.overallSentiment
        });
        
        res.status(200).json({
            success: true,
            message: `Generated ${result.reviews.length} reviews successfully`,
            data: {
                reviews: result.reviews,
                reviewSummary: {
                    ...result.reviewSummary,
                    summaryPoints: aiSummary.summaryPoints,
                    overallSentiment: aiSummary.overallSentiment
                }
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Regenerate reviews for a product (replace existing ones)
exports.regenerateProductReviews = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        const result = await generateReviewsForSpecificProduct(productId);
        
        if (!result) {
            return next(new ErrorHandler('Failed to regenerate reviews', 500));
        }
        
        // Generate AI summary
        const aiSummary = await reviewSummarizer.summarizeReviews(result.reviews);
        
        // Update product with AI-generated summary
        await Product.findByIdAndUpdate(productId, {
            'reviewSummary.summaryPoints': aiSummary.summaryPoints,
            'reviewSummary.overallSentiment': aiSummary.overallSentiment
        });
        
        res.status(200).json({
            success: true,
            message: `Regenerated ${result.reviews.length} reviews successfully`,
            data: {
                reviews: result.reviews,
                reviewSummary: {
                    ...result.reviewSummary,
                    summaryPoints: aiSummary.summaryPoints,
                    overallSentiment: aiSummary.overallSentiment
                }
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get reviews for a specific product
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'reviewDate', order = 'desc' } = req.query;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        const reviews = product.reviews || [];
        
        // Sort reviews
        const sortedReviews = reviews.sort((a, b) => {
            if (sortBy === 'rating') {
                return order === 'desc' ? b.rating - a.rating : a.rating - b.rating;
            } else if (sortBy === 'reviewDate') {
                return order === 'desc' ? new Date(b.reviewDate) - new Date(a.reviewDate) : new Date(a.reviewDate) - new Date(b.reviewDate);
            }
            return 0;
        });
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedReviews = sortedReviews.slice(startIndex, endIndex);
        
        res.status(200).json({
            success: true,
            data: {
                reviews: paginatedReviews,
                reviewSummary: product.reviewSummary,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(reviews.length / limit),
                    totalReviews: reviews.length,
                    hasNext: endIndex < reviews.length,
                    hasPrev: startIndex > 0
                }
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get review summary for a product
exports.getProductReviewSummary = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    
    try {
        const product = await Product.findById(productId).select('reviewSummary reviews title');
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        res.status(200).json({
            success: true,
            data: {
                productTitle: product.title,
                reviewSummary: product.reviewSummary,
                hasReviews: product.reviews && product.reviews.length > 0
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Regenerate AI summary for existing reviews
exports.regenerateReviewSummary = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        if (!product.reviews || product.reviews.length === 0) {
            return next(new ErrorHandler('No reviews found for this product', 400));
        }
        
        // Generate new AI summary
        const aiSummary = await reviewSummarizer.summarizeReviews(product.reviews);
        
        // Update product with new summary
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                'reviewSummary.summaryPoints': aiSummary.summaryPoints,
                'reviewSummary.overallSentiment': aiSummary.overallSentiment,
                'reviewSummary.totalReviews': aiSummary.totalReviews,
                'reviewSummary.averageRating': aiSummary.averageRating
            },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Review summary regenerated successfully',
            data: {
                reviewSummary: updatedProduct.reviewSummary
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Add a single review to a product
exports.addProductReview = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const { customerName, rating, reviewText } = req.body;
    
    try {
        if (!customerName || !rating || !reviewText) {
            return next(new ErrorHandler('Customer name, rating, and review text are required', 400));
        }
        
        if (rating < 1 || rating > 5) {
            return next(new ErrorHandler('Rating must be between 1 and 5', 400));
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return next(new ErrorHandler('Product not found', 404));
        }
        
        const newReview = {
            customerName,
            rating: parseInt(rating),
            reviewText,
            reviewDate: new Date(),
            verified: true
        };
        
        // Add review to product
        product.reviews.push(newReview);
        
        // Recalculate review summary
        const totalReviews = product.reviews.length;
        const averageRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        
        product.reviewSummary.totalReviews = totalReviews;
        product.reviewSummary.averageRating = Math.round(averageRating * 10) / 10;
        
        // Determine overall sentiment
        if (averageRating >= 4) product.reviewSummary.overallSentiment = 'positive';
        else if (averageRating <= 2.5) product.reviewSummary.overallSentiment = 'negative';
        else product.reviewSummary.overallSentiment = 'neutral';
        
        await product.save();
        
        // Regenerate AI summary if there are enough reviews
        if (totalReviews >= 3) {
            const aiSummary = await reviewSummarizer.summarizeReviews(product.reviews);
            await Product.findByIdAndUpdate(productId, {
                'reviewSummary.summaryPoints': aiSummary.summaryPoints
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            data: {
                review: newReview,
                reviewSummary: product.reviewSummary
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});

// Get products with their review summaries
exports.getProductsWithReviews = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 20, minRating, maxRating, sentiment } = req.query;
    
    try {
        let filter = {};
        
        // Filter by rating range
        if (minRating) {
            filter['reviewSummary.averageRating'] = { $gte: parseFloat(minRating) };
        }
        if (maxRating) {
            filter['reviewSummary.averageRating'] = { 
                ...filter['reviewSummary.averageRating'], 
                $lte: parseFloat(maxRating) 
            };
        }
        
        // Filter by sentiment
        if (sentiment && ['positive', 'neutral', 'negative'].includes(sentiment)) {
            filter['reviewSummary.overallSentiment'] = sentiment;
        }
        
        const skip = (page - 1) * limit;
        
        const products = await Product.find(filter)
            .select('title brand sellingPrice images reviewSummary')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ 'reviewSummary.averageRating': -1 });
        
        const totalProducts = await Product.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts,
                    hasNext: skip + products.length < totalProducts,
                    hasPrev: page > 1
                }
            }
        });
        
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});