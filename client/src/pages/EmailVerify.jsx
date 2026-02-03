/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react"
import { assets } from "../assets/assets"
import {useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { AppContext } from "../context/AppContext"
import axios from "axios"


const EmailVerify = () => {
  const navigate = useNavigate()
  const { backendUrl, isLoggedin, userData, getUserData } = useContext(AppContext)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = React.useRef([])

  useEffect(()=>{
    if (isLoggedin && userData?.isAccountVerified) {
      navigate('/')
    }
  },[isLoggedin,userData,navigate])

  const handleInput=(e,index)=>{
    const value = e.target.value.replace(/[^0-9]/g, '')
    e.target.value = value
    
    if (value && index < inputRefs.current.length-1){
      inputRefs.current[index+1].focus()
    }
  }

  const handleKeyDown =(e,index)=>{
    if (e.key === 'Backspace' && !e.target.value && index>0){
      inputRefs.current[index-1].focus()
    }
  }

  const handlePaste = (e)=>{
    e.preventDefault()
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, '')
    const pasteArray = paste.split('').slice(0, 6)
    
    pasteArray.forEach((char,index)=>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value=char 
      }
    })

    if (pasteArray.length > 0 && pasteArray.length < 6) {
      inputRefs.current[pasteArray.length].focus()
    }
  }

  const onSubmitHandler = async(e)=>{
    try{
      e.preventDefault()
      setIsVerifying(true)
      setError('')

      const otpArray = inputRefs.current.map(e=>e.value)
      const otp = otpArray.join('')

      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit OTP')
        setIsVerifying(false)
        return
      }

      const {data}= await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        {otp},
        {withCredentials: true}
      )

      if(data.success){
        toast.success(data.message)
        await getUserData()
        navigate('/')
      }
      else{
        setError(data.message)
        toast.error(data.message)
        inputRefs.current.forEach(input => input.value = '')
        inputRefs.current[0].focus()
      }

    }catch(error){
      console.error('Error verifying OTP:', error)
      const errorMessage = error.response?.data?.message || 'Failed to verify OTP'
      setError(errorMessage)
      toast.error(errorMessage)
      inputRefs.current.forEach(input => input.value = '')
      inputRefs.current[0].focus()
    }finally{
      setIsVerifying(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={assets.ums_logo} alt="UMS Logo" className="w-24 h-auto" />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter the OTP sent to your email
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="mt-8 space-y-6">
          <div className="flex justify-center space-x-2">
            {[...Array(6)].map((_,index)=>(
              <input
                key={index}
                ref={el => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                onChange={(e)=>handleInput(e,index)}
                onKeyDown={(e)=>handleKeyDown(e,index)}
                onPaste={handlePaste}
                disabled={isVerifying}
              />
            ))}
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmailVerify
