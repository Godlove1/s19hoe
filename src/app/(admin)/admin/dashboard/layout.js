"use client";
import * as React from "react";
import { useState } from "react";
import SideBar from "./adminComponents/sideBar";
import Header from "./adminComponents/header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <SideBar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 ">
          <div className="mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
