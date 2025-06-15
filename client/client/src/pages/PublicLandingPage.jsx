import React from 'react';
import { Link } from 'react-router-dom';
import '../PublicLandingPage.css';

const PublicLandingPage = () => {
  return (
    <div className="public-landing-container">
      <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
        <div className="container">
          <Link className="navbar-brand" to="/">Our Institute</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#about-institute">About</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services-courses">Services & Courses</a>
              </li>
              <li className="nav-item">
                <Link className="nav-link btn btn-primary text-white ms-lg-3" to="/login">Login</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-center d-flex align-items-center justify-content-center">
        <div className="container">
          <h1 className="display-4 text-white">Empowering Your Future Through Education</h1>
          <p className="lead text-white-50">Discover our programs and start your journey today.</p>
          <Link to="/login" className="btn btn-primary btn-lg mt-3">Get Started</Link>
        </div>
      </section>

      {/* About the Institute Section */}
      <section id="about-institute" className="about-institute-section mt-5 py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">About the Institute</h2>
          <div className="row">
            <div className="col-md-4">
              <h3>Mission</h3>
              <p>Our mission is to empower students with the knowledge and skills necessary to excel in their chosen fields and contribute positively to society.</p>
            </div>
            <div className="col-md-4">
              <h3>Vision</h3>
              <p>To be a leading educational institution recognized for innovation, excellence, and a commitment to student success.</p>
            </div>
            <div className="col-md-4">
              <h3>Our Team</h3>
              <p>Meet our dedicated team of educators and professionals committed to guiding students on their learning journey.</p>
              {/* Team member components can be added here */}
            </div>
          </div>
        </div>
      </section>

      {/* Services & Courses Section */}
      <section id="services-courses" className="services-courses-section py-5">
        <div className="container">
          <h2 className="text-center mb-5">Our Services & Courses</h2>
          <div className="row">
            <div className="col-lg-6 mb-4">
              <h3>What We Offer</h3>
              <ul className="list-group list-group-flush">
                <li className="list-group-item"><strong>Career Counseling:</strong> Expert guidance to shape your future.</li>
                <li className="list-group-item"><strong>Workshops & Seminars:</strong> Hands-on experience and industry insights.</li>
                <li className="list-group-item"><strong>Mentorship Programs:</strong> Learn from seasoned professionals.</li>
                <li className="list-group-item"><strong>Placement Assistance:</strong> Your bridge to a successful career.</li>
              </ul>
            </div>
            <div className="col-lg-6 mb-4">
              <h3>Popular Courses</h3>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">Web Development</h5>
                      <p className="card-text">Master front-end and back-end technologies to build dynamic web applications.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">Data Science</h5>
                      <p className="card-text">Dive into data analysis, machine learning, and statistical modeling.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">Mobile App Development</h5>
                      <p className="card-text">Create engaging mobile applications for iOS and Android platforms.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title text-primary">Digital Marketing</h5>
                      <p className="card-text">Learn SEO, SEM, social media marketing, and content strategy.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-4 bg-dark text-white text-center">
        <div className="container">
          <p className="mb-0">&copy; 2024 Our Institute. All rights reserved.</p>
          <p className="mb-0">Contact: info@ourinstitute.com | Phone: +123 456 7890</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage; 