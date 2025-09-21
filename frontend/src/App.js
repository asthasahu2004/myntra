import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import './App.css';
import Navbar from './components/Navbar/Navbar.js'
import Home from "./components/Home/Home.js";
import MNavbar from "./components/Navbar/MobileNav/MNavbar.js";
import Login from "./components/Login/Login";
import Otpverify from "./components/Login/otpverify";
import Registeruser from "./components/Login/Registeruser";
import { getuser, clearErrors } from "./action/useraction";
import Overview from "./components/Login/Dashboard/overview";
import Allproductpage from "./components/Product/Allproduct";
import Ppage from "./components/Productpage/Ppage";
import MPpage from "./components/Productpage/MPpage";
import Footer from "./components/Footer/Footer";
import Coupon from "./components/Coupon/Coupon";
import Wishlist from "./components/Wishlist/Wishlist";
import AIContrastWishlist from "./components/Wishlist/AIContrastWishlist";
import Bag from './components/Bag/Bag'
import Address from "./components/Bag/Address";
import 'react-lazy-load-image-component/src/effects/blur.css';

// Custom hook for responsive design
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

// Protected Route component
const ProtectedRoute = ({ children, isAuthenticated, loading }) => {
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }
  
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

// Public Route component (redirects to home if already authenticated)
const PublicRoute = ({ children, isAuthenticated, loading, redirectTo = "/" }) => {
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a proper loading component
  }
  
  return !isAuthenticated ? children : <Navigate to={redirectTo} replace />;
};

function App() {
  const dispatch = useDispatch()
  const { loading, user, isAuthentication, error } = useSelector(state => state.user)
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Use media query hook instead of window.screen.width
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  useEffect(() => {
    // Initialize user data only once
    if (!isInitialized) {
      dispatch(getuser())
      setIsInitialized(true)
    }
  }, [dispatch, isInitialized]);

  useEffect(() => {
    // Handle URL parameter formatting
    const currentUrl = window.location.href;
    if (currentUrl.includes('&') && !currentUrl.includes('?')) {
      const correctedUrl = currentUrl.replace('&', '?');
      window.history.replaceState({}, '', correctedUrl);
    }
  }, []);

  useEffect(() => {
    // Handle authentication redirects
    if (isAuthentication && !loading) {
      const currentPath = window.location.pathname;
      const authRestrictedPaths = ['/Login', '/verifying', '/registeruser'];
      
      if (authRestrictedPaths.includes(currentPath)) {
        window.history.replaceState({}, '', '/');
      }
    }
  }, [isAuthentication, loading]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Application Error:', error);
      dispatch(clearErrors());
    }
  }, [error, dispatch]);

  return (
    <Router>
      <Navbar user={user} />
      <MNavbar user={user} />
      <Coupon />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication Routes - Only accessible when not authenticated */}
        <Route 
          path="/Login" 
          element={
            <PublicRoute isAuthenticated={isAuthentication} loading={loading}>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/verifying" 
          element={
            <PublicRoute isAuthenticated={isAuthentication} loading={loading}>
              <Otpverify />
            </PublicRoute>
          } 
        />
        <Route 
          path='/registeruser' 
          element={
            <PublicRoute isAuthenticated={isAuthentication} loading={loading}>
              <Registeruser />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - Only accessible when authenticated */}
        <Route 
          path='/dashboard' 
          element={
            <ProtectedRoute isAuthenticated={isAuthentication} loading={loading}>
              <Overview user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Product Routes - Accessible to all */}
        <Route path='/products' element={<Allproductpage />} />
        
        {/* Responsive Product Detail Routes */}
        <Route 
          path='/products/:id' 
          element={isDesktop ? <Ppage /> : <MPpage />} 
        />

        {/* Wishlist and Bag Routes */}
        <Route path='/my_wishlist' element={<Wishlist user={isAuthentication} />} />
        <Route path='/ai_wishlist' element={<AIContrastWishlist user={isAuthentication} />} />
        <Route path='/bag' element={<Bag user={user} />} />
        
        {/* Address Route - Should be protected */}
        <Route 
          path='/address/bag' 
          element={
            <ProtectedRoute isAuthenticated={isAuthentication} loading={loading}>
              <Address user={user} />
            </ProtectedRoute>
          } 
        />

        {/* Catch all route - 404 page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;