import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminCategorization.css';

const AdminCategorization = () => {
  const [categories, setCategories] = useState([]);
  const [students, setStudents] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchStudents();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      console.log("Categories fetched successfully:", response.data);
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Frontend Error fetching categories:", err);
      setError('Failed to fetch categories');
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students');
      console.log("Students fetched successfully:", response.data);
      setStudents(response.data);
    } catch (err) {
      console.error("Frontend Error fetching students:", err);
      setError('Failed to fetch students');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      await axios.post('http://localhost:5000/api/categories', { name: newCategoryName });
      setNewCategoryName('');
      fetchCategories();
    } catch (err) {
      setError('Failed to add category');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`http://localhost:5000/api/categories/${categoryId}`);
      fetchCategories();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleStudentCategoryChange = async (studentId, newCategory) => {
    try {
      await axios.put(`http://localhost:5000/api/students/${studentId}/category`, { category: newCategory });
      fetchStudents();
    } catch (err) {
      setError('Failed to update student category');
    }
  };

  const studentsByCategory = categories.reduce((acc, category) => {
    acc[category.name] = students.filter(student => student.category === category.name);
    return acc;
  }, {});

  studentsByCategory['Uncategorized'] = students.filter(student => !student.category || !categories.some(cat => cat.name === student.category));

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-categorization">
      <h1>Student Categorization</h1>

      <div className="category-management">
        <h2>Manage Categories</h2>
        <form onSubmit={handleAddCategory} className="add-category-form">
          <input
            type="text"
            placeholder="New Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />
          <button type="submit">Add Category</button>
        </form>

        <div className="categories-list">
          <h3>Existing Categories</h3>
          <ul>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category) => (
                <li key={category._id}>
                  <span>{category.name}</span>
                  <button onClick={() => handleDeleteCategory(category._id)}>Delete</button>
                </li>
              ))
            ) : (
              <p>No categories found. Add new categories above.</p>
            )}
          </ul>
        </div>
      </div>

      <div className="student-categorization-section">
        <h2>Categorize Students</h2>
        {Object.keys(studentsByCategory).map(categoryName => (
          <div key={categoryName} className="student-category-group">
            <h3>{categoryName} ({studentsByCategory[categoryName].length} students)</h3>
            {studentsByCategory[categoryName].length === 0 ? (
              <p>No students in this category.</p>
            ) : (
              <ul>
                {studentsByCategory[categoryName].map(student => (
                  <li key={student._id}>
                    {student.name} ({student.studentId}) - Current Category: {student.category || 'N/A'}
                    <select
                      value={student.category || ''}
                      onChange={(e) => handleStudentCategoryChange(student._id, e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategorization; 