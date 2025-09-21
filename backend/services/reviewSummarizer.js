let transformers = null;

class ReviewSummarizer {
    constructor() {
        this.summarizer = null;
        this.initialized = false;
    }

    // Initialize the BART model
    async initialize() {
        if (this.initialized) return;
        
        try {
            console.log('🤖 Initializing BART model for review summarization...');
            
            // Dynamic import for ES module
            if (!transformers) {
                transformers = await import('@xenova/transformers');
            }
            
            // Using BART for better summarization
            this.summarizer = await transformers.pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
            this.initialized = true;
            console.log('✅ BART model initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing BART model:', error);
            console.log('📝 Falling back to manual summarization...');
            this.summarizer = null;
            this.initialized = false;
        }
    }

    // Analyze sentiment distribution in reviews
    analyzeSentimentDistribution(reviews) {
        const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
        
        reviews.forEach(review => {
            if (review.rating >= 4) sentimentCounts.positive++;
            else if (review.rating === 3) sentimentCounts.neutral++;
            else sentimentCounts.negative++;
        });
        
        return sentimentCounts;
    }

    // Extract key themes from reviews
    extractKeyThemes(reviews) {
        const themes = {
            quality: [],
            fit: [],
            style: [],
            delivery: [],
            price: [],
            comfort: [],
            material: []
        };
        
        reviews.forEach(review => {
            const text = review.reviewText.toLowerCase();
            
            // Quality related
            if (text.includes('quality') || text.includes('build') || text.includes('craftsmanship')) {
                themes.quality.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Fit related
            if (text.includes('fit') || text.includes('size') || text.includes('tight') || text.includes('loose')) {
                themes.fit.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Style related
            if (text.includes('style') || text.includes('design') || text.includes('look') || text.includes('color')) {
                themes.style.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Delivery related
            if (text.includes('delivery') || text.includes('shipping') || text.includes('package')) {
                themes.delivery.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Price related
            if (text.includes('price') || text.includes('money') || text.includes('value') || text.includes('cost')) {
                themes.price.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Comfort related
            if (text.includes('comfort') || text.includes('soft') || text.includes('comfortable')) {
                themes.comfort.push({ rating: review.rating, text: review.reviewText });
            }
            
            // Material related
            if (text.includes('material') || text.includes('fabric') || text.includes('cotton') || text.includes('polyester')) {
                themes.material.push({ rating: review.rating, text: review.reviewText });
            }
        });
        
        return themes;
    }

    // Generate summary using BART
    async generateAISummary(reviewsText) {
        if (!this.initialized) {
            await this.initialize();
        }
        
        try {
            // Prepare the text for BART summarization
            const cleanedText = reviewsText.replace(/\s+/g, ' ').trim();
            
            // BART works better with direct text input for summarization
            const result = await this.summarizer(cleanedText, {
                max_length: 150,
                min_length: 40,
                do_sample: false
            });
            
            // BART returns a summary_text field
            const summary = result[0].summary_text;
            
            // Transform the summary into a more natural format
            return this.transformToNaturalSummary(summary);
        } catch (error) {
            console.error('Error generating BART summary:', error);
            return null;
        }
    }

    // Transform BART summary into natural customer-focused language
    transformToNaturalSummary(summary) {
        // Extract key themes and transform to customer-focused language
        let naturalSummary = summary;
        
        // Replace technical language with customer-focused language
        naturalSummary = naturalSummary.replace(/product/gi, 'this item');
        naturalSummary = naturalSummary.replace(/customers/gi, 'shoppers');
        naturalSummary = naturalSummary.replace(/reviews/gi, 'feedback');
        
        // Add natural connectors if not present
        if (!naturalSummary.includes('however') && !naturalSummary.includes('but')) {
            // Try to identify positive and negative aspects to add natural flow
            const sentences = naturalSummary.split(/[.!?]+/).filter(s => s.trim());
            if (sentences.length > 1) {
                naturalSummary = sentences.join(', however ') + '.';
            }
        }
        
        return naturalSummary;
    }

    // Create natural manual summary as fallback
    createManualSummary(reviews, themes, sentimentCounts) {
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        
        // Collect what customers loved and what they felt could be improved
        const lovedAspects = [];
        const improvementAreas = [];
        
        // Analyze quality feedback
        if (themes.quality.length > 0) {
            const qualityRating = themes.quality.reduce((sum, item) => sum + item.rating, 0) / themes.quality.length;
            if (qualityRating >= 4) {
                lovedAspects.push('quality');
            } else if (qualityRating <= 2.5) {
                improvementAreas.push('quality');
            }
        }
        
        // Analyze fit feedback
        if (themes.fit.length > 0) {
            const fitRating = themes.fit.reduce((sum, item) => sum + item.rating, 0) / themes.fit.length;
            if (fitRating >= 4) {
                lovedAspects.push('fit');
            } else if (fitRating <= 2.5) {
                improvementAreas.push('sizing');
            }
        }
        
        // Add other common aspects based on sentiment
        if (sentimentCounts.positive > totalReviews * 0.5) {
            lovedAspects.push('design', 'comfort');
        }
        if (sentimentCounts.negative > totalReviews * 0.3) {
            improvementAreas.push('value for money');
        }
        
        // Create natural summary
        let summary = '';
        if (lovedAspects.length > 0) {
            summary += `Customers loved the ${lovedAspects.slice(0, 3).join(', ')} of this product`;
            if (improvementAreas.length > 0) {
                summary += `, however some of them felt that the ${improvementAreas.slice(0, 2).join(' and ')} could be improved.`;
            } else {
                summary += ' and had an overall positive experience.';
            }
        } else if (improvementAreas.length > 0) {
            summary += `Some customers felt that the ${improvementAreas.slice(0, 2).join(' and ')} could be improved.`;
        } else {
            summary += 'Customers have shared mixed experiences with this product.';
        }
        
        return [summary];
    }

    // Main function to summarize reviews
    async summarizeReviews(reviews) {
        if (!this.initialized) {
            await this.initialize();
        }

        if (!reviews || reviews.length === 0) {
            return {
                summaryPoints: ['No reviews available yet'],
                overallSentiment: 'neutral',
                totalReviews: 0,
                averageRating: 0
            };
        }
        
        try {
            // Analyze sentiment distribution
            const sentimentCounts = this.analyzeSentimentDistribution(reviews);
            
            // Extract key themes
            const themes = this.extractKeyThemes(reviews);
            
            // Calculate basic stats
            const totalReviews = reviews.length;
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
            
            // Determine overall sentiment
            let overallSentiment = 'neutral';
            if (averageRating >= 4) overallSentiment = 'positive';
            else if (averageRating <= 2.5) overallSentiment = 'negative';
            
            let summaryPoints = [];
            
            // Try AI summarization first if model is available
            if (this.summarizer) {
                try {
                    const reviewsText = reviews.map(review => review.reviewText).join(' ');
                    
                    if (reviewsText.length < 2000) { // Only for reasonable text lengths
                        const aiSummary = await this.generateAISummary(reviewsText);
                        if (aiSummary) {
                            // Parse AI summary into bullet points
                            summaryPoints = aiSummary.split(/[.!?]/)
                                .filter(point => point.trim().length > 10)
                                .map(point => point.trim())
                                .slice(0, 4);
                        }
                    }
                } catch (error) {
                    console.log('🔄 AI summarization failed, using manual summary fallback...');
                }
            } else {
                console.log('🔄 Using manual summarization fallback...');
            }
            
            // Fallback to manual summary if AI fails or is not available
            if (summaryPoints.length === 0) {
                summaryPoints = this.createManualSummary(reviews, themes, sentimentCounts);
            }
            
            return {
                summaryPoints,
                overallSentiment,
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10
            };
            
        } catch (error) {
            console.error('Error summarizing reviews:', error);
            
            // Return basic summary on error
            const totalReviews = reviews.length;
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
            
            return {
                summaryPoints: [
                    `${totalReviews} customer reviews with average rating of ${averageRating.toFixed(1)} stars`,
                    'Mixed customer feedback on various aspects',
                    'Check individual reviews for detailed insights'
                ],
                overallSentiment: averageRating >= 4 ? 'positive' : averageRating <= 2.5 ? 'negative' : 'neutral',
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10
            };
        }
    }
}

// Create singleton instance
const reviewSummarizer = new ReviewSummarizer();

module.exports = reviewSummarizer;