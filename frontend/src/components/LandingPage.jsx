import React, { useState } from 'react';
import { ChevronRight, Menu, X, BookOpen, UserCheck, Award, BarChart3, FileText, Lock, Users, UserCog, GraduationCap, Mail, PhoneCall, MapPin, CheckCircle2 } from 'lucide-react';
import Navbar from './Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const authUser = useSelector((state) => state.user.authUser);

  const features = [
    {
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: "Student Records Management",
      description: "Store and track comprehensive student details from first year onwards"
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Academic Progress Tracking",
      description: "Monitor semester-wise results with detailed examination breakdowns"
    },
    {
      icon: <UserCheck className="w-6 h-6 text-blue-600" />,
      title: "Teacher Remarks & Feedback",
      description: "Enable teachers to add performance remarks with complete history"
    }
  ];

  const roles = [
    {
      icon: <UserCog className="w-12 h-12 text-blue-600 mb-6" />,
      title: "Administrators",
      description: "Manage student records, oversee system access, and maintain data integrity",
      features: ["User Management", "Data Oversight", "System Configuration"]
    },
    {
      icon: <Users className="w-12 h-12 text-blue-600 mb-6" />,
      title: "Teachers",
      description: "Track progress, provide feedback, and generate detailed reports",
      features: ["Progress Tracking", "Performance Reviews", "Report Generation"]
    },
    {
      icon: <GraduationCap className="w-12 h-12 text-blue-600 mb-6" />,
      title: "Students",
      description: "Access personal records, view progress, and download reports",
      features: ["Progress Monitoring", "Report Access", "Achievement Tracking"]
    }
  ];

  const stats = [
    { value: "99%", label: "User Satisfaction" },
    { value: "50%", label: "Time Saved in Reporting" },
    { value: "24/7", label: "System Availability" },
    { value: "100%", label: "Data Security" }
  ];

  const benefits = [
    "Streamlined academic progress tracking",
    "Efficient performance monitoring",
    "Secure data management",
    "Quick report generation"
  ];

  const handleGetStarted = () => {
    if (authUser) {
      // User is authenticated, navigate to dashboard
      navigate('/dashboard');
    } else {
      // User is not authenticated, navigate to login
      navigate('/login');
    }
  };

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600/5 via-white to-blue-600/5 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <span className="inline-block px-6 py-2 bg-blue-600/10 text-blue-600 rounded-full text-2xl font-semibold mb-4 shadow-md hover:bg-blue-600/20 transition-all duration-300">
              EduTrack
            </span>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900">
              Analyze. Improve. Achieve.
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive student progress tracking system that empowers administrators, teachers, and students to achieve educational excellence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 hover:shadow-blue-700/30 hover:scale-105"
              >
                Get Started
                <ChevronRight size={18} />
              </button>

              {/* External Navigation to a Website */}
              <a
                href="http://www.sinhgadsolapur.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white hover:bg-blue-50 text-blue-600 border border-blue-600/20 px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:border-blue-600 hover:scale-105"
              >
                Learn More
              </a>
            </div>
          </div>

          <div className="mt-16 max-w-5xl mx-auto p-4 bg-white/80 backdrop-blur rounded-2xl shadow-xl shadow-blue-600/10">
            <img
              src="/dashboard.PNG"
              alt="EduTrack Dashboard Preview"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-blue-600/5 via-white to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900">
              Comprehensive Features
            </h2>
            <p className="text-gray-600">
              Everything you need to track and improve student progress effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 group"
              >
                <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-blue-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-gradient-to-b from-white via-blue-600/5 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900">
              Role-Based Access
            </h2>
            <p className="text-gray-600">
              Tailored experiences for every user type
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-xl bg-white shadow-lg transition-all duration-300 group"
              >
                <div className="flex justify-center">
                  {role.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-blue-900">
                  {role.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {role.description}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {role.features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-sm text-gray-500 bg-blue-600/5 px-3 py-1 rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-gradient-to-b from-white via-blue-600/5 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900">
              Why Choose EduTrack?
            </h2>
            <p className="text-gray-600">
              Transform your educational institution with our comprehensive tracking system
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white shadow-lg transition-all duration-300 group"
              >
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl shadow-blue-600/10">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-semibold mb-6 text-blue-900">
                  Key Benefits
                </h3>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-600">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-900 rounded-lg opacity-10 blur-lg"></div>
                <img
                  src="/benefit.svg"
                  alt="Education Benefits"
                  className="rounded-lg shadow-lg relative"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-900 to-blue-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold">EduTrack</h3>
              <p className="text-blue-100">
                Empowering educational institutions with comprehensive progress tracking solutions.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-blue-200 hover:text-white transition-colors">Features</a></li>
                <li><a href="#roles" className="text-blue-200 hover:text-white transition-colors">User Roles</a></li>
                <li><a href="#benefits" className="text-blue-200 hover:text-white transition-colors">Benefits</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-blue-200">
                  <Mail size={16} />
                  <span>contact@edutrack.com</span>
                </li>
                <li className="flex items-center space-x-2 text-blue-200">
                  <PhoneCall size={16} />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-2 text-blue-200">
                  <MapPin size={16} />
                  <span>123 Education St, NY</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
              <p className="text-blue-200 mb-4">Stay updated with our latest features and releases.</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-blue-900/50 text-white px-4 py-2 rounded-lg flex-grow placeholder:text-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-600 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; {new Date().getFullYear()} EduTrack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;