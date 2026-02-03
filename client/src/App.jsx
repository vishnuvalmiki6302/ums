import {Routes,Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import EmailVerify from './pages/EmailVerify'
import ResetPassword from './pages/ResetPassword'
import Notes from './components/Notes'
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <div className="">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ff4b4b',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/email-verify" element={<EmailVerify/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/notes" element={<Notes/>}/>
        {/* <Route exact path="/login1" element={<SignIn />} /> */}
              {/* <Route exact  path="/dashboard" element={<Dashboard />} /> */}

              {/* Teacher-Related Routes */}
              {/* <Route exact  path="/upload-video/:section/:subject" element={<VideoUpload />} />
              {/* Class-Related Routes */}
              {/* <Route  exact path="/class/:sectionId/:subject" element={<RealTimeEngagementDashboard />} />
              <Route exact  path="/student/:studentId" element={<IndividualStudentEngagement />} />
              <Route exact  path="/overall-engagement" element={<OverallClassEngagement />} />
              <Route exact  path="/classroom-heatmap" element={<ClassroomHeatmap />} />
              <Route exact  path="/attendance" element={<AttendanceFeature />} />
              <Route exact  path="/reports" element={<Reports />} />  */}
      </Routes>
    </div>
  )
}

export default App
