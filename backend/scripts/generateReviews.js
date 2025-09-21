const mongoose = require('mongoose');
require('../database/Database');
const Product = require('../model/productmodel');

// Sample customer names
const customerNames = [
    'Priya S.', 'Rahul K.', 'Sneha M.', 'Arjun P.', 'Kavya R.', 'Vikram T.',
    'Ananya G.', 'Rohan D.', 'Meera J.', 'Karthik L.', 'Divya N.', 'Aditya B.',
    'Riya C.', 'Siddharth V.', 'Pooja H.', 'Nikhil A.', 'Shreya F.', 'Varun M.',
    'Nisha K.', 'Abhishek S.', 'Tanya R.', 'Harsh P.', 'Isha T.', 'Manish G.'
];

// Review templates for different aspects and sentiments
const reviewTemplates = {
    positive: {
        quality: [
            "Excellent quality! The material feels premium and well-made.",
            "Really impressed with the build quality. Worth every penny!",
            "Top-notch quality, exactly what I expected from this brand.",
            "The craftsmanship is outstanding. Very satisfied with the purchase."
        ],
        fit: [
            "Perfect fit! Ordered my usual size and it fits like a glove.",
            "Great fit, very comfortable to wear all day.",
            "The sizing is accurate. Fits exactly as described.",
            "Comfortable fit, not too tight or loose. Just right!"
        ],
        style: [
            "Love the design! Very trendy and stylish.",
            "Looks exactly like the pictures. Beautiful color and style.",
            "Super stylish! Got so many compliments wearing this.",
            "The design is modern and chic. Perfect for any occasion."
        ],
        delivery: [
            "Fast delivery! Arrived earlier than expected.",
            "Quick shipping and well-packaged. No damage at all.",
            "Delivered on time and in perfect condition.",
            "Excellent packaging and prompt delivery service."
        ],
        price: [
            "Great value for money! Quality justifies the price.",
            "Reasonable price for such good quality.",
            "Worth the investment. Good quality at this price point.",
            "Fair pricing considering the material and design."
        ]
    },
    neutral: {
        quality: [
            "Decent quality for the price. Nothing extraordinary but okay.",
            "Average quality. It's fine but could be better.",
            "The quality is acceptable. Not the best but not bad either.",
            "Standard quality. Meets basic expectations."
        ],
        fit: [
            "Fit is okay. Maybe runs slightly small/large but manageable.",
            "Average fit. Could be better but it's wearable.",
            "The fit is decent. Not perfect but acceptable.",
            "Sizing is mostly accurate. Minor adjustments needed."
        ],
        style: [
            "Nice design but nothing too special.",
            "The style is okay. Pretty standard for this category.",
            "Decent look. Not my favorite but it's fine.",
            "Average styling. Could use some improvements."
        ],
        delivery: [
            "Delivery was on time. Standard packaging.",
            "Arrived as scheduled. Nothing special about the delivery.",
            "Normal delivery experience. No issues but nothing outstanding.",
            "Standard shipping time. Package was fine."
        ],
        price: [
            "Price is reasonable. Not a steal but fair enough.",
            "Okay pricing. Could be cheaper but it's acceptable.",
            "Average price for this type of product.",
            "Fair price. Not the cheapest option but reasonable."
        ]
    },
    negative: {
        quality: [
            "Poor quality. The material feels cheap and flimsy.",
            "Not satisfied with the quality. Expected much better.",
            "Quality is disappointing. Doesn't match the price.",
            "Cheap material. Started showing wear after just a few uses."
        ],
        fit: [
            "Terrible fit! Way too small/large despite ordering correct size.",
            "The sizing is completely off. Very uncomfortable.",
            "Poor fit. Had to return because it didn't fit properly.",
            "Sizing chart is misleading. Doesn't fit as expected."
        ],
        style: [
            "Looks different from the pictures. Color is off.",
            "Design is outdated and not as stylish as shown.",
            "Not impressed with the style. Looks cheap in person.",
            "The design doesn't match the online photos at all."
        ],
        delivery: [
            "Slow delivery. Took much longer than promised.",
            "Package arrived damaged. Poor packaging quality.",
            "Delayed delivery and no proper communication.",
            "Terrible shipping experience. Package was in bad condition."
        ],
        price: [
            "Overpriced for the quality you get.",
            "Too expensive. Not worth the money at all.",
            "Price doesn't justify the quality. Better options available.",
            "Way too costly for such poor quality."
        ]
    }
};

// Function to get random element from array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Function to generate a single review
function generateSingleReview(product) {
    const customerName = getRandomElement(customerNames);
    
    // Determine sentiment (60% positive, 25% neutral, 15% negative)
    const sentimentRand = Math.random();
    let sentiment;
    if (sentimentRand < 0.6) sentiment = 'positive';
    else if (sentimentRand < 0.85) sentiment = 'neutral';
    else sentiment = 'negative';
    
    // Determine rating based on sentiment
    let rating;
    if (sentiment === 'positive') rating = Math.random() < 0.7 ? 5 : 4;
    else if (sentiment === 'neutral') rating = Math.random() < 0.6 ? 3 : (Math.random() < 0.5 ? 2 : 4);
    else rating = Math.random() < 0.7 ? (Math.random() < 0.5 ? 1 : 2) : 3;
    
    // Select 1-2 aspects to mention
    const aspects = ['quality', 'fit', 'style', 'delivery', 'price'];
    const selectedAspects = [];
    const numAspects = Math.random() < 0.7 ? 1 : 2;
    
    for (let i = 0; i < numAspects; i++) {
        const aspect = getRandomElement(aspects.filter(a => !selectedAspects.includes(a)));
        selectedAspects.push(aspect);
    }
    
    // Generate review text
    let reviewText = '';
    selectedAspects.forEach((aspect, index) => {
        const templates = reviewTemplates[sentiment][aspect];
        reviewText += getRandomElement(templates);
        if (index < selectedAspects.length - 1) {
            reviewText += ' ';
        }
    });
    
    // Add product-specific context occasionally
    if (Math.random() < 0.3) {
        if (product.category && product.category.toLowerCase().includes('shirt')) {
            reviewText += ' Perfect for office wear.';
        } else if (product.category && product.category.toLowerCase().includes('dress')) {
            reviewText += ' Great for special occasions.';
        } else if (product.category && product.category.toLowerCase().includes('jeans')) {
            reviewText += ' Very comfortable for daily wear.';
        }
    }
    
    return {
        customerName,
        rating,
        reviewText,
        reviewDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        verified: Math.random() < 0.85 // 85% verified purchases
    };
}

// Function to generate reviews for a product
function generateReviewsForProduct(product) {
    const numReviews = Math.floor(Math.random() * 5) + 3; // 3-7 reviews
    const reviews = [];
    
    for (let i = 0; i < numReviews; i++) {
        reviews.push(generateSingleReview(product));
    }
    
    return reviews;
}

// Function to calculate review summary
function calculateReviewSummary(reviews) {
    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    // Determine overall sentiment
    let overallSentiment = 'neutral';
    if (averageRating >= 4) overallSentiment = 'positive';
    else if (averageRating <= 2.5) overallSentiment = 'negative';
    
    return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        summaryPoints: [], // Will be filled by AI summarization
        overallSentiment
    };
}

// Main function to generate reviews for all products
async function generateReviewsForAllProducts() {
    try {
        console.log('Starting review generation...');
        
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);
        
        let updatedCount = 0;
        
        for (const product of products) {
            // Skip if product already has reviews
            if (product.reviews && product.reviews.length > 0) {
                console.log(`Skipping ${product.title} - already has reviews`);
                continue;
            }
            
            const reviews = generateReviewsForProduct(product);
            const reviewSummary = calculateReviewSummary(reviews);
            
            await Product.findByIdAndUpdate(product._id, {
                reviews,
                reviewSummary
            });
            
            updatedCount++;
            console.log(`Generated ${reviews.length} reviews for: ${product.title}`);
        }
        
        console.log(`\nReview generation completed! Updated ${updatedCount} products.`);
        
    } catch (error) {
        console.error('Error generating reviews:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Function to generate reviews for a specific product
async function generateReviewsForSpecificProduct(productId) {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            console.log('Product not found');
            return;
        }
        
        const reviews = generateReviewsForProduct(product);
        const reviewSummary = calculateReviewSummary(reviews);
        
        await Product.findByIdAndUpdate(productId, {
            reviews,
            reviewSummary
        });
        
        console.log(`Generated ${reviews.length} reviews for: ${product.title}`);
        return { reviews, reviewSummary };
        
    } catch (error) {
        console.error('Error generating reviews for specific product:', error);
    }
}

// Export functions for use in other modules
module.exports = {
    generateReviewsForAllProducts,
    generateReviewsForSpecificProduct,
    generateSingleReview,
    calculateReviewSummary
};

// Run if called directly
if (require.main === module) {
    generateReviewsForAllProducts();
}