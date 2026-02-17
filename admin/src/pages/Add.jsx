import React, { useState } from 'react'
import { assets } from '../assets/assets'
import axios from 'axios'
import { backendUrl } from '../config'
import { toast } from 'react-toastify'

const Add = ({token}) => {

  // File upload states
  const [image1 , setImage1]= useState(false)
  const [image2 , setImage2]= useState(false)
  const [image3 , setImage3]= useState(false)
  const [image4 , setImage4]= useState(false)

  // Teacher form states
  const [fullName, setFullName] = useState("")
  const [professionalTitle, setProfessionalTitle] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [rating, setRating] = useState("")
  const [totalStudents, setTotalStudents] = useState("")
  const [totalCourses, setTotalCourses] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [specialties, setSpecialties] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [location, setLocation] = useState("")
  const [languages, setLanguages] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [responseTime, setResponseTime] = useState("")
  const [availability, setAvailability] = useState("")
  const [category, setCategory] = useState("") // Programming language category
  const [bestTeacher, setBestTeacher] = useState(false) // Best teacher flag

  // Legacy product states (keeping for compatibility)
  const [name , setName] = useState("")
  const [description , setDescription] = useState("")
  const [price , setPrice] = useState("")
  const [discount , setDiscount] = useState("")
  const [subCategory , setSubCatagory] = useState("Anime")
  const [bestseller , setBestseller] = useState(false)
  const [sizes , setSizes] = useState([])

  const onSubmitHandler = async (e)=> {
    e.preventDefault();

    // Validate required fields
    if (!fullName.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!professionalTitle.trim()) {
      toast.error("Professional Title is required");
      return;
    }

    try {
      
      const formData = new FormData()

      // Debug: Log the values being sent
      console.log("Sending teacher data:", {
        fullName,
        professionalTitle,
        profileImageUrl,
        rating,
        totalStudents,
        totalCourses,
        hourlyRate,
        yearsOfExperience,
        specialties,
        shortDescription,
        location,
        languages,
        email,
        phone,
        responseTime,
        availability
      })

      // Teacher form data
      formData.append("fullName", fullName)
      formData.append("professionalTitle", professionalTitle)
      formData.append("profileImageUrl", profileImageUrl)
      formData.append("rating", rating)
      formData.append("totalStudents", totalStudents)
      formData.append("totalCourses", totalCourses)
      formData.append("hourlyRate", hourlyRate)
      formData.append("yearsOfExperience", yearsOfExperience)
      formData.append("specialties", specialties)
      formData.append("shortDescription", shortDescription)
      formData.append("location", location)
      formData.append("languages", languages)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("responseTime", responseTime)
      formData.append("availability", availability)
      formData.append("category", category)
      formData.append("bestTeacher", bestTeacher)

      // Legacy product data
      formData.append("name" , name)
      formData.append("description" , description)
      formData.append("price" , price)
      formData.append("discount" , discount)
      formData.append("subCategory" , subCategory)
      formData.append("bestseller" , bestseller)
      formData.append("sizes" ,JSON.stringify(sizes))

      image1 &&formData.append("image1", image1)
      image2 &&formData.append("image2" ,image2)
      image3 &&formData.append("image3", image3)
      image4 &&formData.append("image4" ,image4)

      // Debug: Log FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios.post(backendUrl + "/api/product/add" , formData ,{headers:{token}})

        if (response.data.success) {
          toast.success(response.data.message)
          // Reset teacher form
          setFullName('')
          setProfessionalTitle('')
          setProfileImageUrl('')
          setRating('')
          setTotalStudents('')
          setTotalCourses('')
          setHourlyRate('')
          setYearsOfExperience('')
          setSpecialties('')
          setShortDescription('')
          setLocation('')
          setLanguages('')
          setEmail('')
          setPhone('')
          setResponseTime('')
          setAvailability('')
          setCategory('')
          setBestTeacher(false)
          // Reset legacy form
          setName('')
          setDescription('')
          setImage1(false)
          setImage2(false)
          setImage3(false)
          setImage4(false)
          setPrice('')
          setDiscount('')
        }else{
          toast.error(response.data.message)
        }


      
      

    } catch (error) {
      console.log(error);
      toast.error(error.message)
      
    }
  }
  

  return (
    <div className='w-full max-w-4xl mx-auto p-6'>
      <h2 className='text-2xl font-bold mb-6 text-center'>Add New Teacher</h2>
      
      <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-4'>
        
        {/* File Upload Section */}
        <div className='w-full'>
          <p className='mb-2 font-medium'>Upload Images</p>
          <div className='flex gap-2 flex-wrap'>
            <label htmlFor="image1" className='cursor-pointer'>
              <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded' 
                   src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt="Upload 1" />
              <input onChange={(e)=>setImage1(e.target.files[0])} type="file" id='image1' hidden accept="image/*" />
            </label>
            <label htmlFor="image2" className='cursor-pointer'>
              <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded' 
                   src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt="Upload 2" />
              <input onChange={(e)=>setImage2(e.target.files[0])} type="file" id='image2' hidden accept="image/*" />
            </label>
            <label htmlFor="image3" className='cursor-pointer'>
              <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded' 
                   src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt="Upload 3" />
              <input onChange={(e)=>setImage3(e.target.files[0])} type="file" id='image3' hidden accept="image/*" />
            </label>
            <label htmlFor="image4" className='cursor-pointer'>
              <img className='w-20 h-20 object-cover border-2 border-dashed border-gray-300 rounded' 
                   src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt="Upload 4" />
              <input onChange={(e)=>setImage4(e.target.files[0])} type="file" id='image4' hidden accept="image/*" />
            </label>
          </div>
        </div>

        {/* Teacher Form Fields */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 w-full'>
          
          <div>
            <label className='block mb-2 font-medium'>Full Name *</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => {
                console.log("Full name changed:", e.target.value);
                setFullName(e.target.value);
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. Sarah Chen'
              required 
            />
            {fullName && <p className='text-sm text-green-600 mt-1'>✓ {fullName}</p>}
          </div>

          <div>
            <label className='block mb-2 font-medium'>Professional Title *</label>
            <input 
              type="text" 
              value={professionalTitle}
              onChange={(e) => {
                console.log("Professional title changed:", e.target.value);
                setProfessionalTitle(e.target.value);
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. Senior Python Developer'
              required 
            />
            {professionalTitle && <p className='text-sm text-green-600 mt-1'>✓ {professionalTitle}</p>}
          </div>

          <div>
            <label className='block mb-2 font-medium'>Profile Image URL</label>
            <input 
              type="url" 
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='https://images.unsplash.com/...'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Rating (0-5)</label>
            <input 
              type="number" 
              min="0" 
              max="5" 
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='4.8'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Total Students</label>
            <input 
              type="number" 
              value={totalStudents}
              onChange={(e) => setTotalStudents(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='150'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Total Courses</label>
            <input 
              type="number" 
              value={totalCourses}
              onChange={(e) => setTotalCourses(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='8'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Hourly Rate (৳)</label>
            <input 
              type="number" 
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. 85'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Years of Experience</label>
            <input 
              type="text" 
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. 8 years'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block mb-2 font-medium'>Specialties (comma separated)</label>
            <input 
              type="text" 
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. Python, Machine Learning, Django'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block mb-2 font-medium'>Short Description</label>
            <textarea 
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              rows="3"
              placeholder='Brief description of the teacher expertise...'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Location</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. San Francisco, CA'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Languages (comma separated)</label>
            <input 
              type="text" 
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. English, Spanish'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='teacher@codelearn.com'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Phone</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='+1 (555) 123-4567'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Response Time</label>
            <input 
              type="text" 
              value={responseTime}
              onChange={(e) => setResponseTime(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. 2 hours'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Availability</label>
            <input 
              type="text" 
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='e.g. Mon-Fri, 9 AM - 6 PM'
            />
          </div>

          <div>
            <label className='block mb-2 font-medium'>Programming Language Category *</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value="">Select a programming language</option>
              <option value="Python">Python</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
              <option value="PHP">PHP</option>
              <option value="Kotlin">Kotlin</option>
              <option value="Java">Java</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
              <option value="TypeScript">TypeScript</option>
              <option value="Ruby">Ruby</option>
              <option value="Swift">Swift</option>
              <option value="Dart">Dart</option>
            </select>
          </div>

          <div className='md:col-span-2'>
            <label className='flex items-center gap-3'>
              <input 
                type="checkbox" 
                checked={bestTeacher}
                onChange={(e) => setBestTeacher(e.target.checked)}
                className='w-5 h-5 cursor-pointer'
              />
              <span className='font-medium'>Mark as Best Teacher</span>
            </label>
            <p className='text-sm text-gray-500 mt-1 ml-8'>
              Best teachers will be displayed in the "Best Teachers" section on the home page
            </p>
          </div>

        </div>

        <div className='flex gap-4 w-full max-w-xs mx-auto mt-6'>
          <button 
            type='button'
            onClick={() => {
              console.log("Current form state:", {
                fullName,
                professionalTitle,
                profileImageUrl,
                rating,
                totalStudents,
                totalCourses,
                hourlyRate,
                yearsOfExperience,
                specialties,
                shortDescription,
                location,
                languages,
                email,
                phone,
                responseTime,
                availability
              });
              toast.info("Check console for form data");
            }}
            className='flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium'
          >
            TEST DATA
          </button>
          <button 
            type='submit' 
            className='flex-1 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium'
          >
            ADD TEACHER
          </button>
        </div>
      </form>
    </div>
  )
}

export default Add
