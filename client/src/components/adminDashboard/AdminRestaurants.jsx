import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { IoStorefrontOutline, IoCheckmarkCircle, IoBanOutline } from "react-icons/io5";

const AdminRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/restaurants");
      setRestaurants(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load restaurants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleUpdateStatus = async (restaurantId, newStatus) => {
    try {
      setUpdatingId(restaurantId);
      const res = await api.patch(`/admin/restaurant/${restaurantId}/status`, {
        status: newStatus,
      });
      toast.success(res.data.message || `Restaurant status set to ${newStatus}`);
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurantId ? { ...r, status: newStatus } : r)),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <Loader height="100%" width="100%" />;

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IoStorefrontOutline className="text-(--color-primary)" />
            Restaurant Partners Management
          </h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Approve, activate, or suspend restaurant storefronts
          </p>
        </div>
        <button
          onClick={fetchRestaurants}
          className="text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="bg-(--color-base-200) rounded-xl overflow-hidden shadow-sm border border-(--color-base-300)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-secondary)/30 bg-(--color-base-300)/40 text-left">
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Manager / Contact</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Cuisine</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-(--color-neutral)">
                    No restaurants registered yet.
                  </td>
                </tr>
              ) : (
                restaurants.map((rst) => (
                  <tr
                    key={rst._id}
                    className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                  >
                    <td className="py-3 px-4">
                      <p className="font-bold text-sm">{rst.restaurantName}</p>
                      <span className="text-xs text-(--color-neutral)">
                        {rst.isOpen ? "🟢 Store Open" : "⚪ Store Closed"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p className="font-medium">{rst.managerId?.fullName || "Manager"}</p>
                      <p className="text-(--color-neutral)">{rst.contactDetails?.email || rst.managerId?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">{rst.city || "N/A"}</td>
                    <td className="py-3 px-4 text-xs">
                      {rst.cuisineTypes?.slice(0, 2).join(", ") || rst.restaurantType || "All"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          rst.status === "active"
                            ? "bg-green-100 text-green-800"
                            : rst.status === "blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {rst.status || "inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        {rst.status !== "active" ? (
                          <button
                            disabled={updatingId === rst._id}
                            onClick={() => handleUpdateStatus(rst._id, "active")}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                          >
                            Approve / Activate
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === rst._id}
                            onClick={() => handleUpdateStatus(rst._id, "blocked")}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurants;

