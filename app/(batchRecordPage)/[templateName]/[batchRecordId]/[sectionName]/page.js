'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import MainContent from "../../../../../components/MainContent";

export default function SectionPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { templateName, batchRecordId, sectionName } = params;
  const [batchRecordData, setBatchRecordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
      router.push('/unauthorized');
      return;
    }

    const fetchData = async () => {
      try {
        // Ensure batchRecordId is a valid ObjectId
        if (!batchRecordId || !/^[0-9a-fA-F]{24}$/.test(batchRecordId)) {
          throw new Error('Invalid batch record ID');
        }

        // Ensure sectionName is not undefined
        if (!sectionName) {
          throw new Error('Section name is undefined');
        }

        const batchRecordResponse = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`);
        if (!batchRecordResponse.ok) {
          throw new Error('Failed to fetch batch record data');
        }
        const batchRecordData = await batchRecordResponse.json();
        setBatchRecordData(batchRecordData);
        setLoading(false);

        // Fetch available sections
        const sectionsResponse = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!sectionsResponse.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await sectionsResponse.json();
        setSections(sectionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, batchRecordId, sectionName, templateName]);

  const updateSectionData = async (newData, newStatus) => {
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: newData,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section data');
      }

      const updatedData = await response.json();
      setBatchRecordData(updatedData);
    } catch (error) {
      console.error('Error updating section data:', error);
      alert('Error updating section data');
    }
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContent
      initialData={batchRecordData}
      batchRecordId={batchRecordId}
      session={session}
      onUpdate={updateSectionData}
    />
  );
}
