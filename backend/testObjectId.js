const mongoose = require('mongoose');

// Test ObjectId conversion
const contactIds = [
    "68d039341bffb8ca41c86ebb",
    "68d039341bffb8ca41c86ee0", 
    "68d039341bffb8ca41c86f08"
];

console.log('Original contactIds:', contactIds);
console.log('Types:', contactIds.map(id => typeof id));

try {
    const objectIdContactIds = contactIds.map(id => new mongoose.Types.ObjectId(id));
    console.log('Converted ObjectIds:', objectIdContactIds);
    console.log('ObjectId types:', objectIdContactIds.map(id => typeof id));
    console.log('Are they ObjectIds?', objectIdContactIds.map(id => id instanceof mongoose.Types.ObjectId));
} catch (error) {
    console.error('Error converting to ObjectIds:', error.message);
}