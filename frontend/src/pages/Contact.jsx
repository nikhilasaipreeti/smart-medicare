// src/pages/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    emergencyType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const emergencyContacts = [
    {
      id: 1,
      type: 'Medical Emergency',
      number: '1-800-MEDICARE',
      description: '24/7 Medical Emergency Helpline',
      icon: '🚑',
      color: 'bg-red-500',
      available: '24/7'
    },
    {
      id: 2,
      type: 'Ambulance',
      number: '1-800-AMBULANCE',
      description: 'Immediate ambulance service',
      icon: '🚨',
      color: 'bg-red-600',
      available: '24/7'
    },
    {
      id: 3,
      type: 'Emergency Room',
      number: '(555) 123-EMER',
      description: 'Hospital emergency room direct line',
      icon: '🏥',
      color: 'bg-blue-600',
      available: '24/7'
    },
    {
      id: 4,
      type: 'Poison Control',
      number: '1-800-222-1222',
      description: 'National Poison Control Center',
      icon: '⚠️',
      color: 'bg-orange-500',
      available: '24/7'
    },
    {
      id: 5,
      type: 'Mental Health Crisis',
      number: '988',
      description: 'Suicide & Crisis Lifeline',
      icon: '🧠',
      color: 'bg-purple-500',
      available: '24/7'
    },
    {
      id: 6,
      type: 'Cardiac Emergency',
      number: '(555) 123-HEART',
      description: 'Cardiac specialist emergency line',
      icon: '❤️',
      color: 'bg-red-500',
      available: '24/7'
    }
  ];

  const hospitalLocations = [
    {
      id: 1,
      name: 'Main Hospital Campus',
      address: '123 Health Street, Medical City, MC 12345',
      phone: '(555) 123-4567',
      hours: '24/7',
      services: ['Emergency Room', 'ICU', 'Surgery', 'Radiology'],
      mapLink: '#'
    },
    {
      id: 2,
      name: 'Northside Medical Center',
      address: '456 Wellness Avenue, North District, MC 12346',
      phone: '(555) 123-4568',
      hours: '6:00 AM - 10:00 PM',
      services: ['Urgent Care', 'Primary Care', 'Lab Services'],
      mapLink: '#'
    },
    {
      id: 3,
      name: 'Children\'s Medical Wing',
      address: '789 Pediatric Lane, Medical City, MC 12347',
      phone: '(555) 123-4569',
      hours: '24/7',
      services: ['Pediatric ER', 'NICU', 'Children\'s Specialists'],
      mapLink: '#'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmergencyCall = (number) => {
    if (window.confirm(`Are you sure you want to call ${number}?`)) {
      window.location.href = `tel:${number}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        emergencyType: 'general'
      });
      setIsSubmitting(false);
    }, 2000);
  };

  const quickActions = [
    {
      title: 'Book Ambulance',
      description: 'Request immediate ambulance service',
      icon: '🚑',
      action: () => handleEmergencyCall('1-800-AMBULANCE'),
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Emergency Chat',
      description: 'Chat with emergency response team',
      icon: '💬',
      action: () => alert('Connecting you with emergency chat support...'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Find Nearest ER',
      description: 'Locate closest emergency room',
      icon: '📍',
      action: () => alert('Opening location services...'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Medical Records',
      description: 'Access emergency medical information',
      icon: '📋',
      action: () => alert('Opening emergency medical records...'),
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Emergency Banner */}
        <div className="bg-red-600 text-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="text-4xl">🚨</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Emergency Contacts</h1>
              <p className="text-red-100 text-lg">Immediate assistance available 24/7</p>
            </div>
            <div className="text-4xl">🚑</div>
          </div>
          <div className="bg-red-700 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-xl font-semibold">
              For Life-Threatening Emergencies, Call Immediately:
            </p>
            <button
              onClick={() => handleEmergencyCall('911')}
              className="mt-3 bg-white text-red-600 px-8 py-4 rounded-full font-bold text-xl hover:bg-red-50 transform hover:scale-105 transition-all duration-300 shadow-lg animate-pulse"
            >
              🚨 CALL 911 NOW 🚨
            </button>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`bg-gradient-to-r ${action.color} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 text-left`}
            >
              <div className="text-3xl mb-3">{action.icon}</div>
              <h3 className="text-xl font-bold mb-2">{action.title}</h3>
              <p className="text-white/90 text-sm">{action.description}</p>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Contacts */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📞</span>
                Emergency Contact Numbers
              </h2>
              <div className="space-y-4">
                {emergencyContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${contact.color} text-white p-3 rounded-full`}>
                        <span className="text-xl">{contact.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{contact.type}</h3>
                        <p className="text-gray-600 text-sm">{contact.description}</p>
                        <p className="text-green-600 text-sm font-medium">{contact.available}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEmergencyCall(contact.number)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold whitespace-nowrap"
                    >
                      Call Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Locations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">🏥</span>
                Our Hospital Locations
              </h2>
              <div className="space-y-4">
                {hospitalLocations.map(location => (
                  <div
                    key={location.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="font-semibold text-gray-800 text-lg mb-2">{location.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center">
                        <span className="mr-2">📍</span>
                        {location.address}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">📞</span>
                        {location.phone}
                      </p>
                      <p className="flex items-center">
                        <span className="mr-2">🕒</span>
                        Hours: {location.hours}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {location.services.map(service => (
                          <span
                            key={service}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => handleEmergencyCall(location.phone)}
                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-semibold"
                      >
                        Call Location
                      </button>
                      <button className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm">
                        Get Directions
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form & Important Information */}
          <div className="space-y-6">
            {/* Emergency Instructions */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center">
                <span className="text-3xl mr-3">⚠️</span>
                In Case of Emergency
              </h2>
              <div className="space-y-3 text-orange-700">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">1.</span>
                  <p><strong>Stay Calm</strong> - Take a deep breath and assess the situation</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">2.</span>
                  <p><strong>Call 911</strong> - For life-threatening emergencies</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">3.</span>
                  <p><strong>Provide Location</strong> - Give clear address and landmarks</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">4.</span>
                  <p><strong>Describe Situation</strong> - Explain symptoms and condition</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">5.</span>
                  <p><strong>Follow Instructions</strong> - Listen to emergency operator</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">6.</span>
                  <p><strong>Prepare Information</strong> - Have medical history ready</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">✉️</span>
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Your phone number"
                    />
                  </div>
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
                    placeholder="Your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emergency Type
                  </label>
                  <select
                    name="emergencyType"
                    value={formData.emergencyType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="appointment">Urgent Appointment</option>
                    <option value="billing">Billing Issue</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Message subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="Describe your emergency or inquiry..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Message...</span>
                    </div>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Additional Emergency Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-800 mb-3">Additional Emergency Resources</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>• <strong>Emergency Preparedness Kit:</strong> Keep medical records and medications accessible</p>
                <p>• <strong>Emergency Contacts:</strong> Program important numbers in your phone</p>
                <p>• <strong>Medical Alert:</strong> Consider medical alert jewelry for chronic conditions</p>
                <p>• <strong>Insurance Information:</strong> Keep insurance cards readily available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;