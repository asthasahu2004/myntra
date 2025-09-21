const mongoose = require('mongoose')

const dataUploadSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MynUser',
        required: true
    },
    uploadType: {
        type: String,
        enum: ['excel', 'url', 'both'],
        required: true
    },
    excelFile: {
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimetype: String
    },
    urlSource: {
        url: String,
        type: {
            type: String,
            enum: ['zip', 'api', 'product_pages']
        },
        lastFetched: Date
    },
    processingStatus: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    processingResults: {
        contactsProcessed: {
            type: Number,
            default: 0
        },
        contactsCreated: {
            type: Number,
            default: 0
        },
        contactsUpdated: {
            type: Number,
            default: 0
        },
        productsProcessed: {
            type: Number,
            default: 0
        },
        errors: [{
            row: Number,
            field: String,
            message: String,
            data: mongoose.Schema.Types.Mixed
        }]
    },
    validationRules: {
        requiredFields: {
            contacts: [String],
            products: [String]
        },
        dataTypes: {
            type: Map,
            of: String
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }
})

// Index for efficient querying
dataUploadSchema.index({ userId: 1, processingStatus: 1 })
dataUploadSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Static method to validate Excel data structure
dataUploadSchema.statics.validateExcelStructure = function(data) {
    const errors = []
    const requiredContactFields = ['name', 'email']
    const requiredProductFields = ['productId', 'name', 'price']
    
    // Check if data has required sheets/sections
    if (!data.contacts || !Array.isArray(data.contacts)) {
        errors.push({
            field: 'contacts',
            message: 'Contacts sheet is required and must be an array'
        })
    }
    
    if (!data.products || !Array.isArray(data.products)) {
        errors.push({
            field: 'products',
            message: 'Products sheet is required and must be an array'
        })
    }
    
    // Validate contact data structure
    if (data.contacts && Array.isArray(data.contacts)) {
        data.contacts.forEach((contact, index) => {
            requiredContactFields.forEach(field => {
                if (!contact[field]) {
                    errors.push({
                        row: index + 1,
                        field: `contacts.${field}`,
                        message: `Required field '${field}' is missing`,
                        data: contact
                    })
                }
            })
            
            // Validate email format
            if (contact.email && !/\S+@\S+\.\S+/.test(contact.email)) {
                errors.push({
                    row: index + 1,
                    field: 'contacts.email',
                    message: 'Invalid email format',
                    data: contact
                })
            }
        })
    }
    
    // Validate product data structure
    if (data.products && Array.isArray(data.products)) {
        data.products.forEach((product, index) => {
            requiredProductFields.forEach(field => {
                if (!product[field]) {
                    errors.push({
                        row: index + 1,
                        field: `products.${field}`,
                        message: `Required field '${field}' is missing`,
                        data: product
                    })
                }
            })
            
            // Validate price is a number
            if (product.price && isNaN(parseFloat(product.price))) {
                errors.push({
                    row: index + 1,
                    field: 'products.price',
                    message: 'Price must be a valid number',
                    data: product
                })
            }
        })
    }
    
    return {
        isValid: errors.length === 0,
        errors
    }
}

// Instance method to process uploaded data
dataUploadSchema.methods.processData = async function() {
    const Contact = mongoose.model('Contact')
    const Product = mongoose.model('Product')
    
    try {
        this.processingStatus = 'processing'
        await this.save()
        
        let data = {}
        
        // Process Excel file if provided
        if (this.excelFile && this.excelFile.path) {
            const XLSX = require('xlsx')
            const workbook = XLSX.readFile(this.excelFile.path)
            
            // Read contacts sheet
            if (workbook.SheetNames.includes('Contacts')) {
                const contactsSheet = workbook.Sheets['Contacts']
                data.contacts = XLSX.utils.sheet_to_json(contactsSheet)
            }
            
            // Read products sheet
            if (workbook.SheetNames.includes('Products')) {
                const productsSheet = workbook.Sheets['Products']
                data.products = XLSX.utils.sheet_to_json(productsSheet)
            }
            
            // Read product datasets (wishlist, orders, watch time)
            ['Wishlist', 'Orders', 'WatchTime'].forEach(sheetName => {
                if (workbook.SheetNames.includes(sheetName)) {
                    const sheet = workbook.Sheets[sheetName]
                    data[sheetName.toLowerCase()] = XLSX.utils.sheet_to_json(sheet)
                }
            })
        }
        
        // Process URL data if provided
        if (this.urlSource && this.urlSource.url) {
            // This would be implemented based on the specific URL format
            // For now, we'll assume it returns similar structured data
            const urlData = await this.fetchUrlData()
            
            // Merge URL data with Excel data (Excel is authoritative)
            if (!data.contacts && urlData.contacts) data.contacts = urlData.contacts
            if (!data.products && urlData.products) data.products = urlData.products
        }
        
        // Validate data structure
        const validation = this.constructor.validateExcelStructure(data)
        if (!validation.isValid) {
            this.processingResults.errors = validation.errors
            this.processingStatus = 'failed'
            await this.save()
            throw new Error('Data validation failed')
        }
        
        // Process contacts
        if (data.contacts) {
            for (const contactData of data.contacts) {
                try {
                    const existingContact = await Contact.findOne({ email: contactData.email })
                    
                    if (existingContact) {
                        // Update existing contact
                        Object.assign(existingContact, contactData)
                        await existingContact.save()
                        this.processingResults.contactsUpdated++
                    } else {
                        // Create new contact
                        const newContact = new Contact(contactData)
                        await newContact.save()
                        this.processingResults.contactsCreated++
                    }
                    
                    this.processingResults.contactsProcessed++
                } catch (error) {
                    this.processingResults.errors.push({
                        field: 'contact',
                        message: error.message,
                        data: contactData
                    })
                }
            }
        }
        
        // Process products (if needed)
        if (data.products) {
            this.processingResults.productsProcessed = data.products.length
        }
        
        this.processingStatus = 'completed'
        this.completedAt = new Date()
        await this.save()
        
        return {
            success: true,
            results: this.processingResults
        }
        
    } catch (error) {
        this.processingStatus = 'failed'
        this.processingResults.errors.push({
            field: 'general',
            message: error.message
        })
        await this.save()
        throw error
    }
}

// Method to fetch data from URL (placeholder implementation)
dataUploadSchema.methods.fetchUrlData = async function() {
    // This would be implemented based on the specific URL format
    // Could use axios, cheerio for web scraping, or API calls
    return {
        contacts: [],
        products: []
    }
}

module.exports = mongoose.model('DataUpload', dataUploadSchema)