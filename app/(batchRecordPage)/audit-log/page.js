"use client"

import React from 'react';
import AuditLogViewer from '../../../components/AuditLogViewer';

export default function AuditLogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Audit Log</h1>
      <AuditLogViewer />
    </div>
  );
}
