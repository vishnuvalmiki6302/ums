// import React, { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const FileUpload = () => {
//   const [image, setImage] = useState(null);
//   const [annotatedImage, setAnnotatedImage] = useState(null); // To store the URL of the annotated image
//   const [faces, setFaces] = useState([]); // To store face data and statuses
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     setImage(e.target.files[0]);
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!image) {
//       alert('Please select an image!');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('image', image);

//     try {
//       const response = await axios.post('http://127.0.0.1:5000/predict', formData);
//       setAnnotatedImage(response.data.annotated_class_image); // Save the annotated image URL
//       setFaces(response.data.faces); // Save face data
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       alert('Error processing the image');
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center' }}>
//       <h2>Image Upload for Face Detection</h2>
//       <form onSubmit={handleUpload}>
//         <input type="file" onChange={handleFileChange} accept="image/*" />
//         <button type="submit">Upload</button>
//       </form>

//       {annotatedImage && (
//         <div>
//           <h3>Annotated Image</h3>
//           <img
//             src={`http://127.0.0.1:5000${annotatedImage}`}
//             alt="Annotated"
//             style={{
//               width: '80%',      // Adjust the width to be a percentage of the container
//               height: 'auto',    // Keep the aspect ratio intact
//               marginTop: '20px',
//               maxWidth: '1000px', // Set a max-width to prevent it from being too large on wide screens
//             }}
//           />
//         </div>
//       )}

//       {faces.length > 0 && (
//         <div style={{ marginTop: '40px' }}>
//           <h3>Detected Faces</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//             <div style={{ marginBottom: '20px', width: '80%', display: 'flex', justifyContent: 'space-between' }}>
//               <div style={{ width: '30%' }}><strong>Image</strong></div>
//               <div style={{ width: '30%' }}><strong>Status</strong></div>
//               <div style={{ width: '30%' }}><strong>Details</strong></div>
//             </div>

//             {faces.map((face, index) => (
//               <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', width: '80%' }}>
//                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
//                   <img
//                     src={`http://127.0.0.1:5000${face.face}`}
//                     alt={`Face ${index}`}
//                     style={{
//                       width: '150px',
//                       height: '150px',
//                       borderRadius: '5px',
//                       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                     }}
//                   />
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
//                   <p style={{ color: face.status === 'engaged' ? 'green' : 'red' }}>
//                     {face.status === 'engaged' ? '✅ Engaged' : '❌ Disengaged'}
//                   </p>
//                 </div>

//                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%' }}>
//                   <button
//                     onClick={() => navigate(`/student/1`)}  // Navigate to the student details page
//                     style={{
//                       padding: '5px 10px',
//                       backgroundColor: '#4CAF50',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '5px',
//                       cursor: 'pointer',
//                       boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//                       transition: 'background-color 0.3s ease',
//                     }}
//                     onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
//                     onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
//                   >
//                     View More
//                   </button>
//                 </div>
//               </div>
//             ))}

//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FileUpload;


import React, { useState } from 'react';

const FileUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/pdf') {
      setPdfFile(selected);
    } else {
      alert('Please select a valid PDF file!');
      setPdfFile(null);
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!pdfFile) return alert('No file selected');
    alert(`Selected PDF: ${pdfFile.name}`);
    // You can extend this to preview or store file locally if needed
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Upload PDF Notes</h2>
      <form onSubmit={handleUpload} style={styles.form}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Upload</button>
      </form>
      {pdfFile && (
        <div style={styles.preview}>
          <p><strong>Selected File:</strong> {pdfFile.name}</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '60px auto',
    padding: '30px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  header: {
    marginBottom: '20px',
    color: '#0f172a'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  input: {
    marginBottom: '20px'
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    backgroundColor: '#2563eb',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  preview: {
    marginTop: '20px',
    color: '#1e293b'
  }
};

export default FileUpload;
