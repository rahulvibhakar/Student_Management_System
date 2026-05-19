import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const mockStudents = [
  { id: 1, name: 'Alice', email: 'alice@mail.com' },
  { id: 2, name: 'Bob', email: 'bob@mail.com' }
];
const StudentInfo = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  useEffect(() => {
    setStudent(mockStudents.find(s => s.id === Number(id)));
  }, [id]);
  if (!student) return <div className="container mt-4">Student not found.</div>;
  return (
    <div className="container mt-4">
      <h2>Student Info</h2>
      <p><strong>Name:</strong> {student.name}</p>
      <p><strong>Email:</strong> {student.email}</p>
    </div>
  );
};
export default StudentInfo;