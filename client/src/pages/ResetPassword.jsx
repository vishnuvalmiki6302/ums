/* eslint-disable no-unused-vars */
import { useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import React, {useContext, useState } from "react"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import { toast } from "react-toastify"

const ResetPassword = () => {

  const {backendUrl} = useContext(AppContext)

  axios.defaults.withCredentials = true

  const navigate = useNavigate()

  const [email,setEmail] = useState('')
  const [newPassword,setNewPassword] = useState('')
  const [isEmailSent,setIsEmailSent] = useState(false)
  const [otp,setOtp] = useState('')
  const [isOtpSubmitted,setIsOtpSubmitted] = useState(false)
  const [isLoading,setIsLoading] = useState(false)
  

  const inputRefs = React.useRef([])
  

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

  const onSubmitEmail = async(e)=>{
    e.preventDefault()
    try{
      setIsLoading(true)
      const {data} = await axios.post(backendUrl+'/api/auth/send-reset-otp',{email}, {withCredentials: true})
      if (data.success) {
        toast.success(data.message)
        setIsEmailSent(true)
      } else {
        toast.error(data.message)
      }
    }catch(error){
      console.error('Error sending reset OTP:', error)
      toast.error(error.response?.data?.message || 'Failed to send reset OTP')
    }finally{
      setIsLoading(false)
    }
  }

  const onSubmitOtp = async (e)=>{
    e.preventDefault()
    const otpArray = inputRefs.current.map((e)=>e.value)
    const otpValue = otpArray.join('')

    if (otpValue.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }

    setOtp(otpValue)
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async(e)=>{
    e.preventDefault()
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    try{
      setIsLoading(true)
      const {data} = await axios.post(backendUrl+'/api/auth/reset-password',{email,otp,newPassword}, {withCredentials: true})
      if (data.success) {
        toast.success(data.message)
        navigate('/login')
      } else {
        toast.error(data.message)
      }
    }catch(error){
      console.error('Error resetting password:', error)
      toast.error(error.response?.data?.message || 'Failed to reset password')
    }finally{
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={assets.ums_logo} alt="UMS Logo" className="w-24 h-auto" />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* enter email id */}
        {!isEmailSent && (
          <form onSubmit={onSubmitEmail} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        )}

        {/* show success message */}
        {isEmailSent && (
          <div className="text-center">
            <div className="text-green-600 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600">
              Password reset link has been sent to your email. Please check your inbox.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
