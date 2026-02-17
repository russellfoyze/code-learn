import React, { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/shopContext";

const newsLetterBox = () => {
  const { backendURL } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    if (!email || !email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendURL}/api/newsletter/subscribe`, {
        email: email.trim()
      });

      if (response.data.success) {
        toast.success(response.data.message || "Successfully subscribed to newsletter!");
        setEmail(""); // Clear the input
      } else {
        toast.error(response.data.message || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error(error.response?.data?.message || "Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Subscribe Now for get 20% Off
      </p>
      <p className="text-gray-400 mt-3">
        Subscribe to our newsletter to receive updates on new arrivals, special offers, and exclusive deals. Stay connected with the latest trends and never miss out on our promotions.
      </p>
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          className="w-full sm:flex-1 outline-none"
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
        <button 
          type="submit" 
          className="bg-black text-white text-m px-10 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "SUBSCRIBING..." : "SUBSCRIBE"}
        </button>
      </form>
    </div>
  );
};

export default newsLetterBox;
