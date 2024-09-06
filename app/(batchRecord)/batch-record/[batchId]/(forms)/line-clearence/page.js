'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import LineClearanceForm from '../../../../../../components/LineClearenceForm';

export default function LineClearancePage({ params }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCTION')) {
    return <div className="text-red-500 font-bold text-center mt-4">Access Denied: You are not authorized to access this page</div>;
  }

  return <LineClearanceForm batchId={params.batchId} />;
}
