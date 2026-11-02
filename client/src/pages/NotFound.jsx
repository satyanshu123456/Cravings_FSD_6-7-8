import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoHomeOutline, IoArrowBack, IoRestaurantOutline } from "react-icons/io5";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center bg-(--color-base-100)">
      <div className="w-24 h-24 mb-4 rounded-full bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center text-5xl">
        <IoRestaurantOutline />
      </div>
      <h1 className="text-7xl font-extrabold text-(--color-primary)">404</h1>
      <h2 className="text-2xl font-bold mt-2 text-(--color-base-content)">
        Page Not Found
      </h2>
      <p className="text-sm text-(--color-secondary) max-w-md mt-2 mb-8">
        Oops! The recipe you are looking for doesn't exist, or has been moved to another table.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 border border-(--color-base-300) rounded-xl text-sm font-semibold hover:bg-(--color-base-200) transition"
        >
          <IoArrowBack /> Go Back
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-(--color-primary) text-(--color-primary-content) rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm"
        >
          <IoHomeOutline /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

