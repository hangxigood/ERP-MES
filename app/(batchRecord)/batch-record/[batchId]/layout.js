'use client';

import React from 'react';
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";

export default function BatchRecordLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title="BATCH RECORD" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
