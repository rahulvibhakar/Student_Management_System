import React, { useState } from 'react';

const StudentRegistration = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = e => {
    e.preventDefault();
    alert('Student registered: ' + JSON.stringify(form));
    setForm({ name: '', email: '' });
  };
  return (
    <div className="container mt-4">
      <h2>Register Student</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Name</label>
          <input className="form-control" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <button className="btn btn-primary" type="submit">Register</button>
      </form>
    </div>
  );
};
export default StudentRegistration;