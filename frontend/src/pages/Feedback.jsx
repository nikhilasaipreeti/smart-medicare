// pages/Feedback.js
import React, { useState } from 'react';

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    category: '',
    comments: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log('Feedback submitted:', formData);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      rating: 0,
      category: '',
      comments: ''
    });
  };

  const RatingStars = ({ rating, onRatingClick }) => {
    return (
      <div className="flex space-x-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingClick(star)}
            className="text-3xl transition-transform duration-200 hover:scale-125"
          >
            {star <= rating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Share Your Feedback</h1>
            <p className="text-xl text-gray-600">
              Your experience helps us provide better healthcare services
            </p>
          </div>

          {submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-8 animate-fadeIn">
              <div className="flex items-center">
                <span className="text-2xl mr-2">✅</span>
                <span className="font-semibold">Thank you for your feedback!</span>
              </div>
              <p className="mt-1">We appreciate you taking the time to share your experience with us.</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Overall Rating *
                </label>
                <RatingStars 
                  rating={formData.rating} 
                  onRatingClick={handleRatingClick}
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select a category</option>
                  <option value="doctor">Doctor Consultation</option>
                  <option value="nursing">Nursing Care</option>
                  <option value="facility">Facility & Cleanliness</option>
                  <option value="pharmacy">Pharmacy Services</option>
                  <option value="appointment">Appointment Process</option>
                  <option value="billing">Billing & Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback *
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Please share your experience, suggestions, or concerns..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-12 py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>

          {/* Additional Information */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
              <p className="text-gray-600">24/7 Helpline: 1-800-MEDICARE</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
              <p className="text-gray-600">Chat with our support team in real-time</p>
            </div>

            <div className="text-center p-6 bg-white rounded-2xl shadow-lg">
              <div className="text-4xl mb-4">🏥</div>
              <h3 className="text-lg font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-600">123 Health Street, Medical City</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
