// pages/Appointments.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Appointments = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    patientName: '',
    email: '',
    doctor: '',
    date: '',
    time: '',
    reason: '',
    isDifferentPerson: false // New field to track if booking for someone else
  });

  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [bookingError, setBookingError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Mock database of all appointments
  const [allAppointments, setAllAppointments] = useState([
    { id: 1, patientId: 1, patient: 'John Smith', email: 'john@example.com', doctor: 'Dr. Sarah Chen', date: '2024-01-20', time: '10:00', status: 'Confirmed' },
    { id: 2, patientId: 2, patient: 'Sarah Johnson', email: 'sarah@example.com', doctor: 'Dr. Michael Rodriguez', date: '2024-01-21', time: '11:00', status: 'Pending' },
    { id: 3, patientId: 1, patient: 'John Smith', email: 'john@example.com', doctor: 'Dr. James Wilson', date: '2024-01-22', time: '14:00', status: 'Confirmed' },
    { id: 4, patientId: 3, patient: 'Mike Wilson', email: 'mike@example.com', doctor: 'Dr. Lisa Thompson', date: '2024-01-23', time: '09:00', status: 'Completed' },
    { id: 5, patientId: 1, patient: 'John Smith', email: 'john@example.com', doctor: 'Dr. Robert Kim', date: '2024-01-24', time: '15:00', status: 'Pending' }
  ]);

  const doctors = [
    { id: 1, name: 'Dr. Sarah Chen - Cardiology', availability: ['09:00', '10:00', '14:00'] },
    { id: 2, name: 'Dr. Michael Rodriguez - Neurology', availability: ['08:00', '11:00', '15:00'] },
    { id: 3, name: 'Dr. James Wilson - Dermatology', availability: ['10:00', '13:00', '16:00'] },
    { id: 4, name: 'Dr. Lisa Thompson - Pediatrics', availability: ['09:00', '12:00', '14:00'] },
    { id: 5, name: 'Dr. Robert Kim - Dermatology', availability: ['11:00', '14:00', '17:00'] },
    { id: 6, name: 'Dr. Amanda Patel - Gynecology', availability: ['08:30', '10:30', '15:30'] }
  ];

  // Check for time slot conflicts
  const hasTimeSlotConflict = (doctor, date, time, patientId = null) => {
    return allAppointments.some(appointment => 
      appointment.doctor === doctor &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== 'Cancelled' &&
      (patientId ? appointment.patientId !== patientId : true) // For different patients
    );
  };

  // Check if user has existing appointment at same time
  const hasUserTimeConflict = (date, time, patientId) => {
    return allAppointments.some(appointment => 
      appointment.patientId === patientId &&
      appointment.date === date &&
      appointment.time === time &&
      appointment.status !== 'Cancelled'
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user changes input
    if (bookingError) {
      setBookingError('');
    }
  };

  useEffect(() => {
    // Current user (in real app, from auth context)
    const user = {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com'
    };
    
    setCurrentUser(user);

    // Auto-fill patient name and email if not booking for different person
    if (!formData.isDifferentPerson) {
      setFormData(prev => ({
        ...prev,
        patientName: user.name,
        email: user.email
      }));
    } else {
      // Clear fields if booking for different person
      setFormData(prev => ({
        ...prev,
        patientName: '',
        email: ''
      }));
    }

    // Filter appointments for current user
    const userAppointments = allAppointments.filter(
      appointment => appointment.patientId === user.id
    );
    
    setUpcomingAppointments(userAppointments);

    // Pre-select doctor if coming from DoctorList
    if (location.state?.selectedDoctor) {
      const selectedDoctor = location.state.selectedDoctor;
      const doctorOption = doctors.find(doc => 
        doc.name.includes(selectedDoctor.name.split(' - ')[0])
      );
      
      if (doctorOption) {
        setFormData(prev => ({
          ...prev,
          doctor: doctorOption.name
        }));
      }
    }
  }, [location.state, formData.isDifferentPerson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setBookingError('');

    // Determine patient ID and details
    const patientId = formData.isDifferentPerson ? Date.now() : currentUser.id; // Generate unique ID for different person
    const patientName = formData.patientName;
    const patientEmail = formData.email;

    // Validation checks
    if (!patientName || !patientEmail || !formData.doctor || !formData.date || !formData.time) {
      setBookingError('Please fill in all required fields');
      return;
    }

    const selectedDoctor = formData.doctor.split(' - ')[0];

    // Check for time slot conflict with other patients
    if (hasTimeSlotConflict(selectedDoctor, formData.date, formData.time, patientId)) {
      setBookingError('This time slot is already booked. Please choose a different time or date.');
      return;
    }

    // Check if user has another appointment at same time (for same user)
    if (hasUserTimeConflict(formData.date, formData.time, patientId)) {
      setBookingError('You already have an appointment at this time. Please choose a different time.');
      return;
    }

    // Check if booking for different person with same email as existing user
    if (formData.isDifferentPerson) {
      const existingUser = allAppointments.find(app => 
        app.email === patientEmail && app.patientId !== patientId
      );
      if (existingUser) {
        setBookingError('This email is already associated with another patient. Please use a different email or log in as that user.');
        return;
      }
    }

    // Create new appointment
    const newAppointment = {
      id: allAppointments.length + 1,
      patientId: patientId,
      patient: patientName,
      email: patientEmail,
      doctor: selectedDoctor,
      date: formData.date,
      time: formData.time,
      reason: formData.reason,
      status: 'Pending',
      bookedBy: currentUser.id, // Track who made the booking
      isForDifferentPerson: formData.isDifferentPerson
    };

    // Update all appointments
    const updatedAppointments = [...allAppointments, newAppointment];
    setAllAppointments(updatedAppointments);
    
    // Update upcoming appointments for current user (show appointments booked by user)
    const userAppointments = updatedAppointments.filter(
      appointment => appointment.bookedBy === currentUser.id
    );
    
    setUpcomingAppointments(userAppointments);
    
    alert('Appointment booked successfully!');
    
    // Reset form but keep the "different person" choice
    setFormData({
      patientName: formData.isDifferentPerson ? '' : currentUser.name,
      email: formData.isDifferentPerson ? '' : currentUser.email,
      doctor: '',
      date: '',
      time: '',
      reason: '',
      isDifferentPerson: formData.isDifferentPerson
    });
  };

  const cancelAppointment = (appointmentId) => {
    const updatedAppointments = allAppointments.map(appointment =>
      appointment.id === appointmentId 
        ? { ...appointment, status: 'Cancelled' }
        : appointment
    );
    
    setAllAppointments(updatedAppointments);
    
    // Update upcoming appointments for current user
    const userAppointments = updatedAppointments.filter(
      appointment => appointment.bookedBy === currentUser.id && appointment.status !== 'Cancelled'
    );
    
    setUpcomingAppointments(userAppointments);
    alert('Appointment cancelled successfully!');
  };

  const selectedDoctorDetails = location.state?.selectedDoctor;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Book an Appointment</h1>
            <p className="text-xl text-gray-600">Schedule your visit with our expert healthcare providers</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Appointment Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-6">Schedule New Appointment</h2>
              
              {/* Selected Doctor Info */}
              {selectedDoctorDetails && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-2">Selected Doctor</h3>
                  <p className="text-blue-700"><strong>{selectedDoctorDetails.name}</strong></p>
                  {selectedDoctorDetails.consultationFee && (
                    <p className="text-blue-600">Consultation Fee: {selectedDoctorDetails.consultationFee}</p>
                  )}
                </div>
              )}

              {/* Booking for different person toggle */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isDifferentPerson"
                    checked={formData.isDifferentPerson}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">
                    Booking for someone else (family member, friend, etc.)
                  </span>
                </label>
                <p className="text-sm text-gray-600 mt-2 ml-7">
                  {formData.isDifferentPerson 
                    ? 'Please enter the details of the person you are booking for.' 
                    : 'Booking for yourself. We will auto-fill your information.'}
                </p>
              </div>

              {bookingError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-medium">{bookingError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name *
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.isDifferentPerson}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !formData.isDifferentPerson ? 'bg-gray-100' : ''
                      }`}
                      placeholder="Enter patient's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.isDifferentPerson}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                        !formData.isDifferentPerson ? 'bg-gray-100' : ''
                      }`}
                      placeholder="Enter patient's email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Doctor *
                  </label>
                  <select
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Choose a doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.id} value={doctor.name}>
                        {doctor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time *
                    </label>
                    <select
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="">Select time</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Describe symptoms or reason for consultation"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  {formData.isDifferentPerson ? 'Book Appointment for Someone Else' : 'Book My Appointment'}
                </button>
              </form>
            </div>

            {/* Upcoming Appointments & Calendar */}
            <div className="space-y-8">
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Your Booked Appointments</h3>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {upcomingAppointments.length} appointments
                  </span>
                </div>
                <div className="space-y-4">
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
                  ) : (
                    upcomingAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">{appointment.doctor}</h4>
                            <p className="text-sm text-gray-600">
                              {appointment.patient}
                              {appointment.isForDifferentPerson && (
                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  Booked for someone else
                                </span>
                              )}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'Confirmed' 
                              ? 'bg-green-100 text-green-800' 
                              : appointment.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>{appointment.date}</span>
                          <span>{appointment.time}</span>
                        </div>
                        {appointment.status === 'Pending' && (
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            className="w-full mt-2 bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200"
                          >
                            Cancel Appointment
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Doctor Availability Calendar */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Doctor Availability</h3>
                <div className="space-y-4">
                  {doctors.map(doctor => (
                    <div key={doctor.id} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">{doctor.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {doctor.availability.map(time => {
                          const isBooked = allAppointments.some(app => 
                            app.doctor === doctor.name.split(' - ')[0] && 
                            app.time === time && 
                            app.status !== 'Cancelled'
                          );
                          
                          return (
                            <span
                              key={time}
                              className={`px-3 py-1 rounded-full text-sm ${
                                isBooked 
                                  ? 'bg-red-100 text-red-800 line-through' 
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {time} {isBooked && '(Booked)'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
