import React from "react";
import { assets } from "../assets/assets";

const ourPolicy = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      <div>
        <img src={assets.exchange_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Personalized Learning</p>
        <p className="text-gray-400">Custom courses tailored to your goals</p>
      </div>
      <div>
        <img src={assets.quality_icon} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">Expert Teachers</p>
        <p className="text-gray-400">Learn from experienced professionals</p>
      </div>
      <div>
        <img src={assets.support_img} className="w-12 m-auto mb-5" alt="" />
        <p className="font-semibold">24/7 Student Support</p>
        <p className="text-gray-400">We're here to help you succeed</p>
      </div>
    </div>
  );
};

export default ourPolicy;
