import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import ProductItem from "../components/productItem";
import Title from "../components/title";

const RandomProducts = () => {
  const { products } = useContext(ShopContext);
  const [randomTeachers, setRandomTeachers] = useState([]);

  // Function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    // Filter products with teacherId or fullName (approved teachers from database)
    const approvedTeachers = products.filter((item) => item.teacherId || item.fullName);
    
    // Shuffle and get random teachers (limit to 8 for display)
    const shuffled = shuffleArray(approvedTeachers);
    setRandomTeachers(shuffled.slice(0, 8));
  }, [products]);

  return (
    <div className="py-10">
      <div className="text-center text-3xl py-8">
        <Title text1="Random" text2="Selection" />
        <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
          Discover random teachers from our database
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-6 mt-6">
        {randomTeachers.map((item, index) => (
          <ProductItem
            key={item._id || index}
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

export default RandomProducts;