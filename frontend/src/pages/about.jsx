import React from 'react'
import Title from '../components/title'
import { assets } from '../assets/assets'

const about = () => {
  return (
    <div>
      
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'About'} text2={'Us'}></Title>
      </div>
      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} alt="" />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
        <p className='text-lg'>Welcome to CodeLearn, your premier online platform for connecting with expert programming teachers and tech mentors. We are dedicated to helping you find the perfect instructor to accelerate your technology learning journey.</p>
        <p>Our mission is to bridge the gap between learners and highly qualified tech educators. Whether you're looking to master Python, JavaScript, Java, C++, PHP, or any other programming language, we connect you with experienced professionals who can guide you every step of the way.</p>
        <p>With years of experience in tech education, we understand that every learner has unique needs. That's why we carefully vet and onboard teachers with proven expertise in their respective programming languages and technologies. Our platform ensures you receive personalized, high-quality instruction tailored to your learning goals.</p>
        </div>
      

      </div>
      <div className='text-4xl py-4'>
        <Title text1={'Why'} text2={'Choose Us'}></Title>

      </div>
      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b className='text-lg'>Expert Teachers</b>
          <p className='text-gray-600'>We meticulously select and vet each teacher to ensure they have real-world experience and proven expertise in their programming languages. All our instructors are industry professionals with years of hands-on experience.</p>

        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b className='text-lg'>Wide Range of Languages</b>
          <p className='text-gray-600'>From Python and JavaScript to C++, Java, PHP, and more - find expert teachers for any programming language you want to learn. Our platform covers all major technologies and frameworks.</p>

        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b className='text-lg'>Flexible Learning</b>
          <p className='text-gray-600'>Learn at your own pace with teachers who understand your schedule. Book sessions that work for you, whether you're a beginner or looking to advance your skills. Personalized one-on-one instruction tailored to your goals.</p>

        </div>

      </div>

      <div className='my-10 text-center'>
        <Title text1={'Our'} text2={'Mission'}></Title>
        <p className='text-gray-600 max-w-3xl mx-auto mt-6 text-lg'>
          At CodeLearn, we believe that everyone deserves access to quality tech education. Our platform makes it easy to connect with expert teachers, 
          learn programming at your own pace, and achieve your career goals in technology. We're committed to making programming education accessible, 
          affordable, and effective for learners worldwide.
        </p>
      </div>

    </div>
  )
}

export default about
