import React, { useState } from 'react'
import { FaUpload, FaLink, FaFileExcel, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa'
import axios from 'axios'

const DataUpload = ({ onUploadSuccess, onClose }) => {
  const [uploadMethod, setUploadMethod] = useState('excel') // 'excel' or 'url'
  const [file, setFile] = useState(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [validationResults, setValidationResults] = useState(null)

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Please select a valid Excel file (.xls or .xlsx)')
        return
      }

      // Validate file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  // Handle URL input
  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    setError('')
  }

  // Validate URL format
  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle upload submission
  const handleUpload = async () => {
    setError('')
    setSuccess('')
    setValidationResults(null)

    // Validation
    if (uploadMethod === 'excel' && !file) {
      setError('Please select an Excel file to upload')
      return
    }

    if (uploadMethod === 'url' && !url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    if (uploadMethod === 'url' && !isValidUrl(url.trim())) {
      setError('Please enter a valid URL format')
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)

      const formData = new FormData()
      
      if (uploadMethod === 'excel') {
        formData.append('file', file)
        formData.append('uploadType', 'excel')
      } else {
        formData.append('url', url.trim())
        formData.append('uploadType', 'url')
      }

      // Get token from localStorage
      const token = localStorage.getItem('token')
      
      const response = await axios.post('/api/v1/friends/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(progress)
        }
      })

      if (response.data.success) {
        setSuccess('Data uploaded and processed successfully!')
        setValidationResults(response.data.validation)
        
        // Call success callback after a short delay
        setTimeout(() => {
          if (onUploadSuccess) {
            onUploadSuccess(response.data)
          }
        }, 2000)
      }
    } catch (err) {
      console.error('Upload error:', err)
      
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data?.validation) {
        setError('Validation failed. Please check your data format.')
        setValidationResults(err.response.data.validation)
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.')
        // Optionally redirect to login
        localStorage.removeItem('token')
      } else if (err.response?.status === 413) {
        setError('File too large. Please select a smaller file.')
      } else if (err.response?.status === 422) {
        setError('Invalid file format or data structure.')
      } else {
        setError('Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const droppedFile = files[0]
      
      // Create a synthetic event to reuse handleFileSelect logic
      const syntheticEvent = {
        target: {
          files: [droppedFile]
        }
      }
      
      handleFileSelect(syntheticEvent)
    }
  }

  // Reset form
  const handleReset = () => {
    setFile(null)
    setUrl('')
    setError('')
    setSuccess('')
    setValidationResults(null)
    setUploadProgress(0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Upload Friends Data
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          
          {/* Upload Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Upload Method
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setUploadMethod('excel')}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  uploadMethod === 'excel'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaFileExcel />
                Excel File
              </button>
              
              <button
                onClick={() => setUploadMethod('url')}
                className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-colors ${
                  uploadMethod === 'url'
                    ? 'border-pink-500 bg-pink-50 text-pink-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <FaLink />
                URL/API Endpoint
              </button>
            </div>
          </div>

          {/* Excel Upload */}
          {uploadMethod === 'excel' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to select Excel file or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports .xlsx and .xls files (max 10MB)
                  </p>
                </label>
              </div>
              
              {file && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FaCheck className="text-green-600" />
                    <span className="text-sm text-green-700">
                      File selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL Upload */}
          {uploadMethod === 'url' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Source URL
              </label>
              <input
                type="url"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://example.com/api/friends-data or https://example.com/data.zip"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supports API endpoints, ZIP files, or direct data URLs
              </p>
            </div>
          )}

          {/* Data Format Information */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Expected Data Format</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Contacts Sheet:</strong> name, email, avatar (optional)</p>
              <p><strong>Products Sheet:</strong> name, brand, category, price, images, contact_email</p>
              <p><strong>Wishlists Sheet:</strong> contact_email, product_id, added_date</p>
              <p><strong>Orders Sheet:</strong> contact_email, product_id, order_date, quantity</p>
              <p><strong>Watch Time Sheet:</strong> contact_email, product_id, watch_time_seconds</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaTimes className="text-red-600" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <FaCheck className="text-green-600" />
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResults && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Validation Results</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Contacts processed:</span>
                  <span className="font-medium">{validationResults.contactsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Products processed:</span>
                  <span className="font-medium">{validationResults.productsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Wishlists processed:</span>
                  <span className="font-medium">{validationResults.wishlistsCount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orders processed:</span>
                  <span className="font-medium">{validationResults.ordersCount || 0}</span>
                </div>
                {validationResults.errors && validationResults.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 font-medium mb-1">Warnings:</p>
                    <ul className="text-yellow-700 text-xs space-y-1">
                      {validationResults.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                      {validationResults.errors.length > 5 && (
                        <li>• ... and {validationResults.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {uploading && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FaSpinner className="animate-spin text-pink-500" />
                <span className="text-sm text-gray-600">
                  {uploadMethod === 'excel' ? 'Uploading and processing file...' : 'Fetching and processing data...'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}% complete</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleReset}
              disabled={uploading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset
            </button>
            
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleUpload}
              disabled={uploading || (!file && uploadMethod === 'excel') || (!url.trim() && uploadMethod === 'url')}
              className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FaUpload />
                  Upload & Process
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataUpload