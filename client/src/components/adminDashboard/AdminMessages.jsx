import React, { useEffect, useState } from "react";
import api from "../../config/ApiConfig";
import Loader from "../Loader";
import toast from "react-hot-toast";
import { IoMailOutline, IoPersonOutline, IoCallOutline } from "react-icons/io5";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/admin/contact-messages");
      setMessages(res.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (isLoading) return <Loader height="100%" width="100%" />;

  return (
    <div className="overflow-y-auto h-full p-2 md:p-4 space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IoMailOutline className="text-(--color-primary)" />
            Customer & Partner Inquiries
          </h2>
          <p className="text-sm text-(--color-neutral) mt-0.5">
            Messages and feedback submitted through the Contact Us page
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="text-xs px-3 py-1.5 border border-(--color-primary) text-(--color-primary) rounded-md hover:bg-(--color-primary) hover:text-white transition font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="bg-(--color-base-200) p-10 rounded-xl text-center text-(--color-neutral) border border-(--color-base-300)">
            <IoMailOutline className="mx-auto text-4xl mb-2 opacity-50" />
            <p className="font-semibold">No inquiries received yet.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="bg-(--color-base-200) p-4 rounded-xl border border-(--color-base-300) shadow-xs space-y-2"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-(--color-base-300) pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-(--color-base-content)">
                    {msg.fullName}
                  </span>
                  <span className="text-xs text-(--color-neutral)">({msg.email})</span>
                  {msg.phone && (
                    <span className="text-xs text-(--color-neutral) flex items-center gap-0.5">
                      • <IoCallOutline /> {msg.phone}
                    </span>
                  )}
                </div>
                <span className="text-xs text-(--color-neutral)">
                  {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-(--color-primary)">
                  Subject: {msg.subject}
                </p>
                <p className="text-xs text-(--color-base-content) mt-1 bg-(--color-base-100) p-3 rounded-lg leading-relaxed">
                  {msg.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;

