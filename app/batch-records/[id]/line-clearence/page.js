import React from 'react';
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/authOptions";
import Header from "../../../../components/Header";


export default async function BatchRecordDetail( {params} ) {
  const session = await getServerSession(authOptions);
  const { id } = params;
  // Fetch batch record details based on id
  const fetchBatchRecord = async () => {
    try {
      const response = await fetch(`/api/batchRecords/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch batch record');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching batch record:', error);
      return null;
    }
  };

  const batchRecord = await fetchBatchRecord();

  if (!batchRecord) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title={`Batch Record: ${batchRecord.name}`} />
      <div className="self-center w-full max-w-4xl p-8">
        <h2 className="text-2xl font-bold mb-6">Batch Record Details</h2>
        {Object.entries(batchRecord).map(([key, value]) => (
          <div key={key} className="mb-4">
            <span className="font-semibold">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}:</span>
            <span className="ml-2">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
