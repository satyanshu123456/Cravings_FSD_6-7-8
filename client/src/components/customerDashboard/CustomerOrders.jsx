import React, { useEffect, useState } from "react";
import Loader from "../Loader";
import api from "../../config/ApiConfig";
import toast from "react-hot-toast";
import { IoClose, IoStar, IoReceiptOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";

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

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const fetchAllOrders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/customer/all-orders");
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unknown error occurred during fetching orders. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleRateOrder = async (orderId) => {
    try {
      setIsSubmittingRating(true);
      await api.post(`/order/${orderId}/rate`, { rating: selectedRating });
      toast.success("Thank you for your rating!");
      setSelectedOrder((prev) => (prev ? { ...prev, rating: selectedRating } : null));
      setOrders((prev) =>
        prev.map((ord) => (ord._id === orderId ? { ...ord, rating: selectedRating } : ord)),
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return <Loader height="100%" width="100%" />;
  }

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">My Orders</h2>
          <p className="text-sm text-(--color-neutral) mt-1">
            Track and view your food ordering history
          </p>
        </div>
        <button
          onClick={fetchAllOrders}
          className="text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition"
        >
          Refresh
        </button>
      </div>

      <div className="bg-(--color-base-200) rounded-xl overflow-hidden shadow-sm border border-(--color-base-300)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-secondary)/30 bg-(--color-base-300)/40 text-left">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Restaurant</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-(--color-neutral)">
                    <IoReceiptOutline className="mx-auto text-4xl mb-2 opacity-50" />
                    No orders placed yet. Head over to Order Now to satisfy your cravings!
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
                  const statusClass =
                    statusColorMap[ord.orderStatus] || "bg-gray-100 text-gray-700";
                  const paymentClass =
                    ord.paymentDetails?.paymentStatus === "completed"
                      ? "text-green-700 font-semibold"
                      : "text-amber-600 font-medium";

                  return (
                    <tr
                      key={ord._id}
                      className="border-b border-(--color-secondary)/20 hover:bg-(--color-base-100)/50 transition"
                    >
                      <td className="py-3 px-4 font-mono text-xs">
                        #{ord._id?.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {ord.restaurantId?.restaurantName || "Restaurant"}
                        {ord.restaurantId?.city && (
                          <span className="block text-xs text-(--color-neutral)">
                            {ord.restaurantId.city}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {ord.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0} item(s)
                      </td>
                      <td className="py-3 px-4 font-semibold text-(--color-primary)">
                        ₹{ord.billDetails?.finalAmount || 0}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className={paymentClass}>
                          {ord.paymentDetails?.paymentStatus?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusClass}`}
                        >
                          {ord.orderStatus || "pending"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-(--color-neutral)">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setSelectedRating(ord.rating || 5);
                          }}
                          className="px-2.5 py-1 text-xs bg-(--color-primary) text-(--color-primary-content) rounded hover:opacity-90 transition font-medium"
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
                Order Summary
              </span>
              <h3 className="text-xl font-bold mt-1">
                #{selectedOrder._id?.slice(-8).toUpperCase()}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    statusColorMap[selectedOrder.orderStatus] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  Status: {selectedOrder.orderStatus}
                </span>
                <span className="text-xs text-(--color-neutral) flex items-center gap-1">
                  <IoTimeOutline />
                  {selectedOrder.createdAt
                    ? new Date(selectedOrder.createdAt).toLocaleString()
                    : ""}
                </span>
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="bg-(--color-base-200) p-3 rounded-lg mb-4 text-sm">
              <p className="font-semibold text-base">
                {selectedOrder.restaurantId?.restaurantName || "Restaurant"}
              </p>
              <p className="text-xs text-(--color-neutral)">
                {selectedOrder.restaurantId?.address}, {selectedOrder.restaurantId?.city}
              </p>
            </div>

            {/* Items Ordered */}
            <div className="mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-neutral) mb-2">
                Items Ordered
              </h4>
              <div className="space-y-2 border border-(--color-base-200) rounded-lg p-3">
                {selectedOrder.orderItems?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">
                        {item.itemName || `Item ${idx + 1}`}
                      </span>
                      <span className="text-xs text-(--color-neutral) ml-2">
                        x {item.quantity}
                      </span>
                    </div>
                    <span className="font-semibold">
                      ₹{item.price ? item.price * item.quantity : "--"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill Details */}
            <div className="mb-4 bg-(--color-base-200)/60 p-3 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{selectedOrder.billDetails?.totalAmount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes (5% GST)</span>
                <span>₹{selectedOrder.billDetails?.taxAmount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery & Platform Charges</span>
                <span>
                  ₹
                  {(selectedOrder.billDetails?.deliveryCharge || 0) +
                    (selectedOrder.billDetails?.platformFee || 0) +
                    (selectedOrder.billDetails?.convenienceFee || 0)}
                </span>
              </div>
              <div className="border-t border-(--color-base-300) pt-1.5 flex justify-between font-bold text-sm text-(--color-primary)">
                <span>Total Paid</span>
                <span>₹{selectedOrder.billDetails?.finalAmount || 0}</span>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryAddress && (
              <div className="mb-4 text-xs">
                <h4 className="font-bold uppercase tracking-wider text-(--color-neutral) mb-1 flex items-center gap-1">
                  <IoLocationOutline /> Delivered To
                </h4>
                <p className="font-semibold">{selectedOrder.deliveryAddress.name}</p>
                <p className="text-(--color-neutral)">
                  {selectedOrder.deliveryAddress.address}, {selectedOrder.deliveryAddress.city},{" "}
                  {selectedOrder.deliveryAddress.state} - {selectedOrder.deliveryAddress.pinCode}
                </p>
              </div>
            )}

            {/* Rating Section (If delivered or already rated) */}
            <div className="mt-4 pt-4 border-t border-(--color-base-300)">
              <h4 className="text-xs font-bold uppercase tracking-wider text-(--color-neutral) mb-2">
                Order Rating
              </h4>
              {selectedOrder.rating ? (
                <div className="flex items-center gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <IoStar
                      key={i}
                      className={i < selectedOrder.rating ? "text-yellow-400" : "text-gray-300"}
                      size={20}
                    />
                  ))}
                  <span className="text-xs text-(--color-neutral) ml-2">
                    Rated {selectedOrder.rating} / 5
                  </span>
                </div>
              ) : selectedOrder.orderStatus === "delivered" ? (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        className="text-xl focus:outline-none"
                      >
                        <IoStar
                          className={star <= selectedRating ? "text-yellow-400" : "text-gray-300"}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={isSubmittingRating}
                    onClick={() => handleRateOrder(selectedOrder._id)}
                    className="ml-auto px-3 py-1 bg-(--color-primary) text-(--color-primary-content) text-xs rounded hover:opacity-90"
                  >
                    {isSubmittingRating ? "Saving..." : "Submit Rating"}
                  </button>
                </div>
              ) : (
                <p className="text-xs text-(--color-neutral)">
                  Rating will be available once the order is delivered.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
