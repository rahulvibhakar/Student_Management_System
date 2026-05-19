import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [studentData, setStudentData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phoneNumber: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const fetchMyProfile = async () => {
    try {
      setIsLoading(true);
      const response = await studentService.getMyProfile();
      if (response.success) {
        setStudentData(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          address: response.data.address,
          phoneNumber: response.data.phoneNumber,
          isActive: response.data.isActive,
        });
      } else {
        toast.error(response.message || 'Failed to load profile');
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone is required';
    else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = '10 digits only';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    try {
      setIsSaving(true);
      const response = await studentService.updateMyProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        await fetchMyProfile();
      } else {
        toast.error(response.message || 'Failed to update profile');
        response.errors?.forEach((error) => toast.error(error));
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="dashboard-container">
        <div className="no-data">
          <p>No student profile found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h2>Student Dashboard</h2>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="card-header">
            <h3>My Profile</h3>
            {!isEditing && (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'input-error' : ''}
                  />
                  {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'input-error' : ''}
                  />
                  {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={errors.address ? 'input-error' : ''}
                />
                {errors.address && <span className="error-message">{errors.address}</span>}
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={errors.phoneNumber ? 'input-error' : ''}
                />
                {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
              </div>

              <div className="form-actions">
                <button type="submit" disabled={isSaving} className="save-btn">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-view">
              <div className="info-group">
                <label>Email</label>
                <p>{studentData.email}</p>
              </div>

              <div className="info-row">
                <div className="info-group">
                  <label>First Name</label>
                  <p>{studentData.firstName}</p>
                </div>
                <div className="info-group">
                  <label>Last Name</label>
                  <p>{studentData.lastName}</p>
                </div>
              </div>

              <div className="info-group">
                <label>Address</label>
                <p>{studentData.address}</p>
              </div>

              <div className="info-row">
                <div className="info-group">
                  <label>Phone Number</label>
                  <p>{studentData.phoneNumber}</p>
                </div>
                <div className="info-group">
                  <label>Status</label>
                  <p>
                    <span className={`status-badge ${studentData.isActive ? 'active' : 'inactive'}`}>
                      {studentData.isActive ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
