// pages/DoctorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [medicalRecord, setMedicalRecord] = useState({
    patientId: '',
    diagnosis: '',
    prescription: '',
    notes: '',
    visitDate: new Date().toISOString().split('T')[0]
  });
  const [schedule, setSchedule] = useState({
    date: new Date().toISOString().split('T')[0],
    availableSlots: []
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'sick'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      if (!userData) {
        navigate('/login');
        return;
      }

      // Fetch doctor profile
      const doctorResult = await api.getDoctorByUserId(userData.id);
      if (doctorResult.success) {
        setDoctorProfile(doctorResult.data);
      }

      // Fetch doctor's appointments
      const appointmentsResult = await api.getDoctorAppointments(userData.id);
      if (appointmentsResult.success) {
        setAppointments(appointmentsResult.data || []);
      }

      // Fetch doctor's patients
      const patientsResult = await api.getDoctorPatients(userData.id);
      if (patientsResult.success) {
        setPatients(patientsResult.data || []);
      }

    } catch (error) {
      console.error('Error fetching doctor data:', error);
      alert('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const result = await api.updateAppointment(appointmentId, { status });
      if (result.success) {
        alert('Appointment status updated successfully');
        fetchDoctorData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment');
    }
  };

  const handleMedicalRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await api.createMedicalRecord(medicalRecord);
      if (result.success) {
        alert('Medical record saved successfully');
        setMedicalRecord({
          patientId: '',
          diagnosis: '',
          prescription: '',
          notes: '',
          visitDate: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Error saving medical record');
    }
  };

  const handleScheduleUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await api.updateDoctorSchedule(doctorProfile._id, schedule);
      if (result.success) {
        alert('Schedule updated successfully');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Error updating schedule');
    }
  };

  const handleLeaveRequest = async (e) => {
    e.preventDefault();
    try {
      const result = await api.requestLeave(doctorProfile._id, leaveRequest);
      if (result.success) {
        alert('Leave request submitted successfully');
        setShowLeaveModal(false);
        setLeaveRequest({
          startDate: '',
          endDate: '',
          reason: '',
          type: 'sick'
        });
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Error submitting leave request');
    }
  };

  const handleTimeSlotToggle = (time) => {
    setSchedule(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.includes(time)
        ? prev.availableSlots.filter(t => t !== time)
        : [...prev.availableSlots, time]
    }));
  };

  const handlePatientRecordView = (patientId) => {
    navigate(`/patient-records/${patientId}`);
  };

  const handleAppointmentDetails = (appointmentId) => {
    navigate(`/appointment-details/${appointmentId}`);
  };

  const downloadPatientReport = async (patientId) => {
    try {
      const result = await api.downloadPatientReport(patientId);
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `patient-report-${patientId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  const sendPrescription = async (patientId) => {
    try {
      const prescription = prompt('Enter prescription details:');
      if (prescription) {
        const result = await api.sendPrescription(patientId, prescription);
        if (result.success) {
          alert('Prescription sent successfully');
        }
      }
    } catch (error) {
      console.error('Error sending prescription:', error);
      alert('Error sending prescription');
    }
  };

  const markPatientForFollowUp = async (patientId) => {
    try {
      const followUpDate = prompt('Enter follow-up date (YYYY-MM-DD):');
      if (followUpDate) {
        const result = await api.scheduleFollowUp(patientId, followUpDate);
        if (result.success) {
          alert('Follow-up scheduled successfully');
        }
      }
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      alert('Error scheduling follow-up');
    }
  };

  const getTodaysAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointmentDate.split('T')[0] === today && 
      apt.status !== 'Cancelled' && 
      apt.status !== 'Completed'
    );
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.appointmentDate.split('T')[0] > today && 
      apt.status !== 'Cancelled'
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, Dr. {user?.firstName} {user?.lastName}
                {doctorProfile && ` - ${doctorProfile.specialization}`}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('schedule')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📅</span>
                <span>Schedule</span>
              </button>
              <button 
                onClick={() => setShowProfileModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>👤</span>
                <span>Profile</span>
              </button>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Doctor Stats */}
          {doctorProfile && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-blue-800">{getTodaysAppointments().length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-600">Total Patients</p>
                <p className="text-2xl font-bold text-green-800">{patients.length}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-600">Experience</p>
                <p className="text-2xl font-bold text-purple-800">{doctorProfile.experience} years</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-600">Consultation Fee</p>
                <p className="text-2xl font-bold text-orange-800">${doctorProfile.consultationFee}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { key: 'appointments', label: 'Appointments', icon: '📋' },
              { key: 'patients', label: 'Patients', icon: '👥' },
              { key: 'records', label: 'Records', icon: '📁' },
              { key: 'schedule', label: 'Schedule', icon: '📅' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-8">
            {/* Today's Appointments */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">Today's Appointments</h2>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {getTodaysAppointments().length} appointments
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                {getTodaysAppointments().length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
                    <p className="text-gray-400 mt-2">Enjoy your day!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getTodaysAppointments().map(appointment => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-800">
                              {appointment.patientId?.firstName} {appointment.patientId?.lastName}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                              <div>
                                <p><span className="font-medium">Time:</span> {appointment.appointmentTime}</p>
                                <p><span className="font-medium">Reason:</span> {appointment.reason}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Phone:</span> {appointment.patientId?.phone}</p>
                                <p><span className="font-medium">Age:</span> {appointment.patientId?.age || 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.status === 'Completed' 
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {appointment.status}
                            </span>
                            <div className="flex space-x-2">
                              {appointment.status !== 'Completed' && (
                                <button 
                                  onClick={() => updateAppointmentStatus(appointment._id, 'Completed')}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                >
                                  Complete
                                </button>
                              )}
                              <button 
                                onClick={() => handleAppointmentDetails(appointment._id)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                              >
                                Details
                              </button>
                              {appointment.status !== 'Cancelled' && (
                                <button 
                                  onClick={() => updateAppointmentStatus(appointment._id, 'Cancelled')}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h2>
              </div>
              <div className="p-6">
                {getUpcomingAppointments().length === 0 ? (
                  <p className="text-gray-500">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {getUpcomingAppointments().map(appointment => (
                      <div key={appointment._id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                        <div>
                          <p className="font-medium">{appointment.patientId?.firstName} {appointment.patientId?.lastName}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                          </p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                          {appointment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Patient List</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {patients.length} patients
              </span>
            </div>
            
            <div className="grid gap-4">
              {patients.map(patient => (
                <div key={patient._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800">
                        {patient.userId?.firstName} {patient.userId?.lastName}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                        <div>
                          <p><span className="font-medium">Gender:</span> {patient.gender}</p>
                          <p><span className="font-medium">Blood Group:</span> {patient.bloodGroup || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium">Phone:</span> {patient.userId?.phone}</p>
                          <p><span className="font-medium">Email:</span> {patient.userId?.email}</p>
                        </div>
                      </div>
                      {patient.medicalHistory && patient.medicalHistory.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium text-sm text-gray-700">Recent Conditions:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {patient.medicalHistory.slice(0, 3).map((history, index) => (
                              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                {history.condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handlePatientRecordView(patient._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Records
                      </button>
                      <button 
                        onClick={() => downloadPatientReport(patient._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        Download Report
                      </button>
                      <button 
                        onClick={() => sendPrescription(patient._id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors text-sm"
                      >
                        Send Prescription
                      </button>
                      <button 
                        onClick={() => markPatientForFollowUp(patient._id)}
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors text-sm"
                      >
                        Schedule Follow-up
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === 'records' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Medical Records</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <form onSubmit={handleMedicalRecordSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
                    <select 
                      value={medicalRecord.patientId}
                      onChange={(e) => setMedicalRecord({...medicalRecord, patientId: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a patient</option>
                      {patients.map(patient => (
                        <option key={patient._id} value={patient._id}>
                          {patient.userId?.firstName} {patient.userId?.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visit Date</label>
                    <input 
                      type="date" 
                      value={medicalRecord.visitDate}
                      onChange={(e) => setMedicalRecord({...medicalRecord, visitDate: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                  <textarea 
                    value={medicalRecord.diagnosis}
                    onChange={(e) => setMedicalRecord({...medicalRecord, diagnosis: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows="3"
                    placeholder="Enter diagnosis..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                  <textarea 
                    value={medicalRecord.prescription}
                    onChange={(e) => setMedicalRecord({...medicalRecord, prescription: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows="3"
                    placeholder="Enter prescription details..."
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea 
                    value={medicalRecord.notes}
                    onChange={(e) => setMedicalRecord({...medicalRecord, notes: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows="3"
                    placeholder="Additional notes..."
                  ></textarea>
                </div>
                
                <div className="flex space-x-4">
                  <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                    Save Record
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setMedicalRecord({
                      patientId: '',
                      diagnosis: '',
                      prescription: '',
                      notes: '',
                      visitDate: new Date().toISOString().split('T')[0]
                    })}
                    className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Clear Form
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Schedule Management</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Set Availability */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Set Availability</h3>
                  <form onSubmit={handleScheduleUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input 
                        type="date" 
                        value={schedule.date}
                        onChange={(e) => setSchedule({...schedule, date: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slots</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                          <label key={time} className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={schedule.availableSlots.includes(time)}
                              onChange={() => handleTimeSlotToggle(time)}
                              className="mr-2 h-4 w-4 text-blue-600" 
                            />
                            <span className="text-sm">{time}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                      Update Schedule
                    </button>
                  </form>
                </div>
                
                {/* Current Schedule & Leave Management */}
                <div>
                  <h3 className="font-semibold text-lg mb-4">Current Schedule</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                      <p className="font-semibold text-green-800">Today's Schedule</p>
                      <p className="text-sm text-green-600 mt-1">
                        Available: {schedule.availableSlots.length > 0 ? schedule.availableSlots.join(', ') : 'No slots selected'}
                      </p>
                    </div>
                    
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <p className="font-semibold text-blue-800">Appointment Statistics</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Total: {appointments.length} | Completed: {appointments.filter(a => a.status === 'Completed').length}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => setShowLeaveModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Apply for Leave
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Doctor Profile</h3>
            {doctorProfile && (
              <div className="space-y-3">
                <p><strong>Name:</strong> Dr. {user?.firstName} {user?.lastName}</p>
                <p><strong>Specialization:</strong> {doctorProfile.specialization}</p>
                <p><strong>Experience:</strong> {doctorProfile.experience} years</p>
                <p><strong>Qualification:</strong> {doctorProfile.qualification}</p>
                <p><strong>License:</strong> {doctorProfile.licenseNumber}</p>
                <p><strong>Department:</strong> {doctorProfile.department}</p>
                <p><strong>Consultation Fee:</strong> ${doctorProfile.consultationFee}</p>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>
            <form onSubmit={handleLeaveRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    value={leaveRequest.startDate}
                    onChange={(e) => setLeaveRequest({...leaveRequest, startDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input 
                    type="date" 
                    value={leaveRequest.endDate}
                    onChange={(e) => setLeaveRequest({...leaveRequest, endDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Leave Type</label>
                <select 
                  value={leaveRequest.type}
                  onChange={(e) => setLeaveRequest({...leaveRequest, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="sick">Sick Leave</option>
                  <option value="vacation">Vacation</option>
                  <option value="personal">Personal</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea 
                  value={leaveRequest.reason}
                  onChange={(e) => setLeaveRequest({...leaveRequest, reason: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Reason for leave..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;