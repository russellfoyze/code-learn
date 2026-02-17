import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { assets } from '../assets/assets'

const Downbar = () => {
    const location = useLocation()
    const isActive = (path) => location.pathname === path
    const userType = localStorage.getItem('userType')
    const token = localStorage.getItem('token')
    
    // Determine dashboard route based on user type
    const getDashboardRoute = () => {
        if (!token) return '/login'
        if (userType === 'teacher') return '/teacher-dashboard'
        if (userType === 'student') return '/student-dashboard'
        return '/login'
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around items-center py-2">
                <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-red-600' : 'text-gray-600'}`}>
                    <img src={assets.home_icon} alt="Home" className="w-6 h-6" />
                    <span className="text-xs mt-1 font-bold">Home</span>
                </Link>
                <Link to="/collection" className={`flex flex-col items-center ${isActive('/collection') ? 'text-red-600' : 'text-gray-600'}`}>
                    <img src={assets.search_icon} alt="Search" className="w-6 h-6" />
                    <span className="text-xs mt-1 font-bold">Collection</span>
                </Link>
                <Link to="/chat" className={`flex flex-col items-center ${isActive('/chat') ? 'text-red-600' : 'text-gray-600'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs mt-1 font-bold">Chat</span>
                </Link>
                <Link to={getDashboardRoute()} className={`flex flex-col items-center ${location.pathname.includes('dashboard') ? 'text-red-600' : 'text-gray-600'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-xs mt-1 font-bold">Dashboard</span>
                </Link>
            </div>
            <a href="https://wa.me/8801331759272" target="_blank" rel="noopener noreferrer" className="fixed bottom-[74px] right-4 bg-green-500 text-white p-2 rounded-full z-50 shadow-lg">
                <img src={assets.wa} alt="WhatsApp" className="w-6 h-6" />
            </a>
        </div>
    )
}

export default Downbar