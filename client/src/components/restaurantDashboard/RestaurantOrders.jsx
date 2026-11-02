import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import {
  IoReceiptOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoFlameOutline,
  IoFastFoodOutline,
  IoClose,
  IoTimeOutline,
  IoLocationOutline,
  IoPersonOutline,
  IoCallOutline,
} from "react-icons/io5";

const statusColorMap = {
  pending: "bg-amber-100 text-amber-800 border-amber-300",
  accepted: "bg-blue-100 text-blue-800 border-blue-300",
  preparing: "bg-purple-100 text-purple-800 border-purple-300",
  ready: "bg-indigo-100 text-indigo-800 border-indigo-300",
  pickedUp: "bg-cyan-100 text-cyan-800 border-cyan-300",
  onTheWay: "bg-teal-100 text-teal-800 border-teal-300",
  outForDelivery: "bg-orange-100 text-orange-800 border-orange-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  rejected: "bg-rose-100 text-rose-800 border-rose-300",
  failed: "bg-gray-100 text-gray-800 border-gray-300",
};

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/restaurant/orders");
      const list = res.data.data || [];
      setOrders(list);
      setFilteredOrders(list);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load restaurant orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredOrders(orders);
    } else if (activeFilter === "active") {
      setFilteredOrders(
        orders.filter((o) => ["pending", "accepted", "preparing", "ready"].includes(o.orderStatus)),
      );
    } else {
      setFilteredOrders(orders.filter((o) => o.orderStatus === activeFilter));
    }
  }, [activeFilter, orders]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setIsUpdatingStatus(true);
      const res = await api.patch(`/restaurant/order/${orderId}/status`, {
        status: newStatus,
      });
      toast.success(res.data.message || `Order marked as ${newStatus}`);

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o)),
      );
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Incoming & Active Orders</h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Manage incoming orders, update prep stages, and hand over to delivery riders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="self-start text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition font-medium"
        >
          Refresh Orders
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-(--color-base-300) pb-2">
        {[
          { key: "all", label: "All Orders" },
          { key: "active", label: "Active Orders" },
          { key: "pending", label: "New (Pending)" },
          { key: "accepted", label: "Accepted" },
          { key: "preparing", label: "Cooking / Preparing" },
          { key: "ready", label: "Ready for Pickup" },
          { key: "delivered", label: "Delivered" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
              activeFilter === tab.key
                ? "bg-(--color-primary) text-(--color-primary-content) shadow-xs"
                : "bg-(--color-base-200) text-(--color-neutral) hover:bg-(--color-base-300)"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-(--color-base-200) rounded-xl overflow-hidden shadow-sm border border-(--color-base-300)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-secondary)/30 bg-(--color-base-300)/40 text-left">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-center">Kitchen Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-(--color-neutral)">
                    <IoReceiptOutline className="mx-auto text-4xl mb-2 opacity-50" />
                    No orders matching this status.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const customerUser =
                    ord.customerId?.customerId || ord.customerId || {};
                  const statusClass =
                    statusColorMap[ord.orderStatus] || "bg-gray-100 text-gray-700";

                  return (
                    <tr
                      key={ord._id}
                      className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        #{ord._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-xs">
                          {customerUser.fullName || ord.deliveryAddress?.name || "Guest Customer"}
                        </p>
                        <p className="text-[11px] text-(--color-neutral)">
                          {customerUser.phone || ord.deliveryAddress?.city || ""}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs max-w-xs truncate">
                        {ord.orderItems?.map((i) => `${i.itemName || "Item"} (x${i.quantity})`).join(", ") ||
                          `${ord.orderItems?.length || 0} items`}
                      </td>
                      <td className="py-3 px-4 font-bold text-(--color-primary)">
                        ₹{ord.billDetails?.finalAmount || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-(--color-neutral)">
                        {ord.createdAt
                          ? new Date(ord.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "--"}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Pending -> Accept / Reject */}
                          {ord.orderStatus === "pending" && (
                            <>
                              <button
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus(ord._id, "accepted")}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                              >
                                <IoCheckmarkCircleOutline /> Accept
                              </button>
                              <button
                                disabled={isUpdatingStatus}
                                onClick={() => handleUpdateStatus(ord._id, "rejected")}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold transition"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Accepted -> Preparing */}
                          {ord.orderStatus === "accepted" && (
                            <button
                              disabled={isUpdatingStatus}
                              onClick={() => handleUpdateStatus(ord._id, "preparing")}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                            >
                              <IoFlameOutline /> Start Cooking
                            </button>
                          )}

                          {/* Preparing -> Ready */}
                          {ord.orderStatus === "preparing" && (
                            <button
                              disabled={isUpdatingStatus}
                              onClick={() => handleUpdateStatus(ord._id, "ready")}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                            >
                              <IoFastFoodOutline /> Food Ready
                            </button>
                          )}

                          {/* Ready for Pickup */}
                          {ord.orderStatus === "ready" && (
                            <span className="text-xs text-indigo-700 font-semibold italic">
                              Waiting for rider...
                            </span>
                          )}

                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-2 py-1 bg-(--color-base-100) border border-(--color-base-300) hover:bg-(--color-base-300) rounded text-xs font-medium"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-(--color-base-100) rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-(--color-base-200) text-(--color-neutral)"
            >
              <IoClose size={22} />
            </button>

            <div className="border-b border-(--color-base-300) pb-4 mb-4">
              <span className="text-xs uppercase font-bold text-(--color-primary) tracking-wider">
                Kitchen Order Ticket
              </span>
              <h3 className="text-xl font-bold mt-1">
                Order #{selectedOrder._id?.slice(-8).toUpperCase()}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    statusColorMap[selectedOrder.orderStatus] || "bg-gray-100"
                  }`}
                >
                  {selectedOrder.orderStatus}
                </span>
                <span className="text-xs text-(--color-neutral) flex items-center gap-1">
                  <IoTimeOutline />
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-(--color-base-200) p-3 rounded-lg mb-4 text-xs space-y-1">
              <p className="font-bold text-sm text-(--color-base-content) flex items-center gap-1.5">
                <IoPersonOutline />
                {selectedOrder.deliveryAddress?.name || "Customer"}
              </p>
              {selectedOrder.deliveryAddress && (
                <p className="text-(--color-neutral) flex items-center gap-1.5">
                  <IoLocationOutline />
                  {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city},{" "}
                  {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pinCode}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-neutral) mb-2">
                Items to Prepare
              </h4>
              <div className="divide-y divide-(--color-base-200) border border-(--color-base-200) rounded-lg p-3">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="py-2 first:pt-0 last:pb-0 flex justify-between text-sm">
                    <div>
                      <span className="font-bold">{item.itemName || `Item ${idx + 1}`}</span>
                      <span className="ml-2 px-2 py-0.5 bg-(--color-primary)/10 text-(--color-primary) rounded-md text-xs font-extrabold">
                        QTY: {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold text-xs text-(--color-neutral)">
                      ₹{item.price ? item.price * item.quantity : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill summary */}
            <div className="bg-(--color-base-200)/70 p-3 rounded-lg text-xs flex justify-between items-center font-bold">
              <span>Total Order Value:</span>
              <span className="text-base text-(--color-primary)">
                ₹{selectedOrder.billDetails?.finalAmount || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;
