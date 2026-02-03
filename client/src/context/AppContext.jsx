/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react/prop-types */

import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider=(props)=>{

    axios.defaults.withCredentials = true

    const backendUrl=import.meta.env.VITE_BACKEND_URL
    const [isLoggedin,setIsLoggedin] = useState(false)
    const [userData,setUserData] = useState(null)

    const getAuthState = async ()=>{
        try{
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth')

            if(data.success){
                setIsLoggedin(true)
                getUserData()
            }

        }catch(error){
            toast.error(error.message)
        }
    }

    const getUserData = async ()=>{
        try{
            const {data} = await axios.get(backendUrl + '/api/user/data')
            if (data.success && data.userData) {
                const formattedUserData = {
                    ...data.userData,
                    name: data.userData.name || 'User',
                    reggNumber: data.userData.reggNumber || '',
                    email: data.userData.email || '',
                    section: data.userData.section || '',
                    course: data.userData.course || '',
                    phoneNumber: data.userData.phoneNumber || '',
                    parentName: data.userData.parentName || '',
                    parentNumber: data.userData.parentNumber || '',
                    photoFront: data.userData.photoFront || null,
                    photoLeft: data.userData.photoLeft || null,
                    photoRight: data.userData.photoRight || null,
                    isAccountVerified: data.userData.isAccountVerified || false,
                    userType: data.userData.userType || 'student'
                }
                setUserData(formattedUserData)
                setIsLoggedin(true)
            } else {
                setUserData(null)
                setIsLoggedin(false)
                toast.error(data.message || 'Failed to fetch user data')
            }
        }catch(error){
            console.error('Error fetching user data:', error)
            setUserData(null)
            setIsLoggedin(false)
            toast.error('Failed to fetch user data')
        }
    }

    useEffect(()=>{
        getAuthState()
    },[])

    const value = {
        backendUrl,
        isLoggedin,setIsLoggedin,
        userData,setUserData,
        getUserData
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}


