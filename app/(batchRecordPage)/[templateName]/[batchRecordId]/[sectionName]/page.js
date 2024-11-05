'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import MainContent from "../../../../../components/MainContent";

export default function SectionPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { templateName, batchRecordId, sectionName } = params;
  const decodedTemplateName = decodeURIComponent(templateName);
  const decodedBatchRecordId = decodeURIComponent(batchRecordId);
  const [batchRecordData, setBatchRecordData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    const fetchData = async () => {
      try {
        // Fetch both the current section data and the header data
        const batchRecordResponse = await fetch(`/api/${decodedTemplateName}/${decodedBatchRecordId}/${sectionName}`);
        if (!batchRecordResponse.ok) {
          throw new Error('Failed to fetch batch record data');
        }
        const batchRecordData = await batchRecordResponse.json();

        // If this isn't the header section, fetch the header data
        if (sectionName !== 'Header') {
          const headerResponse = await fetch(`/api/${decodedTemplateName}/${decodedBatchRecordId}/Header`);
          if (headerResponse.ok) {
            const headerData = await headerResponse.json();
            // Combine the data
            batchRecordData.batchInfo = {
              fields: headerData.fields
            };
          }
        } else {
          // If this is the header section, use its own data for the header info
          batchRecordData.batchInfo = {
            fields: batchRecordData.fields
          };
        }

        setBatchRecordData(batchRecordData);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router, decodedBatchRecordId, sectionName, decodedTemplateName]);

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

  const handleSignoff = async (comment) => {
    try {
      const response = await fetch(`/api/${templateName}/${batchRecordId}/${sectionName}/signoff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to sign off section');
      }

      const updatedData = await response.json();
      setBatchRecordData(updatedData);
    } catch (error) {
      console.error('Error signing off section:', error);
      alert('Error signing off section');
    }
  };

  if (status === "loading" || loading) {
    return <div>Loading...</div>;
  }

  return (
    <MainContent
      initialData={batchRecordData}
      session={session}
      batchRecordId={decodedBatchRecordId}
      templateName={decodedTemplateName}
      sectionName={sectionName}
      onUpdate={updateSectionData}
      onSignoff={handleSignoff}
    />
  );
}
