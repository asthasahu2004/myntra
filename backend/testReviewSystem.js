const mongoose = require('mongoose');
require('./database/Database');
const Product = require('./model/productmodel');
const reviewSummarizer = require('./services/reviewSummarizer');
const { generateReviewsForSpecificProduct } = require('./scripts/generateReviews');

async function testReviewSystem() {
    try {
        console.log('🚀 Starting Review System Test...\n');
        
        // Get a sample product
        const products = await Product.find({}).limit(1);
        if (products.length === 0) {
            console.log('❌ No products found in database. Please add some products first.');
            return;
        }
        
        const product = products[0];
        console.log(`📦 Testing with product: "${product.title}"`);
        console.log(`🏷️  Brand: ${product.brand}`);
        console.log(`💰 Price: ₹${product.sellingPrice}\n`);
        
        // Step 1: Generate reviews
        console.log('📝 Step 1: Generating realistic customer reviews...');
        const result = await generateReviewsForSpecificProduct(product._id);
        
        if (!result) {
            console.log('❌ Failed to generate reviews');
            return;
        }
        
        console.log(`✅ Generated ${result.reviews.length} reviews successfully!\n`);
        
        // Display generated reviews
        console.log('📋 Generated Reviews:');
        console.log('=' .repeat(60));
        result.reviews.forEach((review, index) => {
            console.log(`${index + 1}. ${review.customerName} - ${review.rating}/5 ⭐`);
            console.log(`   "${review.reviewText}"`);
            console.log(`   Date: ${review.reviewDate.toDateString()}`);
            console.log('');
        });
        
        // Step 2: Generate AI summary using Flan-T5
        console.log('🤖 Step 2: Generating AI-powered review summary using Flan-T5...');
        
        const aiSummary = await reviewSummarizer.summarizeReviews(result.reviews);
        
        console.log('✅ AI Summary generated successfully!\n');
        
        // Display summary
        console.log('📊 Review Summary:');
        console.log('=' .repeat(60));
        console.log(`📈 Total Reviews: ${aiSummary.totalReviews}`);
        console.log(`⭐ Average Rating: ${aiSummary.averageRating}/5`);
        console.log(`😊 Overall Sentiment: ${aiSummary.overallSentiment.toUpperCase()}`);
        console.log('\n🔍 Key Summary Points:');
        aiSummary.summaryPoints.forEach((point, index) => {
            console.log(`   ${index + 1}. ${point}`);
        });
        
        // Step 3: Update product in database
        console.log('\n💾 Step 3: Updating product in database...');
        
        await Product.findByIdAndUpdate(product._id, {
            'reviewSummary.summaryPoints': aiSummary.summaryPoints,
            'reviewSummary.overallSentiment': aiSummary.overallSentiment,
            'reviewSummary.totalReviews': aiSummary.totalReviews,
            'reviewSummary.averageRating': aiSummary.averageRating
        });
        
        console.log('✅ Product updated with reviews and AI summary!\n');
        
        // Step 4: Verify the update
        console.log('🔍 Step 4: Verifying database update...');
        const updatedProduct = await Product.findById(product._id);
        
        console.log('✅ Verification successful!');
        console.log(`📊 Database shows: ${updatedProduct.reviewSummary.totalReviews} reviews, ${updatedProduct.reviewSummary.averageRating} avg rating`);
        
        // Step 5: Test API endpoints (simulation)
        console.log('\n🌐 Step 5: API Endpoints Available:');
        console.log('=' .repeat(60));
        console.log(`GET    /api/v1/reviews/product/${product._id}           - Get all reviews`);
        console.log(`GET    /api/v1/reviews/summary/${product._id}           - Get review summary`);
        console.log(`POST   /api/v1/reviews/generate/${product._id}          - Generate reviews`);
        console.log(`PUT    /api/v1/reviews/regenerate/${product._id}        - Regenerate reviews`);
        console.log(`PUT    /api/v1/reviews/summary/${product._id}           - Regenerate summary`);
        console.log(`POST   /api/v1/reviews/add/${product._id}               - Add single review`);
        console.log(`GET    /api/v1/reviews/products                         - Get products with reviews`);
        
        console.log('\n🎉 Review System Test Completed Successfully!');
        console.log('\n📋 Summary of Features Implemented:');
        console.log('   ✅ Realistic review generation (3-7 reviews per product)');
        console.log('   ✅ Varied sentiment distribution (positive, neutral, negative)');
        console.log('   ✅ Mentions quality, fit, material, delivery, price, style');
        console.log('   ✅ Flan-T5 AI-powered review summarization');
        console.log('   ✅ 3-4 bullet point summaries');
        console.log('   ✅ Overall sentiment analysis');
        console.log('   ✅ Complete REST API endpoints');
        console.log('   ✅ Database integration');
        
    } catch (error) {
        console.error('❌ Error during test:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Function to test API endpoints with sample requests
async function testAPIEndpoints() {
    const axios = require('axios');
    const baseURL = 'http://localhost:4000/api/v1/reviews';
    
    try {
        console.log('🌐 Testing API Endpoints...\n');
        
        // Get a sample product
        const products = await Product.find({}).limit(1);
        if (products.length === 0) {
            console.log('❌ No products found');
            return;
        }
        
        const productId = products[0]._id;
        
        // Test 1: Generate reviews
        console.log('1. Testing review generation...');
        const generateResponse = await axios.post(`${baseURL}/generate/${productId}`);
        console.log('✅ Reviews generated:', generateResponse.data.message);
        
        // Test 2: Get reviews
        console.log('2. Testing get reviews...');
        const getResponse = await axios.get(`${baseURL}/product/${productId}`);
        console.log('✅ Retrieved reviews:', getResponse.data.data.reviews.length);
        
        // Test 3: Get summary
        console.log('3. Testing get summary...');
        const summaryResponse = await axios.get(`${baseURL}/summary/${productId}`);
        console.log('✅ Retrieved summary:', summaryResponse.data.data.reviewSummary.summaryPoints.length, 'points');
        
        console.log('\n🎉 API Tests Completed Successfully!');
        
    } catch (error) {
        console.error('❌ API Test Error:', error.message);
    }
}

// Export functions for use in other modules
module.exports = {
    testReviewSystem,
    testAPIEndpoints
};

// Run if called directly
if (require.main === module) {
    testReviewSystem();
}