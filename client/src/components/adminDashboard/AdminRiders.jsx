import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { IoBicycleOutline, IoCheckmarkCircle, IoBanOutline } from "react-icons/io5";

const AdminRiders = () => {
  const [riders, setRiders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRiders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/riders");
      setRiders(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load riders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRiders();
  }, []);

  const handleUpdateStatus = async (riderId, newStatus) => {
    try {
      setUpdatingId(riderId);
      const res = await api.patch(`/admin/rider/${riderId}/status`, {
        status: newStatus,
      });
      toast.success(res.data.message || `Rider status set to ${newStatus}`);
      setRiders((prev) =>
        prev.map((r) => (r._id === riderId ? { ...r, status: newStatus } : r)),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update rider status");
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
            <IoBicycleOutline className="text-(--color-primary)" />
            Delivery Riders Fleet
          </h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Verify, approve, and oversee registered delivery partners
          </p>
        </div>
        <button
          onClick={fetchRiders}
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
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Vehicle Details</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {riders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-(--color-neutral)">
                    No riders registered yet.
                  </td>
                </tr>
              ) : (
                riders.map((rdr) => (
                  <tr
                    key={rdr._id}
                    className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                  >
                    <td className="py-3 px-4 font-bold text-sm">
                      {rdr.riderId?.fullName || "Delivery Partner"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <p>{rdr.riderId?.phone || "N/A"}</p>
                      <p className="text-(--color-neutral)">{rdr.riderId?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {rdr.vehicleDetails?.vehicleType || "Bike"} • {rdr.vehicleDetails?.vehicleNumber || "Pending"}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {rdr.isAvailable ? (
                        <span className="text-green-600 font-bold">● Online</span>
                      ) : (
                        <span className="text-gray-500 font-medium">○ Offline</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          rdr.status === "active"
                            ? "bg-green-100 text-green-800"
                            : rdr.status === "blocked"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {rdr.status || "active"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-1.5">
                        {rdr.status !== "active" ? (
                          <button
                            disabled={updatingId === rdr._id}
                            onClick={() => handleUpdateStatus(rdr._id, "active")}
                            className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold transition"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === rdr._id}
                            onClick={() => handleUpdateStatus(rdr._id, "blocked")}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition"
                          >
                            Block
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

export default AdminRiders;

