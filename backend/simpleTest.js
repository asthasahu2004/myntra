const axios = require('axios');

async function testReviewAPI() {
    try {
        console.log('🌐 Testing Review API Endpoints...\n');
        
        // First, let's get a product to test with
        const productsResponse = await axios.get('http://localhost:4000/api/v1/products');
        
        if (!productsResponse.data.products || productsResponse.data.products.length === 0) {
            console.log('❌ No products found in database');
            return;
        }
        
        const product = productsResponse.data.products[0];
        console.log(`📦 Testing with product: "${product.title}"`);
        console.log(`🏷️  Brand: ${product.brand}`);
        console.log(`💰 Price: ₹${product.sellingPrice}\n`);
        
        // Test 1: Generate reviews for the product
        console.log('📝 Step 1: Generating reviews...');
        try {
            const generateResponse = await axios.post(`http://localhost:4000/api/v1/reviews/generate/${product._id}`);
            console.log('✅ Reviews generated successfully!');
            console.log(`📊 Generated ${generateResponse.data.data.reviews.length} reviews\n`);
        } catch (error) {
            console.log('❌ Error generating reviews:', error.response?.data?.message || error.message);
            return;
        }
        
        // Test 2: Get the generated reviews
        console.log('📋 Step 2: Retrieving reviews...');
        try {
            const reviewsResponse = await axios.get(`http://localhost:4000/api/v1/reviews/product/${product._id}`);
            const reviews = reviewsResponse.data.data.reviews;
            
            console.log(`✅ Retrieved ${reviews.length} reviews:`);
            reviews.forEach((review, index) => {
                console.log(`   ${index + 1}. ${review.customerName} - ${review.rating}/5 ⭐`);
                console.log(`      "${review.reviewText}"`);
            });
            console.log('');
        } catch (error) {
            console.log('❌ Error retrieving reviews:', error.response?.data?.message || error.message);
        }
        
        // Test 3: Get the review summary
        console.log('📊 Step 3: Retrieving review summary...');
        try {
            const summaryResponse = await axios.get(`http://localhost:4000/api/v1/reviews/summary/${product._id}`);
            const summary = summaryResponse.data.data.reviewSummary;
            
            console.log('✅ Review Summary:');
            console.log(`   📈 Total Reviews: ${summary.totalReviews}`);
            console.log(`   ⭐ Average Rating: ${summary.averageRating}/5`);
            console.log(`   😊 Overall Sentiment: ${summary.overallSentiment.toUpperCase()}`);
            console.log('   🔍 Summary Points:');
            summary.summaryPoints.forEach((point, index) => {
                console.log(`      ${index + 1}. ${point}`);
            });
            console.log('');
        } catch (error) {
            console.log('❌ Error retrieving summary:', error.response?.data?.message || error.message);
        }
        
        console.log('🎉 Review System Test Completed Successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReviewAPI();