'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Header from "../../../components/Header";

export default function BatchRecordsList() {
  const { status } = useSession();
  const [batchRecords, setBatchRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    fetchBatchRecords();
  }, [status]);

  const fetchBatchRecords = async () => {
    try {
      const response = await fetch('/api/batch-records');
      if (!response.ok) {
        throw new Error('Failed to fetch batch records');
      }
      const data = await response.json();
      setBatchRecords(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching batch records:', error);
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title="BATCH RECORDS LIST" />
      <div className="self-center w-full max-w-6xl p-6">
        <table className="min-w-full bg-white border border-gray-300 text-gray-500">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">ID</th>
              <th className="px-4 py-2 border-b">Template Name</th>
              <th className="px-4 py-2 border-b">Status</th>
              <th className="px-4 py-2 border-b">Created By</th>
              <th className="px-4 py-2 border-b">Created At</th>
              <th className="px-4 py-2 border-b">Updated By</th>
              <th className="px-4 py-2 border-b">Updated At</th>
              <th className="px-4 py-2 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {batchRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-4 py-2 border-b">{record.id}</td>
                <td className="px-4 py-2 border-b">{record.templateName}</td>
                <td className="px-4 py-2 border-b">{record.status}</td>
                <td className="px-4 py-2 border-b">{record.createdBy}</td>
                <td className="px-4 py-2 border-b">{new Date(record.createdAt).toLocaleString()}</td>
                <td className="px-4 py-2 border-b">{record.updatedBy}</td>
                <td className="px-4 py-2 border-b">{new Date(record.updatedAt).toLocaleString()}</td>
                <td className="px-4 py-2 border-b">
                  <Link href={`/${encodeURIComponent(record.templateName)}/${record.id}`}>
                    <span className="text-blue-500 hover:underline cursor-pointer">View</span>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
