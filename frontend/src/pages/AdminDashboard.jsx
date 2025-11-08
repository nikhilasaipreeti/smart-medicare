// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalRevenue: 0
  });
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    userType: 'patient',
    phone: '',
    specialization: '',
    experience: '',
    licenseNumber: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);

      if (!userData || userData.userType !== 'staff') {
        navigate('/login');
        return;
      }

      // Fetch all data
      const [usersResult, appointmentsResult, doctorsResult, patientsResult] = await Promise.all([
        api.getUsers(),
        api.getAppointments(),
        api.getDoctors(),
        api.getPatients()
      ]);

      setUsers(usersResult);
      setAppointments(appointmentsResult);
      setDoctors(doctorsResult);
      setPatients(patientsResult);

      // Calculate stats
      const totalRevenue = appointmentsResult.reduce((sum, apt) => {
        const doctor = doctorsResult.find(doc => doc._id === apt.doctorId);
        return sum + (doctor?.consultationFee || 0);
      }, 0);

      setStats({
        totalAppointments: appointmentsResult.length,
        totalPatients: patientsResult.length,
        totalDoctors: doctorsResult.length,
        totalRevenue: totalRevenue
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
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

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const result = await api.register(newUser);
      if (result.success) {
        alert('User created successfully!');
        setShowAddUserModal(false);
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          userType: 'patient',
          phone: '',
          specialization: '',
          experience: '',
          licenseNumber: ''
        });
        fetchAdminData(); // Refresh data
      } else {
        alert(result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    }
  };

  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const result = await api.deleteUser(userId);
        if (result.success) {
          alert('User deleted successfully');
          fetchAdminData(); // Refresh data
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const updateUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      const result = await api.updateUserStatus(userId, { status: newStatus });
      if (result.success) {
        alert(`User status updated to ${newStatus}`);
        fetchAdminData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const result = await api.updateAppointment(appointmentId, { status: 'Cancelled' });
        if (result.success) {
          alert('Appointment cancelled successfully');
          fetchAdminData(); // Refresh data
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Error cancelling appointment');
      }
    }
  };

  const getRecentAppointments = () => {
    return appointments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Scheduled': 
      case 'Confirmed': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case 'doctor': return 'bg-purple-100 text-purple-800';
      case 'patient': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportData = (type) => {
    let data, filename, headers;
    
    switch (type) {
      case 'users':
        data = users;
        filename = 'users.csv';
        headers = ['Name', 'Email', 'Type', 'Phone', 'Status'];
        break;
      case 'appointments':
        data = appointments;
        filename = 'appointments.csv';
        headers = ['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Reason'];
        break;
      case 'doctors':
        data = doctors;
        filename = 'doctors.csv';
        headers = ['Name', 'Specialization', 'Experience', 'Department', 'Consultation Fee'];
        break;
      default:
        return;
    }

    // Convert data to CSV
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (type === 'users') {
          return [
            `${item.firstName} ${item.lastName}`,
            item.email,
            item.userType,
            item.phone || 'N/A',
            item.isActive !== false ? 'Active' : 'Inactive'
          ].join(',');
        } else if (type === 'appointments') {
          const patient = patients.find(p => p._id === item.patientId);
          const doctor = doctors.find(d => d._id === item.doctorId);
          return [
            patient ? `${patient.userId?.firstName} ${patient.userId?.lastName}` : 'Unknown',
            doctor ? `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}` : 'Unknown',
            new Date(item.appointmentDate).toLocaleDateString(),
            item.appointmentTime,
            item.status,
            item.reason
          ].join(',');
        } else if (type === 'doctors') {
          return [
            `Dr. ${item.userId?.firstName} ${item.userId?.lastName}`,
            item.specialization,
            `${item.experience} years`,
            item.department,
            `$${item.consultationFee}`
          ].join(',');
        }
        return '';
      })
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {user?.firstName} {user?.lastName}! System is running smoothly.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => exportData('appointments')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
              >
                <span className="mr-2">📊</span>
                Export Report
              </button>
              <div className="flex items-center space-x-3 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-gray-500">Administrator</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'users', label: 'Users', icon: '👥' },
              { key: 'appointments', label: 'Appointments', icon: '📅' },
              { key: 'doctors', label: 'Doctors', icon: '👨‍⚕️' },
              { key: 'reports', label: 'Reports', icon: '📈' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-50 rounded-lg mr-4">
                    <span className="text-blue-600 text-2xl">📅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAppointments}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-50 rounded-lg mr-4">
                    <span className="text-green-600 text-2xl">👥</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Patients</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPatients}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-50 rounded-lg mr-4">
                    <span className="text-purple-600 text-2xl">👨‍⚕️</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Doctors</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalDoctors}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-50 rounded-lg mr-4">
                    <span className="text-orange-600 text-2xl">💰</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Appointments</h3>
                  <button 
                    onClick={fetchAdminData}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <span className="mr-2">🔄</span>
                    Refresh
                  </button>
                </div>
              </div>
              <div className="p-6">
                {getRecentAppointments().length > 0 ? (
                  <div className="space-y-4">
                    {getRecentAppointments().map(appointment => {
                      const patient = patients.find(p => p._id === appointment.patientId);
                      const doctor = doctors.find(d => d._id === appointment.doctorId);
                      
                      return (
                        <div key={appointment._id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {patient ? `${patient.userId?.firstName} ${patient.userId?.lastName}` : 'Unknown Patient'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              With {doctor ? `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}` : 'Unknown Doctor'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{appointment.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">{appointment.appointmentTime}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                                {appointment.status}
                              </span>
                              {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                                <button 
                                  onClick={() => cancelAppointment(appointment._id)}
                                  className="text-red-600 hover:text-red-800 text-xs"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No appointments found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
              <div className="flex space-x-3">
                <button 
                  onClick={() => exportData('users')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <span className="mr-2">📥</span>
                  Export Users
                </button>
                <button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <span className="mr-2">+</span>
                  Add New User
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.userType)}`}>
                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive !== false 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            onClick={() => updateUserStatus(user._id, user.isActive !== false ? 'Active' : 'Inactive')}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            {user.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => deleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">All Appointments</h2>
              <button 
                onClick={() => exportData('appointments')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="mr-2">📥</span>
                Export Appointments
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map(appointment => {
                      const patient = patients.find(p => p._id === appointment.patientId);
                      const doctor = doctors.find(d => d._id === appointment.doctorId);
                      
                      return (
                        <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {patient ? `${patient.userId?.firstName} ${patient.userId?.lastName}` : 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-600">
                              {doctor ? `Dr. ${doctor.userId?.firstName} ${doctor.userId?.lastName}` : 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {appointment.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {appointment.status !== 'Cancelled' && appointment.status !== 'Completed' && (
                              <button 
                                onClick={() => cancelAppointment(appointment._id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Doctors Management</h2>
              <button 
                onClick={() => exportData('doctors')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <span className="mr-2">📥</span>
                Export Doctors
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map(doctor => (
                <div key={doctor._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-lg">
                      {doctor.userId?.firstName?.charAt(0)}{doctor.userId?.lastName?.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Dr. {doctor.userId?.firstName} {doctor.userId?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      <p className="text-xs text-gray-500">{doctor.department}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Experience:</span>
                      <span className="font-medium">{doctor.experience} years</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fee:</span>
                      <span className="font-medium">${doctor.consultationFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doctor.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.isAvailable ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => exportData('users')}
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-between"
                  >
                    <span>Export Users Data</span>
                    <span>📥</span>
                  </button>
                  <button 
                    onClick={() => exportData('appointments')}
                    className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-between"
                  >
                    <span>Export Appointments Data</span>
                    <span>📥</span>
                  </button>
                  <button 
                    onClick={() => exportData('doctors')}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-between"
                  >
                    <span>Export Doctors Data</span>
                    <span>📥</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-semibold">{users.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Appointments:</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed Appointments:</span>
                    <span className="font-semibold">
                      {appointments.filter(a => a.status === 'Completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold">${stats.totalRevenue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Add New User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User Type</label>
                <select 
                  value={newUser.userType}
                  onChange={(e) => setNewUser({...newUser, userType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input 
                  type="tel" 
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              {newUser.userType === 'doctor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                    <input 
                      type="text" 
                      value={newUser.specialization}
                      onChange={(e) => setNewUser({...newUser, specialization: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input 
                      type="number" 
                      value={newUser.experience}
                      onChange={(e) => setNewUser({...newUser, experience: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input 
                      type="text" 
                      value={newUser.licenseNumber}
                      onChange={(e) => setNewUser({...newUser, licenseNumber: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;