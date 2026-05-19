import React, { useState, useEffect, useContext } from 'react';
import * as XLSX from 'xlsx';
import { AuthContext } from '../../context/AuthContext';
import studentService from '../../services/studentService';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

const RECORDS_PER_PAGE = 10;

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  const fetchAllStudents = async () => {
    try {
      setIsLoading(true);
      const response = await studentService.getAllStudents();
      if (response.success) {
        setStudents(response.data);
      } else {
        toast.error(response.message || 'Failed to fetch students');
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student.studentId);
    setEditData({ ...student });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveEdit = async (studentId) => {
    if (!editData.firstName?.trim()) { toast.error('First Name is required'); return; }
    if (!editData.lastName?.trim()) { toast.error('Last Name is required'); return; }
    if (!editData.address?.trim()) { toast.error('Address is required'); return; }
    if (!editData.phoneNumber?.trim() || !/^\d{10}$/.test(editData.phoneNumber)) {
      toast.error('Phone number must be 10 digits'); return;
    }
    try {
      setIsSaving(true);
      const response = await studentService.updateStudent(studentId, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        address: editData.address,
        phoneNumber: editData.phoneNumber,
        isActive: editData.isActive,
      });
      if (response.success) {
        toast.success('Student updated successfully');
        setEditingId(null);
        await fetchAllStudents();
      } else {
        toast.error(response.message || 'Failed to update student');
      }
    } catch (error) {
      toast.error('Failed to update student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      setIsSaving(true);
      const response = await studentService.deleteStudent(studentId);
      if (response.success) {
        toast.success('Student deleted successfully');
        setDeleteConfirm(null);
        await fetchAllStudents();
      } else {
        toast.error(response.message || 'Failed to delete student');
      }
    } catch (error) {
      toast.error('Failed to delete student');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // ── Excel Export ────────────────────────────────────────────────
  const exportToExcel = () => {
    if (students.length === 0) { toast.warn('No students to export'); return; }
    const exportData = students.map((s) => ({
      'First Name': s.firstName,
      'Last Name': s.lastName,
      'Email': s.email,
      'Phone': s.phoneNumber,
      'Address': s.address,
      'Status': s.isActive ? 'Active' : 'Inactive',
      'Registered On': new Date(s.createdAt).toLocaleDateString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `Students_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exported successfully!');
  };

  // ── Filter + Pagination ─────────────────────────────────────────
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phoneNumber.includes(searchTerm);
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && student.isActive) ||
      (filterStatus === 'inactive' && !student.isActive);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / RECORDS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * RECORDS_PER_PAGE,
    currentPage * RECORDS_PER_PAGE
  );

  const handleSearchChange = (e) => { setSearchTerm(e.target.value); setCurrentPage(1); };
  const handleFilterChange = (e) => { setFilterStatus(e.target.value); setCurrentPage(1); };

  const startRecord = filteredStudents.length === 0 ? 0 : (currentPage - 1) * RECORDS_PER_PAGE + 1;
  const endRecord = Math.min(currentPage * RECORDS_PER_PAGE, filteredStudents.length);

  if (isLoading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading students data...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h2>Admin Dashboard</h2>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="table-header">
          <div className="table-header-top">
            <h3>All Students ({filteredStudents.length})</h3>
            <button className="export-btn" onClick={exportToExcel} title="Export to Excel">
              📥 Export to Excel
            </button>
          </div>
          <div className="filters">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select value={filterStatus} onChange={handleFilterChange} className="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {paginatedStudents.length === 0 ? (
          <div className="no-data"><p>No students found</p></div>
        ) : (
          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student.studentId} className={editingId === student.studentId ? 'editing' : ''}>
                    {editingId === student.studentId ? (
                      <>
                        <td><input type="text" name="firstName" value={editData.firstName} onChange={handleEditChange} className="edit-input" /></td>
                        <td><input type="text" name="lastName" value={editData.lastName} onChange={handleEditChange} className="edit-input" /></td>
                        <td>{student.email}</td>
                        <td><input type="tel" name="phoneNumber" value={editData.phoneNumber} onChange={handleEditChange} className="edit-input" /></td>
                        <td><input type="text" name="address" value={editData.address} onChange={handleEditChange} className="edit-input" maxLength="50" /></td>
                        <td>
                          <label className="checkbox-label">
                            <input type="checkbox" name="isActive" checked={editData.isActive} onChange={handleEditChange} />
                            Active
                          </label>
                        </td>
                        <td className="actions">
                          <button className="save-btn" onClick={() => handleSaveEdit(student.studentId)} disabled={isSaving}>Save</button>
                          <button className="cancel-btn" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{student.firstName}</td>
                        <td>{student.lastName}</td>
                        <td>{student.email}</td>
                        <td>{student.phoneNumber}</td>
                        <td className="address-cell">{student.address}</td>
                        <td>
                          <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                            {student.isActive ? '🟢 Active' : '🔴 Inactive'}
                          </span>
                        </td>
                        <td className="actions">
                          <button className="edit-btn" onClick={() => handleEdit(student)}>Edit</button>
                          <button className="delete-btn" onClick={() => setDeleteConfirm(student.studentId)}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ── Pagination Bar ── */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <span className="pagination-info">
                  Showing {startRecord}–{endRecord} of {filteredStudents.length} students
                </span>
                <div className="pagination-controls">
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    ‹ Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next ›
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this student?</p>
            <div className="modal-actions">
              <button className="delete-btn" onClick={() => handleDelete(deleteConfirm)} disabled={isSaving}>
                {isSaving ? 'Deleting...' : 'Delete'}
              </button>
              <button className="cancel-btn" onClick={() => setDeleteConfirm(null)} disabled={isSaving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
