import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import Title from "./title";
import ProductItem from "./productItem";

const bestSeller = () => {
  const { products } = useContext(ShopContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const bestProduct = products.filter((item) => item.bestTeacher === true);
    setBestSeller(bestProduct.slice(0, 5));
  }, [products]);

  return (
    <div className="my-10">
      <div className="text-center text-3xl py-8">
        <Title text1={"Best"} text2={"Teachers"} />
        <p className="w3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
    
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gap-y-6">
        {bestSeller.map((item, index) => (
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

export default bestSeller;
