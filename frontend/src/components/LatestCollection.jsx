import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import Title from "./title";
import ProductItem from "./productItem";

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);
  
  useEffect(() => {
    // Filter products with teacherId (approved courses from teacher requests) and sort by date (most recent first)
    // This ensures only approved courses/teachers are shown in latest collection
    const approvedCourses = products.filter((item) => item.teacherId || item.fullName);
    const sorted = [...approvedCourses].sort((a, b) => {
      const dateA = a.date || (a._id ? new Date(a._id).getTime() : 0);
      const dateB = b.date || (b._id ? new Date(b._id).getTime() : 0);
      return dateB - dateA; // Most recent first
    });
    setLatestProducts(sorted.slice(0, 10));
  }, [products]);


  return (
    <div className="my-10">
      <div className="text-center py-8 text-3xl">
        <Title text1={"LATEST"} text2={"TEACHERS"} />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Recently approved courses and teachers
        </p>
      </div>
      {/* Rendering products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-6">
        {latestProducts.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            image={item.image}
            profileImageUrl={item.profileImageUrl}
            fullName={item.fullName}
            professionalTitle={item.professionalTitle}
            yearsOfExperience={item.yearsOfExperience}
            shortDescription={item.shortDescription}
            specialties={item.specialties}
            rating={item.rating}
            totalStudents={item.totalStudents}
            totalCourses={item.totalCourses}
            hourlyRate={item.hourlyRate}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestCollection;
