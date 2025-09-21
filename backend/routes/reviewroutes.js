const express = require('express');
const router = express.Router();

const {
    generateProductReviews,
    regenerateProductReviews,
    getProductReviews,
    getProductReviewSummary,
    regenerateReviewSummary,
    addProductReview,
    getProductsWithReviews
} = require('../controller/reviewcontroller');

// Routes for review management

// Generate reviews for a specific product
router.post('/generate/:productId', generateProductReviews);

// Regenerate reviews for a product (replace existing)
router.put('/regenerate/:productId', regenerateProductReviews);

// Get reviews for a specific product with pagination and sorting
router.get('/product/:productId', getProductReviews);

// Get review summary for a specific product
router.get('/summary/:productId', getProductReviewSummary);

// Regenerate AI summary for existing reviews
router.put('/summary/:productId', regenerateReviewSummary);

// Add a single review to a product
router.post('/add/:productId', addProductReview);

// Get products with their review summaries (with filtering)
router.get('/products', getProductsWithReviews);

module.exports = router;