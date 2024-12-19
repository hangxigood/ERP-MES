'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  _id: string;
  name: string;
  version: number;
  structure: Section[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Section {
  sectionName: string;
  sectionDescription?: string;
  order: number;
  duplicatable: boolean;
  fields: Field[];
}

interface Field {
  name: string;
  default: any;
  fieldType: 'text' | 'float' | 'int' | 'date' | 'checkbox';
}

export default function TemplateManagement() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/template-management/create');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/template-management/${templateId}/edit`);
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/templates/${templateId}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate template');
      }
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Template Management</h1>
        <button
          onClick={handleCreateTemplate}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
        >
          Create New Template
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-5 gap-4 p-4 font-semibold text-gray-700 border-b">
          <div>Template Name</div>
          <div>Version</div>
          <div>Sections</div>
          <div>Last Updated</div>
          <div>Actions</div>
        </div>
        <div className="divide-y">
          {templates.map((template) => (
            <div key={template._id} className="grid grid-cols-5 gap-4 p-4 hover:bg-gray-50">
              <div className="text-gray-900">{template.name}</div>
              <div className="text-gray-600">v{template.version}</div>
              <div className="text-gray-600">{template.structure.length} sections</div>
              <div className="text-gray-600">
                {new Date(template.updatedAt).toLocaleString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditTemplate(template._id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicateTemplate(template._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Duplicate
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No templates found. Create your first template!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
