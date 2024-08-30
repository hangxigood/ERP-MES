'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "../../../components/Header";
import MainContent from "../../../components/MainContent";

export default function EditBatchRecordPage({ params }) {
  const [batchRecord, setBatchRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const fetchBatchRecord = async () => {
      try {
        const response = await fetch(`/api/batchRecord/${params.batchId}`);
        if (response.ok) {
          const data = await response.json();
          setBatchRecord(data);
        } else {
          console.error('Failed to fetch batch record');
        }
      } catch (error) {
        console.error('Error fetching batch record:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchBatchRecord();
    }
  }, [params.batchId, session]);

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: You are not authorized to access this page</div>;
  }

  if (!batchRecord) {
    return <div>Batch record not found</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title="EDIT BATCH RECORD" />
      <div className="self-center w-full">
        <div className="flex gap-6">
          <MainContent mode="edit" initialData={batchRecord} batchId={params.batchId} />
        </div>
      </div>
    </div>
  );
}
