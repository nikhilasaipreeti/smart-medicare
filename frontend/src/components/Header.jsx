import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/hosi.png";

const Header = ({ isLoggedIn, setIsLoggedIn, userRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const isActiveLink = (path) => {
    return location.pathname === path ? 'text-blue-600 font-semibold border-b-2 border-blue-600' : 'text-gray-700 hover:text-blue-600';
  };

  const handleProfileClick = () => {
    if (isLoggedIn) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <img 
              src={logo}
              alt="MediCare+ Hospital"
              className="h-12 w-auto md:h-14"
            />
            <div>
              <h1 className="text-2xl font-bold text-blue-800">MediCare+</h1>
              <p className="text-xs text-gray-600 hidden md:block">Advanced Healthcare</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/')}`}
            >
              Home
            </Link>
            <Link 
              to="/doctors" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/doctors')}`}
            >
              Doctors
            </Link>
            <Link 
              to="/appointments" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/appointments')}`}
            >
              Appointments
            </Link>
            <Link 
              to="/consultation" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/consultation')}`}
            >
              Online Consultation
            </Link>
            <Link 
              to="/pharmacy" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/pharmacy')}`}
            >
              Pharmacy
            </Link>
            <Link 
              to="/feedback" 
              className={`transition-colors duration-300 py-2 ${isActiveLink('/feedback')}`}
            >
              Feedback
            </Link>
            {isLoggedIn && (
              <Link 
                to="/dashboard" 
                className={`transition-colors duration-300 py-2 ${isActiveLink('/dashboard')}`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Desktop Auth Buttons & Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-700">
                    {userRole?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {userRole}
                    </p>
                    <p className="text-gray-500 text-xs">My Account</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 capitalize">Welcome, {userRole}</p>
                      <p className="text-xs text-gray-500">Manage your account</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      to="/appointments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      📅 My Appointments
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      👤 Profile Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors duration-200"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="font-semibold text-gray-700 px-4 py-2 rounded-lg hover:text-blue-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg border border-gray-200 p-4 animate-slideDown">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link 
                to="/doctors" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/doctors')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                👨‍⚕️ Doctors
              </Link>
              <Link 
                to="/appointments" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/appointments')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                📅 Appointments
              </Link>
              <Link 
                to="/consultation" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/consultation')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💻 Online Consultation
              </Link>
              <Link 
                to="/pharmacy" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/pharmacy')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💊 Pharmacy
              </Link>
              <Link 
                to="/feedback" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/feedback')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                💬 Feedback
              </Link>
              <Link 
                to="/contact" 
                className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/contact')}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🚨 Emergency Contact
              </Link>
                
              {isLoggedIn && (
                <Link 
                  to="/dashboard" 
                  className={`py-3 px-4 rounded-lg transition-colors duration-200 ${isActiveLink('/dashboard')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  📊 Dashboard
                </Link>
              )}
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 mt-2">
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-semibold text-white text-sm">
                        {userRole?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 capitalize">{userRole}</p>
                        <p className="text-gray-500 text-xs">Logged In</p>
                      </div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      📊 My Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block py-2 px-4 rounded-lg text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      👤 My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left py-3 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      to="/login"
                      className="text-center py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors duration-200 font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-center py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>

      {/* Blue Thin Line Under Header */}
      <div className="w-full h-0.5 bg-blue-500"></div>

      {/* Close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileDropdownOpen(false)}
        ></div>
      )}
    </header>
  );
};

export default Header;