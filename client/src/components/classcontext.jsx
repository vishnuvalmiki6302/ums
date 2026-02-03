import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      // Assuming you have a way to get the username, perhaps from localStorage
      const username = localStorage.getItem('username');
      if (username) {
        const response = await axios.get(`http://localhost:5000/api/user/data?username=${username}`);
        setUserData(response.data);
        setError(null);
      } else {
        throw new Error('Username not found');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const updateUserData = useCallback(async (updatedData) => {
    try {
      setLoading(true);
      // Assuming you have an API endpoint to update user data
      const response = await axios.put("http://localhost:5000/api/user/data", updatedData);
      setUserData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Failed to update user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ClassContext.Provider value={{ userData, loading, error, fetchUserData, updateUserData }}>
      {children}
    </ClassContext.Provider>
  );
};