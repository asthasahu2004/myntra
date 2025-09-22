import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaCheckCircle, FaCircle } from 'react-icons/fa'
import axios from 'axios'

const FriendsSelector = () => {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const contactsPerPage = 12

  // Fetch pre-seeded contacts from API
  useEffect(() => {
    fetchContacts()
  }, [searchTerm])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await axios.get('/api/v1/friends/contacts/preseeded', {
        params: {
          search: searchTerm
        }
      })

      if (response.data.success) {
        setContacts(response.data.contacts)
        setFilteredContacts(response.data.contacts)
        setTotalPages(1) // All contacts are loaded at once
      }
    } catch (err) {
      console.error('Error fetching contacts from API:', err)
      
      // Fallback to mock data if API fails
      try {
        console.log('Attempting to load fallback mock data...')
        const mockResponse = await fetch('/mock-contacts.json')
        
        if (!mockResponse.ok) {
          throw new Error(`HTTP error! status: ${mockResponse.status}`)
        }
        
        const mockData = await mockResponse.json()
        console.log('Mock data loaded:', mockData)
        
        if (mockData.contacts && Array.isArray(mockData.contacts)) {
          setContacts(mockData.contacts)
          setFilteredContacts(mockData.contacts)
          setTotalPages(Math.ceil(mockData.contacts.length / contactsPerPage))
          console.log('Successfully loaded mock contacts:', mockData.contacts.length)
          setError(null) // Clear any previous errors
        } else {
          throw new Error('Invalid mock data format')
        }
      } catch (mockError) {
        console.error('Error loading mock data:', mockError)
        setError('Failed to load contacts. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle search
  const handleSearch = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle contact selection
  const handleContactSelect = (contactId) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId)
      } else {
        return [...prev, contactId]
      }
    })
  }

  // Select all visible contacts
  const handleSelectAll = () => {
    const allVisibleIds = filteredContacts.map(contact => contact._id)
    const allSelected = allVisibleIds.every(id => selectedContacts.includes(id))
    
    if (allSelected) {
      // Deselect all visible
      setSelectedContacts(prev => prev.filter(id => !allVisibleIds.includes(id)))
    } else {
      // Select all visible
      setSelectedContacts(prev => {
        const newSelected = [...prev]
        allVisibleIds.forEach(id => {
          if (!newSelected.includes(id)) {
            newSelected.push(id)
          }
        })
        return newSelected
      })
    }
  }

  // Generate friends feed
  const handleGenerateFeed = async () => {
    if (selectedContacts.length < 10) {
      setError('Please select at least 10 contacts to generate a feed.')
      return
    }

    try {
      setGenerating(true)
      setError('')

      // Store selected contacts in localStorage for the self-contained feature
      const selectedContactsData = contacts.filter(contact => 
        selectedContacts.includes(contact._id)
      )
      
      localStorage.setItem('selectedFriendsContacts', JSON.stringify(selectedContactsData))
      localStorage.setItem('selectedContactIds', JSON.stringify(selectedContacts))
      localStorage.setItem('feedGeneratedAt', new Date().toISOString())

      // For the self-contained feature, we'll generate the feed on the frontend
      // Navigate to friends products
      navigate('/friends/products')
      
    } catch (err) {
      setError('Failed to generate feed. Please try again.')
      console.error('Error generating feed:', err)
    } finally {
      setGenerating(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#ffffff] to-[#f13ab1]/10 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#f13ab1] to-[#f135af] rounded-full mb-6 shadow-lg">
            <span className="text-white text-2xl font-bold">👥</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#f13ab1] to-[#fd913c] bg-clip-text text-transparent mb-4">
            Select Your Friends
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Choose at least <span className="font-semibold text-[#f13ab1]">10 friends</span> to generate a personalized product feed based on their preferences, 
            wishlists, and shopping history.
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8 backdrop-blur-sm bg-white/90">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search friends by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Selection Info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {selectedContacts.length} selected
                  {selectedContacts.length >= 10 && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </span>
              </div>
              
              <button
                onClick={handleSelectAll}
                className="text-sm text-pink-600 hover:text-pink-700 font-medium px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors duration-200"
              >
                {filteredContacts.every(contact => selectedContacts.includes(contact._id)) 
                  ? 'Deselect All' 
                  : 'Select All'
                }
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            <p className="mt-2 text-gray-600">Loading contacts...</p>
          </div>
        ) : (
          <>
            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredContacts.map((contact) => {
                const isSelected = selectedContacts.includes(contact._id)
                
                // Generate initials from name
                const getInitials = (name) => {
                  return name
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase())
                    .join('')
                    .substring(0, 2) // Take only first 2 initials
                }

                // Generate color scheme based on name
                const getAvatarColor = (name) => {
                  const colors = [
                    'bg-gradient-to-br from-[#f13ab1] to-[#f135af]',
                    'bg-gradient-to-br from-[#f134af] to-[#f138b0]',
                    'bg-gradient-to-br from-[#fd913c] to-[#f13ab1]',
                    'bg-gradient-to-br from-[#f135af] to-[#fd913c]',
                    'bg-gradient-to-br from-[#f138b0] to-[#f134af]',
                    'bg-gradient-to-br from-[#f13ab1] to-[#fd913c]',
                    'bg-gradient-to-br from-[#f134af] to-[#f135af]',
                    'bg-gradient-to-br from-[#fd913c] to-[#f138b0]',
                    'bg-gradient-to-br from-[#f135af] to-[#f13ab1]',
                    'bg-gradient-to-br from-[#f138b0] to-[#fd913c]',
                    'bg-gradient-to-br from-[#f13ab1] to-[#f134af]',
                    'bg-gradient-to-br from-[#fd913c] to-[#f135af]'
                  ]
                  
                  // Use name to generate consistent color index
                  const nameSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
                  return colors[nameSum % colors.length]
                }
                
                return (
                  <div
                    key={contact._id}
                    onClick={() => handleContactSelect(contact._id)}
                    className={`relative bg-white rounded-xl shadow-sm border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 transform ${
                      isSelected 
                        ? 'border-[#f13ab1] bg-gradient-to-br from-[#f13ab1]/10 to-[#fd913c]/10 shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Selection Indicator */}
                    <div className="absolute top-3 right-3 z-10">
                      {isSelected ? (
                        <div className="bg-white rounded-full p-1 shadow-md">
                          <FaCheckCircle className="text-[#f13ab1] text-lg" />
                        </div>
                      ) : (
                        <div className="bg-white rounded-full p-1 shadow-sm opacity-70 hover:opacity-100 transition-opacity">
                          <FaCircle className="text-gray-300 text-lg" />
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Avatar with Initials */}
                      <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-full ${getAvatarColor(contact.name)} flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-110`}>
                          <span className="text-white font-bold text-xl drop-shadow-sm">
                            {getInitials(contact.name)}
                          </span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="text-center">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {contact.name}
                        </h3>
                      </div>
                    </div>

                    {/* Subtle decorative element */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300 ${
                      isSelected ? 'bg-gradient-to-r from-pink-400 to-purple-500' : 'bg-transparent'
                    }`}></div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mb-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Generate Feed Button */}
        <div className="fixed bottom-8 right-8 z-50">
          <div className="relative">
            {/* Floating action button with enhanced styling */}
            <button
              onClick={handleGenerateFeed}
              disabled={selectedContacts.length < 10 || generating}
              className={`group relative px-8 py-4 rounded-2xl font-bold text-white shadow-2xl transition-all duration-300 transform hover:scale-105 ${
                selectedContacts.length >= 10 && !generating
                  ? 'bg-gradient-to-r from-[#f13ab1] to-[#fd913c] hover:from-[#f134af] hover:to-[#fd913c]/90 hover:shadow-[#f13ab1]/25'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {/* Animated background for active state */}
              {selectedContacts.length >= 10 && !generating && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#f134af] to-[#fd913c] opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              )}
              
              <span className="relative z-10 flex items-center gap-3">
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Feed...</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl">✨</span>
                    <span>Generate Feed ({selectedContacts.length}/10)</span>
                  </>
                )}
              </span>
            </button>

            {/* Progress indicator */}
            {selectedContacts.length > 0 && selectedContacts.length < 10 && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-3 py-2 text-sm text-gray-600 whitespace-nowrap">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#f13ab1] to-[#fd913c] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(selectedContacts.length / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendsSelector