import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Login from "./pages/login";
import Contact from "./pages/contact";
import Cart from "./pages/cart";
import Orders from "./pages/orders";
import Collection from "./pages/collection";
import PlaceOrder from "./pages/placeOrder";
import Product from "./pages/product";
import BookSession from "./pages/bookSession";
import Chat from "./pages/chat";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import SearchBar from './components/searchBar'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css'
import Downbar from "./components/downbar";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => {
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="relative">
      <div className={`${isCartPage ? 'w-[20%]' : 'w-full'} px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]`}>
      <ToastContainer /> 
      <Navbar />
      
      <SearchBar/>
     
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={null} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/book-session/:productId" element={<BookSession />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
      </Routes>

      <Footer />
      <Downbar/>
      </div>

      {isCartPage && <Cart />}
    </div>
  );
};

export default App;
