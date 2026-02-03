import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@mui/material';

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin, getUserData } = useContext(AppContext);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userData !== null) {
      setIsLoading(false);
    }
  }, [userData]);

  const sendVerificationOtp = async () => {
    try {
      setIsSending(true);
      const response = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/email-verify');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error sending verification OTP:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification OTP');
    } finally {
      setIsSending(false);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-18 flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-20 bg-blue-500 shadow-xl">
        <div className="flex justify-center items-center">
          <img src={assets.ums_logo} alt="ums_logo" className="w-12 m-0" />
          <h1 className="ml-2 text-3xl text-white font-bold">UMS</h1>
        </div>
        <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-18 flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-20 bg-blue-500 shadow-xl" style={navbarStyles}>
        <div className="flex justify-center items-center">
          <img src={assets.ums_logo} alt="ums_logo" className="w-12 m-0" />
          <h1 className="ml-2 text-3xl text-white font-bold">UMS</h1>
        </div>

        {userData ? (
          <div className="flex items-center gap-6">
            <Button 
              style={{ 
                color: 'white', 
                fontSize: '15px',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '6px 12px',
                borderRadius: '8px'
              }} 
              onClick={getUserData} 
              startIcon={<RefreshIcon />}
            >
              Refresh
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-white/80">Welcome,</span>
                <span className="font-semibold text-white">{userData.name}</span>
              </div>
              
              <div className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                userData.reggNumber.startsWith('A') 
                  ? 'bg-purple-500/20 text-purple-200' 
                  : userData.reggNumber.startsWith('P')
                  ? 'bg-blue-500/20 text-blue-200'
                  : 'bg-green-500/20 text-green-200'
              }`}>
                {userData.reggNumber.startsWith('A') 
                  ? 'Administrator' 
                  : userData.reggNumber.startsWith('P')
                  ? 'Professor'
                  : 'Student'}
              </div>
            </div>

            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-white/10 text-white relative group cursor-pointer text-xl">
              {userData?.photoFront ? (
                <img
                  src={userData.photoFront}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2"
                />
              ) : (
                <div className="w-full h-full bg-black text-white flex justify-center items-center text-xl">
                  {userData?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}

              <div className="absolute hidden group-hover:block top-full right-0 mt-0 bg-gray-100 rounded shadow z-30">
                <ul className="text-sm">
                  {!userData.isAccountVerified && (
                    <li
                      onClick={sendVerificationOtp}
                      className="py-1 px-4 hover:bg-gray-200 text-black"
                      disabled={isSending}
                    >
                      {isSending ? 'Sending...' : 'Verify Email'}
                    </li>
                  )}
                  <li
                    onClick={logout}
                    className="py-1 px-4 hover:bg-gray-200 text-black"
                  >
                    Logout
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-gray-800 hover:bg-gray-100 transition-all"
            >
              Login
              <img src={assets.arrow_icon} alt="arrow" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const navbarStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
};

export default Navbar;
