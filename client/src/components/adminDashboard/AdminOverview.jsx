import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import {
  IoReceiptOutline,
  IoWalletOutline,
  IoStorefrontOutline,
  IoBicycleOutline,
  IoPeopleOutline,
  IoMailOutline,
} from "react-icons/io5";

const AdminOverview = ({ setActiveTab }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/admin/overview");
        setData(res.data.data);
      } catch (error) {
        console.error("Failed to fetch admin overview:", error);
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
      <div>
        <h2 className="text-2xl font-bold">Platform Overview & Analytics</h2>
        <p className="text-sm text-(--color-neutral) mt-0.5">
          Real-time summary of sales, platform commissions, partners, and customers
        </p>
      </div>

      {/* 6 High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl text-2xl">
            <IoWalletOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total GMV Sales
            </p>
            <p className="text-2xl font-black mt-0.5 text-green-700">
              ₹{data?.totalGMV || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl text-2xl">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Platform Fees Earned
            </p>
            <p className="text-2xl font-black mt-0.5 text-blue-700">
              ₹{data?.totalPlatformFees || 0}
            </p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-(--color-primary)/10 text-(--color-primary) rounded-xl text-2xl">
            <IoReceiptOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Total Platform Orders
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 text-orange-600 rounded-xl text-2xl">
            <IoStorefrontOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Restaurant Partners
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalRestaurants || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-600 rounded-xl text-2xl">
            <IoBicycleOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Delivery Riders
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalRiders || 0}</p>
          </div>
        </div>

        <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300) flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl text-2xl">
            <IoPeopleOutline />
          </div>
          <div>
            <p className="text-(--color-neutral) text-xs uppercase tracking-wider font-semibold">
              Registered Customers
            </p>
            <p className="text-2xl font-black mt-0.5">{data?.totalCustomers || 0}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-(--color-base-200) p-5 rounded-xl border border-(--color-base-300)">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Recent Platform Transactions</h3>
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
          <p className="text-center py-6 text-(--color-neutral) text-sm">
            No orders placed yet on the platform.
          </p>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((ord) => (
              <div
                key={ord._id}
                className="bg-(--color-base-100) p-3.5 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      #{ord._id?.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-xs text-(--color-neutral)">
                      • {ord.deliveryAddress?.name || "Customer"}
                    </span>
                  </div>
                  <p className="text-xs text-(--color-neutral) mt-0.5">
                    Items: {ord.orderItems?.length || 0} • Status:{" "}
                    <strong className="capitalize">{ord.orderStatus}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-(--color-primary)">
                    ₹{ord.billDetails?.finalAmount || 0}
                  </span>
                  <span className="text-xs text-(--color-neutral)">
                    {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : ""}
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

export default AdminOverview;
