import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import {
  IoReceiptOutline,
  IoWalletOutline,
  IoFlameOutline,
  IoCheckmarkDoneCircleOutline,
} from "react-icons/io5";

const RestaurantOverview = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/restaurant/overview");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to load restaurant overview:", error);
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
          <h2 className="text-2xl font-bold">Restaurant Dashboard</h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Real-time kitchen insights and revenue breakdown
          </p>
        </div>
        {setActiveTab && (
          <button
            onClick={() => setActiveTab("orders")}
            className="px-3.5 py-1.5 bg-(--color-primary) text-(--color-primary-content) rounded-lg text-xs font-bold hover:opacity-90 transition shadow-xs"
          >
            Manage Kitchen Orders →
          </button>
        )}
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-(--color-primary)/10 text-(--color-primary) rounded-xl text-2xl">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Orders
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl text-2xl">
            <IoWalletOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Revenue
            </p>
            <p className="text-2xl font-black mt-0.5 text-green-700">
              ₹{data?.totalRevenue || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl text-2xl">
            <IoFlameOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Active Cooking
            </p>
            <p className="text-2xl font-black mt-0.5 text-purple-700">
              {data?.activeOrders || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl text-2xl">
            <IoCheckmarkDoneCircleOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Delivered
            </p>
            <p className="text-2xl font-black mt-0.5 text-blue-700">
              {data?.deliveredOrders || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300)">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Recent Orders</h3>
          {setActiveTab && (
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-semibold text-(--color-primary) hover:underline"
            >
              Go to all orders →
            </button>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-(--color-neutral) text-sm">
            No incoming orders yet. Ensure your restaurant is marked as "Open" in settings!
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((ord) => {
              const customerUser =
                ord.customerId?.customerId || ord.customerId || {};

              return (
                <div
                  key={ord._id}
                  className="bg-(--color-base-100) p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">
                        #{ord._id?.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-(--color-neutral)">
                        ({customerUser.fullName || ord.deliveryAddress?.name || "Customer"})
                      </span>
                    </div>
                    <p className="text-xs text-(--color-neutral) mt-0.5">
                      {ord.orderItems?.length || 0} item(s) •{" "}
                      {ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString() : ""}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOverview;
