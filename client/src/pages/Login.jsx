/* eslint-disable no-unused-vars */
import {useContext, useState } from "react"
import { assets } from "../assets/assets"
import {useNavigate } from "react-router-dom"
import { AppContext } from "../context/AppContext"
import axios from "axios"
import toast from "react-hot-toast"

const Login = () => {

    const navigate = useNavigate()

    const {backendUrl,setIsLoggedin,getUserData} = useContext(AppContext)

    const [state,setState]=useState('Login')
    const [name,setName]=useState('')
    const [reggNumber,setreggNumber]=useState('')
    const [email,setEmail]=useState('')
    const [password,setPassword]=useState('')
    const [universityCode,setUniversityCode]=useState('')
    const [isLoading, setIsLoading] = useState(false)

    const onSubmitHandle = async(e)=>{
        try{
            e.preventDefault()

            axios.defaults.withCredentials = true
            
            if(state === "Sign Up"){
                
                if (!reggNumber.startsWith('A')) {
                    toast.error("Registration Number must start with 'A' for signup");
                    return;
                }
                
                const {data} = await axios.post(backendUrl + "/api/auth/register", 
                    {name,email,password,universityCode,reggNumber}
                );
                
                if (data.success){
                    setIsLoggedin(true);
                    getUserData();
                    navigate("/");
                    toast.success("Admin created Successfully");
                } else {
                    toast.error(data.message);
                }
            } else {
                
                const {data} = await axios.post(backendUrl + "/api/auth/login", 
                    {reggNumber,password}
                );
                
                if (data.success){
                    setIsLoggedin(true);
                    getUserData();
                    navigate("/");
                } else {
                    toast.error(data.message);
                }
            }
        } catch(error){
            toast.error(error.message);
        }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={assets.ums_logo} alt="UMS Logo" className="w-24 h-auto" />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={onSubmitHandle} className="mt-8 space-y-6">
          {state==="Sign Up" && (
                <>
                <div className='mb-4 flex flex-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300'>
                <img src={assets.person_icon} alt="" className="w-3 h-3 text-gray-500"/>
                <input value={name} onChange={e=>setName(e.target.value)} className="bg-transparent outline-none text-gray-900 w-full" type="text" placeholder="Full Name"required/>
            </div>
            <div className='mb-4 flex flex-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300'>
                <img src={assets.person_icon} alt="" className="w-3 h-3 text-gray-500"/>
                <input value={email} onChange={e=>setEmail(e.target.value)} className="bg-transparent outline-none text-gray-900 w-full" type="email" placeholder="Email"required/>
            </div>
            <div className='mb-4 flex flex-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300'>
                <img src={assets.lock_icon} alt="" className="w-3 h-3 text-gray-500"/>
                <input value={universityCode} onChange={e=>setUniversityCode(e.target.value)} className="bg-transparent outline-none text-gray-900 w-full" type="text" placeholder="University Code"required/>
            </div>
                </>
            )}

            <div className='mb-4 flex flex-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300'>
                <img src={assets.person_icon} alt="" className="w-3 h-3 text-gray-500"/>
                <input  value={reggNumber} onChange={e=>setreggNumber(e.target.value)}  className="bg-transparent outline-none text-gray-900 w-full" type="text" placeholder="Registration Number"required/>
            </div>

            <div className='mb-4 flex flex-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300'>
                <img src={assets.lock_icon} alt="" className="w-3 h-3 text-gray-500"/>
                <input  value={password} onChange={e=>setPassword(e.target.value)}  className="bg-transparent outline-none text-gray-900 w-full" type="password" placeholder="Password"required/>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                    </label>
                </div>

                <div className="text-sm">
                    <a href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                        Forgot your password?
                    </a>
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {isLoading ? 'Logging in...' : state}
                </button>
            </div>
        </form>

        {state === "Sign Up"? (
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Already have an Account?{' '}
                    <span className="text-blue-600 cursor-pointer underline" onClick={()=>setState('Login')}>Login here</span>
                </p>
            </div>
        )
        :(
            <div className="text-center">
                <p className="text-sm text-gray-600">
                    Dont have an Account?{' '}
                    <span className="text-blue-600 cursor-pointer underline"  onClick={()=>setState('Sign Up')}>Sign Up here</span>
                </p>
            </div>
        )}
      </div>
    </div>
  )
}

export default Login
