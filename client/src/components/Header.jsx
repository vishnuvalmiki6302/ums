
import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import LogoutIcon from '@mui/icons-material/Logout';
import { useLocation ,useNavigate} from 'react-router-dom';
import Dash from './Dash'
import axios from 'axios';


const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
const navigate=useNavigate();
  const location = useLocation();
  const username = location?.state?.username;

  // Fetch data based on the username
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (username) {
          const response = await axios.get(`http://localhost:5000/api/user/data?username=${username}`);
          setUserData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, [username]);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
    const handleLogout = () => {
      localStorage.removeItem('authToken');
      navigate('/login');
    };
    const toggleDropdown = (index) => {
      setDropdownOpen(dropdownOpen === index ? null : index);
    };

    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };

    

    return (
      
     
        <h1>Dashboard</h1>
        
       );
  };

  export default Dashboard;
