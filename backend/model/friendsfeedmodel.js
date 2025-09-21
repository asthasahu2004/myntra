const mongoose = require('mongoose')

const friendsFeedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MynUser',
        required: true
    },
    selectedContacts: [{
        contactId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contact',
            required: true
        },
        contactName: String,
        selectionWeight: {
            type: Number,
            default: 1 // Can be used for weighted relevance
        }
    }],
    combinedProducts: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        relevanceScore: {
            type: Number,
            required: true
        },
        sources: [{
            contactId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Contact'
            },
            sourceType: {
                type: String,
                enum: ['wishlist', 'orderHistory', 'watchTime']
            },
            score: Number
        }],
        aggregatedData: {
            totalWishlistCount: { type: Number, default: 0 },
            totalOrderCount: { type: Number, default: 0 },
            totalWatchTime: { type: Number, default: 0 },
            averageRating: { type: Number, default: 0 },
            totalViewCount: { type: Number, default: 0 }
        }
    }],
    feedMetadata: {
        totalProducts: Number,
        totalContacts: Number,
        generatedAt: {
            type: Date,
            default: Date.now
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    },
    filters: {
        priceRange: {
            min: Number,
            max: Number
        },
        categories: [String],
        brands: [String],
        sortBy: {
            type: String,
            enum: ['relevance', 'price_asc', 'price_desc', 'rating', 'newest'],
            default: 'relevance'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from creation
    }
})

// Index for efficient querying
friendsFeedSchema.index({ userId: 1, isActive: 1 })
friendsFeedSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to generate feed from contacts
friendsFeedSchema.statics.generateFeed = async function(userId, contactIds) {
    const Contact = mongoose.model('Contact')
    
    console.log('generateFeed called with contactIds:', contactIds)
    console.log('contactIds types:', contactIds.map(id => typeof id))
    
    const contacts = await Contact.find({ _id: { $in: contactIds } })
    console.log('Found contacts:', contacts.length)
    if (contacts.length < 10) {
        throw new Error('At least 10 contacts required')
    }
    
    const productMap = new Map()
    
    contacts.forEach(contact => {
        const combinedDataset = contact.getCombinedDataset()
        
        combinedDataset.forEach(item => {
            const productId = typeof item.productId === 'string' ? 
                item.productId : item.productId.toString()
            
            if (!productMap.has(productId)) {
                productMap.set(productId, {
                    productId: new mongoose.Types.ObjectId(productId),
                    name: item.name || `Product ${productId}`,
                    price: item.price || 0,
                    category: item.category || 'Unknown',
                    brand: item.brand || 'Unknown',
                    relevanceScore: 0,
                    sources: []
                })
            }
            
            const product = productMap.get(productId)
            product.relevanceScore += item.relevanceScore
            product.sources.push({
                contactId: contact._id,
                sourceType: item.source,
                score: item.relevanceScore
            })
        })
    })
    
    const combinedProducts = Array.from(productMap.values())
    combinedProducts.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    await this.updateMany({ userId, isActive: true }, { isActive: false })
    
    console.log('Creating feed with combinedProducts count:', combinedProducts.length)
    console.log('Sample product:', combinedProducts[0])
    
    const feed = new this({
        userId,
        selectedContacts: contacts.map(c => ({
            contactId: c._id,
            contactName: c.name
        })),
        combinedProducts,
        feedMetadata: {
            totalProducts: combinedProducts.length,
            totalContacts: contacts.length,
            generatedAt: new Date()
        }
    })
    
    await feed.save()
    return feed
}

// Instance method to get similar products
friendsFeedSchema.methods.getSimilarProducts = async function(productId, limit = 5) {
    const Product = mongoose.model('Product')
    
    try {
        // Find the target product in the feed
        const targetProduct = this.combinedProducts.find(
            p => p.productId.toString() === productId.toString()
        )
        
        if (!targetProduct) {
            return []
        }
        
        // Get product details for similarity comparison
        const product = await Product.findById(productId)
        if (!product) return []
        
        // Find similar products based on category, brand, and price range
        const similarProducts = await Product.find({
            _id: { $ne: productId },
            $or: [
                { category: product.category },
                { brand: product.brand },
                { 
                    price: { 
                        $gte: product.price * 0.8, 
                        $lte: product.price * 1.2 
                    } 
                }
            ]
        }).limit(limit * 2) // Get more to filter from feed
        
        // Filter to only include products that are in the feed
        const feedProductIds = this.combinedProducts.map(p => p.productId.toString())
        const filteredSimilar = similarProducts.filter(p => 
            feedProductIds.includes(p._id.toString())
        ).slice(0, limit)
        
        return filteredSimilar
    } catch (error) {
        throw error
    }
}

module.exports = mongoose.model('FriendsFeed', friendsFeedSchema)