import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import doctor1 from "../assets/doctors/d1.png";
import doctor2 from "../assets/doctors/d2.png";
import doctor3 from "../assets/doctors/d3.png";
import doctor4 from "../assets/doctors/d4.png";
import doctor5 from "../assets/doctors/d5.png";
import doctor6 from "../assets/doctors/d6.png";

const OnlineConsultation = () => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');
  const [search, setSearch] = useState('');
  const [uploadedReport, setUploadedReport] = useState(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [openProfile, setOpenProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ✅ Doctor Data
  const onlineDoctors = [
    {
      id: 1,
      name: 'Dr. Sarah Chen',
      specialization: 'Cardiology',
      availability: ['09:00', '14:00', '16:00'],
      fee: 99,
      rating: 4.9,
      image: doctor1,
      languages: ['English', 'Mandarin'],
      isOnline: true,
      experience: '12 years',
      education: 'MD - Cardiology, Harvard University'
    },
    {
      id: 2,
      name: 'Dr. Michael Rodriguez',
      specialization: 'Neurology',
      availability: ['08:00', '11:00', '15:00'],
      fee: 120,
      rating: 4.8,
      image: doctor2,
      languages: ['English', 'Spanish'],
      isOnline: false,
      experience: '15 years',
      education: 'MD - Neurology, Stanford University'
    },
    {
      id: 3,
      name: 'Dr. Lisa Thompson',
      specialization: 'Pediatrics',
      availability: ['10:00', '13:00', '17:00'],
      fee: 85,
      rating: 4.9,
      image: doctor4,
      languages: ['English'],
      isOnline: true,
      experience: '9 years',
      education: 'MD - Pediatrics, Johns Hopkins'
    }
  ];

  // ✅ Generate random meeting link
  const generateMeetingLink = () => {
    const random = Math.random().toString(36).substring(7);
    return `https://meet.telehealth.com/${random}`;
  };

  // ✅ Search doctor
  const filteredDoctors = onlineDoctors.filter(doc =>
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const handlePayment = () => {
    setPaymentDone(true);
    const link = generateMeetingLink();
    setMeetingLink(link);
    alert("✅ Payment Successful!");
  };

  const handleScheduleConsultation = (e) => {
    e.preventDefault();
    if (!paymentDone) return alert("⚠ Please complete payment!");

    const newAppointment = {
      id: Date.now(),
      doctor: selectedDoctor.name,
      specialization: selectedDoctor.specialization,
      date: consultationDate,
      time: consultationTime,
      fee: selectedDoctor.fee,
      link: meetingLink,
      status: "Upcoming"
    };

    setAppointments([...appointments, newAppointment]);

    alert(`✅ Appointment Confirmed with ${selectedDoctor.name}`);

    setSelectedDoctor(null);
    setConsultationDate('');
    setConsultationTime('');
    setPaymentDone(false);
    setMeetingLink('');
  };

  const cancelAppointment = (id) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-6">Online Consultation</h1>

        {/* ✅ Search */}
        <input
          type="text"
          placeholder="Search doctor or specialization..."
          className="w-full border p-3 rounded-xl mb-6 shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Doctors List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Available Doctors</h2>

              {filteredDoctors.length === 0 && (
                <p className="text-gray-500">No doctor found 😔</p>
              )}

              {filteredDoctors.map(doctor => (
                <div key={doctor.id} className="border rounded-xl p-5 mb-4 hover:shadow-md transition">
                  
                  <div className="flex items-center gap-4">
                    {/* ✅ FIXED: Using img tag instead of text */}
                    <div className="flex-shrink-0">
                      <img 
                        src={doctor.image} 
                        alt={doctor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-200"
                      />
                    </div>

                    <div className="flex-grow">
                      <h3
                        className="font-bold text-xl cursor-pointer hover:text-blue-600"
                        onClick={() => setOpenProfile(doctor)}
                      >
                        {doctor.name}
                      </h3>
                      <p className="text-blue-600">{doctor.specialization}</p>
                      <p className="text-sm text-gray-600">⭐ {doctor.rating}</p>

                      <p className="text-sm flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${doctor.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {doctor.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedDoctor(doctor)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4">
            <h2 className="text-2xl font-semibold mb-6">
              {selectedDoctor ? `Schedule with ${selectedDoctor.name}` : "Select a Doctor"}
            </h2>

            {selectedDoctor && (
              <form onSubmit={handleScheduleConsultation} className="space-y-4">

                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                  {/* ✅ FIXED: Doctor image in booking section */}
                  <img 
                    src={selectedDoctor.image} 
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <strong className="text-lg">{selectedDoctor.name}</strong><br />
                    <span className="text-blue-600">{selectedDoctor.specialization}</span><br />
                    <span className="text-green-600 font-semibold">Fee: ${selectedDoctor.fee}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    className="border p-3 rounded-lg w-full"
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    className="border p-3 rounded-lg w-full"
                    value={consultationTime}
                    onChange={(e) => setConsultationTime(e.target.value)}
                    required
                  >
                    <option value="">Select Time</option>
                    {selectedDoctor.availability.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {!paymentDone ? (
                  <button
                    type="button"
                    onClick={handlePayment}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                  >
                    Pay ${selectedDoctor.fee}
                  </button>
                ) : (
                  <p className="text-green-600 font-bold text-center">✅ Payment Done</p>
                )}

                {meetingLink && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-semibold">Meeting Link:</p>
                    <a 
                      href={meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm break-all"
                    >
                      {meetingLink}
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!paymentDone}
                  className={`w-full py-3 rounded-lg font-bold transition ${
                    paymentDone 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  Confirm Appointment
                </button>

              </form>
            )}
          </div>
        </div>

        {/* ✅ Appointment List */}
        <div className="bg-white mt-12 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Scheduled Appointments</h2>

          {appointments.length === 0 && (
            <p className="text-gray-500">No appointments scheduled.</p>
          )}

          {appointments.map(app => (
            <div
              key={app.id}
              className="border rounded-lg p-4 mb-3 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-bold text-lg">{app.doctor} ({app.specialization})</p>
                <p className="text-gray-600">{app.date} at {app.time}</p>
                <p className="text-green-600 font-semibold">Fee: ${app.fee}</p>
                <a 
                  href={app.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 underline text-sm inline-block mt-1"
                >
                  Join Meeting
                </a>
              </div>

              <button
                onClick={() => cancelAppointment(app.id)}
                className="text-red-600 font-bold hover:underline hover:text-red-700 transition"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>

        {/* ✅ Doctor Profile Modal */}
        {openProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-4 mb-4">
                {/* ✅ FIXED: Doctor image in modal */}
                <img 
                  src={openProfile.image} 
                  alt={openProfile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-blue-300"
                />
                <div>
                  <h2 className="text-2xl font-bold">{openProfile.name}</h2>
                  <p className="text-blue-600 font-semibold">{openProfile.specialization}</p>
                  <p className="text-sm text-gray-600">⭐ {openProfile.rating} Rating</p>
                </div>
              </div>

              <div className="space-y-2">
                <p><strong>Experience:</strong> {openProfile.experience}</p>
                <p><strong>Education:</strong> {openProfile.education}</p>
                <p><strong>Languages:</strong> {openProfile.languages.join(', ')}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 ${openProfile.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {openProfile.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </p>
                <p><strong>Consultation Fee:</strong> ${openProfile.fee}</p>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setSelectedDoctor(openProfile)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>
                <button
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={() => setOpenProfile(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OnlineConsultation;