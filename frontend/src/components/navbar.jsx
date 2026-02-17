import React, { useContext, useState, useEffect } from 'react'
import {assets} from '../assets/assets'
import {Link , NavLink } from 'react-router-dom'
import { ShopContext } from '../context/shopContext'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

const navbar = () => {
    const [visible , setVisible] = useState(false);
    const [orderCount, setOrderCount] = useState(0); // pending only
    const [unreadCount, setUnreadCount] = useState(0);
    const {setShowSearch , navigate , setToken , setCartItems, token, backendURL } = useContext(ShopContext);
    const location = useLocation()
    const userType = localStorage.getItem('userType')
    const isTeacher = userType === 'teacher'
    const isStudent = userType === 'student'
    const userName = localStorage.getItem('userName') || 'Student';
    const [profileImageUrl, setProfileImageUrl] = useState(localStorage.getItem('profileImageUrl') || '');

    // Fetch order count for students
    useEffect(() => {
      if (isStudent && token && backendURL) {
        const userId = localStorage.getItem('userId') || '';
        const fetchCounts = async () => {
          try {
            // Pending orders
            const response = await axios.get(
              `${backendURL}/api/sessions/student`,
              { headers: { token } }
            );
            if (response.data.success) {
              const sessions = response.data.sessions || [];
              setOrderCount(sessions.filter(s => s.status === 'pending').length);
            }
          } catch (error) {
            console.error('Error fetching order count:', error);
          }
          try {
            // Unread chat messages across support + teacher chats
            if (!userId) return;
            const convRes = await axios.post(`${backendURL}/api/chat/conversations`, { userId });
            if (convRes.data?.success) {
              const conversations = convRes.data.conversations || [];
              let total = 0;
              conversations.forEach(c => {
                if (Array.isArray(c.messages)) {
                  total += c.messages.filter(m => m.receiverId === userId && !m.read).length;
                }
              });
              setUnreadCount(total);
            }
          } catch (error) {
            console.error('Error fetching unread chats:', error);
          }
        };
        fetchCounts();
        const id = setInterval(fetchCounts, 5000);
        return () => clearInterval(id);
      }
    }, [isStudent, token, backendURL]);

    // Keep profile image in sync with localStorage updates (e.g., after upload)
    useEffect(() => {
      const onStorage = (e) => {
        if (e.key === 'profileImageUrl') {
          setProfileImageUrl(e.newValue || '');
        }
      };
      window.addEventListener('storage', onStorage);
      return () => window.removeEventListener('storage', onStorage);
    }, []);

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('profileImageUrl')
    setToken("")
    setCartItems({})
    navigate('/login')
  }


  return (
    <div className={``}>
    <div className=' flex items-center justify-between py-1 font-medium'>
     <Link to={'./'}> <img src={assets.logo} className='w-100' alt="" /></Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        {isTeacher ? (
          <>
            <NavLink to='/teacher-dashboard' className='flex flex-col item-center gap-1'>
              <p>Dashboard</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
            <NavLink 
              to='/teacher-dashboard#chats' 
              className='flex flex-col item-center gap-1'
            >
              <p>Student Chat</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to='/' className='flex flex-col item-center gap-1'>
              <p>Home</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
            <NavLink to='/collection' className='flex flex-col item-center gap-1'>
              <p>Teachers</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
            <NavLink to='/about' className='flex flex-col item-center gap-1'>
              <p>About Us</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
            <NavLink to='/contact' className='flex flex-col item-center gap-1'>
              <p>Contact</p>
              <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
            </NavLink>
          </>
        )}
      </ul>

      <div className='flex item items-center gap-6'>
        {!isTeacher && (
          <img onClick={()=>setShowSearch(true)} src={assets.search_icon} className={`w-5 cursor-pointer ${location.pathname.includes('collection')? "visible": 'invisible' }`} alt="" />
        )}

        {!isTeacher && (
          <Link to='/chat' className='relative'>
            <svg className='w-5 h-5 text-gray-700' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' />
            </svg>
            {unreadCount > 0 && (
              <span className='absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center'>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        )}

        {token ? (
          <>
            {/* Student Dashboard Link with Order Count */}
            {isStudent && (
              <Link 
                to='/student-dashboard' 
                className='hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors relative'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
                </svg>
                <span>Orders</span>
                {orderCount > 0 && (
                  <span className='absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {orderCount}
                  </span>
                )}
              </Link>
            )}
            <button 
              onClick={logout}
              className='px-4 py-1.5 text-sm text-gray-700 hover:text-black border border-gray-300 rounded-md hover:bg-gray-50 transition-colors hidden sm:block'
            >
              Log Out
            </button>
            <div className='group relative'>
              <Link to={isTeacher ? '/teacher-dashboard' : '/student-dashboard'}>
                {/* Show user avatar with name for students */}
                {isStudent ? (
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 rounded-full overflow-hidden bg-blue-500 flex items-center justify-center text-white text-sm font-semibold ring-2 ring-blue-100'>
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Profile" className='w-full h-full object-cover' />
                      ) : (
                        <span>{userName[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className='hidden sm:block text-sm font-medium text-gray-700'>
                      {userName}
                    </span>
                  </div>
                ) : (
                  <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="" />
                )}
              </Link>

                <div className='group-hover:block hidden absolute dropdown-menu right-0 pt-4'>
                    <div className='flex flex-col gap-2 w-36 py-3 px-5 bg-slate-100 text-gray-500 rounded '>
                        {isStudent && (
                          <>
                            <Link to='/student-dashboard' className='cursor-pointer hover:text-black ml-5'>My Profile</Link>
                            <Link to='/student-dashboard' className='cursor-pointer hover:text-black ml-5'>
                              Orders {orderCount > 0 && `(${orderCount})`}
                            </Link>
                          </>
                        )}
                        {isTeacher && (
                          <>
                            <Link to='/teacher-dashboard' className='cursor-pointer hover:text-black ml-5'>Dashboard</Link>
                          </>
                        )}
                        <p className='cursor-pointer hover:text-black ml-5' onClick={logout}>Log Out</p>
                    </div>
                </div>
            </div>
          </>
        ) : (
          <Link to={'/login'}> 
            <img src={assets.profile_icon} className='w-5 cursor-pointer' alt="" />
          </Link>
        )}
    <img onClick={()=>setVisible(true)} src={assets.menu_icon} className='w-5 cursor-pointer sm:hidden' alt="" />
      </div>


      {/* sidebar menu for small screen */}

        <div className={`absolute top-0 right-0 bottom-0 overflow-hidden bg-white transition-all z-[100] ${visible ? 'w-[90%]': 'w-0'}`}>
         <div className='flex flex-col text-gray-600'>
            <div onClick={()=> setVisible(false)} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img src={assets.dropdown_icon} className='h-4 rotate-180' alt="" />
            <p>Back</p>
            </div>

            {isTeacher ? (
              <>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/teacher-dashboard'>Dashboard</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/chat'>Student Chat</NavLink>
              </>
            ) : (
              <>
                <NavLink onClick={()=> setVisible(false)}  className='py-2 pl-6 border' to='/'>Home</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/collection'>Collection</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/about'>About Us</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/contact'>Contact</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/chat'>Chat</NavLink>
                <NavLink onClick={()=> setVisible(false)} className='py-2 pl-6 border' to='/student-dashboard'>
                  Dashboard {orderCount > 0 && `(${orderCount})`}
                </NavLink>
              </>
            )}
            {token && (
              <button 
                onClick={() => { logout(); setVisible(false); }}
                className='py-2 pl-6 border text-left text-red-600 hover:text-red-700'
              >
                Log Out
              </button>
            )}
            </div>   
        </div>
        


        </div>
        </div>
    
  )
}

export default navbar

