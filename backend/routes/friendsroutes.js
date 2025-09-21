const express = require('express')
const router = express.Router()
const {
    uploadData,
    getUploadStatus,
    getContacts,
    getAllPreSeededContacts,
    generateFriendsFeed,
    getFriendsFeed,
    getSimilarProducts,
    updateFeedFilters,
    createSeedData
} = require('../controller/friendscontroller')
const { isAuthenticateuser } = require('../Middelwares/authuser')

// Data upload routes
router.route('/upload').post(isAuthenticateuser, ...uploadData)
router.route('/upload/:uploadId/status').get(isAuthenticateuser, getUploadStatus)

// Contact management routes
router.route('/contacts').get(isAuthenticateuser, getContacts)
router.route('/contacts/preseeded').get(getAllPreSeededContacts)

// Friends feed routes
router.route('/feed/generate').post(isAuthenticateuser, generateFriendsFeed)
router.route('/feed').get(isAuthenticateuser, getFriendsFeed)
router.route('/feed/filters').put(isAuthenticateuser, updateFeedFilters)

// Similar products route
router.route('/products/:productId/similar').get(isAuthenticateuser, getSimilarProducts)

// Seed data route (for development/testing)
router.route('/seed').post(createSeedData)

// Test route for connectivity verification
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Backend connected!' })
})

module.exports = router