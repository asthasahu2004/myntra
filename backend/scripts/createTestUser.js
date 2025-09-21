require('dotenv').config({ path: '../config/config.env' })
const mongoose = require('mongoose')
const User = require('../model/usermodel')

const createTestUser = async () => {
  try {
    console.log('🔧 Creating test user...')

    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/myntraclone', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('📦 Connected to MongoDB')

    // Check if test user already exists
    const existingUser = await User.findOne({ phonenumber: 1234567890 })
    if (existingUser) {
      console.log('✅ Test user already exists')
      console.log('📱 Phone: 1234567890')
      console.log('🔑 User ID:', existingUser._id)
      console.log('✅ Verified:', existingUser.verify)
      return existingUser
    }

    // Create test user
    const testUser = await User.create({
      phonenumber: 1234567890,
      verify: 'verified',
      name: 'Test User',
      email: 'test@example.com',
      gender: 'men',
      address: {
        pincode: 110001,
        address1: 'Test Address',
        address2: 'Test Area',
        citystate: 'Delhi'
      }
    })

    console.log('✅ Test user created successfully!')
    console.log('📱 Phone: 1234567890')
    console.log('🔑 User ID:', testUser._id)
    console.log('✅ Verified:', testUser.verify)
    console.log('🎯 You can now login with phone number: 1234567890')
    
    return testUser

  } catch (error) {
    console.error('❌ Error creating test user:', error)
    throw error
  } finally {
    await mongoose.disconnect()
    console.log('📦 Disconnected from MongoDB')
  }
}

// If this script is run directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('🎉 Test user setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error:', error)
      process.exit(1)
    })
}

module.exports = createTestUser