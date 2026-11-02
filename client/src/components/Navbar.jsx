import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoLight from "../assets/transparentLogoLight.png";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FaPowerOff } from "react-icons/fa";
import { IoCartOutline, IoMenu, IoClose } from "react-icons/io5";
import toast from "react-hot-toast";
import api from "../config/ApiConfig";

const Navbar = () => {
  const { user, isLogin, role, setUser, setIsLogin, setRole } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = () => {
    if (role === "restaurant") {
      navigate("/restaurant-dashboard");
    } else if (role === "rider") {
      navigate("/rider-dashboard");
    } else if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.get("/auth/logout");
      toast.success(res.data.message || "Logged out successfully");

      sessionStorage.removeItem("cravingUser");
      setUser(null);
      setIsLogin(false);
      setRole(null);
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during logout. Please try again.",
      );
    }
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-1 rounded-md ${
      isActive
        ? "bg-white/20 text-white font-bold"
        : "text-white/80 hover:text-white hover:bg-white/10"
    }`;

  return (
    <>
      <nav className="sticky top-0 z-50 flex items-center justify-between px-4 md:px-10 bg-(--color-primary) text-white w-full h-16 shadow-md">
        {/* Logo */}
        <div className="h-full py-2 flex items-center gap-2">
          <Link to="/" className="h-full flex items-center">
            <img src={logoLight} alt="Cravings Logo" className="h-10 w-auto object-contain" />
          </Link>
        </div>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/order-now" className={navLinkClass}>
            Order Now
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About Us
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Icon (accessible to all or customer) */}
          <div className="relative flex items-center">
            <button
              onClick={() => navigate("/cart")}
              className="p-1 hover:scale-110 transition-transform duration-200"
              title="Go to Cart"
            >
              <IoCartOutline className="text-white text-2xl" />
            </button>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-(--color-primary)">
                {totalItems}
              </span>
            )}
          </div>

          {isLogin ? (
            <div className="flex items-center gap-2">
              <button
                className="flex gap-2 items-center text-white border border-transparent hover:border-white/30 px-2.5 py-1 rounded-lg transition"
                title="Go to Dashboard"
                onClick={handleNavigate}
              >
                <img
                  src={
                    user?.photo?.url ||
                    `https://placehold.co/100x100?text=${user?.fullName?.[0] || "U"}`
                  }
                  alt={user?.fullName || "User"}
                  className="w-9 h-9 rounded-full object-cover object-top border border-white/40"
                />
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-bold truncate max-w-[120px]">
                    {user?.fullName}
                  </span>
                  <span className="text-[10px] text-white/80 uppercase tracking-wider font-semibold">
                    {role}
                  </span>
                </div>
              </button>

              <button
                onClick={handleLogout}
                className="text-white/80 hover:text-white hover:bg-red-600 p-2 rounded-lg transition"
                title="Logout"
              >
                <FaPowerOff size={15} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="text-white hover:bg-white/10 px-3 py-1.5 rounded-lg text-sm font-semibold transition"
              >
                Login
              </Link>
              <Link
                to="/register/customer"
                className="bg-white text-(--color-primary) hover:bg-white/90 px-3.5 py-1.5 rounded-lg text-sm font-bold shadow-xs transition"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-white text-2xl"
          >
            {mobileMenuOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-(--color-primary) text-white px-4 py-3 space-y-2 border-t border-white/10 shadow-lg">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium hover:text-white/80"
          >
            Home
          </Link>
          <Link
            to="/order-now"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium hover:text-white/80"
          >
            Order Now
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium hover:text-white/80"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium hover:text-white/80"
          >
            Contact
          </Link>

          {!isLogin && (
            <div className="pt-2 border-t border-white/20 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-white/10 rounded-lg text-xs font-bold"
              >
                Login
              </Link>
              <Link
                to="/register/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 bg-white text-(--color-primary) rounded-lg text-xs font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
