import React from 'react'
import { NavLink } from 'react-router-dom'
import { assets } from '../assets/assets'

const Sidebar = () => {
  return (
    <div className='w-[18%] h-full border-r-2 border-gray-300 flex-shrink-0 overflow-y-auto'>
    <div className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/add">
      <img className='w-5 h-5' src={assets.add_icon} alt="" />
            <p className='hidden md:block'>Add Teacher</p>
      </NavLink>

      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/list">
      <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block'>Teachers List</p>
      </NavLink>

      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/orders">
      <img className='w-5 h-5' src={assets.order_icon} alt="" />
            <p className='hidden md:block'>Orders</p>
      </NavLink>

      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/teacher-requests">
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
      </svg>
            <p className='hidden md:block'>Teacher Requests</p>
      </NavLink>

      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/newsletter">
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' />
      </svg>
            <p className='hidden md:block'>Newsletter</p>
      </NavLink>

      <NavLink className="flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l " to="/chat">
      <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
      </svg>
            <p className='hidden md:block'>Support Chat</p>
      </NavLink>

      
    </div>
    </div>
  )
}

export default Sidebar
