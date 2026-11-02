import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminSetting from "../../components/adminDashboard/AdminSetting";
import AdminSidebar from "../../components/adminDashboard/AdminSidebar";
import AdminOverview from "../../components/adminDashboard/AdminOverview";
import AdminOrders from "../../components/adminDashboard/AdminOrders";
import AdminRestaurants from "../../components/adminDashboard/AdminRestaurants";
import AdminRiders from "../../components/adminDashboard/AdminRiders";
import AdminMessages from "../../components/adminDashboard/AdminMessages";

const AdminDashboard = () => {
  const { isLogin, role } = useAuth();
  const navigate = useNavigate();
  const active = useLocation().state?.activeTab;
  const [activeTab, setActiveTab] = React.useState(active || "overview");

  if (!isLogin || role !== "admin") {
    return (
      <div className="h-[92vh] bg-[url('/foodTable.webp')] bg-cover bg-center">
        <div className="h-full backdrop-blur-lg flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-(--color-neutral-content)">
            Access Denied. Please log in as an Admin to view this page.
          </h1>
          <button
            className="mt-4 px-4 py-2 bg-(--color-primary) text-white rounded-md"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[91vh] flex gap-2 p-2">
      <div className="w-3/17 min-w-[200px] bg-(--color-base-200) p-4 rounded-lg shadow-md h-full">
        <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <div className="flex-1 bg-(--color-base-100) p-4 rounded-lg shadow-md h-full overflow-hidden">
        {activeTab === "overview" && <AdminOverview setActiveTab={setActiveTab} />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "restaurants" && <AdminRestaurants />}
        {activeTab === "riders" && <AdminRiders />}
        {activeTab === "messages" && <AdminMessages />}
        {activeTab === "settings" && <AdminSetting />}
      </div>
    </div>
  );
};

export default AdminDashboard;
