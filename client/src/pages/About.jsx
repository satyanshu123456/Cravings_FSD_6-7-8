import React from "react";
import { Link } from "react-router-dom";
import logoLight from "../assets/transparentLogo.png";
import circleLogo from "../assets/circleLogo.png";
import {
  IoFastFoodOutline,
  IoShieldCheckmarkOutline,
  IoBicycleOutline,
  IoHeartOutline,
  IoArrowForward,
} from "react-icons/io5";

const About = () => {
  return (
    <div className="min-h-screen bg-(--color-base-100) text-(--color-base-content)">
      {/* Hero Header */}
      <section className="bg-gradient-to-r from-(--color-primary) to-orange-600 text-white py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <img
            src={circleLogo}
            alt="Cravings Logo"
            className="w-24 h-24 mx-auto rounded-full bg-white p-2 shadow-lg"
          />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            About Cravings
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light">
            Connecting food lovers with the finest restaurants and dedicated delivery
            riders. Every meal delivered hot, fresh, and on time.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-(--color-primary)">
              Our Story & Mission
            </span>
            <h2 className="text-3xl font-bold">
              Delivering happiness, one craving at a time.
            </h2>
            <p className="text-(--color-secondary) leading-relaxed">
              Founded with a passion for good food and seamless digital experiences,
              <strong> Cravings</strong> is built to empower local restaurants, support
              independent delivery partners, and delight customers with their favorite cuisines
              at the tap of a button.
            </p>
            <p className="text-(--color-secondary) leading-relaxed">
              From comforting home-style curries to artisanal burgers and delectable desserts,
              we bridge the distance between hungry foodies and top-rated kitchen masters.
            </p>
          </div>
          <div className="bg-(--color-base-200) p-8 rounded-3xl border border-(--color-base-300) shadow-sm flex flex-col justify-center items-center text-center">
            <img
              src={circleLogo}
              alt="Cravings Emblem"
              className="w-40 h-40 object-contain mb-4"
            />
            <h3 className="text-2xl font-bold text-(--color-primary)">Fast • Fresh • Reliable</h3>
            <p className="text-sm text-(--color-secondary) mt-1">
              Trusted by thousands of customers and culinary partners.
            </p>
          </div>
        </div>
      </section>

      {/* Pillars / Values */}
      <section className="bg-(--color-base-200) py-16 px-4 border-y border-(--color-base-300)">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose Cravings?</h2>
            <p className="text-(--color-secondary) mt-2 text-sm">
              The complete food ordering and delivery ecosystem built for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center text-2xl">
                <IoFastFoodOutline />
              </div>
              <h3 className="font-bold text-base mb-1">Curated Menus</h3>
              <p className="text-xs text-(--color-secondary)">
                Wide selection of top-rated restaurants, pure veg, non-veg, and local specialties.
              </p>
            </div>

            <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center text-2xl">
                <IoBicycleOutline />
              </div>
              <h3 className="font-bold text-base mb-1">Swift Delivery</h3>
              <p className="text-xs text-(--color-secondary)">
                Dedicated riders assigned in real-time to pick up and deliver hot meals fast.
              </p>
            </div>

            <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl">
                <IoShieldCheckmarkOutline />
              </div>
              <h3 className="font-bold text-base mb-1">Secure Razorpay</h3>
              <p className="text-xs text-(--color-secondary)">
                100% safe payments via UPI, Credit/Debit cards, and Netbanking.
              </p>
            </div>

            <div className="bg-(--color-base-100) p-6 rounded-2xl border border-(--color-base-300) shadow-xs text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 text-red-600 flex items-center justify-center text-2xl">
                <IoHeartOutline />
              </div>
              <h3 className="font-bold text-base mb-1">Community First</h3>
              <p className="text-xs text-(--color-secondary)">
                Empowering restaurant partners with transparent tools and fair commission structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold">Hungry? Discover What's Cooking!</h2>
          <p className="text-(--color-secondary) text-sm">
            Check out restaurants near you and get your favorite dishes delivered right to your doorstep.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/order-now"
              className="px-6 py-3 bg-(--color-primary) text-(--color-primary-content) font-bold rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm shadow-md"
            >
              Order Now <IoArrowForward />
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border border-(--color-primary) text-(--color-primary) font-bold rounded-xl hover:bg-(--color-primary)/5 transition text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

