import React from "react";
import Title from "../components/title";
import { assets } from "../assets/assets";
import NewsletterBox from '../components/newsLetterBox.jsx'

const contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 border-t">
        <Title text1={"Contact"} text2={"Us"}></Title>
        </div>
        <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28">
          <img
            className="w-full md:max-w-[480px]"
            src={assets.contact_img}
            alt=""
          />
          <div className="flex flex-col justify-center items-start gap-6">
            <p className="font-semibold text-xl text-gray-600">Get in Touch</p>
            <p className="text-gray-600 leading-relaxed">
              Have questions about finding the perfect programming teacher? Need help with booking a session? 
              We're here to help you on your coding journey!
            </p>
            <div className="flex flex-col gap-4 w-full">
              <div>
                <p className="font-semibold text-lg text-gray-700 mb-2">Office Address</p>
                <p className="text-gray-500">
                  CodeLearn Platform Headquarters<br />
                  Tech Education Hub<br />
                  Online - Available Worldwide
                </p>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-700 mb-2">Contact Information</p>
                <p className="text-gray-500">
                  Phone: +1 (555) CODE-LEARN<br />
                  Email: support@codelearn.com<br />
                  Office Hours: Mon-Fri, 9 AM - 6 PM EST
                </p>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-700 mb-2">
                  Become a Teacher
                </p>
                <p className="text-gray-500 mb-3">
                  Are you an experienced programmer? Join our platform and help others learn! 
                  Contact us to start teaching today.
                </p>
                <a
                  href="mailto:teachers@codelearn.com"
                  className="inline-flex items-center border px-6 py-2 text-sm hover:bg-black hover:text-white transition-all duration-500"
                >
                  Apply as Teacher
                </a>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-700 mb-2">
                  Quick Support
                </p>
                <p className="text-gray-500 mb-3">Need immediate assistance? Reach us on WhatsApp</p>
                <a
                  href="https://wa.me/1234567890"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center border px-6 py-2 text-sm hover:bg-black hover:text-white transition-all duration-500"
                >
                  <img src={assets.wa} alt="WhatsApp" className="mr-2 w-5 h-5" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        
      </div>
      <NewsletterBox/>
    </div>
  );
};

export default contact;
