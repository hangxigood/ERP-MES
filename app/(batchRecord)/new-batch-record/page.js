'use client'

import React from 'react';
import { useSession } from "next-auth/react";
import Header from "../../../components/Header";
import MainContent from "../../../components/MainContent";

export default function BatchRecordSystem() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: You are not authorized to access this page</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title="NEW BATCH RECORD" />
      <div className="self-center w-full">
        <div className="flex gap-6">
          <MainContent mode="create" />
        </div>
      </div>
    </div>
  );
}