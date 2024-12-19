'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "../../../components/Header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BatchRecordSystem() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templateNames, setTemplateNames] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplateNames();
  }, []);

  const fetchTemplateNames = async () => {
    try {
      const response = await fetch('/api/template-names');
      const data = await response.json();
      setTemplateNames(data);
    } catch (error) {
      console.error('Error fetching template names:', error);
      setError('Failed to load templates. Please try again.');
    }
  };

  const handleTemplateSelect = (value) => {
    setSelectedTemplate(value);
    setError('');
  };

  const handleCreateBatchRecord = async () => {
    if (!selectedTemplate) {
      setError('Please select a template');
      return;
    }

    try {
      const response = await fetch(`/api/${selectedTemplate}/new-batch-record`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create batch record');
      }
      
      router.push(`/${selectedTemplate}/${data.batchRecordId}`);
    } catch (error) {
      console.error('Error creating batch record:', error);
      setError(error.message || 'Failed to create batch record. Please try again.');
    }
  };

  if (status === "loading") {
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
      <Header title="NEW BATCH RECORD" />
      <div className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Select a Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templateNames.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              onClick={handleCreateBatchRecord}
              className="w-full"
              size="lg"
            >
              Create Batch Record
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}