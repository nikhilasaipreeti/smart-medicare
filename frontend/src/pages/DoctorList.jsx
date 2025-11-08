// pages/DoctorList.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import doctor1 from "../assets/doctors/d1.png";
import doctor2 from "../assets/doctors/d2.png";
import doctor3 from "../assets/doctors/d3.png";
import doctor4 from "../assets/doctors/d4.png";
import doctor5 from "../assets/doctors/d5.png";
import doctor6 from "../assets/doctors/d6.png";

const DoctorList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const navigate = useNavigate();

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      specialization: 'Cardiology',
      experience: '15 years',
      education: 'MD, Harvard Medical School',
      availability: 'Available',
      nextAvailable: 'Today, 2:00 PM',
      cabin: 'A-101',
      block: 'Main Building',
      image: doctor1,
      rating: 4.9,
      reviews: 127,
      consultationFee: '$200'
    },
    {
      id: 2,
      name: 'Dr. Michael Rodriguez',
      specialization: 'Neurology',
      experience: '12 years',
      education: 'MD, Johns Hopkins University',
      availability: 'Busy',
      nextAvailable: 'Tomorrow, 9:00 AM',
      cabin: 'B-205',
      block: 'Neuro Center',
      image: doctor4,
      rating: 4.8,
      reviews: 98,
      consultationFee: '$180'
    },
    {
      id: 3,
      name: 'Dr. James Wilson',
      specialization: 'Dermatology',
      experience: '10 years',
      education: 'MD, Dermatology (Stanford University)',
      availability: 'Available',
      nextAvailable: 'Today, 3:30 PM',
      cabin: 'C-102',
      block: 'Skin Care Center',
      image: doctor3,
      rating: 4.7,
      reviews: 156,
      consultationFee: '$175',
      description: 'Specializes in cosmetic dermatology and skin cancer prevention. Pioneer in laser treatment technologies.'
    },
    {
      id: 4,
      name: 'Dr. Lisa Thompson',
      specialization: 'Pediatrics',
      experience: '10 years',
      education: 'MD, Stanford University',
      availability: 'Available',
      nextAvailable: 'Today, 1:00 PM',
      cabin: 'D-301',
      block: 'Children\'s Wing',
      image: doctor2,
      rating: 4.9,
      reviews: 203,
      consultationFee: '$160'
    },
    {
      id: 5,
      name: 'Dr. Robert Kim',
      specialization: 'Dermatology',
      experience: '14 years',
      education: 'MD, UCLA',
      availability: 'Busy',
      nextAvailable: 'Tomorrow, 10:30 AM',
      cabin: 'E-104',
      block: 'Skin Care Center',
      image: doctor5,
      rating: 4.6,
      reviews: 89,
      consultationFee: '$190'
    },
    {
      id: 6,
      name: 'Dr. Amanda Patel',
      specialization: 'Gynecology',
      experience: '11 years',
      education: 'MD, Duke University',
      availability: 'Available',
      nextAvailable: 'Today, 4:00 PM',
      cabin: 'F-201',
      block: 'Women\'s Health',
      image: doctor6,
      rating: 4.8,
      reviews: 134,
      consultationFee: '$185'
    }
  ];

  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization ? doctor.specialization === selectedSpecialization : true;
    return matchesSearch && matchesSpecialization;
  });

  const handleBookAppointment = (doctor) => {
    // Navigate to appointments page with doctor data
    navigate('/appointments', { 
      state: { 
        selectedDoctor: {
          id: doctor.id,
          name: `${doctor.name} - ${doctor.specialization}`,
          specialization: doctor.specialization,
          consultationFee: doctor.consultationFee,
          description: doctor.description
        }
      }
    });
  };

  const handleViewProfile = (doctor) => {
    // Navigate to doctor profile page
    navigate(`/doctor-profile/${doctor.id}`, { state: { doctor } });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Medical Experts</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Meet our team of highly qualified and experienced healthcare professionals dedicated to your well-being
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <div>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
            >
              <div className="p-6">
                {/* Doctor Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    doctor.availability === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.availability}
                  </span>
                </div>

                {/* Doctor Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-24">Experience:</span>
                    <span className="ml-2">{doctor.experience}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-24">Education:</span>
                    <span className="ml-2">{doctor.education}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-24">Location:</span>
                    <span className="ml-2">{doctor.cabin}, {doctor.block}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-24">Consultation:</span>
                    <span className="ml-2 font-semibold text-green-600">{doctor.consultationFee}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium w-24">Next Available:</span>
                    <span className="ml-2">{doctor.nextAvailable}</span>
                  </div>
                </div>

                {/* Doctor Description */}
                {doctor.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 italic">{doctor.description}</p>
                  </div>
                )}

                {/* Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400">⭐</span>
                      <span className="ml-1 font-semibold">{doctor.rating}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({doctor.reviews} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleBookAppointment(doctor)}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    Book Appointment
                  </button>
                  <button 
                    onClick={() => handleViewProfile(doctor)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                  >
                    Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No doctors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;