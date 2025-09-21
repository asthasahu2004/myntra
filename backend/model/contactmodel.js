const mongoose = require('mongoose')

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Contact name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Contact email is required"],
        unique: true,
        lowercase: true
    },
    avatar: {
        type: String,
        default: null // Optional avatar URL
    },
    metadata: {
        totalProducts: {
            type: Number,
            default: 0
        },
        totalWatchTime: {
            type: Number,
            default: 0 // in minutes
        },
        totalOrders: {
            type: Number,
            default: 0
        }
    },
    productDatasets: {
        wishlist: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            addedAt: {
                type: Date,
                default: Date.now
            },
            priority: {
                type: Number,
                default: 1 // 1-5 scale
            }
        }],
        orderHistory: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            orderedAt: {
                type: Date,
                default: Date.now
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                required: true
            },
            rating: {
                type: Number,
                min: 1,
                max: 5
            }
        }],
        watchTime: [{
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            timeSpent: {
                type: Number, // in seconds
                required: true
            },
            lastViewed: {
                type: Date,
                default: Date.now
            },
            viewCount: {
                type: Number,
                default: 1
            }
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Update the updatedAt field before saving
contactSchema.pre('save', function(next) {
    this.updatedAt = Date.now()
    next()
})

// Calculate and update metadata before saving
contactSchema.pre('save', function(next) {
    this.metadata.totalProducts = this.productDatasets.wishlist.length + 
                                  this.productDatasets.orderHistory.length + 
                                  this.productDatasets.watchTime.length
    
    this.metadata.totalOrders = this.productDatasets.orderHistory.length
    
    this.metadata.totalWatchTime = this.productDatasets.watchTime.reduce((total, item) => {
        return total + (item.timeSpent / 60) // convert seconds to minutes
    }, 0)
    
    next()
})

// Instance method to get combined product dataset
contactSchema.methods.getCombinedDataset = function() {
    const combined = []
    
    this.productDatasets.wishlist.forEach(item => {
        combined.push({
            productId: item.productId,
            source: 'wishlist',
            relevanceScore: (item.priority || 1) * 2,
            timestamp: item.addedAt,
            name: item.name,
            price: item.price,
            category: item.category,
            brand: item.brand
        })
    })
    
    this.productDatasets.orderHistory.forEach(item => {
        combined.push({
            productId: item.productId,
            source: 'orderHistory',
            relevanceScore: (item.rating || 3) * 3,
            timestamp: item.orderedAt,
            name: item.name,
            price: item.price,
            category: item.category,
            brand: item.brand,
            rating: item.rating
        })
    })
    
    this.productDatasets.watchTime.forEach(item => {
        const timeScore = Math.min((item.timeSpent || 0) / 60, 10)
        const viewScore = Math.min(item.viewCount || 1, 5)
        combined.push({
            productId: item.productId,
            source: 'watchTime',
            relevanceScore: timeScore + viewScore,
            timestamp: item.lastViewed,
            timeSpent: item.timeSpent,
            viewCount: item.viewCount
        })
    })
    
    return combined
}

module.exports = mongoose.model('Contact', contactSchema)