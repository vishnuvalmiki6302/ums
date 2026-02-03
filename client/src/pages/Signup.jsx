  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={assets.ums_logo} alt="UMS Logo" className="w-24 h-auto" />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register for a new account
          </p>
        </div>

        <form onSubmit={onSubmitHandler} className="mt-8 space-y-6">
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300">
            <img src={assets.mail_icon} alt="" className="w-3 h-3 text-gray-500"/>
            <input value={email} type="email" placeholder="Email address" onChange={(e)=>setEmail(e.target.value)}
                className="bg-transparent outline-none text-gray-900 w-full" required
                disabled={isLoading}/>
          </div>
          <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-white border border-gray-300">
            <img src={assets.lock_icon} alt="" className="w-3 h-3 text-gray-500"/>
            <input value={password} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}
                className="bg-transparent outline-none text-gray-900 w-full" required
                disabled={isLoading}/>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  ); 