const mongoose = require('mongoose');
const Product = require('../model/productmodel');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: './backend/config/config.env' });

// Connect to MongoDB
const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Function to extract brand from product name
const extractBrand = (name, seller) => {
    // Use seller as brand if available, otherwise try to extract from name
    if (seller && seller !== '-') return seller;
    
    // Common brand patterns in product names
    const brandPatterns = [
        /^(\w+)\s+/,  // First word
        /(Nike|Adidas|Puma|Reebok|HRX|Roadster|HERE&NOW|WROGN)/i
    ];
    
    for (const pattern of brandPatterns) {
        const match = name.match(pattern);
        if (match) return match[1];
    }
    
    return 'Generic';
};

// Function to determine category from product name
const extractCategory = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('t-shirt') || lowerName.includes('tshirt')) return 'T-Shirts';
    if (lowerName.includes('shirt')) return 'Shirts';
    if (lowerName.includes('jeans') || lowerName.includes('trouser')) return 'Jeans';
    if (lowerName.includes('dress')) return 'Dresses';
    if (lowerName.includes('kurta')) return 'Kurtas';
    if (lowerName.includes('shoe') || lowerName.includes('sneaker')) return 'Shoes';
    if (lowerName.includes('watch')) return 'Watches';
    if (lowerName.includes('bag')) return 'Bags';
    
    return 'Clothing';
};

// Function to determine gender from product name
const extractGender = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('men') || lowerName.includes('boys')) return 'Men';
    if (lowerName.includes('women') || lowerName.includes('girls')) return 'Women';
    
    return 'Unisex';
};

// Function to process images
const processImages = (imgString) => {
    if (!imgString || imgString === '-') return [];
    
    const urls = imgString.split(';').filter(url => url.trim());
    return urls.slice(0, 5).map(url => ({ url: url.trim() })); // Limit to 5 images
};

// Function to generate bullet points
const generateBulletPoints = (name, category) => {
    const points = [
        { point: `High-quality ${category.toLowerCase()}` },
        { point: 'Comfortable fit and feel' },
        { point: 'Durable material construction' }
    ];
    
    if (name.toLowerCase().includes('cotton')) {
        points.push({ point: '100% pure cotton fabric' });
    }
    
    return points;
};

// Function to import data from CSV
const importData = async () => {
    try {
        await connectDatabase();
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Existing products cleared');
        
        const products = [];
        
        // Read CSV file
<<<<<<< HEAD
        fs.createReadStream('myntra_sample_500.csv')
=======
        fs.createReadStream('./myntra_500_items.csv')
>>>>>>> 1125742fcac5b8ab3eae10245f19d275a7042fbc
            .pipe(csv())
            .on('data', (row) => {
                try {
                    // Skip rows with missing essential data
                    if (!row.name || !row.price || row.price === '-') return;
                    
                    const brand = extractBrand(row.name, row.seller);
                    const category = extractCategory(row.name);
                    const gender = extractGender(row.name);
                    const images = processImages(row.img);
                    const bulletPoints = generateBulletPoints(row.name, category);
                    
                    const product = {
                        brand: brand,
                        title: row.name,
                        sellingPrice: parseInt(row.price) || 0,
                        mrp: parseInt(row.mrp) || parseInt(row.price) || 0,
                        size: 'M', // Default size
                        bulletPoints: bulletPoints,
                        productDetails: `Premium ${category.toLowerCase()} with excellent quality and comfort`,
                        material: row.name.toLowerCase().includes('cotton') ? 'Cotton' : 'Mixed fabric',
                        specification: [
                            { point: `Category: ${category}` },
                            { point: `Gender: ${gender}` },
                            { point: `Brand: ${brand}` }
                        ],
                        category: category,
                        style_no: `STY${row.id || Math.floor(Math.random() * 100000)}`,
                        images: images.length > 0 ? images : [{ url: 'https://via.placeholder.com/300x400?text=No+Image' }],
                        color: 'Multi',
                        gender: gender,
                        stock: Math.floor(Math.random() * 50) + 10 // Random stock between 10-60
                    };
                    
                    products.push(product);
                } catch (error) {
                    console.error('Error processing row:', error);
                }
            })
            .on('end', async () => {
                try {
                    console.log(`Processing ${products.length} products...`);
                    
                    // Insert products in batches
                    const batchSize = 50;
                    for (let i = 0; i < products.length; i += batchSize) {
                        const batch = products.slice(i, i + batchSize);
                        await Product.insertMany(batch);
                        console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)}`);
                    }
                    
                    console.log(`Successfully imported ${products.length} products from CSV`);
                    mongoose.connection.close();
                    console.log('Database connection closed');
                    console.log('Data import completed successfully!');
                } catch (error) {
                    console.error('Error inserting products:', error);
                    process.exit(1);
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                process.exit(1);
            });
            
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    }
};

// Run the import
importData();