import React, { Fragment } from 'react'
import { Link } from 'react-router-dom'

const Friends = ({ show, CMenu, parentCallback }) => {
  const handleMouseEnter = () => {
    parentCallback('block', true)
  }

  const handleMouseLeave = () => {
    parentCallback('hidden', false)
  }

  return (
    <Fragment>
      <div 
        className={`${CMenu} absolute top-20 left-0 w-full bg-white shadow-lg border-t border-gray-200 z-50`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-4 gap-8">
            
            {/* Friends Feed Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Friends Feed
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/friends" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Browse Friends Feed
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/selector" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Select Friends
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/generate" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Generate New Feed
                  </Link>
                </li>
              </ul>
            </div>

            {/* Data Management Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Data Management
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/friends/upload" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Upload Data
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/contacts" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Manage Contacts
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/history" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Feed History
                  </Link>
                </li>
              </ul>
            </div>

            {/* Recommendations Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Recommendations
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/friends/trending" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Trending Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/similar" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Similar Products
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/insights" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Friend Insights
                  </Link>
                </li>
              </ul>
            </div>

            {/* Quick Actions Section */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Quick Actions
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/friends/filters" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Filter Settings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/preferences" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Preferences
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends/help" 
                    className="text-gray-600 hover:text-pink-500 text-sm block py-1"
                  >
                    Help & Guide
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Featured Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 text-sm">
                  🎯 Discover what your friends love
                </h4>
                <p className="text-gray-600 text-xs mt-1">
                  Get personalized recommendations based on your friends' preferences
                </p>
              </div>
              <Link 
                to="/friends/selector"
                className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Friends