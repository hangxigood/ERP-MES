"use client"

import React from 'react';
import AuditLogViewer from '../../../components/AuditLogViewer';
import Header from '../../../components/Header';

export default function AuditLogPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="AUDIT LOG" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <AuditLogViewer />
      </div>
    </div>
  );
}
