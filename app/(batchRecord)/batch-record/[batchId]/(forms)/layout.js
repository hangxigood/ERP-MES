'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BatchRecordInfo from '../../../../../components/BatchRecordInfo';

async function fetchBatchRecordData(batchId) {
  const response = await fetch(`/api/batch-record/${batchId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch batch record data');
  }
  return response.json();
}

export default function FormsLayout({ children }) {
  const { batchId } = useParams();
  const [batchRecordData, setBatchRecordData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadBatchRecordData() {
      try {
        const data = await fetchBatchRecordData(batchId);
        setBatchRecordData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadBatchRecordData();
  }, [batchId]);

  if (isLoading) {
    return <div>Loading batch record data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {batchRecordData && <BatchRecordInfo {...batchRecordData} />}
      {children}
    </div>
  );
}

