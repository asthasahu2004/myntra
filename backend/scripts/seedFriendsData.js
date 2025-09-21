require('dotenv').config({ path: '../config/config.env' })
const mongoose = require('mongoose')
const Contact = require('../model/contactmodel')
const Product = require('../model/productmodel')
const FriendsFeed = require('../model/friendsfeedmodel')

// Sample contacts data
const sampleContacts = [
  {
    name: "Priya Sharma",
    email: "priya.sharma@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 45,
      totalWatchTime: 7200, // 2 hours
      totalOrders: 12,
      avgOrderValue: 2500,
      favoriteCategories: ["Women", "Beauty"],
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  },
  {
    name: "Rahul Gupta",
    email: "rahul.gupta@email.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 32,
      totalWatchTime: 5400, // 1.5 hours
      totalOrders: 8,
      avgOrderValue: 3200,
      favoriteCategories: ["Men", "Sports"],
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  },
  {
    name: "Anita Desai",
    email: "anita.desai@email.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 67,
      totalWatchTime: 9600, // 2.7 hours
      totalOrders: 18,
      avgOrderValue: 1800,
      favoriteCategories: ["Women", "Home & Living"],
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  },
  {
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 28,
      totalWatchTime: 4200, // 1.2 hours
      totalOrders: 6,
      avgOrderValue: 4500,
      favoriteCategories: ["Men", "Accessories"],
      lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  },
  {
    name: "Sneha Patel",
    email: "sneha.patel@email.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 89,
      totalWatchTime: 12600, // 3.5 hours
      totalOrders: 25,
      avgOrderValue: 2200,
      favoriteCategories: ["Women", "Beauty", "Accessories"],
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  },
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@email.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 41,
      totalWatchTime: 6300, // 1.75 hours
      totalOrders: 11,
      avgOrderValue: 3800,
      favoriteCategories: ["Men", "Sports", "Footwear"],
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  },
  {
    name: "Kavya Reddy",
    email: "kavya.reddy@email.com",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 56,
      totalWatchTime: 8100, // 2.25 hours
      totalOrders: 15,
      avgOrderValue: 2800,
      favoriteCategories: ["Women", "Kids", "Home & Living"],
      lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
  },
  {
    name: "Rohit Kumar",
    email: "rohit.kumar@email.com",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 33,
      totalWatchTime: 4800, // 1.33 hours
      totalOrders: 9,
      avgOrderValue: 3500,
      favoriteCategories: ["Men", "Electronics", "Sports"],
      lastActive: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    }
  },
  {
    name: "Meera Joshi",
    email: "meera.joshi@email.com",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 72,
      totalWatchTime: 10800, // 3 hours
      totalOrders: 20,
      avgOrderValue: 2100,
      favoriteCategories: ["Women", "Beauty", "Jewelry"],
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@email.com",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 38,
      totalWatchTime: 5700, // 1.58 hours
      totalOrders: 10,
      avgOrderValue: 4200,
      favoriteCategories: ["Men", "Formal", "Accessories"],
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  },
  {
    name: "Divya Agarwal",
    email: "divya.agarwal@email.com",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 84,
      totalWatchTime: 11400, // 3.17 hours
      totalOrders: 22,
      avgOrderValue: 1900,
      favoriteCategories: ["Women", "Casual", "Footwear"],
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  },
  {
    name: "Amit Verma",
    email: "amit.verma@email.com",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 29,
      totalWatchTime: 4500, // 1.25 hours
      totalOrders: 7,
      avgOrderValue: 3900,
      favoriteCategories: ["Men", "Casual", "Sports"],
      lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  },
  {
    name: "Riya Kapoor",
    email: "riya.kapoor@email.com",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 91,
      totalWatchTime: 13200, // 3.67 hours
      totalOrders: 28,
      avgOrderValue: 2400,
      favoriteCategories: ["Women", "Party", "Beauty"],
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  },
  {
    name: "Sanjay Rao",
    email: "sanjay.rao@email.com",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 35,
      totalWatchTime: 5100, // 1.42 hours
      totalOrders: 8,
      avgOrderValue: 3600,
      favoriteCategories: ["Men", "Formal", "Footwear"],
      lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
  },
  {
    name: "Pooja Nair",
    email: "pooja.nair@email.com",
    avatar: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 63,
      totalWatchTime: 9000, // 2.5 hours
      totalOrders: 17,
      avgOrderValue: 2600,
      favoriteCategories: ["Women", "Ethnic", "Jewelry"],
      lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  },
  {
    name: "Nikhil Jain",
    email: "nikhil.jain@email.com",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 42,
      totalWatchTime: 6600, // 1.83 hours
      totalOrders: 12,
      avgOrderValue: 3300,
      favoriteCategories: ["Men", "Casual", "Electronics"],
      lastActive: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  },
  {
    name: "Shreya Bansal",
    email: "shreya.bansal@email.com",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 78,
      totalWatchTime: 10200, // 2.83 hours
      totalOrders: 21,
      avgOrderValue: 2300,
      favoriteCategories: ["Women", "Western", "Bags"],
      lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  },
  {
    name: "Deepak Choudhary",
    email: "deepak.choudhary@email.com",
    avatar: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 31,
      totalWatchTime: 4650, // 1.29 hours
      totalOrders: 9,
      avgOrderValue: 3700,
      favoriteCategories: ["Men", "Sports", "Watches"],
      lastActive: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
    }
  },
  {
    name: "Nisha Gupta",
    email: "nisha.gupta@email.com",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 87,
      totalWatchTime: 12000, // 3.33 hours
      totalOrders: 24,
      avgOrderValue: 2000,
      favoriteCategories: ["Women", "Casual", "Home & Living"],
      lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
  },
  {
    name: "Rajesh Khanna",
    email: "rajesh.khanna@email.com",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    metadata: {
      totalProducts: 46,
      totalWatchTime: 7500, // 2.08 hours
      totalOrders: 13,
      avgOrderValue: 3100,
      favoriteCategories: ["Men", "Formal", "Accessories"],
      lastActive: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
    }
  }
]

// Sample products data
const sampleProducts = [
  {
    name: "Floral Print Maxi Dress",
    brand: "Zara",
    category: "Women",
    subcategory: "Dresses",
    price: 2999,
    originalPrice: 3999,
    images: [{ url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop" }],
    description: "Beautiful floral print maxi dress perfect for summer occasions",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Pink", "White"],
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    tags: ["summer", "floral", "maxi", "casual"]
  },
  {
    name: "Classic White Sneakers",
    brand: "Nike",
    category: "Footwear",
    subcategory: "Sneakers",
    price: 4999,
    originalPrice: 5999,
    images: [{ url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop" }],
    description: "Comfortable white sneakers for everyday wear",
    sizes: ["6", "7", "8", "9", "10", "11"],
    colors: ["White", "Black", "Grey"],
    inStock: true,
    rating: 4.7,
    reviewCount: 256,
    tags: ["sneakers", "casual", "comfortable", "sports"]
  },
  {
    name: "Denim Jacket",
    brand: "Levi's",
    category: "Men",
    subcategory: "Jackets",
    price: 3499,
    originalPrice: 4499,
    images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop" }],
    description: "Classic denim jacket with vintage wash",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "Black", "Light Blue"],
    inStock: true,
    rating: 4.3,
    reviewCount: 89,
    tags: ["denim", "jacket", "casual", "vintage"]
  },
  {
    name: "Silk Saree",
    brand: "Fabindia",
    category: "Women",
    subcategory: "Ethnic",
    price: 8999,
    originalPrice: 12999,
    images: [{ url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=600&fit=crop" }],
    description: "Elegant silk saree with traditional motifs",
    sizes: ["Free Size"],
    colors: ["Red", "Gold", "Green", "Blue"],
    inStock: true,
    rating: 4.8,
    reviewCount: 67,
    tags: ["silk", "saree", "ethnic", "traditional", "wedding"]
  },
  {
    name: "Wireless Earbuds",
    brand: "Apple",
    category: "Electronics",
    subcategory: "Audio",
    price: 18999,
    originalPrice: 24900,
    images: [{ url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&h=600&fit=crop" }],
    description: "Premium wireless earbuds with noise cancellation",
    sizes: ["One Size"],
    colors: ["White", "Black"],
    inStock: true,
    rating: 4.6,
    reviewCount: 342,
    tags: ["wireless", "earbuds", "audio", "premium", "noise-cancellation"]
  }
]

// Function to seed the database
const seedFriendsData = async () => {
  try {
    console.log('🌱 Starting Friends data seeding...')

    // Clear existing data
    await Contact.deleteMany({})
    await FriendsFeed.deleteMany({})
    console.log('🗑️ Cleared existing data')

    // Get all products from database
    const allProducts = await Product.find({}).limit(500)
    console.log(`📦 Found ${allProducts.length} products`)

    if (allProducts.length === 0) {
      console.log('⚠️ No products found. Please run product seeding first.')
      return
    }

    // Create contacts with realistic product datasets
    const contactsWithData = sampleContacts.map((contact, index) => {
      // Distribute products randomly but consistently for each contact
      const shuffledProducts = [...allProducts].sort(() => Math.random() - 0.5)
      
      // Generate wishlist (5-15 products per contact)
      const wishlistCount = Math.floor(Math.random() * 11) + 5
      const wishlist = shuffledProducts.slice(0, wishlistCount).map(product => ({
        productId: product._id,
        addedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        priority: Math.floor(Math.random() * 5) + 1
      }))

      // Generate order history (3-12 orders per contact)
      const orderCount = Math.floor(Math.random() * 10) + 3
      const orderHistory = shuffledProducts.slice(wishlistCount, wishlistCount + orderCount).map(product => ({
        productId: product._id,
        orderedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        quantity: Math.floor(Math.random() * 3) + 1,
        price: product.price || Math.floor(Math.random() * 5000) + 500,
        rating: Math.floor(Math.random() * 5) + 1
      }))

      // Generate watch time data (10-25 products per contact)
      const watchTimeCount = Math.floor(Math.random() * 16) + 10
      const watchTime = shuffledProducts.slice(wishlistCount + orderCount, wishlistCount + orderCount + watchTimeCount).map(product => ({
        productId: product._id,
        timeSpent: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
        lastViewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last 7 days
        viewCount: Math.floor(Math.random() * 10) + 1
      }))

      // Update metadata based on generated data
      const totalWatchTime = watchTime.reduce((sum, item) => sum + item.timeSpent, 0)
      
      return {
        ...contact,
        productDatasets: {
          wishlist,
          orderHistory,
          watchTime
        },
        metadata: {
          ...contact.metadata,
          totalProducts: wishlist.length + orderHistory.length + watchTime.length,
          totalWatchTime: Math.floor(totalWatchTime / 60), // Convert to minutes
          totalOrders: orderHistory.length
        }
      }
    })

    // Create contacts
    const createdContacts = await Contact.insertMany(contactsWithData)
    console.log(`✅ Created ${createdContacts.length} contacts with product datasets`)

    // Log summary
    const totalWishlistItems = createdContacts.reduce((sum, contact) => sum + contact.productDatasets.wishlist.length, 0)
    const totalOrders = createdContacts.reduce((sum, contact) => sum + contact.productDatasets.orderHistory.length, 0)
    const totalWatchTimeItems = createdContacts.reduce((sum, contact) => sum + contact.productDatasets.watchTime.length, 0)
    
    console.log(`📊 Summary:`)
    console.log(`   - Total wishlist items: ${totalWishlistItems}`)
    console.log(`   - Total orders: ${totalOrders}`)
    console.log(`   - Total watch time entries: ${totalWatchTimeItems}`)

    console.log('🎉 Friends data seeding completed successfully!')
    
    return {
      success: true,
      contactsCount: createdContacts.length,
      productsCount: allProducts.length
    }

  } catch (error) {
    console.error('❌ Error seeding friends data:', error)
    throw error
  }
}

// Export the function
module.exports = seedFriendsData

// If this script is run directly
if (require.main === module) {
  const runSeed = async () => {
    try {
      // Connect directly to MongoDB
      await mongoose.connect('mongodb://127.0.0.1:27017/myntraclone', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      console.log('📦 Connected to MongoDB')
      
      await seedFriendsData()
      console.log('✅ Friends data seeding completed successfully!')
      process.exit(0)
    } catch (error) {
      console.error('❌ Error seeding friends data:', error)
      process.exit(1)
    }
  }
  
  runSeed()
}