import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import { Link } from "react-router-dom";
import { IoReceiptOutline, IoWalletOutline, IoLocationOutline, IoArrowForward } from "react-icons/io5";

const CustomerOverview = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/customer/overview");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load customer overview:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  const recentOrders = data?.recentOrders || [];

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Welcome Back!</h2>
          <p className="text-sm text-(--color-neutral)">
            Here is a quick look at your cravings journey
          </p>
        </div>
        <Link
          to="/order-now"
          className="px-4 py-2 bg-(--color-primary) text-(--color-primary-content) rounded-lg text-sm font-semibold hover:opacity-90 transition flex items-center gap-1.5"
        >
          Order Food Now <IoArrowForward />
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-(--color-primary)/10 text-(--color-primary) rounded-xl text-2xl">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Orders
            </p>
            <p className="text-3xl font-extrabold mt-0.5">{data?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl text-2xl">
            <IoWalletOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Spent
            </p>
            <p className="text-3xl font-extrabold mt-0.5 text-green-700">
              ₹{data?.totalSpent || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl text-2xl">
            <IoLocationOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Saved Addresses
            </p>
            <p className="text-3xl font-extrabold mt-0.5">{data?.addressCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300)">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Recent Orders</h3>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-semibold text-(--color-primary) hover:underline"
            >
              View All Orders →
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-(--color-neutral) text-sm">
            <p>You haven't placed any orders yet.</p>
            <Link
              to="/order-now"
              className="inline-block mt-3 px-4 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md text-xs font-semibold hover:bg-(--color-primary) hover:text-white transition"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord._id}
                className="bg-(--color-base-100) p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {ord.restaurantId?.restaurantName || "Restaurant"}
                    </span>
                    <span className="text-xs text-(--color-neutral)">
                      #{ord._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-neutral) mt-0.5">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ""} •{" "}
                    {ord.orderItems?.length || 0} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-(--color-primary)">
                    ₹{ord.billDetails?.finalAmount || 0}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize bg-(--color-base-200) border border-(--color-base-300)">
                    {ord.orderStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOverview;
