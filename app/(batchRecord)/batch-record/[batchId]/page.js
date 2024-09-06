'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import MainContent from "../../../../components/MainContent";

export default function EditBatchRecordPage({ params }) {
  const [batchRecord, setBatchRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchBatchRecord = async () => {
      try {
        const response = await fetch(`/api/batch-record/${params.batchId}`);
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

  return <MainContent mode="edit" initialData={batchRecord} batchId={params.batchId} />;
}
