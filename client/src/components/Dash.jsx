import React, { Component } from 'react';
import axios from 'axios';
import FileUpload from './FileUpload';
import Events from './Events';
import CreateStudent from './CreateStudent';
import CreateFaculty from './CreateFaculty';
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import Attendance from './Attendance';
import { assets } from "../assets/assets";
import Notes from './Notes';
import { toast } from 'react-hot-toast';

const studentImage = assets.studentImg

const backendUrl = import.meta.env.VITE_BACKEND_URL
class Dash extends Component {
  
  state = {
    selectedSection: '',
    sectionOptions: ['select section', 'A', 'B', 'C'],
    selectedDropdown: 'select section',
    students: [], 
  };

  


  handleSelection = (section) => {
    this.setState({ selectedSection: section });
  };



  homeClicked = () => {
    this.setState({ selectedSection: '' });
  }

  handleDropdownChange = async (e) => {
    const selected = e.target.value;
    this.setState({ selectedDropdown: selected });

    try {
      const response = await axios.get(backendUrl + `/api/students/section/${selected}`);
      this.setState({ students: response.data.students || [] });
    } catch (error) {
      toast.error('Error fetching students');
    }
  };

  fetchStudents = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/students`);
      if (response.data.success) {
        this.setState({ students: response.data.students });
      }
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  renderMainContent() {
    const { selectedSection } = this.state;

    switch (selectedSection) {
      case '':
        return (
          <div
            className="h-screen bg-cover bg-center flex items-center justify-center"
            style={{ backgroundImage: `url(${studentImage})` }}
          >
            <div className="bg-white bg-opacity-90 shadow-xl rounded-2xl p-10 max-w-lg w-full text-center border border-slate-200">
              <h1 className="text-4xl font-bold text-blue-700 mb-4">Welcome to University Management System</h1>
              <p className="text-slate-600 text-md mb-6">Track, manage, and empower student data with ease and confidence.</p>
            </div>
          </div>
        );

      case 'attendance':
        return <Attendance />;

      case 'events':
        return (
          <div className='mt-30 ml-10'>
            <Events />
          </div>
        );

      case 'notes':
        return (
          <div className='mt-30 ml-10'>
            <Notes />
          </div>
        );

      case 'new_student':
        return (
          <div className='mt-30'>
            <CreateStudent />
          </div>
        );

      case 'new_faculty':
        return (
          <div className='mt-30'>
            <CreateFaculty />
          </div>
        );

      case 'profile':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md mt-10">
              <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Student Profile</h2>
              <div className="flex flex-col items-center mb-4">
                {this.props.userData?.photo_front && (
                  <div className="flex flex-col items-center mb-4">
                    <img
                      src={this.props.userData.photo_front}
                      alt="Front"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
                    />
                  </div>
                )}
                <div className="w-full">
                  <div className="mb-2"><span className="font-semibold">Name:</span> {this.props.userData?.name || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Reg. No:</span> {this.props.userData?.reggNumber || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Email:</span> {this.props.userData?.email || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Section:</span> {this.props.userData?.section || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Course:</span> {this.props.userData?.course || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Phone:</span> {this.props.userData?.phoneNumber || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Parent Name:</span> {this.props.userData?.parentName || 'N/A'}</div>
                  <div className="mb-2"><span className="font-semibold">Parent Phone:</span> {this.props.userData?.parentNumber || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className='mt-30 ml-30'>
            <h2>Select an option from the sidebar</h2>
          </div>
        );
    }
  }

  render() {
    const { userData } = this.props;
    const reggNumber = userData?.reggNumber || '';

    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', flexDirection: 'row' }}>
        <div style={styles.sidebar}>
          <h1 className='my-10' onClick={this.homeClicked}>
            <button>Home</button>
          </h1>

          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li
              onClick={() => this.handleSelection('attendance')}
              style={styles.navItem}
            >
              Attendance
            </li>
            <li
              onClick={() => this.handleSelection('events')}
              style={styles.navItem}
            >
              Events
            </li>
            <li
              onClick={() => this.handleSelection('notes')}
              style={styles.navItem}
            >
              Notes
            </li>
            {reggNumber?.[0] === "S" && (
              <li
                onClick={() => this.handleSelection('profile')}
                style={styles.navItem}
              >
                Profile
              </li>
            )}
            {reggNumber?.[0] === "A" && (
              <>
                <li
                  onClick={() => this.handleSelection('new_student')}
                  style={styles.navItem}
                >
                  New Student
                </li>
                <li
                  onClick={() => this.handleSelection('new_faculty')}
                  style={styles.navItem}
                >
                  New Faculty
                </li>
              </>
            )}
          </ul>
        </div>

        <div style={styles.mainContent}>
          {this.renderMainContent()}
        </div>
      </div>
    );
  }
}

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: '60px',
    bottom: '0',
    left: '0',
    zIndex: 1,
    overflowY: 'auto',
  },
  select: {
    width: '100%',
    padding: '8px',
    marginTop: '8px',
    backgroundColor: '#334155',
    color: 'white',
    border: '1px solid #4B5563',
  },
  navItem: {
    padding: '12px 0',
    cursor: 'pointer',
    borderBottom: '1px solid #334155',
    transition: 'background 0.3s',
  },
  mainContent: {
    flexGrow: 1,
    backgroundColor: '#f1f5f9',
    overflowY: 'auto',
    marginLeft: '250px',
  },
};

export default Dash;
