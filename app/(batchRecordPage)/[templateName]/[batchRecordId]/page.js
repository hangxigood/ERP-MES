'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import Header from "../../../../components/Header";

export default function BatchRecordPage({ params }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { templateName, batchRecordId } = params;

  useEffect(() => {
    if (status === "loading") return;
    // Redirect to the Header section
    router.push(`/${templateName}/${batchRecordId}/Header`);
  }, [session, status, router, templateName, batchRecordId]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-white">
      <Header title={`BATCH RECORD: ${templateName}`} />
      <div className="self-center w-full max-w-2xl p-6">
        <p>Redirecting to Header section...</p>
      </div>
    </div>
  );
}
