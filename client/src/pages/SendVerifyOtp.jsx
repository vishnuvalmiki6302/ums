  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="flex justify-center mb-4">
          <img src={assets.ums_logo} alt="UMS Logo" className="w-24 h-auto" />
        </div>
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Email Verification</h2>
          <p className="mt-2 text-sm text-gray-600">
            Click the button below to receive a verification OTP
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={sendVerificationOtp}
            disabled={isSending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSending ? 'Sending...' : 'Send Verification OTP'}
          </button>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
      </div>
    </div>
  ); 