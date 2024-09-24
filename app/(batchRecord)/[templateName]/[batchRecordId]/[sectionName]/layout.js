'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

export default function BatchRecordLayout({ children, params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sections, setSections] = useState([]);
  const { templateName, batchRecordId } = params;

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
      router.push('/unauthorized');
      return;
    }

    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSections();
  }, [session, status, router, templateName, batchRecordId]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
      <div className="flex flex-1">
        <Sidebar availableSections={sections} />
        <main className="flex-grow p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
