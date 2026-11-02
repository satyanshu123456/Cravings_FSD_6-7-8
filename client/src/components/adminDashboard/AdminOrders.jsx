import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import {
  IoReceiptOutline,
  IoClose,
  IoSearch,
  IoLocationOutline,
  IoTimeOutline,
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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/orders");
      const list = res.data.data || [];
      setOrders(list);
      setFilteredOrders(list);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.orderStatus === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          o.restaurantId?.restaurantName?.toLowerCase().includes(q) ||
          o.deliveryAddress?.name?.toLowerCase().includes(q),
      );
    }
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, orders]);

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Platform Orders Registry</h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Audit, inspect, and monitor all transactions across restaurants and riders
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="self-start text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition font-medium"
        >
          Refresh Registry
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <IoSearch className="absolute left-3 top-2.5 text-(--color-neutral) text-base" />
          <input
            type="text"
            placeholder="Search by Order ID, Restaurant, or Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-(--color-base-300) rounded-lg bg-(--color-base-100)"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-(--color-base-300) rounded-lg bg-(--color-base-100)"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready for Pickup</option>
          <option value="pickedUp">Picked Up</option>
          <option value="outForDelivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-(--color-base-200) rounded-xl overflow-hidden shadow-sm border border-(--color-base-300)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-secondary)/30 bg-(--color-base-300)/40 text-left">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-(--color-neutral)">
                    <IoReceiptOutline className="mx-auto text-4xl mb-2 opacity-50" />
                    No orders found matching your search.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const statusClass =
                    statusColorMap[ord.orderStatus] || "bg-gray-100 text-gray-700";

                  return (
                    <tr
                      key={ord._id}
                      className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs font-bold">
                        #{ord._id?.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {ord.restaurantId?.restaurantName || "Restaurant"}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {ord.deliveryAddress?.name || "Customer"}
                      </td>
                      <td className="py-3 px-4 font-bold text-(--color-primary)">
                        ₹{ord.billDetails?.finalAmount || 0}
                      </td>
                      <td className="py-3 px-4 text-xs capitalize">
                        <span
                          className={
                            ord.paymentDetails?.paymentStatus === "completed"
                              ? "text-green-700 font-semibold"
                              : "text-amber-600 font-medium"
                          }
                        >
                          {ord.paymentDetails?.paymentStatus || "pending"}
                        </span>
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
                          ? new Date(ord.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 text-xs bg-(--color-base-100) border border-(--color-base-300) hover:bg-(--color-base-300) rounded font-medium"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              Order #{selectedOrder._id?.slice(-8).toUpperCase()}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-(--color-base-200) p-3 rounded-lg flex justify-between">
                <span>Restaurant:</span>
                <span className="font-bold">{selectedOrder.restaurantId?.restaurantName}</span>
              </div>
              <div className="bg-(--color-base-200) p-3 rounded-lg flex justify-between">
                <span>Customer:</span>
                <span className="font-bold">{selectedOrder.deliveryAddress?.name}</span>
              </div>
              <div className="bg-(--color-base-200) p-3 rounded-lg flex justify-between">
                <span>Delivery Address:</span>
                <span className="font-semibold text-right max-w-xs">
                  {selectedOrder.deliveryAddress?.address}, {selectedOrder.deliveryAddress?.city}
                </span>
              </div>
              <div className="bg-(--color-base-200) p-3 rounded-lg flex justify-between">
                <span>Razorpay Order ID:</span>
                <span className="font-mono">{selectedOrder.paymentDetails?.razorpayOrderId || "N/A"}</span>
              </div>
              <div className="bg-(--color-base-200) p-3 rounded-lg flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold text-sm text-(--color-primary)">
                  ₹{selectedOrder.billDetails?.finalAmount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
