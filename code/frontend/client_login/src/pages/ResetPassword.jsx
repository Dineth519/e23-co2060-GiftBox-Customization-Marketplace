import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // State for input fields
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Retrieve email passed from the EmailVerify page state
    const email = location.state?.email;

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        // Validation: Ensure email exists (security check)
        if (!email) {
            alert("Session expired. Please start the reset process again.");
            return navigate('/login');
        }

        // Validation: Matching passwords
        if (newPassword !== confirmPassword) {
            return alert("Passwords do not match!");
        }

        try {
            // API call matching your Backend 'Map<String, String> body'
            const response = await axios.post('http://localhost:8080/api/auth/reset-password', {
                email: email,
                newPassword: newPassword 
            });

            if (response.data.success === true) {
                alert("Password Reset Successful!");
                navigate('/login');
            } else {
                alert(response.data.message || "Failed to reset password.");
            }
        } catch (error) {
            console.error("API Error:", error);
            alert("Something went wrong. Please check if the server is running.");
        }
    };

    return (
        <div className='flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-500'>
            
            <img 
                src={assets.logo} 
                alt="Logo" 
                onClick={() => navigate('/login')} 
                className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer'
            />

            <div className='w-full sm:w-96'>
                <div className='bg-neutral-900 border border-amber-500/30 p-10 rounded-xl shadow-[0_20px_50px_rgba(217,119,6,0.3)] flex flex-col justify-center'>
                    
                    <h2 className='text-3xl font-semibold text-white text-center mb-3'>New Password</h2>
                    <p className='text-center text-amber-200/70 text-sm mb-6'>
                        Enter your new password for <br/>
                        <span className='text-amber-400 font-medium'>{email}</span>
                    </p>

                    <form onSubmit={onSubmitHandler}>
                        
                        {/* New Password Input */}
                        <div className='flex items-center gap-3 w-full px-5 py-3 rounded-full bg-neutral-800 mb-4 focus-within:ring-1 focus-within:ring-amber-500 transition-all'>
                            <img src={assets.lock_icon} className="w-5" alt="" />
                            <input 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                value={newPassword} 
                                className='bg-transparent outline-none w-full text-white' 
                                type={showPassword ? "text" : "password"} 
                                placeholder='New Password' 
                                required
                            />
                            
                            {/* Inserted Eye Toggle Button */}
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className='outline-none'
                            >
                                <img 
                                    src={showPassword ? assets.Open_Eye : assets.Close_Eye} 
                                    className="w-5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer invert" 
                                    alt="Toggle Visibility" 
                                />
                            </button>
                        </div>

                        {/* Confirm Password Input */}
                        <div className='flex items-center gap-3 w-full px-5 py-3 rounded-full bg-neutral-800 mb-6 focus-within:ring-1 focus-within:ring-amber-500 transition-all'>
                            <img src={assets.lock_icon} className="w-5" alt="" />
                            <input 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                value={confirmPassword} 
                                className='bg-transparent outline-none w-full text-white' 
                                type={showPassword ? "text" : "password"} 
                                placeholder='Confirm Password' 
                                required
                            />
                            {/* We can omit the toggle here as it's controlled by the same state above */}
                        </div>

                        <button type="submit" className='w-full py-2.5 rounded-full bg-gradient-to-r from-amber-700 to-yellow-600 text-white font-medium hover:from-amber-600 hover:to-yellow-500 hover:scale-105 transition-all shadow-md'>
                            Submit
                        </button>
                    </form>

                    <p 
                        onClick={() => navigate('/login')} 
                        className='text-center mt-6 text-amber-400 cursor-pointer underline hover:text-amber-200 text-sm transition-colors'
                    >
                        Back to Login
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;