'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';
import Header from "../../../components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function BatchRecordsList() {
  const { data: session, status } = useSession();
  const [batchRecords, setBatchRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (error) {
      console.error('Error fetching batch records:', error);
      setError('Failed to load batch records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    const variants = {
      'DRAFT': 'secondary',
      'IN_PROGRESS': 'warning',
      'COMPLETED': 'success',
      'REJECTED': 'destructive',
    };
    return variants[status] || 'default';
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'LABELING')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-lg">
          <AlertDescription>
            Access Denied: You are not authorized to access this page
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header title="BATCH RECORDS LIST" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Template Name</TableHead>
                <TableHead>Lot Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated By</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.id}</TableCell>
                  <TableCell>{record.templateName}</TableCell>
                  <TableCell>{record.lotNumber}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.createdBy}</TableCell>
                  <TableCell>{formatDate(record.createdAt)}</TableCell>
                  <TableCell>{record.updatedBy}</TableCell>
                  <TableCell>{formatDate(record.updatedAt)}</TableCell>
                  <TableCell>
                    <Link 
                      href={`/${encodeURIComponent(record.templateName)}/${record.id}`}
                      className="text-primary hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {batchRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No batch records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
