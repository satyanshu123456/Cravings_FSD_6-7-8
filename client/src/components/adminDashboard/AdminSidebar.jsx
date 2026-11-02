import React from "react";
import { MdDashboard, MdOutlineStorefront, MdOutlineMail } from "react-icons/md";
import { FaShoppingCart, FaBicycle } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

const AdminSidebar = ({ activeTab, setActiveTab }) => {
  const mainTabs = [
    { name: "Overview", value: "overview", icon: <MdDashboard /> },
    { name: "All Orders", value: "orders", icon: <FaShoppingCart /> },
    { name: "Restaurants", value: "restaurants", icon: <MdOutlineStorefront /> },
    { name: "Riders", value: "riders", icon: <FaBicycle /> },
    { name: "Inquiries", value: "messages", icon: <MdOutlineMail /> },
  ];

  const settingsTab = { name: "Settings", value: "settings", icon: <IoMdSettings /> };

  const renderTab = (tab) => (
    <li
      key={tab.value}
      className={`cursor-pointer p-2.5 rounded-lg text-sm flex items-center gap-3 transition ${
        activeTab === tab.value
          ? "bg-(--color-primary) text-(--color-primary-content) font-bold shadow-xs"
          : "text-(--color-neutral) hover:bg-(--color-base-300) hover:text-(--color-base-content)"
      }`}
      onClick={() => setActiveTab(tab.value)}
    >
      <span className="text-lg">{tab.icon}</span> {tab.name}
    </li>
  );

  return (
    <div className="h-full flex flex-col justify-between">
      <ul className="space-y-1.5 flex-1">
        {mainTabs.map((tab) => renderTab(tab))}
      </ul>
      <ul className="pt-3 border-t border-(--color-base-300)">
        {renderTab(settingsTab)}
      </ul>
    </div>
  );
};

export default AdminSidebar;
