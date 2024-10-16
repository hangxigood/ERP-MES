'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

<<<<<<< Updated upstream
export default function BatchRecordLayout({ children, params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [sections, setSections] = useState([]);
  const { templateName, batchRecordId } = params;
=======
export default function BatchRecordLayout({ children }) {
  const params = useParams();
  const templateName = params.templateName;
  const batchRecordId = params.batchRecordId;

  const [availableSections, setAvailableSections] = useState([]);
>>>>>>> Stashed changes

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`/api/${templateName}/${batchRecordId}/sections`);
        if (!response.ok) {
          throw new Error('Failed to fetch sections');
        }
        const sectionsData = await response.json();
        setAvailableSections(sectionsData);
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    if (templateName && batchRecordId) {
      fetchSections();
    }
  }, [templateName, batchRecordId]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={`BATCH RECORD: ${decodeURIComponent(templateName)}`} />
      <div className="flex flex-1">
        <Sidebar availableSections={availableSections} />
        <main className="flex-grow p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
