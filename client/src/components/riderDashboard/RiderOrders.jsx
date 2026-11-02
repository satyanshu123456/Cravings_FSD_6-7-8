import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import {
  IoBicycleOutline,
  IoCheckmarkDoneCircleOutline,
  IoLocationOutline,
  IoCallOutline,
  IoStorefrontOutline,
  IoPersonOutline,
  IoReceiptOutline,
  IoClose,
  IoNavigateOutline,
} from "react-icons/io5";

const statusColorMap = {
  ready: "bg-indigo-100 text-indigo-800 border-indigo-300",
  pickedUp: "bg-cyan-100 text-cyan-800 border-cyan-300",
  onTheWay: "bg-teal-100 text-teal-800 border-teal-300",
  outForDelivery: "bg-orange-100 text-orange-800 border-orange-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
};

const RiderOrders = () => {
  const [activeTab, setActiveTab] = useState("available"); // 'available' | 'active' | 'history'
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [availRes, myRes] = await Promise.all([
        api.get("/rider/available-deliveries"),
        api.get("/rider/my-deliveries"),
      ]);
      setAvailableOrders(availRes.data.data || []);
      setMyOrders(myRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load deliveries");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptOrder = async (orderId) => {
    try {
      setIsProcessing(true);
      const res = await api.post(`/rider/accept-order/${orderId}`);
      toast.success(res.data.message || "Delivery accepted! Pick up from restaurant.");
      fetchData();
      setActiveTab("active");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsProcessing(true);
      const res = await api.patch(`/rider/update-status/${orderId}`, {
        status: newStatus,
      });
      toast.success(res.data.message || `Status updated to ${newStatus}`);
      fetchData();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update delivery status");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  const activeDeliveries = myOrders.filter((o) =>
    ["pickedUp", "onTheWay", "outForDelivery"].includes(o.orderStatus),
  );
  const deliveryHistory = myOrders.filter((o) => o.orderStatus === "delivered");

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IoBicycleOutline className="text-(--color-primary)" />
            Rider Delivery Central
          </h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Accept open orders, navigate routes, and deliver meals to happy customers
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition font-medium"
        >
          Refresh Deliveries
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-(--color-base-300) pb-2">
        <button
          onClick={() => setActiveTab("available")}
          className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === "available"
              ? "bg-(--color-primary) text-(--color-primary-content) shadow-xs"
              : "bg-(--color-base-200) text-(--color-neutral) hover:bg-(--color-base-300)"
          }`}
        >
          <span>Available Pickups</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {availableOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("active")}
          className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === "active"
              ? "bg-(--color-primary) text-(--color-primary-content) shadow-xs"
              : "bg-(--color-base-200) text-(--color-neutral) hover:bg-(--color-base-300)"
          }`}
        >
          <span>My Active Trips</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {activeDeliveries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-(--color-primary) text-(--color-primary-content) shadow-xs"
              : "bg-(--color-base-200) text-(--color-neutral) hover:bg-(--color-base-300)"
          }`}
        >
          <span>Delivery History</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
            {deliveryHistory.length}
          </span>
        </button>
      </div>

      {/* ── 1. Available Pickups Tab ── */}
      {activeTab === "available" && (
        <div className="space-y-4">
          {availableOrders.length === 0 ? (
            <div className="bg-(--color-base-200) p-10 rounded-xl text-center text-(--color-neutral) border border-(--color-base-300)">
              <IoStorefrontOutline className="mx-auto text-4xl mb-2 opacity-50" />
              <p className="font-semibold">No ready orders waiting for pickup right now.</p>
              <p className="text-xs mt-1">Check back in a few minutes as restaurants prepare dishes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-(--color-base-200) p-4 rounded-xl border border-(--color-base-300) shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono font-bold text-(--color-primary)">
                        #{ord._id?.slice(-6).toUpperCase()}
                      </span>
                      <h4 className="font-bold text-base mt-0.5">
                        {ord.restaurantId?.restaurantName || "Restaurant"}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[11px] font-bold rounded-full">
                      Earn ₹40
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-(--color-neutral)">
                    <p className="flex items-start gap-1.5 text-(--color-base-content)">
                      <IoStorefrontOutline className="text-sm shrink-0 text-(--color-primary) mt-0.5" />
                      <span>
                        <strong>Pickup:</strong> {ord.restaurantId?.address},{" "}
                        {ord.restaurantId?.city}
                      </span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <IoLocationOutline className="text-sm shrink-0 text-red-500 mt-0.5" />
                      <span>
                        <strong>Drop:</strong> {ord.deliveryAddress?.address},{" "}
                        {ord.deliveryAddress?.city}
                      </span>
                    </p>
                  </div>

                  <div className="pt-2 border-t border-(--color-base-300) flex justify-between items-center">
                    <span className="text-xs font-semibold">
                      {ord.orderItems?.length || 0} item(s) • ₹{ord.billDetails?.finalAmount || 0}
                    </span>
                    <button
                      disabled={isProcessing}
                      onClick={() => handleAcceptOrder(ord._id)}
                      className="px-4 py-1.5 bg-(--color-primary) text-(--color-primary-content) text-xs font-bold rounded-lg hover:opacity-90 transition shadow-xs flex items-center gap-1.5"
                    >
                      <IoBicycleOutline className="text-sm" /> Accept & Pick Up
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 2. My Active Trips Tab ── */}
      {activeTab === "active" && (
        <div className="space-y-4">
          {activeDeliveries.length === 0 ? (
            <div className="bg-(--color-base-200) p-10 rounded-xl text-center text-(--color-neutral) border border-(--color-base-300)">
              <IoCheckmarkDoneCircleOutline className="mx-auto text-4xl mb-2 opacity-50 text-green-500" />
              <p className="font-semibold">No ongoing delivery trips.</p>
              <button
                onClick={() => setActiveTab("available")}
                className="mt-3 px-4 py-1.5 bg-(--color-primary) text-(--color-primary-content) text-xs font-bold rounded-lg hover:opacity-90"
              >
                Browse Available Pickups
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-(--color-base-200) p-5 rounded-xl border-2 border-(--color-primary) shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold text-(--color-primary)">
                        Active Trip #{ord._id?.slice(-8).toUpperCase()}
                      </span>
                      <h3 className="text-lg font-bold">
                        {ord.restaurantId?.restaurantName} ➔ {ord.deliveryAddress?.name}
                      </h3>
                    </div>
                    <span
                      className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold border ${
                        statusColorMap[ord.orderStatus] || "bg-gray-100"
                      }`}
                    >
                      Status: {ord.orderStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-(--color-base-100) p-3 rounded-lg">
                    <div>
                      <p className="font-bold text-(--color-primary) mb-1 flex items-center gap-1">
                        <IoStorefrontOutline /> Restaurant Pickup Point
                      </p>
                      <p className="font-semibold">{ord.restaurantId?.restaurantName}</p>
                      <p className="text-(--color-neutral)">
                        {ord.restaurantId?.address}, {ord.restaurantId?.city}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold text-red-600 mb-1 flex items-center gap-1">
                        <IoLocationOutline /> Customer Drop Location
                      </p>
                      <p className="font-semibold">{ord.deliveryAddress?.name}</p>
                      <p className="text-(--color-neutral)">
                        {ord.deliveryAddress?.address}, {ord.deliveryAddress?.city},{" "}
                        {ord.deliveryAddress?.pinCode}
                      </p>
                    </div>
                  </div>

                  {/* Rider Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2 items-center justify-between border-t border-(--color-base-300)">
                    <span className="text-xs font-bold text-green-700">
                      Trip Payout: ₹40
                    </span>
                    <div className="flex gap-2">
                      {ord.orderStatus === "pickedUp" && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(ord._id, "outForDelivery")}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                        >
                          <IoNavigateOutline /> On The Way / Out for Delivery
                        </button>
                      )}

                      {["pickedUp", "outForDelivery", "onTheWay"].includes(ord.orderStatus) && (
                        <button
                          disabled={isProcessing}
                          onClick={() => handleUpdateStatus(ord._id, "delivered")}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-xs"
                        >
                          <IoCheckmarkDoneCircleOutline /> Mark as Delivered ✅
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-2 border border-(--color-base-300) hover:bg-(--color-base-300) text-xs font-semibold rounded-lg"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. Delivery History Tab ── */}
      {activeTab === "history" && (
        <div className="bg-(--color-base-200) rounded-xl overflow-hidden shadow-sm border border-(--color-base-300)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--color-secondary)/30 bg-(--color-base-300)/40 text-left">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Delivered At</th>
                  <th className="py-3 px-4">Payout Earned</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveryHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-(--color-neutral)">
                      No completed deliveries yet. Complete trips to build your earnings!
                    </td>
                  </tr>
                ) : (
                  deliveryHistory.map((ord) => (
                    <tr
                      key={ord._id}
                      className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-bold">
                        #{ord._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {ord.restaurantId?.restaurantName || "Restaurant"}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {ord.deliveryAddress?.name || "Customer"}
                      </td>
                      <td className="py-3 px-4 text-xs text-(--color-neutral)">
                        {ord.updatedAt ? new Date(ord.updatedAt).toLocaleDateString() : "--"}
                      </td>
                      <td className="py-3 px-4 font-bold text-green-700">
                        ₹40.00
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 text-xs bg-(--color-base-100) border border-(--color-base-300) hover:bg-(--color-base-300) rounded font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-(--color-base-100) rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-(--color-base-200) text-(--color-neutral)"
            >
              <IoClose size={22} />
            </button>

            <h3 className="text-xl font-bold mb-3">
              Delivery Trip #{selectedOrder._id?.slice(-8).toUpperCase()}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-(--color-base-200) p-3 rounded-lg space-y-1">
                <p className="font-bold text-(--color-primary)">Restaurant Pickup</p>
                <p className="font-semibold text-sm">{selectedOrder.restaurantId?.restaurantName}</p>
                <p className="text-(--color-neutral)">
                  {selectedOrder.restaurantId?.address}, {selectedOrder.restaurantId?.city}
                </p>
              </div>

              <div className="bg-(--color-base-200) p-3 rounded-lg space-y-1">
                <p className="font-bold text-red-600">Customer Drop-off</p>
                <p className="font-semibold text-sm">{selectedOrder.deliveryAddress?.name}</p>
                <p className="text-(--color-neutral)">
                  {selectedOrder.deliveryAddress?.address}, {selectedOrder.deliveryAddress?.city},{" "}
                  {selectedOrder.deliveryAddress?.pinCode}
                </p>
              </div>

              <div className="border border-(--color-base-200) p-3 rounded-lg space-y-1">
                <p className="font-bold uppercase tracking-wider text-(--color-neutral) text-[10px]">
                  Items in Package
                </p>
                {selectedOrder.orderItems?.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.itemName || `Item ${idx + 1}`}</span>
                    <span className="font-bold">x{i.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderOrders;
