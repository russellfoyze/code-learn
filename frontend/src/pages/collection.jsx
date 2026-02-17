import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { ShopContext } from "../context/shopContext";
import { assets } from "../assets/assets";
import Title from "../components/title";
import ProductItem from "../components/productItem";

const collection = () => {
  const { products , search , showSearch } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(true);
  const [fileterProduct, setFilterProduct] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType , setSortType]= useState('relavent')

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter =()=>{
    let productsCopy = products.slice();

    // Filter by search query - search across multiple fields for teachers
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      productsCopy = productsCopy.filter(item => {
        // Search in fullName
        const fullNameMatch = item.fullName?.toLowerCase().includes(searchLower);
        // Search in professionalTitle
        const titleMatch = item.professionalTitle?.toLowerCase().includes(searchLower);
        // Search in category (programming language)
        const categoryMatch = item.category?.toLowerCase().includes(searchLower);
        // Search in specialties
        const specialtiesMatch = item.specialties?.toLowerCase().includes(searchLower);
        // Search in shortDescription
        const descMatch = item.shortDescription?.toLowerCase().includes(searchLower);
        // Search in email
        const emailMatch = item.email?.toLowerCase().includes(searchLower);
        // Search in location
        const locationMatch = item.location?.toLowerCase().includes(searchLower);
        // Search in languages
        const languagesMatch = item.languages?.toLowerCase().includes(searchLower);
        
        // Return true if any field matches
        return fullNameMatch || titleMatch || categoryMatch || specialtiesMatch || descMatch || emailMatch || locationMatch || languagesMatch;
      });
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory) )
    }
    setFilterProduct(productsCopy);
  }

  const sortProduct = ()=>{
    let fpCopy = fileterProduct.slice();

    switch(sortType){
      case 'low-high':
        setFilterProduct(fpCopy.sort((a,b)=> (a.price - b.price)))
        break;
      
      case 'high-low':
        setFilterProduct(fpCopy.sort((a,b)=>(b.price - a.price)))
        break;

        default:
          applyFilter();
          break;
    }

  }


  useEffect(()=>{
    applyFilter();
  },[category, subCategory, search , showSearch, products])

  useEffect(()=>{
    sortProduct();
  },[sortType])
  
 

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 ">
      {/* Filter option */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex item-center cursor-pointer gap-2"
        >
          Filters{" "}
          <img
            src={assets.dropdown_icon}
            className={`h-3 mt-2 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            alt=""
          />
        </p>
        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">PROGRAMMING LANGUAGES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Python"}
                onChange={toggleCategory}
              />
              Python
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"C"}
                onChange={toggleCategory}
              />
              C
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"C++"}
                onChange={toggleCategory}
              />
              C++
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"JavaScript"}
                onChange={toggleCategory}
              />
              JavaScript (JS)
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"PHP"}
                onChange={toggleCategory}
              />
              PHP
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Kotlin"}
                onChange={toggleCategory}
              />
              Kotlin
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Java"}
                onChange={toggleCategory}
              />
              Java
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Go"}
                onChange={toggleCategory}
              />
              Go
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Rust"}
                onChange={toggleCategory}
              />
              Rust
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"TypeScript"}
                onChange={toggleCategory}
              />
              TypeScript
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Ruby"}
                onChange={toggleCategory}
              />
              Ruby
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Swift"}
                onChange={toggleCategory}
              />
              Swift
            </p>
            <p className="flex gap-2">
              <input
                className="w-3 "
                type="checkbox"
                value={"Dart"}
                onChange={toggleCategory}
              />
              Dart
            </p>
          </div>
        </div>
        {/* Sub Category Filter */}
              {/* Sub Category Filter */}
        
        {/* <div
          className={`border border-gray-300 pl-5 py-5 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">Type</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input className="w-3 " type="checkbox" value={"Topwear"} onChange={toggleSubCategory} />
              T-shirt
            </p>
            <p className="flex gap-2">
              <input className="w-3 " type="checkbox" value={"Bottomwear"} onChange={toggleSubCategory} />
              Pant
            </p>
            <p className="flex gap-2">
              <input className="w-3 " type="checkbox" value={"Winterwear"} onChange={toggleSubCategory} />
              Hoddie
            </p>
          </div>
        </div> */}
      </div>
      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"All"} text2={"Collection"} />
          {/* Product Sort */}
          
        </div>
        {/* map products */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 gap-y-6">
          {fileterProduct.map((item, index) => (
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
    </div>
  );
};

export default collection;
