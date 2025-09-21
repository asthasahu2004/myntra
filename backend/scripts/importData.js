const mongoose = require('mongoose');
const Product = require('../model/productmodel');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
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
    if (seller && seller !== '-' && seller.trim()) return seller.trim();
    
    // Common brand patterns in product names
    const brandPatterns = [
        /(Nike|Adidas|Puma|Reebok|HRX|Roadster|HERE&NOW|WROGN|Levis|Tommy|Calvin Klein|Zara|H&M)/i,
        /^([A-Z][a-zA-Z]+)\s+/,  // Capitalized first word
        /^(\w+)\s+/  // First word as fallback
    ];
    
    for (const pattern of brandPatterns) {
        const match = name.match(pattern);
        if (match && match[1]) return match[1].trim();
    }
    
    return 'Generic';
};

// Function to determine category from product name
const extractCategory = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('t-shirt') || lowerName.includes('tshirt') || lowerName.includes('tee')) return 'T-Shirts';
    if (lowerName.includes('shirt') && !lowerName.includes('t-shirt')) return 'Shirts';
    if (lowerName.includes('jeans') || lowerName.includes('trouser') || lowerName.includes('pants')) return 'Jeans';
    if (lowerName.includes('dress')) return 'Dresses';
    if (lowerName.includes('kurta') || lowerName.includes('kurti')) return 'Kurtas';
    if (lowerName.includes('shoe') || lowerName.includes('sneaker') || lowerName.includes('boot')) return 'Shoes';
    if (lowerName.includes('watch')) return 'Watches';
    if (lowerName.includes('bag') || lowerName.includes('backpack')) return 'Bags';
    if (lowerName.includes('jacket') || lowerName.includes('blazer')) return 'Jackets';
    if (lowerName.includes('shorts')) return 'Shorts';
    if (lowerName.includes('saree') || lowerName.includes('sari')) return 'Sarees';
    if (lowerName.includes('top') || lowerName.includes('blouse')) return 'Tops';
    if (lowerName.includes('skirt')) return 'Skirts';
    
    return 'Clothing';
};

// Function to determine gender from product name
const extractGender = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('men') || lowerName.includes('boys') || lowerName.includes('male')) return 'Men';
    if (lowerName.includes('women') || lowerName.includes('girls') || lowerName.includes('female') || lowerName.includes('ladies')) return 'Women';
    if (lowerName.includes('kids') || lowerName.includes('children')) return 'Kids';
    
    return 'Unisex';
};

// Function to process images
const processImages = (imgString) => {
    if (!imgString || imgString === '-' || imgString.trim() === '') return [];
    
    try {
        const urls = imgString.split(';')
            .filter(url => url && url.trim() && url.trim() !== '-')
            .map(url => url.trim())
            .filter(url => url.startsWith('http'));
        
        return urls.slice(0, 5).map(url => ({ url })); // Limit to 5 images
    } catch (error) {
        console.error('Error processing images:', error);
        return [];
    }
};

// Function to generate bullet points
const generateBulletPoints = (name, category, material) => {
    const points = [
        { point: `High-quality ${category.toLowerCase()}` },
        { point: 'Comfortable fit and feel' },
        { point: 'Durable material construction' }
    ];
    
    if (material && material !== 'Mixed fabric') {
        points.push({ point: `Made with premium ${material.toLowerCase()}` });
    }
    
    if (name.toLowerCase().includes('cotton')) {
        points.push({ point: '100% pure cotton fabric' });
    }
    
    if (name.toLowerCase().includes('slim fit')) {
        points.push({ point: 'Slim fit design' });
    }
    
    return points;
};

// Function to determine material
const extractMaterial = (name) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('cotton')) return 'Cotton';
    if (lowerName.includes('silk')) return 'Silk';
    if (lowerName.includes('wool')) return 'Wool';
    if (lowerName.includes('polyester')) return 'Polyester';
    if (lowerName.includes('denim')) return 'Denim';
    if (lowerName.includes('linen')) return 'Linen';
    if (lowerName.includes('leather')) return 'Leather';
    
    return 'Mixed fabric';
};

// Function to validate and clean price
const cleanPrice = (priceStr) => {
    if (!priceStr || priceStr === '-' || priceStr.trim() === '') return 0;
    
    // Remove currency symbols and whitespace
    const cleaned = priceStr.toString().replace(/[₹,$\s]/g, '');
    const price = parseInt(cleaned);
    
    return isNaN(price) ? 0 : price;
};

// Function to find CSV file
const findCsvFile = () => {
    const possiblePaths = [
        './myntra_sample_500.csv',
        './myntra_500_items.csv',
        './backend/myntra_sample_500.csv',
        './backend/myntra_500_items.csv',
        path.join(__dirname, 'myntra_sample_500.csv'),
        path.join(__dirname, 'myntra_500_items.csv')
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log(`Found CSV file at: ${filePath}`);
            return filePath;
        }
    }
    
    throw new Error('CSV file not found. Please ensure the file exists in the correct location.');
};

// Function to import data from CSV
const importData = async () => {
    try {
        await connectDatabase();
        
        // Clear existing products
        await Product.deleteMany({});
        console.log('Existing products cleared');
        
        const products = [];
        let rowCount = 0;
        let skippedRows = 0;
        
        // Find CSV file
        const csvPath = findCsvFile();
        
        console.log('Starting CSV import...');
        
        // Read CSV file
        const stream = fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
                try {
                    rowCount++;
                    
                    // Skip rows with missing essential data
                    if (!row.name || !row.price || row.price === '-' || row.name.trim() === '') {
                        skippedRows++;
                        return;
                    }
                    
                    const brand = extractBrand(row.name, row.seller);
                    const category = extractCategory(row.name);
                    const gender = extractGender(row.name);
                    const material = extractMaterial(row.name);
                    const images = processImages(row.img);
                    const bulletPoints = generateBulletPoints(row.name, category, material);
                    
                    const sellingPrice = cleanPrice(row.price);
                    const mrp = cleanPrice(row.mrp) || sellingPrice;
                    
                    // Skip if price is 0 or invalid
                    if (sellingPrice === 0) {
                        skippedRows++;
                        return;
                    }
                    
                    const product = {
                        brand: brand,
                        title: row.name.trim(),
                        sellingPrice: sellingPrice,
                        mrp: mrp > sellingPrice ? mrp : sellingPrice,
                        size: 'M', // Default size
                        bulletPoints: bulletPoints,
                        productDetails: `Premium ${category.toLowerCase()} with excellent quality and comfort. Perfect for ${gender.toLowerCase()} looking for style and comfort.`,
                        material: material,
                        specification: [
                            { point: `Category: ${category}` },
                            { point: `Gender: ${gender}` },
                            { point: `Brand: ${brand}` },
                            { point: `Material: ${material}` }
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
                    console.error(`Error processing row ${rowCount}:`, error);
                    skippedRows++;
                }
            })
            .on('end', async () => {
                try {
                    console.log(`\nProcessing completed:`);
                    console.log(`- Total rows processed: ${rowCount}`);
                    console.log(`- Valid products: ${products.length}`);
                    console.log(`- Skipped rows: ${skippedRows}`);
                    
                    if (products.length === 0) {
                        console.error('No valid products found to import');
                        process.exit(1);
                    }
                    
                    console.log('\nInserting products into database...');
                    
                    // Insert products in batches
                    const batchSize = 50;
                    let insertedCount = 0;
                    
                    for (let i = 0; i < products.length; i += batchSize) {
                        const batch = products.slice(i, i + batchSize);
                        try {
                            await Product.insertMany(batch);
                            insertedCount += batch.length;
                            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(products.length/batchSize)} (${insertedCount}/${products.length} products)`);
                        } catch (batchError) {
                            console.error(`Error inserting batch ${Math.floor(i/batchSize) + 1}:`, batchError);
                        }
                    }
                    
                    console.log(`\n✅ Successfully imported ${insertedCount} products from CSV`);
                    
                    // Verify the import
                    const count = await Product.countDocuments();
                    console.log(`📊 Total products in database: ${count}`);
                    
                } catch (error) {
                    console.error('Error inserting products:', error);
                } finally {
                    mongoose.connection.close();
                    console.log('Database connection closed');
                    console.log('Data import process completed!');
                }
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                mongoose.connection.close();
                process.exit(1);
            });
            
    } catch (error) {
        console.error('Import failed:', error);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
        }
        process.exit(1);
    }
};

// Handle process termination gracefully
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Gracefully shutting down...');
    mongoose.connection.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Gracefully shutting down...');
    mongoose.connection.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});

// Run the import
console.log('🚀 Starting data import process...');
importData();