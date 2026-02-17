import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import { Link } from "react-router-dom";
import axios from "axios";


const ProductItem = ({ 
  id, 
  image, 
  profileImageUrl,
  fullName, 
  professionalTitle, 
  yearsOfExperience, 
  shortDescription, 
  specialties, 
  rating, 
  totalStudents, 
  totalCourses, 
  hourlyRate 
}) => {
  const { currency, backendURL } = useContext(ShopContext);
  const [ratingInfo, setRatingInfo] = useState({ averageRating: null, ratingCount: null });

  useEffect(() => {
    let isMounted = true;
    const loadRating = async () => {
      try {
        if (!backendURL || !id) return;
        const res = await axios.get(`${backendURL}/api/user/teacher/${id}/rating`);
        if (isMounted && res.data?.success) {
          setRatingInfo({
            averageRating: res.data.averageRating ?? null,
            ratingCount: res.data.ratingCount ?? null
          });
        }
      } catch (e) {
        // silently ignore
      }
    };
    loadRating();
    return () => { isMounted = false };
  }, [backendURL, id]);

  // Render stars for rating
  const renderStars = (ratingValue) => {
    const r = ratingValue || 0;
    const stars = [];
    const fullStars = Math.floor(r);
    const hasHalfStar = r % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    const emptyStars = 5 - Math.ceil(r);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }
    return stars;
  };

  // Format specialties for display
  const formatSpecialties = (specialties) => {
    if (!specialties) return [];
    return specialties.split(',').slice(0, 3).map(s => s.trim());
  };

  const displayRating = ratingInfo.averageRating ?? rating;
  const displayCount = ratingInfo.ratingCount;

  return (
    <Link className="block" to={`/product/${id}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        
        {/* Profile Header */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Profile Image */}
          <div className="flex-shrink-0 relative">
            <div className="w-16 h-16 rounded-full overflow-hidden">
              {(() => {
                // Get image from database - handle array, string, or profileImageUrl
                // Priority: image array first, then profileImageUrl
                let imageUrl = null;
                
                // Check image array first (from database)
                if (image) {
                  if (Array.isArray(image) && image.length > 0) {
                    // If it's an array, get the first image from database
                    imageUrl = image[0];
                  } else if (typeof image === 'string') {
                    // If it's a string, use it directly
                    imageUrl = image;
                  }
                }
                
                // Fallback to profileImageUrl if no image found
                if (!imageUrl && profileImageUrl) {
                  imageUrl = profileImageUrl;
                }
                
                return imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={fullName || 'Teacher'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">👨‍🏫</div>';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-2xl">
                    👨‍🏫
                  </div>
                );
              })()}
            </div>
            {/* Online status indicator */}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
          </div>
          
          {/* Name and Title */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {fullName || 'Teacher Name'}
            </h3>
            <p className="text-sm text-gray-600 truncate">
              {professionalTitle || 'Professional Title'}
            </p>
            {yearsOfExperience && (
              <p className="text-xs text-gray-500 mt-1">
                {yearsOfExperience} experience
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 flex-1">
          <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
            {shortDescription || 'Passionate educator with extensive experience in programming and technology. Helping students achieve their goals through practical, hands-on learning.'}
          </p>
        </div>

        {/* Specialties */}
        {specialties && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {formatSpecialties(specialties).map((specialty, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Statistics Row */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="font-medium">{(displayRating || 0).toFixed ? (displayRating || 0).toFixed(1) : (displayRating || 0)}</span>
            {typeof displayCount === 'number' && (
              <span className="text-xs text-gray-500">({displayCount})</span>
            )}
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span>👥</span>
            <span>{totalStudents?.toLocaleString() || '0'} students</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <span>📚</span>
            <span>{totalCourses || '0'} courses</span>
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-lg font-bold text-green-600">
              {currency}{hourlyRate || '85'}/hr
            </span>
            <span className="text-xs text-gray-500 ml-1">starting at</span>
          </div>
          <button className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-800 transition-colors">
            View Profile
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductItem;
