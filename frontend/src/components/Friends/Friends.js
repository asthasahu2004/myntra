import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { FaUpload, FaCog, FaUsers, FaRss, FaUserPlus } from 'react-icons/fa'
import FriendsSelector from './FriendsSelector'
import FriendsFeed from './FriendsFeed'
import DataUpload from './DataUpload'
import axios from 'axios'

const Friends = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showUpload, setShowUpload] = useState(false)
  const [hasData, setHasData] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedContactsCount, setSelectedContactsCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState('Never')
  const [stats, setStats] = useState({
    totalContacts: 150,
    feedItems: 0,
    lastUpdated: null
  })

  // Load selected contacts count from localStorage and set up data
  useEffect(() => {
    setHasData(true) // We always have pre-seeded data available
    setLoading(false)
    
    // Get selected contacts from localStorage
    const selectedContactIds = JSON.parse(localStorage.getItem('selectedContactIds') || '[]')
    setSelectedContactsCount(selectedContactIds.length)
    
    // Get last updated time from localStorage
    const feedGeneratedAt = localStorage.getItem('feedGeneratedAt')
    if (feedGeneratedAt) {
      const date = new Date(feedGeneratedAt)
      setLastUpdated(date.toLocaleString())
      setStats(prev => ({
        ...prev,
        lastUpdated: feedGeneratedAt,
        feedItems: selectedContactIds.length > 0 ? 25 : 0
      }))
    }
  }, [])

  // Listen for storage changes to update count in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      const selectedContactIds = JSON.parse(localStorage.getItem('selectedContactIds') || '[]')
      setSelectedContactsCount(selectedContactIds.length)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Handle successful upload
  const handleUploadSuccess = (data) => {
    setHasData(true)
    setStats(data.stats || {})
    setShowUpload(false)
    
    // Navigate to selector if not already there
    if (location.pathname === '/friends' || location.pathname === '/friends/') {
      navigate('/friends/selector')
    }
  }

  // Welcome screen when no data is available
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaUsers className="text-pink-500 text-3xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Friends Feed
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Discover products based on your friends' preferences, wishlists, and shopping history. 
            Get started by uploading your friends' data.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaUsers className="text-blue-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Friend Selection</h3>
            <p className="text-sm text-gray-600">
              Choose from your contacts and select at least 10 friends to generate a personalized feed.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaRss className="text-green-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Feed</h3>
            <p className="text-sm text-gray-600">
              Get a curated product feed based on combined data from your selected friends' preferences.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FaCog className="text-purple-500 text-xl" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Recommendations</h3>
            <p className="text-sm text-gray-600">
              Discover similar products and get personalized recommendations based on the combined dataset.
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div className="space-y-4">
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-colors shadow-lg hover:shadow-xl"
          >
            <FaUpload />
            Upload Friends Data
          </button>
          
          <p className="text-sm text-gray-500">
            Upload an Excel file or provide a URL with your friends' product data
          </p>
        </div>

        {/* Data Format Info */}
        <div className="mt-12 p-6 bg-white rounded-lg shadow-sm text-left">
          <h3 className="font-semibold text-gray-900 mb-4">Supported Data Formats</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <span className="font-medium text-pink-600">Excel Files:</span>
              <span>Upload .xlsx or .xls files with contacts, products, wishlists, orders, and watch time data</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-pink-600">URL/API:</span>
              <span>Provide a URL pointing to your data source (ZIP files, API endpoints, or direct data URLs)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Data management screen
  const DataManagementScreen = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#f13ab1] to-[#f135af] rounded-full mb-6 shadow-lg">
            <FaUsers className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Friends Dashboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing products through your friends' preferences and create personalized shopping experiences
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Selected Contacts Card */}
          <div className="bg-gradient-to-br from-[#ffffff] to-[#f13ab1]/10 rounded-xl shadow-lg p-8 border border-[#f13ab1]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#f13ab1] to-[#f135af] rounded-xl flex items-center justify-center shadow-lg">
                  <FaUsers className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Selected Contacts</h3>
                  <p className="text-gray-600 text-sm">Currently chosen for feed</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold transition-colors duration-300 ${
                  selectedContactsCount >= 10 ? 'text-[#fd913c]' : 'text-[#f13ab1]'
                }`}>
                  {selectedContactsCount}
                </div>
                <div className="text-sm text-gray-500">selected</div>
                {selectedContactsCount >= 10 && (
                  <div className="text-xs text-[#fd913c] font-medium mt-1">✓ Ready to generate</div>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ease-out ${
                  selectedContactsCount >= 10 
                    ? 'bg-gradient-to-r from-[#fd913c] to-[#fd913c]/80' 
                    : 'bg-gradient-to-r from-[#f13ab1] to-[#f135af]'
                }`}
                style={{width: `${Math.min((selectedContactsCount / 10) * 100, 100)}%`}}
              ></div>
            </div>
            <p className={`text-xs mt-2 transition-colors duration-300 ${
              selectedContactsCount >= 10 ? 'text-[#fd913c] font-medium' : 'text-gray-500'
            }`}>
              {selectedContactsCount >= 10 
                ? `Great! You have ${selectedContactsCount} contacts selected` 
                : `Select ${10 - selectedContactsCount} more friends to generate feed`
              }
            </p>
          </div>

          {/* Last Updated Card */}
          <div className="bg-gradient-to-br from-[#ffffff] to-[#fd913c]/10 rounded-xl shadow-lg p-8 border border-[#fd913c]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#fd913c] to-[#f138b0] rounded-xl flex items-center justify-center shadow-lg">
                  <FaCog className="text-white text-2xl animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Last Updated</h3>
                  <p className="text-gray-600 text-sm">Data synchronization status</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-[#fd913c] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-[#fd913c]">Active</span>
                </div>
                <div className="text-xs text-gray-500">{lastUpdated}</div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 animate-fade-in">
              <p className="text-sm text-gray-600">
                Your friends data is automatically synchronized every 5 minutes to ensure you get the latest preferences and recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Add Friends Card */}
          <div className="bg-gradient-to-br from-[#ffffff] to-[#f134af]/10 rounded-xl shadow-lg p-8 border border-[#f134af]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#f134af] to-[#f138b0] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                <FaUserPlus className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Add Friends</h3>
              <p className="text-gray-600 mb-6">
                Connect with friends to discover their favorite products and get personalized recommendations
              </p>
              <button 
                onClick={() => navigate('/friends/selector')}
                className="w-full bg-gradient-to-r from-[#f134af] to-[#f138b0] text-white py-3 px-6 rounded-lg font-medium hover:from-[#f13ab1] hover:to-[#f135af] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Select Friends
              </button>
            </div>
          </div>

          {/* View Feed Card */}
          <div className="bg-gradient-to-br from-[#ffffff] to-[#fd913c]/10 rounded-xl shadow-lg p-8 border border-[#fd913c]/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#fd913c] to-[#f13ab1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
                <FaRss className="text-white text-3xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">View Feed</h3>
              <p className="text-gray-600 mb-6">
                Explore curated products based on your friends' preferences and shopping history
              </p>
              <button 
                disabled={selectedContactsCount < 10}
                onClick={() => navigate('/feed')}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  selectedContactsCount >= 10 
                    ? 'bg-gradient-to-r from-[#fd913c] to-[#f13ab1] text-white hover:from-[#fd913c]/90 hover:to-[#f13ab1]/90' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedContactsCount >= 10 ? 'View Your Feed' : `Select ${10 - selectedContactsCount} more friends`}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="bg-gradient-to-r from-[#f13ab1] via-[#fd913c] to-[#f135af] rounded-xl p-8 text-white text-center shadow-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 w-20 h-20 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-2">Ready to Discover?</h3>
            <p className="text-white/90 mb-8 text-lg">Your friends have amazing taste! Start exploring their favorite products and find your next purchase.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-bold mb-1">50+</div>
                <div className="text-white/80 text-sm font-medium">Available Friends</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-bold mb-1">1.2K+</div>
                <div className="text-white/80 text-sm font-medium">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all duration-300">
                <div className="text-4xl font-bold mb-1">95%</div>
                <div className="text-white/80 text-sm font-medium">Match Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={hasData ? <DataManagementScreen /> : <WelcomeScreen />} 
        />
        <Route 
          path="/selector" 
          element={hasData ? <FriendsSelector /> : <WelcomeScreen />} 
        />
        <Route 
          path="/feed" 
          element={hasData ? <FriendsFeed /> : <WelcomeScreen />} 
        />
        <Route 
          path="/manage" 
          element={<DataManagementScreen />} 
        />
      </Routes>

      {/* Upload Modal */}
      {showUpload && (
        <DataUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUpload(false)}
        />
      )}
    </>
  )
}

export default Friends