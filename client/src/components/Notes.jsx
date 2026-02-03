import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const Notes = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [notes, setNotes] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { userData } = useContext(AppContext);

  const isStudent = userData?.reggNumber?.startsWith('S');

  const engineeringSubjects = [
    'Operating Systems',
    'Data Structures and Algorithms',
    'Computer Networks',
    'Database Management Systems',
    'Software Engineering',
    'Computer Architecture',
    'Artificial Intelligence',
    'Machine Learning',
    'Web Technologies',
    'Mobile Application Development',
    'Cloud Computing',
    'Cyber Security',
    'Internet of Things',
    'Big Data Analytics',
    'Computer Graphics',
    'Compiler Design',
    'Digital Electronics',
    'Microprocessors',
    'Embedded Systems',
    'Computer Organization',
    'Theory of Computation',
    'Discrete Mathematics',
    'Linear Algebra',
    'Probability and Statistics',
    'Digital Signal Processing',
    'Computer Vision',
    'Natural Language Processing',
    'Blockchain Technology',
    'Quantum Computing',
    'Robotics'
  ];

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSection) {
      fetchNotes();
    }
  }, [selectedSection, selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/notes/subjects');
      if (response.data.success) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchNotes = async () => {
    try {
      let url = '/api/notes';
      
      const params = new URLSearchParams();
      if (selectedSection) params.append('section', selectedSection);
      if (selectedSubject) params.append('subject', selectedSubject);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url);
      
      if (response.data.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      toast.error('Failed to fetch notes');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const isPDF = selectedFile.type === 'application/pdf' || 
                   selectedFile.name.toLowerCase().endsWith('.pdf');
      
      if (isPDF) {
        setFile(selectedFile);
      } else {
        toast.error('Please select a PDF file');
        e.target.value = null;
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file || !selectedSubject || !selectedSection) {
      toast.error('Please fill all fields and select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('subject', selectedSubject);
    formData.append('section', selectedSection);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/notes/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );
      
      if (response.data.success) {
        toast.success('Notes uploaded successfully');
        setFile(null);
        setSelectedSubject('');
        e.target.reset();
        fetchNotes();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload notes');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Section - Only show for non-students */}
        {!isStudent && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">Upload Notes</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Subject</option>
                  {engineeringSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Section</option>
                  {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map((section) => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">PDF File</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="mt-1 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Uploading...' : 'Upload Notes'}
              </button>
            </form>
          </div>
        )}

        {/* View Notes Section */}
        <div className={`bg-white p-6 rounded-lg shadow-md ${isStudent ? 'md:col-span-2' : ''}`}>
          <h2 className="text-2xl font-bold mb-6">Available Notes</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Subjects</option>
                {engineeringSubjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                {/* Add more sections as needed */}
              </select>
            </div>
          </div>
          
          {/* Notes Display */}
          <div className="space-y-6">
            {notes.length === 0 ? (
              <p className="text-gray-500 text-center">No notes available</p>
            ) : (
              // Group notes by subject
              Object.entries(
                notes.reduce((acc, note) => {
                  if (!acc[note.subject]) {
                    acc[note.subject] = [];
                  }
                  acc[note.subject].push(note);
                  return acc;
                }, {})
              )
              .filter(([subject]) => !selectedSubject || subject === selectedSubject)
              .map(([subject, subjectNotes]) => (
                <div key={subject} className="border rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-blue-600">{subject}</h3>
                  <div className="space-y-4">
                    {subjectNotes
                      .filter(note => !selectedSection || note.section === selectedSection)
                      .map((note) => (
                        <div key={note._id} className="border-l-4 border-blue-500 pl-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-600">Section: {note.section}</p>
                              <p className="text-sm text-gray-600">Uploaded by: {note.uploadedBy?.name}</p>
                              <p className="text-sm text-gray-600">
                                Uploaded on: {new Date(note.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <a
                              href={`${import.meta.env.VITE_BACKEND_URL}${note.pdfUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                            >
                              View PDF
                            </a>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes; 