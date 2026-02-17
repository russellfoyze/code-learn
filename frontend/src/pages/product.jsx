import React, { useState, useContext, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShopContext } from '../context/shopContext';
import { assets } from '../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const product = () => {
  const {productId} = useParams();
  const {products, backendURL} = useContext(ShopContext);
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(false);
  const [ratingInfo, setRatingInfo] = useState({ averageRating: 0, ratingCount: 0 });

  const fetchTeacherData = async () => {
    products.map((item) => {
      if (item._id === productId) {
        setTeacherData(item);
        return null;
      }
    })
  }

  useEffect(() => {
    fetchTeacherData();
  }, [productId, products])

  useEffect(() => {
    const loadRating = async () => {
      try {
        const teacherId = teacherData?.teacherId || teacherData?._id;
        if (!backendURL || !teacherId) return;
        const res = await axios.get(`${backendURL}/api/user/teacher/${teacherId}/rating`);
        if (res.data.success) {
          setRatingInfo({
            averageRating: res.data.averageRating || 0,
            ratingCount: res.data.ratingCount || 0
          });
        }
      } catch (e) {
        // ignore silently
      }
    };
    loadRating();
  }, [backendURL, teacherData])

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    return stars;
  }

  const handleMessageTeacher = async () => {
    if (!teacherData) return;
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user_${Date.now()}`;
      localStorage.setItem('userId', userId);
    }
    const userName = localStorage.getItem('userName') || 'Student';
    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/chat/get-or-create`, {
        userId,
        userName: userName,
        teacherId: teacherData.teacherId || teacherData._id,
        teacherName: teacherData.fullName,
        teacherImage: (() => {
          if (teacherData.image) {
            if (Array.isArray(teacherData.image) && teacherData.image.length > 0) {
              return teacherData.image[0];
            } else if (typeof teacherData.image === 'string') {
              return teacherData.image;
            }
          }
          return teacherData.profileImageUrl || null;
        })()
      });

      if (response.data.success) {
        navigate('/chat', { 
          state: { 
            teacherId: teacherData.teacherId || teacherData._id,
            chatId: response.data.chat._id
          } 
        });
        toast.success('Chat opened with ' + teacherData.fullName);
      } else {
        toast.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return teacherData ? (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          
          {/* Left Column - Teacher Summary */}
          <div className='lg:w-1/3'>
            <div className='bg-white rounded-lg shadow-lg p-6 sticky top-8'>
              
              {/* Profile Header */}
              <div className='text-center mb-6'>
                <div className='w-32 h-32 mx-auto mb-4 relative'>
                  {(() => {
                    let imageUrl = null;
                    if (teacherData.image) {
                      if (Array.isArray(teacherData.image) && teacherData.image.length > 0) {
                        imageUrl = teacherData.image[0];
                      } else if (typeof teacherData.image === 'string') {
                        imageUrl = teacherData.image;
                      }
                    }
                    if (!imageUrl && teacherData.profileImageUrl) {
                      imageUrl = teacherData.profileImageUrl;
                    }
                    return imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={teacherData.fullName || 'Teacher'}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-4xl'>
                        👨‍🏫
                      </div>
                    );
                  })()}
                  <div className='absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white'></div>
                </div>
                
                <h1 className='text-2xl font-bold text-gray-900 mb-1'>{teacherData.fullName}</h1>
                <p className='text-lg text-blue-600 font-medium mb-2'>{teacherData.professionalTitle}</p>
                {teacherData.location && (
                  <div className='flex items-center justify-center text-gray-600 mb-2'>
                    <span className='mr-1'>📍</span>
                    <span>{teacherData.location}</span>
                  </div>
                )}
                
                <div className='flex items-center justify-center text-sm text-gray-600'>
                  <div className='flex mr-2'>{renderStars(ratingInfo.averageRating || 0)}</div>
                  <span>
                    {ratingInfo.averageRating?.toFixed ? ratingInfo.averageRating.toFixed(1) : (ratingInfo.averageRating || 0)}
                    {` (${ratingInfo.ratingCount || 0} reviews)`}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-3 gap-4 mb-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>{teacherData.totalStudents?.toLocaleString() || '0'}</div>
                  <div className='text-sm text-gray-600'>Students</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>{teacherData.totalCourses || '0'}</div>
                  <div className='text-sm text-gray-600'>Courses</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-gray-900'>{teacherData.yearsOfExperience || '0+'}</div>
                  <div className='text-sm text-gray-600'>Experience</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3 mb-6'>
                {teacherData.teacherId && (
                  <button 
                    onClick={handleMessageTeacher}
                    disabled={loading}
                    className='w-full bg-black text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed'
                  >
                    <span className='mr-2'>💬</span>
                    {loading ? 'Connecting...' : 'Message Teacher'}
                  </button>
                )}
                <button 
                  onClick={() => navigate(`/book-session/${productId}`)}
                  className='w-full border-2 border-black text-black py-3 px-4 rounded-lg font-medium flex items-center justify-center hover:bg-gray-50 transition-colors'
                >
                  <span className='mr-2'>📅</span>
                  Book a Session
                </button>
              </div>
              
              {/* Pricing */}
              {teacherData.hourlyRate && (
                <div className='text-center mb-6'>
                  <div className='text-3xl font-bold text-gray-900'>৳{teacherData.hourlyRate}/hr</div>
                  <div className='text-sm text-gray-500'>Starting price</div>
                </div>
              )}

              {/* Quick Info */}
              <div className='mb-6'>
                <h3 className='font-bold text-gray-900 mb-3'>Quick Info</h3>
                <div className='space-y-2 text-sm'>
                  {teacherData.responseTime && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Response time:</span>
                      <span className='font-medium'>{teacherData.responseTime}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Response rate:</span>
                    <span className='font-medium'>100%</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>Completion rate:</span>
                    <span className='font-medium'>98%</span>
                  </div>
                  {teacherData.availability && (
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Availability:</span>
                      <span className='font-medium'>{teacherData.availability}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Languages */}
              {teacherData.languages && (
                <div>
                  <h3 className='font-bold text-gray-900 mb-3'>Languages</h3>
                  <div className='flex flex-wrap gap-2'>
                    {teacherData.languages.split(',').map((lang, index) => (
                      <span key={index} className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm'>
                        {lang.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className='lg:w-2/3'>
            <div className='bg-white rounded-lg shadow-lg'>
              
              {/* Navigation Tabs */}
              <div className='border-b border-gray-200'>
                <nav className='flex space-x-8 px-6'>
                  <button
                    onClick={() => setActiveTab('about')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'about'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    About
                  </button>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'courses'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Courses
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className='p-6'>
                {activeTab === 'about' && (
                  <div className='space-y-6'>
                    <div>
                      <h2 className='text-xl font-bold text-gray-900 mb-4'>About {teacherData.fullName}</h2>
                      <p className='text-gray-700 leading-relaxed'>
                        {teacherData.shortDescription || teacherData.description || 
                         "I'm a passionate educator with extensive experience in my field. I love helping students achieve their goals and build practical skills that matter in today's industry."}
                      </p>
                    </div>
                    {teacherData.specialties && (
                      <div>
                        <h3 className='text-lg font-bold text-gray-900 mb-3'>Specialties</h3>
                        <div className='flex flex-wrap gap-2'>
                          {teacherData.specialties.split(',').map((specialty, index) => (
                            <span key={index} className='bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium'>
                              {specialty.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 mb-3'>Certifications</h3>
                      <div className='space-y-2'>
                        <div className='flex items-center text-sm text-gray-700'>
                          <span className='mr-2'>🏆</span>
                          <span>Google Cloud Professional Developer</span>
                        </div>
                        <div className='flex items-center text-sm text-gray-700'>
                          <span className='mr-2'>🏆</span>
                          <span>AWS Certified Solutions Architect</span>
                        </div>
                        <div className='flex items-center text-sm text-gray-700'>
                          <span className='mr-2'>🏆</span>
                          <span>Python Institute Certified Expert</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className='text-lg font-bold text-gray-900 mb-3'>Contact Information</h3>
                      <div className='space-y-2 text-sm text-gray-700'>
                        {teacherData.email && (
                          <div className='flex items-center'>
                            <span className='mr-2'>📧</span>
                            <span>{teacherData.email}</span>
                          </div>
                        )}
                        {teacherData.phone && (
                          <div className='flex items-center'>
                            <span className='mr-2'>📞</span>
                            <span>{teacherData.phone}</span>
                          </div>
                        )}
                        {teacherData.responseTime && (
                          <div className='flex items-center'>
                            <span className='mr-2'>⏱️</span>
                            <span>Response time: {teacherData.responseTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'courses' && (
                  <div>
                    <h2 className='text-xl font-bold text-gray-900 mb-4'>Courses by {teacherData.fullName}</h2>
                    <div className='text-gray-600'>
                      <p>This teacher has {teacherData.totalCourses || 0} courses available.</p>
                      <p className='mt-2'>Course details and enrollment options will be displayed here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='text-center'>
        <div className='text-6xl mb-4'>👨‍🏫</div>
        <h2 className='text-2xl font-bold text-gray-600 mb-2'>Loading Teacher Profile...</h2>
        <p className='text-gray-500'>Please wait while we fetch the teacher information.</p>
      </div>
    </div>
  )
}

export default product
