import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Students() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await axios.get('http://localhost:5000/api/students', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setStudents(res.data);
    };
    fetchStudents();
  }, []);

  return (
    <div>
      <h1>Students</h1>
      <ul>
        {students.map(student => (
          <li key={student._id}>{student.name} - {student.studentId}</li>
        ))}
      </ul>
    </div>
  );
}