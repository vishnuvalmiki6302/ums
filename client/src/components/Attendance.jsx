import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';

const Attendance = () => {
  const [sectionOptions] = useState(['select section', 'A', 'B', 'C']);
  const [periodOptions] = useState(['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6']);
  const [selectedDropdown, setSelectedDropdown] = useState('select section');
  const [selectedPeriod, setSelectedPeriod] = useState('Class 1');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  const [isRectifying, setIsRectifying] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [viewMode, setViewMode] = useState('view'); 
  const [takenPeriods, setTakenPeriods] = useState([]);
  const [nextAvailablePeriod, setNextAvailablePeriod] = useState('Class 1');
  const navigate = useNavigate();
  const { userData } = useContext(AppContext);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!userData) {
      navigate('/login');
      return;
    }

    if (userData.reggNumber && userData.reggNumber.startsWith('S')) {
      setSelectedDropdown(userData.section || 'select section');
      fetchStudentAttendance(userData.reggNumber);
    }
  }, [navigate, userData]);

  const fetchStudentAttendance = async (reggNumber) => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/attendance/student/${reggNumber}`);
      if (response.data.success) {
        setAttendanceDetails(response.data.attendance);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance details');
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownChange = async (e) => {
    const selected = e.target.value;
    setSelectedDropdown(selected);
    setLoading(true);
    setError(null);

    try {
      if (selected !== 'select section') {
        // First, fetch all students in the section
        const response = await axios.get(`${backendUrl}/api/students/section/${selected}`);
        if (response.data && response.data.success && Array.isArray(response.data.students)) {
          const studentsData = response.data.students
            .filter(student => student && student.reggNumber)
            .map(student => ({
              ...student,
              reggNumber: student.reggNumber.trim(),
              name: student.name?.trim() || 'Unknown',
              section: student.section?.trim() || selected,
              attendance: [] // Initialize empty attendance array
            }));
          
          if (studentsData.length === 0) {
            setError('No students found in this section');
            setStudents([]);
            setAttendanceStatus({});
            setTakenPeriods([]);
            return;
          }

          // Get today's date for taken periods
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Fetch taken periods for today
          const attendanceResponse = await axios.get(
            `${backendUrl}/api/attendance/section/${selected}/date/${today.toISOString()}`
          );
          
          const takenPeriods = attendanceResponse.data.success ? attendanceResponse.data.takenPeriods || [] : [];
          setTakenPeriods(takenPeriods);

          // Fetch attendance history for each student
          const studentsWithAttendance = await Promise.all(
            studentsData.map(async (student) => {
              try {
                const studentAttendanceResponse = await axios.get(
                  `${backendUrl}/api/attendance/student/${student.reggNumber}`
                );
                return {
                  ...student,
                  attendance: studentAttendanceResponse.data.success ? 
                    studentAttendanceResponse.data.attendance?.history || [] : []
                };
              } catch (error) {
                console.error(`Error fetching attendance for ${student.reggNumber}:`, error);
                return {
                  ...student,
                  attendance: []
                };
              }
            })
          );

          // Set all students as present by default when section is selected
          const initialStatus = {};
          studentsWithAttendance.forEach(student => {
            initialStatus[student.reggNumber] = 'present';
          });
          setAttendanceStatus(initialStatus);
          setStudents(studentsWithAttendance);

          if (isRectifying) {
            // In rectify mode, select the first taken period or Class 1 if no periods are taken
            const initialPeriod = takenPeriods.length > 0 ? takenPeriods[0] : 'Class 1';
            setSelectedPeriod(initialPeriod);
          } else if (viewMode === 'take' && !isRectifying) {
            // In take attendance mode, find the next available period
            const nextPeriod = periodOptions.find(period => !takenPeriods.includes(period));
            setSelectedPeriod(nextPeriod || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Error fetching students. Please try again.');
      setStudents([]);
      setAttendanceStatus({});
      setTakenPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = async (e) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    
    if (isRectifying && period) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Create a map of student attendance status for the selected period
      const initialStatus = {};
      students.forEach(student => {
        // Initialize as present by default
        initialStatus[student.reggNumber] = 'present';

        // If student has attendance records
        if (student.attendance && Array.isArray(student.attendance)) {
          // Find today's attendance record
          const todayRecord = student.attendance.find(record => {
            const recordDate = new Date(record.date);
            recordDate.setHours(0, 0, 0, 0);
            return recordDate.getTime() === today.getTime();
          });

          if (todayRecord && todayRecord.periods) {
            // Find the period in today's record
            const periodRecord = todayRecord.periods.find(p => p.period === period);
            if (periodRecord) {
              // Set the status based on the existing record
              initialStatus[student.reggNumber] = periodRecord.status.toLowerCase();
            }
          }
        }
      });
      setAttendanceStatus(initialStatus);
    } else if (viewMode === 'take' && !isRectifying) {
      // Set all students as present by default when period is selected
      const initialStatus = {};
      students.forEach(student => {
        initialStatus[student.reggNumber] = 'present';
      });
      setAttendanceStatus(initialStatus);
    }
  };

  const handleAttendanceStatusChange = (reggNumber) => {
    setAttendanceStatus(prev => {
      const newStatus = { ...prev };
      // Toggle between present and absent
      newStatus[reggNumber] = prev[reggNumber] === 'present' ? 'absent' : 'present';
      return newStatus;
    });
  };

  const handleSubmitAttendance = async () => {
    try {
      setLoading(true);
      
      if (!students || students.length === 0) {
        throw new Error('No students found in the selected section');
      }

      if (!selectedDropdown || selectedDropdown === 'select section') {
        throw new Error('Please select a section first');
      }

      if (!selectedPeriod) {
        throw new Error('Please select a period first');
      }

      // Create attendance records for all students
      const attendanceRecords = students.map(student => ({
        reggNumber: student.reggNumber,
        name: student.name,
        section: selectedDropdown,
        period: selectedPeriod,
        status: attendanceStatus[student.reggNumber] || 'present'
      }));

      console.log('Submitting attendance records:', attendanceRecords);

      const response = await axios.post(
        `${backendUrl}/api/attendance/mark`,
        { 
          records: attendanceRecords,
          markedBy: userData.reggNumber
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setError(null);
        setIsTakingAttendance(false);
        if (isRectifying) {
          setViewMode('view');
          setIsRectifying(false);
        }
        toast.success('Attendance marked successfully');
        
        // Refresh the attendance data
        await handleDropdownChange({ target: { value: selectedDropdown } });
      } else {
        setError(response.data.message);
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError(error.message || 'Failed to submit attendance');
      toast.error(error.message || 'Failed to submit attendance');
    } finally {
      setLoading(false);
    }
  };

  // Function to find the next available period
  const findNextAvailablePeriod = (takenPeriods) => {
    const allPeriods = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6'];
    const nextPeriod = allPeriods.find(period => !takenPeriods.includes(period));
    return nextPeriod || 'All periods taken';
  };

  // Update next available period when taken periods change
  useEffect(() => {
    if (takenPeriods.length > 0) {
      const nextPeriod = findNextAvailablePeriod(takenPeriods);
      setNextAvailablePeriod(nextPeriod);
      if (nextPeriod !== 'All periods taken') {
        setSelectedPeriod(nextPeriod);
      }
    } else {
      setNextAvailablePeriod('Class 1');
      setSelectedPeriod('Class 1');
    }
  }, [takenPeriods]);

  const isFacultyOrAdmin = userData?.reggNumber?.startsWith('P') || userData?.reggNumber?.startsWith('A');

  return (
    <div className='flex flex-col min-h-screen'>
      {/* Header Section */}
      <div className='bg-white p-6 shadow-md'>
        <div className='max-w-6xl mx-auto'>
          <h2 className="text-2xl font-bold mb-6">Attendance Management</h2>
          
          {userData?.reggNumber?.startsWith('S') ? (
            // Student View
            <div className="flex flex-col items-start">
              <h3 className="text-lg font-semibold mb-4">Your Attendance Details</h3>
              {loading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              ) : attendanceDetails ? (
                <div className="w-full space-y-6">
                  {/* Summary Card */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold">Total Classes:</p>
                        <p>{attendanceDetails.totalClasses}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Present:</p>
                        <p>{attendanceDetails.present}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Absent:</p>
                        <p>{attendanceDetails.absent}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Attendance Percentage:</p>
                        <p>{((attendanceDetails.present / attendanceDetails.totalClasses) * 100).toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance History */}
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h4 className="text-lg font-semibold mb-4">Attendance History</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-32 py-2 text-center text-sm font-bold text-gray-700">Date</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">1</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">2</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">3</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">4</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">5</th>
                            <th className="w-16 py-2 text-center text-sm font-bold text-gray-700">6</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const periods = ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6"];
                            const grouped = {};
                            attendanceDetails.history?.forEach(({ date, period, status }) => {
                              const d = new Date(date).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                              if (!grouped[d]) grouped[d] = {};
                              grouped[d][period] = status.toLowerCase();
                            });
                            const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));
                            return sortedDates.map((date, idx) => (
                              <tr key={date} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="w-32 h-12 text-center align-middle font-medium text-gray-900">{date}</td>
                                {periods.map(p => {
                                  const status = grouped[date]?.[p];
                                  return (
                                    <td key={p} className="w-16 h-12 text-center align-middle">
                                      {status === 'present' ? (
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700">
                                          ✓
                                        </span>
                                      ) : status === 'absent' ? (
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700">
                                          ✗
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-400">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            // Faculty/Admin View
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold">Select Section</h3>
                {isFacultyOrAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setViewMode('view');
                        setIsTakingAttendance(false);
                        setIsRectifying(false);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        viewMode === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      View Attendance
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('take');
                        setIsTakingAttendance(true);
                        setIsRectifying(false);
                        // Set all students as present by default
                        const initialStatus = {};
                        students.forEach(student => {
                          initialStatus[student.reggNumber] = 'present';
                        });
                        setAttendanceStatus(initialStatus);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        viewMode === 'take' && !isRectifying ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Take Attendance
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('take');
                        setIsTakingAttendance(false);
                        setIsRectifying(true);
                        // Set initial attendance status from existing records
                        const initialStatus = {};
                        students.forEach(student => {
                          const todayRecord = student.attendance.find(record => {
                            const recordDate = new Date(record.date);
                            recordDate.setHours(0, 0, 0, 0);
                            return recordDate.getTime() === new Date().setHours(0, 0, 0, 0) && record.period === selectedPeriod;
                          });
                          if (todayRecord) {
                            initialStatus[student.reggNumber] = todayRecord.status.toLowerCase();
                          }
                        });
                        setAttendanceStatus(initialStatus);
                      }}
                      className={`px-4 py-2 rounded-md ${
                        isRectifying ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Rectify Attendance
                    </button>
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div style={{ width: '200px' }}>
                  <select
                    value={selectedDropdown}
                    onChange={handleDropdownChange}
                    className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sectionOptions.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec}
                      </option>
                    ))}
                  </select>
                </div>
                {(viewMode === 'take' || isRectifying) && (
                  <div style={{ width: '200px' }}>
                    <select
                      value={selectedPeriod}
                      onChange={handlePeriodChange}
                      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Period</option>
                      {periodOptions.map((period) => {
                        const isTaken = takenPeriods.includes(period);
                        
                        // In rectify mode, only show taken periods
                        if (isRectifying) {
                          if (!isTaken) return null;
                          return (
                            <option 
                              key={period} 
                              value={period}
                            >
                              {period}
                            </option>
                          );
                        }
                        
                        // In view mode, only show untaken periods
                        if (viewMode === 'view') {
                          if (isTaken) return null;
                          return (
                            <option 
                              key={period} 
                              value={period}
                            >
                              {period}
                            </option>
                          );
                        }
                        
                        // In take attendance mode, show all periods but disable taken ones
                        return (
                          <option 
                            key={period} 
                            value={period}
                            disabled={isTaken}
                            className={`${isTaken ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                          >
                            {period} {isTaken ? '✓' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className='flex-1 flex flex-col items-center justify-center p-8'>
        <div className='w-full max-w-6xl'>
          {loading && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 text-center">
              {error}
            </div>
          )}

          {userData?.reggNumber?.startsWith('S') ? null : (
            // Faculty/Admin View
            <>
              {(viewMode === 'take' || isRectifying) && !loading && !error && students && students.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  {viewMode === 'take' && !isRectifying && takenPeriods.length === periodOptions.length ? (
                    <div className="text-center py-8">
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">All Classes Marked</h3>
                      <p className="text-gray-500">All periods have been marked for today.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-4 text-center">
                        {isRectifying ? 'Rectify' : 'Mark'} Attendance for Section {selectedDropdown} - {selectedPeriod}
                      </h3>
                      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {students.map((student) => (
                          <div key={student._id} className="bg-gray-50 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                            <div className="p-4">
                              <div className="flex items-center space-x-4">
                                {student.photo_front ? (
                                  <img 
                                    src={student.photo_front} 
                                    alt={student.name} 
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <span className="text-2xl font-bold">{student.name[0].toUpperCase()}</span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold">{student.name}</h4>
                                  <p className="text-gray-600">Reg. No: {student.reggNumber}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                  <div 
                                    className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-colors duration-200 ${
                                      attendanceStatus[student.reggNumber] === 'present' 
                                        ? 'bg-green-500 hover:bg-green-600' 
                                        : 'bg-red-500 hover:bg-red-600'
                                    }`}
                                    onClick={() => handleAttendanceStatusChange(student.reggNumber)}
                                  >
                                    <span className="text-white font-bold">
                                      {attendanceStatus[student.reggNumber] === 'present' ? 'P' : 'A'}
                                    </span>
                                  </div>
                                  <p className="text-xs mt-1">
                                    {attendanceStatus[student.reggNumber] === 'present' ? 'Present' : 'Absent'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6">
                        <div className="flex justify-center gap-8 mb-6">
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700">Total Students</p>
                            <p className="text-2xl font-bold text-blue-600">{students.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700">Present</p>
                            <p className="text-2xl font-bold text-green-600">
                              {Object.values(attendanceStatus).filter(status => status === 'present').length}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-700">Absent</p>
                            <p className="text-2xl font-bold text-red-600">
                              {Object.values(attendanceStatus).filter(status => status === 'absent').length}
                            </p>
                          </div>
                        </div>
                        <div className="text-center">
                          <button
                            onClick={handleSubmitAttendance}
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            disabled={loading}
                          >
                            {loading ? 'Submitting...' : isRectifying ? 'Update Attendance' : 'Submit Attendance'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {viewMode === 'view' && !loading && !error && selectedDropdown !== 'select section' && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
                  {students && students.length > 0 && (
                    <>
                      <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reg No</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Classes</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance %</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => {
                              const totalClasses = student.attendance.length;
                              const presentCount = student.attendance.filter(a => a.status.toLowerCase() === 'present').length;
                              const absentCount = totalClasses - presentCount;
                              const attendancePercentage = totalClasses > 0 ? ((presentCount / totalClasses) * 100).toFixed(1) : 0;
                              
                              return (
                                <tr key={student.reggNumber}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      {student.photo_front ? (
                                        <img
                                          className="h-10 w-10 rounded-full object-cover"
                                          src={student.photo_front}
                                          alt={student.name}
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-gray-500">{student.name[0]}</span>
                                        </div>
                                      )}
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">{student.reggNumber}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{totalClasses}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      {presentCount}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                      {absentCount}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      attendancePercentage >= 75 ? 'bg-green-100 text-green-800' :
                                      attendancePercentage >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {attendancePercentage}%
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Overall Performance Section */}
                      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
                        <h4 className="text-lg font-semibold p-4 bg-gray-50">Overall Performance</h4>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Total Classes */}
                            <div className="bg-blue-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-blue-800">Total Classes</h5>
                              <p className="text-2xl font-bold text-blue-600 mt-2">
                                {students.reduce((total, student) => total + student.attendance.length, 0)}
                              </p>
                            </div>

                            {/* Average Attendance */}
                            <div className="bg-green-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-green-800">Average Attendance</h5>
                              <p className="text-2xl font-bold text-green-600 mt-2">
                                {(() => {
                                  const totalStudents = students.length;
                                  const totalAttendance = students.reduce((total, student) => {
                                    const presentCount = student.attendance.filter(a => a.status.toLowerCase() === 'present').length;
                                    return total + (presentCount / student.attendance.length) * 100;
                                  }, 0);
                                  return totalStudents > 0 ? (totalAttendance / totalStudents).toFixed(1) + '%' : '0%';
                                })()}
                              </p>
                            </div>

                            {/* Best Attendance */}
                            <div className="bg-purple-50 rounded-lg p-4">
                              <h5 className="text-sm font-medium text-purple-800">Best Attendance</h5>
                              <p className="text-2xl font-bold text-purple-600 mt-2">
                                {(() => {
                                  const bestStudent = students.reduce((best, student) => {
                                    const presentCount = student.attendance.filter(a => a.status.toLowerCase() === 'present').length;
                                    const percentage = student.attendance.length > 0 ? (presentCount / student.attendance.length) * 100 : 0;
                                    return percentage > best.percentage ? { percentage } : best;
                                  }, { percentage: 0 });
                                  return bestStudent.percentage > 0 ? `${bestStudent.percentage.toFixed(1)}%` : 'N/A';
                                })()}
                              </p>
                            </div>
                          </div>

                          {/* Attendance Distribution */}
                          <div className="mt-6">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Attendance Distribution</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {['Excellent (≥90%)', 'Good (75-89%)', 'Needs Improvement (<75%)'].map((category, index) => {
                                const [label, range] = category.split(' (');
                                const [min, max] = range.replace(/[^0-9-]/g, '').split('-').map(Number);
                                const count = students.filter(student => {
                                  const presentCount = student.attendance.filter(a => a.status.toLowerCase() === 'present').length;
                                  const percentage = student.attendance.length > 0 ? (presentCount / student.attendance.length) * 100 : 0;
                                  if (index === 0) return percentage >= min;
                                  if (index === 1) return percentage >= min && percentage < max;
                                  return percentage < min;
                                }).length;
                                const percentage = (count / students.length) * 100;

                                return (
                                  <div key={category} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-sm font-medium text-gray-700">{label}</span>
                                      <span className="text-sm font-medium text-gray-500">{count} students</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                      <div
                                        className={`h-2.5 rounded-full ${
                                          index === 0 ? 'bg-green-500' :
                                          index === 1 ? 'bg-yellow-500' :
                                          'bg-red-500'
                                        }`}
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance; 