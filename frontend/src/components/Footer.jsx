// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/hosi.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Find a Doctor', path: '/doctors' },
    { name: 'Book Appointment', path: '/appointments' },
    { name: 'Online Consultation', path: '/consultation' },
    { name: 'Pharmacy', path: '/pharmacy' },
    { name: 'Emergency Contact', path: '/contact' }
  ];

  const services = [
    'Emergency Care',
    'Cardiology',
    'Neurology',
    'Orthopedics',
    'Pediatrics',
    'Dermatology',
    'Surgery',
    'Radiology'
  ];

  const socialLinks = [
    {
      name: 'Facebook',
      icon: '📘',
      url: '#',
      color: 'hover:bg-blue-600'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      url: '#',
      color: 'hover:bg-blue-400'
    },
    {
      name: 'Instagram',
      icon: '📷',
      url: '#',
      color: 'hover:bg-pink-600'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: '#',
      color: 'hover:bg-blue-800'
    },
    {
      name: 'YouTube',
      icon: '📺',
      url: '#',
      color: 'hover:bg-red-600'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Hospital Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div>
              <img 
                  src={logo}
                  alt="MediCare+ Hospital"
                  className="w-8 h-8 object-contain width={100} height={90}"
                />
                <h1 className="text-xl font-bold text-blue-600">MediCare+</h1>
                <p className="text-gray-400 text-sm">Advanced Healthcare</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Providing world-class healthcare services with compassion and cutting-edge technology. 
              Your health is our priority, 24/7.
            </p>
            
           

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  className={`bg-gray-800 p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${social.color} hover:text-white`}
                  title={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-700 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center space-x-2 group"
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full group-hover:scale-125 transition-transform duration-200"></span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

         

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white border-b border-gray-700 pb-2">
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 group">
                <div className="text-blue-400 mt-1 group-hover:scale-110 transition-transform duration-200">📍</div>
                <div>
                  <p className="font-medium">Main Hospital</p>
                  <p className="text-gray-300 text-sm">123 Health Street, Medical City, MC 12345</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="text-green-400 mt-1 group-hover:scale-110 transition-transform duration-200">📞</div>
                <div>
                  <p className="font-medium">24/7 Helpline</p>
                  <p className="text-gray-300 text-sm">1-800-MEDICARE</p>
                  <p className="text-gray-300 text-sm">(555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="text-yellow-400 mt-1 group-hover:scale-110 transition-transform duration-200">📧</div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-300 text-sm">info@medicareplus.com</p>
                  <p className="text-gray-300 text-sm">emergency@medicareplus.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 group">
                <div className="text-purple-400 mt-1 group-hover:scale-110 transition-transform duration-200">🕒</div>
                <div>
                  <p className="font-medium">Working Hours</p>
                  <p className="text-gray-300 text-sm">Emergency: 24/7</p>
                  <p className="text-gray-300 text-sm">OPD: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left">
              <h4 className="text-lg font-semibold mb-2">Stay Updated with Health Tips</h4>
              <p className="text-gray-400 text-sm">Subscribe to our newsletter for health insights and updates</p>
            </div>
            <div className="flex space-x-2 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 flex-1 lg:w-64 transition-all duration-200"
              />
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} @MediCare+ Hospital. All rights reserved-batch10.
              </p>
            </div>

            {/* Accreditations */}
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded-full">JCI Accredited</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">NABH Certified</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">ISO 9001:2015</span>
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="hover:text-white transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/contact"
          className="bg-red-600 text-white p-4 rounded-full shadow-2xl hover:bg-red-700 transform hover:scale-110 transition-all duration-300 flex items-center justify-center animate-pulse"
          title="Emergency Help"
        >
          <div className="text-center">
            <div className="text-2xl">🚑</div>
            <div className="text-xs font-bold mt-1">HELP</div>
          </div>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;