import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import {
  IoBicycleOutline,
  IoWalletOutline,
  IoStar,
  IoNavigateOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
} from "react-icons/io5";

const RiderOverview = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/rider/overview");
      setData(res.data.data);
    } catch (error) {
      console.error("Failed to load rider overview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleToggleOnline = async () => {
    try {
      setIsToggling(true);
      const res = await api.patch("/rider/toggle-availability");
      toast.success(res.data.message || "Status updated");
      setData((prev) =>
        prev ? { ...prev, isAvailable: res.data.data?.isAvailable } : prev,
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to toggle status");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  const isAvailable = data?.isAvailable;
  const activeOrders = data?.activeOrders || [];

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-6">
      {/* Header with Availability Switch */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Rider Dashboard</h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Deliver fast, earn per trip, and satisfy local food cravings
          </p>
        </div>

        <button
          onClick={handleToggleOnline}
          disabled={isToggling}
          className={`self-start flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-xs transition ${
            isAvailable
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-gray-400 hover:bg-gray-500 text-white"
          }`}
        >
          {isAvailable ? <IoCheckmarkCircle className="text-base" /> : <IoCloseCircle className="text-base" />}
          <span>{isAvailable ? "Online (Accepting Orders)" : "Offline (Resting)"}</span>
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-(--color-primary)/10 text-(--color-primary) rounded-xl text-2xl">
            <IoBicycleOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Delivered Orders
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalDeliveries || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl text-2xl">
            <IoWalletOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Earnings
            </p>
            <p className="text-2xl font-black mt-0.5 text-green-700">
              ₹{data?.totalEarnings || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl text-2xl">
            <IoNavigateOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Active Trips
            </p>
            <p className="text-2xl font-black mt-0.5 text-orange-700">
              {data?.activeTripsCount || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 text-yellow-600 rounded-xl text-2xl">
            <IoStar />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Rider Rating
            </p>
            <p className="text-2xl font-black mt-0.5 text-yellow-600">
              ★ {data?.averageRating || 4.8}
            </p>
          </div>
        </div>
      </div>

      {/* Active Trips Card / Section */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300)">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Active Delivery Tasks</h3>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-semibold text-(--color-primary) hover:underline"
            >
              Open Deliveries Screen →
            </button>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="text-center py-8 text-(--color-neutral) text-sm">
            <p>You currently have no ongoing delivery trips.</p>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab("orders")}
                className="mt-3 px-4 py-1.5 bg-(--color-primary) text-(--color-primary-content) rounded-lg text-xs font-semibold hover:opacity-90"
              >
                View Available Pickups
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((ord) => (
              <div
                key={ord._id}
                className="bg-(--color-base-100) p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-(--color-primary)/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {ord.restaurantId?.restaurantName || "Restaurant"}
                    </span>
                    <span className="text-xs text-(--color-neutral)">
                      #{ord._id?.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-neutral) mt-0.5">
                    Stage: <strong className="capitalize text-orange-600">{ord.orderStatus}</strong> •{" "}
                    Destination: {ord.deliveryAddress?.city || "Customer City"}
                  </p>
                </div>
                {setActiveTab && (
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="px-3 py-1.5 bg-(--color-primary) text-(--color-primary-content) rounded-md text-xs font-bold hover:opacity-90"
                  >
                    Manage Trip
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderOverview;
