'use client';

import React, { useState, useEffect } from 'react';
import { DataSheetGrid } from 'react-datasheet-grid';
import { useRouter } from 'next/navigation';

interface Field {
  name: string;
  default: any;
  fieldType: 'text' | 'float' | 'int' | 'date' | 'checkbox';
}

interface Section {
  sectionName: string;
  sectionDescription?: string;
  order: number;
  duplicatable: boolean;
  fields: Field[];
}

interface Template {
  _id?: string;
  name: string;
  version: number;
  structure: Section[];
}

export default function TemplateEditor({ templateId }: { templateId?: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<Template>({
    name: '',
    version: 1,
    structure: []
  });
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    } else {
      setLoading(false);
    }
  }, [templateId]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }
      const data = await response.json();
      setTemplate(data);
      if (data.structure.length > 0) {
        setCurrentSection(data.structure[0]);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const url = templateId ? `/api/templates/${templateId}` : '/api/templates';
      const method = templateId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      router.push('/template-management');
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      sectionName: `Section ${template.structure.length + 1}`,
      order: template.structure.length + 1,
      duplicatable: false,
      fields: []
    };
    setTemplate(prev => ({
      ...prev,
      structure: [...prev.structure, newSection]
    }));
    setCurrentSection(newSection);
  };

  const handleSectionChange = (updatedSection: Section) => {
    setTemplate(prev => ({
      ...prev,
      structure: prev.structure.map(section => 
        section.order === currentSection?.order ? updatedSection : section
      )
    }));
    setCurrentSection(updatedSection);
  };

  const fieldColumns = [
    {
      key: 'name',
      title: 'Field Name',
      width: 200,
      editor: () => ({
        component: DataSheetGrid.textEditor(),
      }),
    },
    {
      key: 'fieldType',
      title: 'Field Type',
      width: 150,
      editor: () => ({
        component: DataSheetGrid.selectEditor({
          options: [
            { value: 'text', label: 'Text' },
            { value: 'float', label: 'Float' },
            { value: 'int', label: 'Integer' },
            { value: 'date', label: 'Date' },
            { value: 'checkbox', label: 'Checkbox' },
          ]
        }),
      }),
    },
    {
      key: 'default',
      title: 'Default Value',
      width: 200,
      editor: ({ rowData }) => ({
        component: 
          rowData.fieldType === 'checkbox' 
            ? DataSheetGrid.checkboxEditor()
            : DataSheetGrid.textEditor(),
      }),
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {templateId ? 'Edit Template' : 'Create Template'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push('/template-management')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Template Info */}
        <div className="col-span-4 bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Template Name</label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <input
                type="number"
                value={template.version}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sections</h2>
            <button
              onClick={handleAddSection}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add Section
            </button>
          </div>
          <div className="space-y-2">
            {template.structure.map((section) => (
              <button
                key={section.order}
                onClick={() => setCurrentSection(section)}
                className={`w-full text-left px-3 py-2 rounded ${
                  currentSection?.order === section.order
                    ? 'bg-teal-100 text-teal-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {section.sectionName}
              </button>
            ))}
          </div>
        </div>

        {/* Section Editor */}
        <div className="col-span-3 bg-white rounded-lg shadow p-4">
          {currentSection ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Name</label>
                  <input
                    type="text"
                    value={currentSection.sectionName}
                    onChange={(e) => handleSectionChange({
                      ...currentSection,
                      sectionName: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duplicatable</label>
                  <input
                    type="checkbox"
                    checked={currentSection.duplicatable}
                    onChange={(e) => handleSectionChange({
                      ...currentSection,
                      duplicatable: e.target.checked
                    })}
                    className="mt-3 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Section Description</label>
                <textarea
                  value={currentSection.sectionDescription || ''}
                  onChange={(e) => handleSectionChange({
                    ...currentSection,
                    sectionDescription: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                <DataSheetGrid
                  value={currentSection.fields}
                  onChange={(fields) => handleSectionChange({
                    ...currentSection,
                    fields
                  })}
                  columns={fieldColumns}
                  height={400}
                  addRowsComponent={true}
                  className="template-field-grid"
                />
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Select a section to edit or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
