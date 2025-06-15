import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaTasks, FaClipboardCheck, FaEnvelope } from 'react-icons/fa';

const AdminDashboard = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card text-white bg-primary o-hidden h-100">
            <div className="card-body">
              <div className="card-body-icon">
                <FaUsers size={32} />
              </div>
              <div className="mr-5"> Students</div> {/* Dummy Data */}
            </div>
            <Link className="card-footer text-white clearfix small z-1" to="/admin/students">
              <span className="float-left">View Details</span>
              <span className="float-right">
                <i className="fas fa-angle-right"></i>
              </span>
            </Link>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card text-white bg-warning o-hidden h-100">
            <div className="card-body">
              <div className="card-body-icon">
                <FaTasks size={32} />
              </div>
              <div className="mr-5"> Pending Tasks</div> {/* Dummy Data */}
            </div>
            <Link className="card-footer text-white clearfix small z-1" to="/admin/pending-tasks">
              <span className="float-left">View Details</span>
              <span className="float-right">
                <i className="fas fa-angle-right"></i>
              </span>
            </Link>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card text-white bg-success o-hidden h-100">
            <div className="card-body">
              <div className="card-body-icon">
                <FaClipboardCheck size={32} />
              </div>
              <div className="mr-5"> Reviewed Portfolios</div> {/* Dummy Data */}
            </div>
             <Link className="card-footer text-white clearfix small z-1" to="/admin/portfolio-review">
              <span className="float-left">View Details</span>
              <span className="float-right">
                <i className="fas fa-angle-right"></i>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Placeholder for other admin sections */}
      <div className="row">
        <div className="col-md-12">
          <div className="card mb-4">
            <div className="card-header bg-light">
              Other Admin Actions
            </div>
            <div className="card-body">
              <div className="list-group" style={{ maxWidth: '400px' }}>
                <Link to="/admin/students" className="list-group-item list-group-item-action">
                  Student Management
                </Link>
                <Link to="/admin/categorization" className="list-group-item list-group-item-action">
                  Categorization of Students
                </Link>
                <Link to="/admin/task-assignment" className="list-group-item list-group-item-action">
                  Task Assignment
                </Link>
                <Link to="/admin/task-review" className="list-group-item list-group-item-action">Task Review</Link>
                <Link to="/admin/messages" className="list-group-item list-group-item-action">
                  <FaEnvelope className="me-2" /> Messaging System
                </Link>
                <Link to="/admin/pending-tasks" className="list-group-item list-group-item-action">
                  <FaTasks className="me-2" /> Pending Tasks
                </Link>
                <Link to="/admin/reporting" className="list-group-item list-group-item-action">
                  Student Reporting
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard; 