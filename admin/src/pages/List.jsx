import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl } from '../config'
import { toast } from 'react-toastify'
import { currency } from '../App'

const List = ({token}) => {

  const [list , setList]= useState([])
  const fatchList = async ()=>{

    try {
      
      const response = await axios.get(backendUrl + '/api/product/list' , {headers:{token}})
      
      if (response.data.products) {
        setList(response.data.products)
      }else{
        toast.error(response.data.message)
      }
      
      
    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }

  }

  const removeProduct = async (id)=> {
    try {
      
      const response = await axios.post(backendUrl + '/api/product/remove', {id} , {headers:{token}})
      if (response.data.success) {
        toast.success(response.data.message)
        await fatchList()
      }else{
        toast.error(response.data.message)
      }


    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  }

  useEffect(()=>{
    fatchList()
  },[])

  return (
    <div className='w-full max-w-7xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6'>All Teachers List</h2>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {list.map((teacher, index) => (
          <div key={teacher._id} className='bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow'>
            
            {/* Teacher Image */}
            <div className='h-48 bg-gray-200 flex items-center justify-center'>
              {(() => {
                // Same logic as product page - get first image from array or use string
                let imageUrl = null;
                if (teacher.image) {
                  if (Array.isArray(teacher.image) && teacher.image.length > 0) {
                    imageUrl = teacher.image[0];
                  } else if (typeof teacher.image === 'string') {
                    imageUrl = teacher.image;
                  }
                }
                if (!imageUrl && teacher.profileImageUrl) {
                  imageUrl = teacher.profileImageUrl;
                }
                
                return imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={teacher.fullName || 'Teacher'} 
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='text-gray-400 text-4xl'>👨‍🏫</div>
                );
              })()}
            </div>

            {/* Teacher Information */}
            <div className='p-4'>
              {/* Basic Info */}
              <div className='mb-3'>
                <h3 className='text-xl font-bold text-gray-800'>{teacher.fullName}</h3>
                <p className='text-blue-600 font-medium'>{teacher.professionalTitle}</p>
                {teacher.location && (
                  <p className='text-sm text-gray-600'>📍 {teacher.location}</p>
                )}
              </div>

              {/* Rating and Stats */}
              <div className='flex items-center gap-4 mb-3'>
                {teacher.rating && (
                  <div className='flex items-center gap-1'>
                    <span className='text-yellow-500'>⭐</span>
                    <span className='font-medium'>{teacher.rating}</span>
                  </div>
                )}
                {teacher.totalStudents && (
                  <div className='text-sm text-gray-600'>
                    👥 {teacher.totalStudents} students
                  </div>
                )}
                {teacher.totalCourses && (
                  <div className='text-sm text-gray-600'>
                    📚 {teacher.totalCourses} courses
                  </div>
                )}
              </div>

              {/* Hourly Rate */}
              {teacher.hourlyRate && (
                <div className='mb-3'>
                  <span className='text-lg font-bold text-green-600'>
                    ৳{teacher.hourlyRate}/hour
                  </span>
                </div>
              )}

              {/* Experience */}
              {teacher.yearsOfExperience && (
                <div className='mb-3'>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Experience:</span> {teacher.yearsOfExperience}
                  </p>
                </div>
              )}

              {/* Specialties */}
              {teacher.specialties && (
                <div className='mb-3'>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Specialties:</span> {teacher.specialties}
                  </p>
                </div>
              )}

              {/* Languages */}
              {teacher.languages && (
                <div className='mb-3'>
                  <p className='text-sm text-gray-600'>
                    <span className='font-medium'>Languages:</span> {teacher.languages}
                  </p>
                </div>
              )}

              {/* Description */}
              {teacher.shortDescription && (
                <div className='mb-3'>
                  <p className='text-sm text-gray-700 line-clamp-2'>
                    {teacher.shortDescription}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className='space-y-1 mb-4'>
                {teacher.email && (
                  <p className='text-xs text-gray-600'>📧 {teacher.email}</p>
                )}
                {teacher.phone && (
                  <p className='text-xs text-gray-600'>📞 {teacher.phone}</p>
                )}
                {teacher.responseTime && (
                  <p className='text-xs text-gray-600'>⏱️ Response: {teacher.responseTime}</p>
                )}
                {teacher.availability && (
                  <p className='text-xs text-gray-600'>🕒 {teacher.availability}</p>
                )}
              </div>

              {/* Action Button */}
              <div className='flex justify-between items-center'>
                <button 
                  onClick={() => removeProduct(teacher._id)} 
                  className='px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors'
                >
                  Remove
                </button>
                <span className='text-xs text-gray-400'>
                  ID: {teacher._id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {list.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-6xl mb-4'>👨‍🏫</div>
          <h3 className='text-xl font-medium text-gray-600 mb-2'>No Teachers Found</h3>
          <p className='text-gray-500'>Add some teachers to get started!</p>
        </div>
      )}

      {/* Summary Stats */}
      {list.length > 0 && (
        <div className='mt-8 bg-gray-50 rounded-lg p-4'>
          <h3 className='text-lg font-medium mb-3'>Summary</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div>
              <span className='font-medium'>Total Teachers:</span> {list.length}
            </div>
            <div>
              <span className='font-medium'>Total Students:</span> {list.reduce((sum, teacher) => sum + (teacher.totalStudents || 0), 0)}
            </div>
            <div>
              <span className='font-medium'>Total Courses:</span> {list.reduce((sum, teacher) => sum + (teacher.totalCourses || 0), 0)}
            </div>
            <div>
              <span className='font-medium'>Avg Rating:</span> {list.length > 0 ? (list.reduce((sum, teacher) => sum + (teacher.rating || 0), 0) / list.length).toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default List
