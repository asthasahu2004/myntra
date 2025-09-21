const mongoose = require('mongoose')
const Contact = require('../model/contactmodel')
const FriendsFeed = require('../model/friendsfeedmodel')
const DataUpload = require('../model/datauploadmodel')
const MynUser = require('../model/usermodel')
const resolveandcatch = require('../Middelwares/resolveandcatch')
const ErrorHandler = require('../utilis/errorhandel')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/excel')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        cb(null, uploadDir)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new ErrorHandler('Only Excel and CSV files are allowed', 400), false)
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
})

// Upload data (Excel file and/or URL)
exports.uploadData = [
    upload.single('excelFile'),
    resolveandcatch(async (req, res, next) => {
        const { url, urlType } = req.body
        const userId = req.user.id
        
        // Validate that at least one source is provided
        if (!req.file && !url) {
            return next(new ErrorHandler('Please provide either an Excel file or a URL', 400))
        }
        
        // Determine upload type
        let uploadType = 'excel'
        if (req.file && url) uploadType = 'both'
        else if (url && !req.file) uploadType = 'url'
        
        // Create data upload record
        const dataUpload = new DataUpload({
            userId,
            uploadType,
            excelFile: req.file ? {
                filename: req.file.filename,
                originalName: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                mimetype: req.file.mimetype
            } : undefined,
            urlSource: url ? {
                url,
                type: urlType || 'api'
            } : undefined
        })
        
        await dataUpload.save()
        
        // Process the data asynchronously
        dataUpload.processData().catch(error => {
            console.error('Data processing failed:', error)
        })
        
        res.status(201).json({
            success: true,
            message: 'Data upload initiated successfully',
            uploadId: dataUpload._id,
            status: dataUpload.processingStatus
        })
    })
]

// Get upload status
exports.getUploadStatus = resolveandcatch(async (req, res, next) => {
    const { uploadId } = req.params
    const userId = req.user.id
    
    const dataUpload = await DataUpload.findOne({ _id: uploadId, userId })
    
    if (!dataUpload) {
        return next(new ErrorHandler('Upload not found', 404))
    }
    
    res.status(200).json({
        success: true,
        upload: {
            id: dataUpload._id,
            status: dataUpload.processingStatus,
            results: dataUpload.processingResults,
            createdAt: dataUpload.createdAt,
            completedAt: dataUpload.completedAt
        }
    })
})

// Get all contacts for selection
exports.getContacts = resolveandcatch(async (req, res, next) => {
    const { search, limit = 20, page = 1 } = req.query
    
    let query = {}
    if (search) {
        query = {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
    }
    
    const contacts = await Contact.find(query)
        .select('name email avatar metadata')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ name: 1 })
    
    const total = await Contact.countDocuments(query)
    
    res.status(200).json({
        success: true,
        contacts,
        pagination: {
            current: page,
            total: Math.ceil(total / limit),
            count: contacts.length,
            totalContacts: total
        }
    })
})

// Get all pre-seeded contacts (no authentication required for self-contained feature)
exports.getAllPreSeededContacts = resolveandcatch(async (req, res, next) => {
    const { search } = req.query
    
    let query = { isActive: true }
    if (search) {
        query = {
            ...query,
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }
    }
    
    const contacts = await Contact.find(query)
        .select('name email avatar metadata')
        .sort({ name: 1 })
        .limit(20) // Always return max 20 contacts
    
    res.status(200).json({
        success: true,
        contacts,
        totalContacts: contacts.length
    })
})

// Generate friends feed
exports.generateFriendsFeed = resolveandcatch(async (req, res, next) => {
    const { contactIds, filters = {} } = req.body
    const userId = req.user.id
    
    console.log('generateFriendsFeed called with:', { contactIds, userId })
    
    // Validate minimum contact selection
    if (!contactIds || contactIds.length < 10) {
        return next(new ErrorHandler('Please select at least 10 contacts', 400))
    }
    
    console.log('Converting contactIds to ObjectIds...')
    // Convert contactIds to ObjectIds
    const objectIdContactIds = contactIds.map(id => new mongoose.Types.ObjectId(id))
    console.log('Converted successfully:', objectIdContactIds.length, 'ObjectIds')
    
    // Validate that contacts exist
    console.log('Querying contacts with ObjectIds...')
    const contacts = await Contact.find({ _id: { $in: objectIdContactIds } })
    console.log('Found contacts:', contacts.length)
    if (contacts.length !== contactIds.length) {
        return next(new ErrorHandler('Some selected contacts were not found', 400))
    }
    
    // Check if user already has an active feed with same contacts
    const existingFeed = await FriendsFeed.findOne({
        userId,
        selectedContacts: { $all: contactIds, $size: contactIds.length },
        isActive: true
    })
    
    if (existingFeed) {
        return res.status(200).json({
            success: true,
            message: 'Using existing feed',
            feed: existingFeed
        })
    }
    
    // Deactivate previous feeds
    await FriendsFeed.updateMany(
        { userId, isActive: true },
        { isActive: false }
    )
    
    // Generate the feed using static method
    console.log('Calling FriendsFeed.generateFeed with userId:', userId, 'and', objectIdContactIds.length, 'ObjectIds')
    const friendsFeed = await FriendsFeed.generateFeed(userId, objectIdContactIds)
    console.log('Feed generated successfully')
    
    // Update user's selected contacts
    await MynUser.findByIdAndUpdate(userId, {
        selectedContacts: contactIds,
        $push: { friendsFeeds: friendsFeed._id }
    })
    
    res.status(201).json({
        success: true,
        message: 'Friends feed generated successfully',
        feed: friendsFeed
    })
})

// Get friends feed
exports.getFriendsFeed = resolveandcatch(async (req, res, next) => {
    const friendsFeed = await FriendsFeed.findOne({
        userId: req.user.id,
        isActive: true
    })
    
    if (!friendsFeed) {
        return next(new ErrorHandler('No active feed found', 404))
    }
    
    // Apply filters and pagination to combinedProducts
    let filteredProducts = friendsFeed.combinedProducts || []
    
    res.status(200).json({
        success: true,
        products: filteredProducts, // Direct products array
        feed: {
            id: friendsFeed._id,
            selectedContacts: friendsFeed.selectedContacts,
            metadata: friendsFeed.feedMetadata
        },
        pagination: {
            current: 1,
            total: 1,
            count: filteredProducts.length,
            totalProducts: filteredProducts.length
        }
    })
})

// Get similar products for a specific product
exports.getSimilarProducts = resolveandcatch(async (req, res, next) => {
    const { productId } = req.params
    const { limit = 5 } = req.query
    const userId = req.user.id
    
    const friendsFeed = await FriendsFeed.findOne({ userId, isActive: true })
    
    if (!friendsFeed) {
        return next(new ErrorHandler('No active friends feed found', 404))
    }
    
    const similarProducts = await friendsFeed.getSimilarProducts(productId, parseInt(limit))
    
    res.status(200).json({
        success: true,
        similarProducts
    })
})

// Update feed filters
exports.updateFeedFilters = resolveandcatch(async (req, res, next) => {
    const { filters } = req.body
    const userId = req.user.id
    
    const friendsFeed = await FriendsFeed.findOneAndUpdate(
        { userId, isActive: true },
        { filters },
        { new: true }
    )
    
    if (!friendsFeed) {
        return next(new ErrorHandler('No active friends feed found', 404))
    }
    
    res.status(200).json({
        success: true,
        message: 'Feed filters updated successfully',
        feed: friendsFeed
    })
})

// Create seed data with 20 hard-coded contacts
exports.createSeedData = resolveandcatch(async (req, res, next) => {
    // Check if seed data already exists
    const existingContacts = await Contact.countDocuments()
    if (existingContacts >= 20) {
        return res.status(200).json({
            success: true,
            message: 'Seed data already exists',
            contactCount: existingContacts
        })
    }
    
    const seedContacts = [
        {
            name: "Alice Johnson",
            email: "alice.johnson@email.com",
            avatar: "https://i.pravatar.cc/150?img=1",
            metadata: {
                totalProducts: 45,
                totalWatchTime: 3600,
                totalOrders: 12
            },
            productDatasets: {
                wishlist: [
                    { productId: "prod_001", name: "Summer Dress", price: 89.99, category: "Clothing", brand: "FashionCo" },
                    { productId: "prod_002", name: "Sneakers", price: 129.99, category: "Footwear", brand: "SportBrand" }
                ],
                orderHistory: [
                    { productId: "prod_003", name: "Handbag", price: 199.99, category: "Accessories", brand: "LuxuryBags" }
                ],
                watchTime: [
                    { productId: "prod_001", timeSpent: 300 },
                    { productId: "prod_004", timeSpent: 180 }
                ]
            }
        },
        {
            name: "Bob Smith",
            email: "bob.smith@email.com",
            avatar: "https://i.pravatar.cc/150?img=2",
            metadata: {
                totalProducts: 32,
                totalWatchTime: 2400,
                totalOrders: 8
            },
            productDatasets: {
                wishlist: [
                    { productId: "prod_005", name: "Gaming Headset", price: 159.99, category: "Electronics", brand: "TechGear" }
                ],
                orderHistory: [
                    { productId: "prod_006", name: "T-Shirt", price: 29.99, category: "Clothing", brand: "CasualWear" }
                ],
                watchTime: [
                    { productId: "prod_005", timeSpent: 420 }
                ]
            }
        },
        {
            name: "Carol Davis",
            email: "carol.davis@email.com",
            avatar: "https://i.pravatar.cc/150?img=3",
            metadata: {
                totalProducts: 67,
                totalWatchTime: 4800,
                totalOrders: 15
            }
        },
        {
            name: "David Wilson",
            email: "david.wilson@email.com",
            avatar: "https://i.pravatar.cc/150?img=4",
            metadata: {
                totalProducts: 28,
                totalWatchTime: 1800,
                totalOrders: 6
            }
        },
        {
            name: "Emma Brown",
            email: "emma.brown@email.com",
            avatar: "https://i.pravatar.cc/150?img=5",
            metadata: {
                totalProducts: 53,
                totalWatchTime: 3200,
                totalOrders: 11
            }
        },
        {
            name: "Frank Miller",
            email: "frank.miller@email.com",
            avatar: "https://i.pravatar.cc/150?img=6",
            metadata: {
                totalProducts: 41,
                totalWatchTime: 2700,
                totalOrders: 9
            }
        },
        {
            name: "Grace Taylor",
            email: "grace.taylor@email.com",
            avatar: "https://i.pravatar.cc/150?img=7",
            metadata: {
                totalProducts: 72,
                totalWatchTime: 5400,
                totalOrders: 18
            }
        },
        {
            name: "Henry Anderson",
            email: "henry.anderson@email.com",
            avatar: "https://i.pravatar.cc/150?img=8",
            metadata: {
                totalProducts: 35,
                totalWatchTime: 2100,
                totalOrders: 7
            }
        },
        {
            name: "Ivy Thomas",
            email: "ivy.thomas@email.com",
            avatar: "https://i.pravatar.cc/150?img=9",
            metadata: {
                totalProducts: 58,
                totalWatchTime: 3900,
                totalOrders: 13
            }
        },
        {
            name: "Jack Jackson",
            email: "jack.jackson@email.com",
            avatar: "https://i.pravatar.cc/150?img=10",
            metadata: {
                totalProducts: 29,
                totalWatchTime: 1950,
                totalOrders: 5
            }
        },
        {
            name: "Kate White",
            email: "kate.white@email.com",
            avatar: "https://i.pravatar.cc/150?img=11",
            metadata: {
                totalProducts: 64,
                totalWatchTime: 4200,
                totalOrders: 16
            }
        },
        {
            name: "Liam Harris",
            email: "liam.harris@email.com",
            avatar: "https://i.pravatar.cc/150?img=12",
            metadata: {
                totalProducts: 37,
                totalWatchTime: 2500,
                totalOrders: 8
            }
        },
        {
            name: "Mia Martin",
            email: "mia.martin@email.com",
            avatar: "https://i.pravatar.cc/150?img=13",
            metadata: {
                totalProducts: 49,
                totalWatchTime: 3100,
                totalOrders: 10
            }
        },
        {
            name: "Noah Thompson",
            email: "noah.thompson@email.com",
            avatar: "https://i.pravatar.cc/150?img=14",
            metadata: {
                totalProducts: 33,
                totalWatchTime: 2200,
                totalOrders: 6
            }
        },
        {
            name: "Olivia Garcia",
            email: "olivia.garcia@email.com",
            avatar: "https://i.pravatar.cc/150?img=15",
            metadata: {
                totalProducts: 61,
                totalWatchTime: 4100,
                totalOrders: 14
            }
        },
        {
            name: "Paul Martinez",
            email: "paul.martinez@email.com",
            avatar: "https://i.pravatar.cc/150?img=16",
            metadata: {
                totalProducts: 26,
                totalWatchTime: 1700,
                totalOrders: 4
            }
        },
        {
            name: "Quinn Rodriguez",
            email: "quinn.rodriguez@email.com",
            avatar: "https://i.pravatar.cc/150?img=17",
            metadata: {
                totalProducts: 55,
                totalWatchTime: 3600,
                totalOrders: 12
            }
        },
        {
            name: "Ruby Lewis",
            email: "ruby.lewis@email.com",
            avatar: "https://i.pravatar.cc/150?img=18",
            metadata: {
                totalProducts: 42,
                totalWatchTime: 2800,
                totalOrders: 9
            }
        },
        {
            name: "Sam Lee",
            email: "sam.lee@email.com",
            avatar: "https://i.pravatar.cc/150?img=19",
            metadata: {
                totalProducts: 38,
                totalWatchTime: 2600,
                totalOrders: 7
            }
        },
        {
            name: "Tina Walker",
            email: "tina.walker@email.com",
            avatar: "https://i.pravatar.cc/150?img=20",
            metadata: {
                totalProducts: 51,
                totalWatchTime: 3400,
                totalOrders: 11
            }
        }
    ]
    
    // Insert seed contacts
    const createdContacts = await Contact.insertMany(seedContacts)
    
    res.status(201).json({
        success: true,
        message: 'Seed data created successfully',
        contactCount: createdContacts.length,
        contacts: createdContacts.map(c => ({
            id: c._id,
            name: c.name,
            email: c.email,
            metadata: c.metadata
        }))
    })
})