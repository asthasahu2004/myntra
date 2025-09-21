const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const inputFile = 'myntra202305041052.csv';
const outputFile = 'myntra_sample_500.csv';
const maxProducts = 500;

async function filterCSV() {
    try {
        console.log('Starting CSV filtering process...');
        console.log(`Reading from: ${inputFile}`);
        console.log(`Writing to: ${outputFile}`);
        console.log(`Limiting to: ${maxProducts} products`);
        
        const products = [];
        let productCount = 0;
        let headers = null;
        return new Promise((resolve, reject) => {
            fs.createReadStream(inputFile)
                .pipe(csv())
                .on('headers', (headerList) => {
                    headers = headerList;
                    console.log('CSV Headers:', headers);
                })
                .on('data', (row) => {
                    if (productCount < maxProducts) {
                        products.push(row);
                        productCount++;
                        
                        // Log progress every 100 products
                        if (productCount % 100 === 0) {
                            console.log(`Processed ${productCount} products...`);
                        }
                    }
                })
                .on('end', async () => {
                    try {
                        console.log(`\nFinished reading CSV. Total products collected: ${products.length}`);
                        
                        if (products.length === 0) {
                            throw new Error('No products found in the CSV file');
                        }
                        
                        // Create CSV writer with dynamic headers
                        const csvWriter = createCsvWriter({
                            path: outputFile,
                            header: Object.keys(products[0]).map(key => ({
                                id: key,
                                title: key
                            }))
                        });
                        
                        // Write the filtered data
                        await csvWriter.writeRecords(products);
                        console.log(`\n✅ Successfully created ${outputFile} with ${products.length} products`);
                        
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
        
    } catch (error) {
        console.error('❌ Error filtering CSV:', error.message);
        throw error;
    }
}

// Run the filtering process
filterCSV()
    .then(() => {
        console.log('\n🎉 CSV filtering completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 CSV filtering failed:', error.message);
        process.exit(1);
    });