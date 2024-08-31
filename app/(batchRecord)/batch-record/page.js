'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Header from "../../../components/Header";
import Link from 'next/link';

export default function BatchRecordList() {
  const [batchRecords, setBatchRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchBatchRecords();
    }
  }, [status]);

  const fetchBatchRecords = async () => {
    try {
      const response = await fetch('/api/batch-record');
      if (response.ok) {
        const data = await response.json();
        setBatchRecords(data);
      } else {
        console.error('Failed to fetch batch records');
      }
    } catch (error) {
      console.error('Error fetching batch records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: You are not authorized to access this page</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title="BATCH RECORD LIST" />
      <div className="self-center w-full max-w-4xl mt-8">
        {batchRecords.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-gray-500">Name</th>
                <th className="border p-2 text-gray-500">Document Number</th>
                <th className="border p-2 text-gray-500">Lot Number</th>
                <th className="border p-2 text-gray-500">Date</th>
                <th className="border p-2 text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {batchRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-100">
                  <td className="border p-2 text-gray-500">{record.name}</td>
                  <td className="border p-2 text-gray-500">{record.documentNumber}</td>
                  <td className="border p-2 text-gray-500">{record.lotNumber}</td>
                  <td className="border p-2 text-gray-500">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="border p-2">
                    <Link href={`/batch-record/${record.id}`} className="text-blue-500 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No batch records found.</p>
        )}
      </div>
    </div>
  );
}
